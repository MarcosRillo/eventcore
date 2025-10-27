# CARD-001: Organizer Stats API (Backend)

**Time Estimate:** 45 min  
**Checkpoint Name:** card-001-complete

---

## 🎯 Objective

Implementar endpoint que retorna estadísticas básicas para organizador autenticado.

**Business Value:** Organizador ve cuántos eventos tiene y su estado, sin tener que contarlos manualmente.

---

## 📁 Files to Create
```
backend/app/Features/Dashboard/
├── Controllers/
│   └── OrganizerStatsController.php
└── Services/
    └── OrganizerStatsService.php

backend/tests/Feature/
└── Dashboard/
    └── OrganizerStatsTest.php

backend/routes/
└── api.php (add route)
```

---

## 📖 Files to Read First

**MUST READ (in order):**
1. `claude.md` - Architecture rules, anti-patterns, quality requirements
2. `docs/ARCHITECTURE.md` - Detailed backend architecture
3. `backend/app/Features/Events/Controllers/EventController.php` - Reference pattern
4. `backend/tests/Feature/EventTest.php` - Reference test pattern

---

## 🔌 API Specification

### Endpoint
```http
GET /api/v1/organizer/stats
Authorization: Bearer {token}
```

### Success Response (200)
```json
{
  "total_events": 10,
  "pending": 3,
  "approved": 5,
  "rejected": 2,
  "published": 4
}
```

### Error Responses
```json
// 401 Unauthorized
{
  "message": "Unauthenticated."
}

// 500 Server Error
{
  "message": "Error fetching stats",
  "error": "Internal server error"
}
```

---

## 🧪 Tests Required (Minimum 8 tests)

### Test Suite: OrganizerStatsTest

**CRITICAL from claude.md:**
- Each test MUST have >3 assertions
- Include edge cases (zero events, unauthorized)
- Verify database state with assertDatabaseHas
- Descriptive test names (what it tests, not just "works")

**Required Tests:**

1. **test_returns_correct_stats_for_authenticated_organizer**
   - Arrange: Create organizer with 10 events (3 pending, 5 approved, 2 rejected, 4 published)
   - Act: GET /api/v1/organizer/stats
   - Assert:
     - Response 200
     - total_events = 10
     - pending = 3
     - approved = 5
     - rejected = 2
     - published = 4

2. **test_returns_401_for_unauthenticated_request**
   - Act: GET without token
   - Assert: Response 401

3. **test_only_counts_organizers_own_events**
   - Arrange: 
     - Organizer A: 5 events
     - Organizer B: 3 events
   - Act: Login as Organizer A, GET stats
   - Assert: total_events = 5 (not 8)

4. **test_returns_zero_for_organizer_with_no_events**
   - Arrange: Organizer with 0 events
   - Act: GET stats
   - Assert: All counts = 0

5. **test_pending_count_only_includes_pending_status**
   - Arrange: Mix of statuses
   - Assert: pending count matches only pending events

6. **test_approved_count_only_includes_approved_status**
   - Arrange: Mix of statuses
   - Assert: approved count matches only approved events

7. **test_rejected_count_only_includes_rejected_status**
   - Arrange: Mix of statuses
   - Assert: rejected count matches only rejected events

8. **test_published_count_only_includes_published_status**
   - Arrange: Mix of statuses
   - Assert: published count matches only published events

---

## ✅ Success Criteria

### Code Quality (from claude.md)
- [ ] Controller ≤ 200 lines (delegation only)
- [ ] Business logic in Service class
- [ ] Service wraps queries in DB::transaction() (if any writes)
- [ ] Max 2 log statements total (1 success, 1 error)
- [ ] Zero over-engineering (KISS principle)
- [ ] Zero unused imports/variables

### Testing
- [ ] All 8 tests passing
- [ ] Each test has >3 assertions
- [ ] Tests include edge cases (zero events, unauthorized)
- [ ] Tests verify behavior, not implementation
- [ ] Coverage >60% on new code

### Architecture
- [ ] Follows Features-based structure
- [ ] Matches reference patterns (EventController)
- [ ] PHPDoc complete
- [ ] Type hints on all methods

### Validation
- [ ] Run: `php artisan test --filter=OrganizerStatsTest`
- [ ] Expected: 8/8 passing
- [ ] Run: `php artisan insights` (if installed)
- [ ] Expected: 0 warnings

---

## 🚫 Anti-Patterns to Avoid (from claude.md)

### 1. Over-Engineering
```php
// ❌ WRONG - Don't create unnecessary abstractions
interface StatsRepositoryInterface {}
abstract class AbstractStatsService {}
class StatsFactory {}
class StatsBuilder {}

// ✅ CORRECT - Simple Service
class OrganizerStatsService {
    public function getStats(int $organizerId): array {
        // Simple, direct query
    }
}
```

### 2. Excessive Logging
```php
// ❌ WRONG - Too much logging
Log::info('Method started');
Log::debug('Querying database');
Log::info('Query complete');

// ✅ CORRECT - Minimal logging (Max 2 statements)
try {
    $stats = $this->getStats();
    Log::info('Stats fetched', ['organizer_id' => $organizerId]);
    return $stats;
} catch (\Exception $e) {
    Log::error('Stats fetch failed', ['error' => $e->getMessage()]);
    throw $e;
}
```

### 3. Superficial Tests
```php
// ❌ WRONG - Superficial test (only 1 assertion)
public function test_gets_stats()
{
    $response = $this->get('/api/v1/organizer/stats');
    $response->assertStatus(200);  // Only 1 assertion!
}

// ✅ CORRECT - Robust test (5+ assertions)
public function test_returns_correct_stats_for_authenticated_organizer()
{
    $organizer = Organizer::factory()->create();
    Event::factory()->count(3)->pending()->for($organizer)->create();
    Event::factory()->count(5)->approved()->for($organizer)->create();
    
    $response = $this->actingAs($organizer)->getJson('/api/v1/organizer/stats');
    
    $response->assertStatus(200);                    // ✅ Assertion 1
    $response->assertJsonPath('total_events', 8);    // ✅ Assertion 2
    $response->assertJsonPath('pending', 3);         // ✅ Assertion 3
    $response->assertJsonPath('approved', 5);        // ✅ Assertion 4
    $this->assertDatabaseCount('events', 8);         // ✅ Assertion 5
}
```

---

## 📝 Implementation Hints

### Service Pattern
```php
// OrganizerStatsService.php
public function getStats(int $organizerId): array
{
    // Query events by organizer
    // Group by status
    // Return array with counts
    
    // IMPORTANT: Use Eloquent efficiently (no N+1)
    // IMPORTANT: Max 2 log statements
}
```

### Controller Pattern
```php
// OrganizerStatsController.php
public function index(Request $request): JsonResponse
{
    // Get authenticated user's organizer_id
    // Call service
    // Return JSON response
    
    // IMPORTANT: ≤ 200 lines (delegation only)
    // IMPORTANT: Try-catch with logging
}
```

---

## 🔄 TDD Workflow

**PHASE 1: RED (Tests fail)**
1. Generate `OrganizerStatsTest.php` with 8 tests
2. Run tests: `php artisan test --filter=OrganizerStatsTest`
3. Expected: 8/8 failures ✅

**PHASE 2: GREEN (Tests pass)**
1. Implement `OrganizerStatsService.php`
2. Implement `OrganizerStatsController.php`
3. Add route to `api.php`
4. Run tests: `php artisan test --filter=OrganizerStatsTest`
5. Expected: 8/8 passing ✅

**PHASE 3: REFACTOR (Clean up)**
1. Human reviews code for tech debt
2. Refactor if needed (simplify, remove logs, etc.)
3. Tests still pass

**PHASE 4: CHECKPOINT**
```bash
git add backend/
git commit -m "feat(backend): implement CARD-001 organizer stats API"
claude code --checkpoint save "card-001-complete"
```

---

## 🎯 Definition of Done

- [ ] All 8 tests passing (100%)
- [ ] Coverage >60% on new code
- [ ] Zero over-engineering
- [ ] Max 2 log statements
- [ ] Zero unused imports
- [ ] Architectural review >8/10
- [ ] Human reviewed and approved
- [ ] Checkpoint created

---

**Ready to start TDD cycle!**

Next: Run `claude code` and paste the prompt from the workflow document.
