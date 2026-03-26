# Contributing to Plataforma de Eventos Turísticos

Thank you for your interest in contributing! This document provides guidelines and instructions for developers.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Architecture Guidelines](#architecture-guidelines)
4. [Testing Requirements](#testing-requirements)
5. [Code Style](#code-style)
6. [Commit Messages](#commit-messages)
7. [Pull Request Process](#pull-request-process)

---

## 🚀 Getting Started

### Prerequisites

- **Docker Desktop** (required for backend)
- **Git**
- **Node.js v22.15.1** (use nvm: `nvm use 22`)
- **pnpm 10.33.0**

### Initial Setup

1. **Clone and enter the repository:**
```bash
git clone https://github.com/MarcosRillo/plataforma-calendario-monorepo.git
cd plataforma-calendario
```

2. **Start Docker containers:**
```bash
docker compose up -d
```

This starts:
- PostgreSQL 15 (port 5432)
- Laravel Backend (port 8000)

3. **Install frontend dependencies:**
```bash
pnpm install
```

4. **Verify setup:**
```bash
# Backend tests
docker compose exec backend php artisan test

# Frontend tests
pnpm test

# Frontend dev server
pnpm run dev
```

5. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1/

---

## 🔄 Development Workflow

### Daily Development

1. **Pull latest changes:**
```bash
git pull origin main
```

2. **Start services:**
```bash
docker compose up -d
pnpm run dev
```

3. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
```

4. **Make changes following TDD:**
   - Write tests first
   - Implement feature
   - Ensure all tests pass

5. **Run tests before committing:**
```bash
pnpm test
docker compose exec backend php artisan test
```

6. **Commit and push:**
```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

7. **Create Pull Request** on GitHub

---

## 🏛️ Architecture Guidelines

### Backend: Features-Based Architecture

**MANDATORY:** All backend code must follow Features-based organization.

#### Structure

```
backend/app/Features/
├── FeatureName/
│   ├── Controllers/FeatureController.php
│   ├── Services/FeatureService.php
│   ├── Tests/FeatureTest.php
│   └── ... (optional: Models, Requests, etc.)
```

#### Rules

**Controllers (STRICT):**
- Maximum 200 lines
- Delegation only (no business logic)
- Call Services for business operations

```php
// ✅ CORRECT
public function store(StoreEventRequest $request): JsonResponse
{
    $event = $this->eventService->createEvent($request->validated());
    return response()->json($event, 201);
}

// ❌ WRONG - Business logic in controller
public function store(Request $request): JsonResponse
{
    $event = Event::create($request->all());
    $event->status = 'draft';
    $event->save();
    return response()->json($event, 201);
}
```

**Services:**
- ALL business logic goes here
- MUST wrap DB operations in transactions

```php
// ✅ CORRECT - Always use transactions
public function createEvent(array $data): Event
{
    return DB::transaction(function () use ($data) {
        $event = Event::create($data);
        // ... other operations
        return $event;
    });
}
```

**Tests:**
- Located in same feature folder
- Feature tests (most common) and Unit tests
- Run in Docker for proper DB setup

### Frontend: Features-Based + Smart/Dumb Components

#### Structure

```
src/features/
├── feature-name/
│   ├── components/
│   │   ├── dumb/           # Presentational components (UI only)
│   │   └── smart/          # Container components (logic + data)
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API calls
│   ├── types/              # TypeScript interfaces
│   └── __tests__/          # Tests for this feature
```

#### Component Rules

**Dumb Components:**
- Pure UI (no business logic)
- Receive all data via props
- No API calls, no hooks (except UI hooks like useState for UI state)

```typescript
// ✅ CORRECT - Dumb component
interface EventCardProps {
  event: Event
  onEdit: (id: number) => void
}

export const EventCard = ({ event, onEdit }: EventCardProps) => {
  return (
    <div>
      <h3>{event.title}</h3>
      <button onClick={() => onEdit(event.id)}>Edit</button>
    </div>
  )
}
```

**Smart Components:**
- Connect hooks + services
- Pass data to dumb components
- Handle business logic

```typescript
// ✅ CORRECT - Smart component
export const EventCardContainer = ({ eventId }: { eventId: number }) => {
  const { event, loading, handleEdit } = useEventManager(eventId)

  if (loading) return <LoadingSpinner />

  return <EventCard event={event} onEdit={handleEdit} />
}
```

#### Import Rules

**MANDATORY:** Use path aliases ONLY (NO relative imports)

```typescript
// ✅ CORRECT
import { eventService } from '@/features/events/services/eventService'
import { Button } from '@/components/ui/Button'

// ❌ WRONG - NEVER use relative imports
import { eventService } from '../../../services/eventService'  // ❌ NO!
import { Button } from '../../ui/Button'  // ❌ NO!
```

---

## 🧪 Testing Requirements

### Philosophy

**Quality over speed. Tests before features (TDD).**

### Backend Testing (PHPUnit)

**Run tests:**
```bash
docker compose exec backend php artisan test
```

**Test Requirements:**
- MUST have >3 assertions minimum
- MUST verify database state (not just return values)
- MUST test edge cases (null, empty, invalid)
- Coverage target: >60%

```php
// ✅ CORRECT - Robust test
test('creates event with all required fields and saves to database', function () {
    $eventData = [
        'title' => 'Test Event',
        'category_id' => 1,
        'location_id' => 1,
        'start_date' => '2025-10-30'
    ];

    $result = $this->eventService->createEvent($eventData);

    expect($result->id)->toBeGreaterThan(0);        // ✅ Assertion 1
    expect($result->title)->toBe('Test Event');     // ✅ Assertion 2
    expect($result->status)->toBe('draft');         // ✅ Assertion 3

    // Verify DB state
    $this->assertDatabaseHas('events', [            // ✅ Assertion 4
        'id' => $result->id,
        'title' => 'Test Event'
    ]);
});
```

### Frontend Testing (Jest + RTL)

**Run tests:**
```bash
pnpm test
```

**Test Requirements:**
- Test behavior, not implementation
- Use React Testing Library queries
- Test user interactions

```typescript
// ✅ CORRECT - Test behavior
test('displays event title and allows editing', () => {
  const mockEvent = { id: 1, title: 'Test Event' }
  const mockOnEdit = jest.fn()

  render(<EventCard event={mockEvent} onEdit={mockOnEdit} />)

  expect(screen.getByText('Test Event')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: /edit/i }))
  expect(mockOnEdit).toHaveBeenCalledWith(1)
})
```

### N+1 Query Prevention

**`preventLazyLoading()` is active in development and tests.** Any lazy-loaded relationship
throws `LazyLoadingViolationException` immediately — the test fails, the dev sees the exact
model and relation. This is the primary guardrail.

**Rules:**
1. **Always** use `->with()` to eager-load relations you'll access after the query
2. **Always** use `whenLoaded()` in API Resources (never access relations directly)
3. **Never** access `$model->relation` without ensuring it's eager-loaded
4. **Use** `$user->organization_id` (cached accessor) instead of `$user->organizations()->first()->id`
5. **Use** `$user->getRoleCode()` instead of `$user->role?->role_code`

**In tests:** Use `assertMaxQueries()` for critical endpoints:

```php
use Tests\Concerns\AssertsQueryCount;

class MyTest extends TestCase
{
    use AssertsQueryCount;

    public function test_endpoint_query_budget(): void
    {
        // Seed 20 records, assert constant query count
        $this->assertMaxQueries(10, function () {
            $this->getJson('/api/v1/my-endpoint')->assertOk();
        });
    }
}
```

See `tests/Feature/Performance/QueryCountTest.php` for examples.

### Test Coverage Targets

- Backend: >60% on Services and Controllers
- Frontend: >50% overall, >80% on critical paths
- **Current:** 164/164 tests passing (100%)

---

## 🎨 Code Style

### Backend (PHP)

- **PSR-12** coding standard
- **Laravel conventions**
- Run Pint before committing: `docker compose exec backend ./vendor/bin/pint`

**Logging Rules:**
- Maximum 1 log per 50 lines of code
- ONLY log errors and business events
- NO Log::debug in production

```php
// ✅ CORRECT - Minimal, meaningful logging
try {
    $event = $this->service->createEvent($data);
    Log::info('Event created', ['event_id' => $event->id]);
    return $event;
} catch (\Exception $e) {
    Log::error('Failed to create event', [
        'error' => $e->getMessage(),
        'user_id' => auth()->id()
    ]);
    throw $e;
}
```

### Frontend (TypeScript)

- **ESLint + Prettier**
- **TypeScript strict mode**
- Run linter: `pnpm run lint`

**Strict Rules:**
- ZERO `any` types (use `unknown` + type guards)
- ZERO `console.log` in production code
- ALL functions must have return types
- ALL props must have interfaces

```typescript
// ✅ CORRECT
interface CreateEventData {
  title: string
  categoryId: number
}

async function createEvent(data: CreateEventData): Promise<Event> {
  return eventService.create(data)
}

// ❌ WRONG
function createEvent(data: any): any {  // ❌ NO any types!
  console.log('Creating event', data)   // ❌ NO console.log!
  return eventService.create(data)
}
```

---

## 📝 Commit Messages

### Format

```
type(scope): description

[optional body]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(events): add event duplication functionality
fix(auth): correct token expiration logic
docs: update API documentation with new endpoints
refactor(categories): simplify category service logic
test(events): add integration tests for event creation
```

---

## 🔄 Pull Request Process

### Before Creating PR

1. **Ensure all tests pass:**
```bash
pnpm test
docker compose exec backend php artisan test
```

2. **Run linters:**
```bash
pnpm run lint
docker compose exec backend ./vendor/bin/pint
```

3. **Update documentation** if needed

### PR Template

```markdown
## Description
[Brief description of changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Backend tests pass (527+)
- [ ] Frontend tests pass (2882+)
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project architecture
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log or debug code
- [ ] Commit messages follow convention
```

### Review Process

1. **Automated checks** must pass (tests, linters)
2. **Code review** by maintainer
3. **Approval** required before merge
4. **Squash and merge** to main

---

## 🐛 Debugging

### Backend

**View logs:**
```bash
docker compose logs -f backend
```

**Access container shell:**
```bash
docker compose exec backend bash
```

**Run artisan commands:**
```bash
docker compose exec backend php artisan [command]
```

### Frontend

**View dev server logs:** Check terminal where `pnpm run dev` is running

**Debug in browser:** Use React DevTools and browser DevTools

---

## 📚 Additional Resources

- [Backend Architecture](docs/backend/ARCHITECTURE.md) - Detailed backend architecture
- [Frontend Architecture](docs/frontend/ARCHITECTURE.md) - Detailed frontend architecture
- [API Documentation](docs/API.md) - API endpoints reference
- [claude.md](claude.md) - AI assistant coding standards

---

## 🤝 Getting Help

If you encounter issues:

1. Check this CONTRIBUTING.md
2. Review architecture documentation
3. Check existing tests for examples
4. Ask in team chat

---

## ⚠️ Important Reminders

1. **Quality over speed** - Take time to do it right
2. **Tests before code** - TDD approach
3. **No `any` types** - TypeScript strict mode
4. **Use transactions** - All DB writes must be in transactions
5. **Path aliases only** - No relative imports
6. **Run tests in Docker** - Backend tests need full DB setup

---

**Last Updated:** March 25, 2026
**Maintained by:** Marcos Rillo Cabanne
