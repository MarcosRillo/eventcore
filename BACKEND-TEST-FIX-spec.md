# BACKEND-TEST-FIX: Refactor Test Design for Self-Contained Tests

**Date:** October 28, 2025  
**Priority:** HIGH (score blocker para 10/10)  
**Estimated Time:** 2-3 hours  
**Current Status:** 5/36 passing (31 failing)  
**Target:** 36/36 passing  
**Score Impact:** 9.9/10 → 10/10

---

## 🎯 OBJECTIVE

Refactor backend tests to be self-contained and not depend on database seeders.

**Problem:**
- Tests use `RefreshDatabase` trait (clears DB before each test)
- Tests depend on seeded data (which gets cleared)
- Tests don't create their own test data
- Result: 31/36 tests failing with "not found" errors

**Solution:**
- Keep `RefreshDatabase` trait (good practice for test isolation)
- Make each test create its own required data
- Use Laravel factories for data creation
- Ensure tests are independent and repeatable

---

## 📋 CURRENT STATE ANALYSIS

### Test Execution Results (from audit)
```bash
PHPUnit 11.5.32 by Sebastian Bergmann and contributors.

..EEEEEEEEEEEEEEEEEEEEEEEEEEEE.EEEEE                              36 / 36 (100%)

Time: 00:00.333, Memory: 50.50 MB

ERRORS!
Tests: 36, Assertions: 4, Errors: 33.

Error: SQLSTATE[HY000]: General error: 1 no such table: user_roles
```

**After infrastructure fix:** 5/36 passing

### Test Files to Fix

```
app/Features/Organizer/Tests/OrganizerStatsTest.php
├── 10 tests total
├── Currently: ~2-3 passing
└── Need: 10/10 passing

Other test files:
├── app/Features/Events/Tests/EventTest.php
├── app/Features/Approvals/Tests/ApprovalTest.php
└── [other test files in Features/]
```

---

## 🏗️ ARCHITECTURE PATTERN

### Current (Broken) Pattern
```php
use RefreshDatabase;

public function test_can_fetch_stats()
{
    // ❌ PROBLEM: Depends on seeded data that was cleared
    $response = $this->actingAs($this->organizerUser)
        ->getJson('/api/v1/organizer/stats');
    
    // Fails because no events exist
    $response->assertOk();
}
```

### Target (Fixed) Pattern
```php
use RefreshDatabase;

public function test_can_fetch_stats()
{
    // ✅ SOLUTION: Create own test data
    $user = User::factory()->create();
    $entity = Entity::factory()->create();
    $user->entities()->attach($entity->id, ['role' => 'organizer']);
    
    Event::factory()->count(5)->create([
        'organizer_id' => $user->id,
        'entity_id' => $entity->id,
        'status' => 'approved'
    ]);
    
    $response = $this->actingAs($user)
        ->getJson('/api/v1/organizer/stats');
    
    $response->assertOk();
    $response->assertJsonStructure([
        'total_events',
        'by_status',
        'recent_events'
    ]);
}
```

---

## ✅ EXECUTION PLAN

### Phase 1: Setup Factories (30 min)

**Verify existing factories:**
```bash
ls -la database/factories/
# Should have: UserFactory, EventFactory, EntityFactory, etc.
```

**Create missing factories if needed:**
```php
// database/factories/EventFactory.php
use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'event_date' => $this->faker->dateTimeBetween('now', '+30 days'),
            'start_time' => '10:00:00',
            'end_time' => '12:00:00',
            'status' => 'draft',
            'category_id' => Category::factory(),
            'location_id' => Location::factory(),
            'entity_id' => Entity::factory(),
            'organizer_id' => User::factory(),
        ];
    }
    
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
        ]);
    }
    
    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
        ]);
    }
}
```

**Required factories:**
- UserFactory ✅ (should exist)
- EventFactory (create/verify)
- EntityFactory (create/verify)
- CategoryFactory (create/verify)
- LocationFactory (create/verify)
- EventApprovalFactory (if needed)

### Phase 2: Fix OrganizerStatsTest (45 min)

**File:** `app/Features/Organizer/Tests/OrganizerStatsTest.php`

**Test structure:**
```php
<?php

namespace App\Features\Organizer\Tests;

use App\Models\User;
use App\Models\Event;
use App\Models\Entity;
use App\Models\Category;
use App\Models\Location;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizerStatsTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Entity $entity;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create base test data in setUp
        $this->user = User::factory()->create();
        $this->entity = Entity::factory()->create();
        
        // Attach user to entity as organizer
        $this->user->entities()->attach($this->entity->id, [
            'role' => 'organizer'
        ]);
    }

    public function test_can_get_organizer_stats(): void
    {
        // Create test events for this user
        Event::factory()->count(3)->create([
            'organizer_id' => $this->user->id,
            'entity_id' => $this->entity->id,
            'status' => 'approved'
        ]);
        
        Event::factory()->count(2)->create([
            'organizer_id' => $this->user->id,
            'entity_id' => $this->entity->id,
            'status' => 'draft'
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/organizer/stats');

        $response->assertOk();
        $response->assertJsonStructure([
            'total_events',
            'by_status',
            'recent_events'
        ]);
        $response->assertJson([
            'total_events' => 5,
            'by_status' => [
                'approved' => 3,
                'draft' => 2,
            ]
        ]);
    }

    public function test_stats_only_include_own_events(): void
    {
        // Create events for this user
        Event::factory()->count(2)->create([
            'organizer_id' => $this->user->id,
            'entity_id' => $this->entity->id,
        ]);
        
        // Create events for another user (should not be included)
        $otherUser = User::factory()->create();
        Event::factory()->count(3)->create([
            'organizer_id' => $otherUser->id,
            'entity_id' => $this->entity->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/organizer/stats');

        $response->assertOk();
        $response->assertJson([
            'total_events' => 2  // Only this user's events
        ]);
    }

    public function test_stats_by_status_breakdown(): void
    {
        Event::factory()->create([
            'organizer_id' => $this->user->id,
            'entity_id' => $this->entity->id,
            'status' => 'draft'
        ]);
        
        Event::factory()->count(2)->create([
            'organizer_id' => $this->user->id,
            'entity_id' => $this->entity->id,
            'status' => 'pending'
        ]);
        
        Event::factory()->count(3)->create([
            'organizer_id' => $this->user->id,
            'entity_id' => $this->entity->id,
            'status' => 'approved'
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/organizer/stats');

        $response->assertOk();
        $response->assertJson([
            'by_status' => [
                'draft' => 1,
                'pending' => 2,
                'approved' => 3,
            ]
        ]);
    }

    public function test_recent_events_returns_latest_5(): void
    {
        // Create 10 events
        Event::factory()->count(10)->create([
            'organizer_id' => $this->user->id,
            'entity_id' => $this->entity->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/organizer/stats');

        $response->assertOk();
        $this->assertCount(5, $response->json('recent_events'));
    }

    public function test_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/organizer/stats');
        $response->assertUnauthorized();
    }

    public function test_requires_organizer_role(): void
    {
        $userWithoutRole = User::factory()->create();

        $response = $this->actingAs($userWithoutRole)
            ->getJson('/api/v1/organizer/stats');

        $response->assertForbidden();
    }

    // Add remaining tests following same pattern...
}
```

### Phase 3: Fix Other Test Files (45 min)

Apply same pattern to:
- `EventTest.php`
- `ApprovalTest.php`
- Any other failing tests

**Pattern for each test:**
1. Use `RefreshDatabase` trait
2. Create required data in `setUp()` or test method
3. Use factories for all models
4. Ensure test is self-contained
5. Assert expected behavior

### Phase 4: Verification (30 min)

**Run all tests:**
```bash
cd backend
./vendor/bin/phpunit

# Expected output:
# Tests: 36, Assertions: 30+, Errors: 0
# OK (36 tests, XX assertions)
```

**Run tests multiple times to ensure stability:**
```bash
./vendor/bin/phpunit
./vendor/bin/phpunit
./vendor/bin/phpunit

# Should pass 3/3 times (no flaky tests)
```

**Run specific test suites:**
```bash
./vendor/bin/phpunit --filter=OrganizerStats
./vendor/bin/phpunit --filter=Event
./vendor/bin/phpunit --filter=Approval
```

---

## 🔧 IMPLEMENTATION CHECKLIST

### Setup Phase
- [ ] Verify all required factories exist
- [ ] Create missing factories (Event, Entity, Category, Location)
- [ ] Add factory states (approved, published, etc.)
- [ ] Test factory creation in tinker

### OrganizerStatsTest Refactor
- [ ] Add setUp() method with base data
- [ ] Refactor test_can_get_organizer_stats
- [ ] Refactor test_stats_only_include_own_events
- [ ] Refactor test_stats_by_status_breakdown
- [ ] Refactor test_recent_events_returns_latest_5
- [ ] Refactor test_requires_authentication
- [ ] Refactor test_requires_organizer_role
- [ ] Refactor remaining 4 tests
- [ ] Verify 10/10 passing

### Other Tests Refactor
- [ ] Identify all failing test files
- [ ] Apply same pattern to EventTest.php
- [ ] Apply same pattern to ApprovalTest.php
- [ ] Apply same pattern to other test files
- [ ] Verify each test file passes

### Verification
- [ ] Run full test suite: 36/36 passing
- [ ] Run tests 3 times: all pass consistently
- [ ] No flaky tests detected
- [ ] All assertions passing
- [ ] Test execution time reasonable (<5s)

---

## 🎯 EXPECTED RESULTS

### Before Refactor
```bash
Tests: 36, Assertions: 4, Errors: 33
Status: 5/36 passing (14%)
Issues: Tests depend on seeders, data cleared by RefreshDatabase
```

### After Refactor
```bash
Tests: 36, Assertions: 30+, Errors: 0
Status: 36/36 passing (100%)
Quality: Self-contained, repeatable, independent tests
```

---

## 📊 FACTORY EXAMPLES

### UserFactory (should exist)
```php
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password'),
        ];
    }
}
```

### EntityFactory (create if missing)
```php
class EntityFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'type' => 'hotel',
            'organization_id' => 1, // Ente de Turismo
        ];
    }
}
```

### CategoryFactory (create if missing)
```php
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'slug' => fake()->slug(),
            'description' => fake()->sentence(),
        ];
    }
}
```

### LocationFactory (create if missing)
```php
class LocationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->city(),
            'address' => fake()->address(),
            'latitude' => fake()->latitude(-30, -20),
            'longitude' => fake()->longitude(-70, -60),
        ];
    }
}
```

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue: Factory not found
**Error:** `Class 'Database\Factories\EventFactory' not found`  
**Solution:** Create the factory file in `database/factories/`

### Issue: Foreign key constraint
**Error:** `SQLSTATE[23000]: Integrity constraint violation`  
**Solution:** Use factory relations:
```php
Event::factory()->create([
    'category_id' => Category::factory(),
    'location_id' => Location::factory(),
]);
```

### Issue: User not attached to entity
**Error:** Forbidden (user doesn't have organizer role)  
**Solution:** Attach user to entity in setUp():
```php
$this->user->entities()->attach($this->entity->id, ['role' => 'organizer']);
```

### Issue: Tests pass individually but fail together
**Error:** Intermittent failures  
**Solution:** Ensure RefreshDatabase is used, check for static state

---

## 🎯 COMMIT MESSAGE

After successful refactor:

```bash
git add .
git commit -m "test(backend): refactor tests to be self-contained and use factories

- Convert all tests to create their own test data
- Add/update factories for Event, Entity, Category, Location models
- Remove dependency on database seeders
- Keep RefreshDatabase trait for proper test isolation
- All tests now independent and repeatable

IMPACT:
- Tests passing: 5/36 → 36/36 (100%)
- Test quality: Brittle → Self-contained
- Score: 9.9/10 → 10/10

✅ All 36 backend tests passing
✅ Zero test dependencies on seeders
✅ Proper test isolation maintained
✅ Repeatable test execution

Fixes backend test infrastructure issues identified in audit"

git push origin main
```

---

## 📈 METRICS TO REPORT

After successful refactor:

```markdown
## BACKEND-TEST-FIX - Completion Report

✅ REFACTOR COMPLETADO

### Test Results
- Tests passing: 5/36 → 36/36 (100%)
- Test assertions: 4 → 30+ 
- Test errors: 31 → 0
- Execution time: ~0.3s (maintained)

### Factories Created/Updated
- EventFactory: Created with states (approved, published)
- EntityFactory: Created
- CategoryFactory: Created
- LocationFactory: Created
- UserFactory: Updated (if needed)

### Tests Refactored
- OrganizerStatsTest: 10/10 tests fixed
- EventTest: X/X tests fixed
- ApprovalTest: X/X tests fixed
- Other tests: X/X tests fixed

### Score Impact
- Backend testing: 5/10 → 10/10
- Overall score: 9.9/10 → 10/10
- Production readiness: Confirmed ✅

### Commit
- Files changed: ~10-15 files
- Factories added: 4
- Tests refactored: 36
- Lines changed: ~500-1000
```

---

## ✅ SUCCESS CRITERIA

All of these MUST be true:

```bash
# 1. All tests passing
./vendor/bin/phpunit
# → Tests: 36, Assertions: 30+, Errors: 0

# 2. Tests are stable (run 3 times)
./vendor/bin/phpunit && ./vendor/bin/phpunit && ./vendor/bin/phpunit
# → All 3 runs: 36/36 passing

# 3. Specific test suites passing
./vendor/bin/phpunit --filter=OrganizerStats
# → Tests: 10, Errors: 0

# 4. No warnings or deprecations
./vendor/bin/phpunit 2>&1 | grep -i warning
# → No output (or only minor warnings)

# 5. Reasonable execution time
./vendor/bin/phpunit | grep Time
# → Time: < 5 seconds
```

---

## 🎯 NEXT STEPS AFTER FIX

1. ✅ Verify 36/36 tests passing
2. ✅ Update audit report status
3. ✅ Commit with descriptive message
4. ✅ Push to main
5. ✅ Update TODO.md with score 10/10
6. ✅ Proceed with CARD-005 (Action Buttons)

---

**ESTIMATED TOTAL TIME:** 2-3 hours  
**DIFFICULTY:** Medium (systematic refactoring)  
**RISK:** Low (tests already exist, just fixing)  
**IMPACT:** High (+0.1 to final score, 100% test coverage)

---

**END OF SPECIFICATION**