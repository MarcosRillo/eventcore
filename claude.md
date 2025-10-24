# claude.md - Plataforma Multi-Tenant de Eventos Turísticos

**Project Status:** MVP 75% completo, enfoque en completar Panel Organizador  
**Current Sprint:** Sprint 1 - Opción C (Launch rápido + iteración)  
**Last Updated:** Octubre 24, 2025

---

## 🎯 PROJECT OVERVIEW

Sistema de gestión de eventos turísticos multi-tenant para Argentina. 

**Primary Entity:** Ente de Turismo de Tucumán (aprueba/rechaza eventos)  
**Secondary Entities:** Hoteles, restaurantes, organizadores (crean eventos)  
**Public:** Turistas (ven calendario público)

---

## 🏗️ ARCHITECTURE PRINCIPLES (STRICT - NO EXCEPTIONS)

### Backend (Laravel 11 + PostgreSQL 15)

#### 1. Features-Based Organization (MANDATORY)
```
app/Features/
├── Events/
│   ├── Controllers/EventController.php
│   ├── Services/EventService.php
│   └── Tests/EventTest.php
├── Approval/
├── Categories/
└── [other features...]
```

**Rules:**
- EVERY new feature goes in `app/Features/{Feature}/`
- Controller MUST be ≤ 200 lines (delegation only)
- Business logic MUST be in Service class
- Tests MUST be in same feature folder

#### 2. Database Transactions (NO EXCEPTIONS)
```php
// ✅ CORRECT - ALWAYS
public function createEvent(array $data): Event
{
    return DB::transaction(function () use ($data) {
        $event = Event::create($data);
        // ... other operations
        return $event;
    });
}

// ❌ WRONG - NEVER DO THIS
public function createEvent(array $data): Event
{
    $event = Event::create($data);  // No transaction!
    return $event;
}
```

**Rules:**
- ALL creates, updates, deletes MUST be wrapped in `DB::transaction()`
- NO exceptions, even for "simple" operations
- Transactions protect data integrity

#### 3. Error Logging (STRICT)
```php
// ✅ CORRECT
try {
    $result = $this->service->doSomething();
    Log::info('Operation successful', ['user_id' => $userId]);
    return $result;
} catch (\Exception $e) {
    Log::error('Operation failed', [
        'error' => $e->getMessage(),
        'user_id' => $userId
    ]);
    throw $e;
}
```

**Rules:**
- ALWAYS log errors with context
- ONLY log business events (user created, order placed)
- **MAX 1 log statement per 50 lines of code** ⚠️
- NO Log::debug in production code
- NO excessive logging (tech debt!)

#### 4. Eloquent Relationships (Prevent N+1)
```php
// ✅ CORRECT
$events = Event::with(['category', 'location'])->get();

// ❌ WRONG - N+1 query
$events = Event::all();
foreach ($events as $event) {
    echo $event->category->name;  // N+1!
}
```

---

### Frontend (Next.js 15 + React 19 + TypeScript)

#### 1. Features-Based Organization (MANDATORY)
```
src/features/
├── events/
│   ├── components/
│   │   ├── dumb/       # Presentational (UI only)
│   │   └── smart/      # Container (logic + data)
│   ├── hooks/          # Custom hooks
│   ├── services/       # API calls
│   ├── types/          # TypeScript interfaces
│   └── __tests__/      # Tests
```

**Rules:**
- EVERY feature in `src/features/{feature}/`
- Components MUST be separated: dumb vs smart
- Dumb = NO business logic, NO API calls
- Smart = connects hooks + services, passes props to dumb

#### 2. TypeScript Strict Mode (NO ANY TYPES)
```typescript
// ✅ CORRECT
interface Event {
  id: number
  title: string
  categoryId: number
}

function createEvent(data: Event): Promise<Event> {
  return eventService.create(data)
}

// ❌ WRONG - NEVER USE ANY
function createEvent(data: any): any {  // ❌ NO!
  return eventService.create(data)
}
```

**Rules:**
- ZERO `any` types anywhere
- ALL props must have interfaces
- ALL functions must have return types
- Use `unknown` instead of `any` (then type guard)

#### 3. Path Aliases ONLY (ZERO Relative Imports)
```typescript
// ✅ CORRECT
import { eventService } from '@/features/events/services/eventService'
import { Button } from '@/components/ui/Button'

// ❌ WRONG - NEVER USE RELATIVE IMPORTS
import { eventService } from '../../../services/eventService'  // ❌ NO!
import { Button } from '../../ui/Button'  // ❌ NO!
```

**Rules:**
- ALWAYS use `@/*` path aliases
- ZERO `../` imports allowed
- Instant rejection if relative imports found

#### 4. Console.log = FORBIDDEN
```typescript
// ❌ WRONG - NEVER IN PRODUCTION
console.log('User data:', user)  // ❌ NO!
console.error('Error:', error)   // ❌ NO!

// ✅ CORRECT
// Use error boundaries for React errors
// Use analytics events for user actions
// NO console statements in production code
```

**Rules:**
- ZERO `console.log` in production code
- ZERO `console.error` in production code
- Use proper error boundaries
- Analytics events only (user actions)

---

## 🧪 TESTING REQUIREMENTS (STRICT)

### Test Quality Rules (CRITICAL)

**EVERY test MUST:**
1. Have descriptive name (what it tests, not just "works")
2. Test actual behavior, not implementation details
3. Include edge cases (null, empty, invalid input)
4. Have **>3 assertions minimum**
5. Verify side effects:
   - Backend: Check database state
   - Frontend: Check DOM state or state changes

```typescript
// ❌ SUPERFICIAL TEST (NEVER GENERATE THIS)
test('creates event', async () => {
  const result = await createEvent({})
  expect(result).toBeDefined()  // ❌ This validates NOTHING!
})

// ✅ ROBUST TEST (ALWAYS LIKE THIS)
test('creates event with all required fields and saves to database', async () => {
  // Arrange
  const eventData = {
    title: 'Test Event',
    categoryId: 1,
    locationId: 1,
    startDate: '2025-10-30'
  }
  
  // Act
  const result = await createEvent(eventData)
  
  // Assert
  expect(result.id).toBeGreaterThan(0)         // ✅ Assertion 1
  expect(result.title).toBe('Test Event')      // ✅ Assertion 2
  expect(result.status).toBe('draft')          // ✅ Assertion 3
  
  // Verify database state
  const dbEvent = await Event.findById(result.id)
  expect(dbEvent).toBeDefined()                // ✅ Assertion 4
  expect(dbEvent.title).toBe('Test Event')     // ✅ Assertion 5
})
```

### Coverage Targets
- Backend: >60% on critical paths (Services, Controllers)
- Frontend: >50% overall, >80% on critical components
- E2E: 10+ critical scenarios (Cypress)

---

## 🚫 ANTI-PATTERNS (DO NOT GENERATE)

### 1. Over-Engineering (KISS Principle)
```php
// ❌ WRONG - Over-engineered
interface EventFactoryInterface {}
abstract class AbstractEventFactory implements EventFactoryInterface {}
class ConcreteEventFactory extends AbstractEventFactory {}
class EventBuilder {}
class EventValidator {}
// ... 10 more classes for simple event creation

// ✅ CORRECT - Simple
class EventService {
    public function createEvent(array $data): Event {
        // Simple, direct, readable
    }
}
```

**Rules:**
- Prefer simplicity over cleverness
- NO abstractions until 3rd usage (Rule of Three)
- If solution exceeds 100 lines, justify why
- KISS: Keep It Simple, Stupid

### 2. Excessive Logging
```php
// ❌ WRONG - Too much logging
Log::info('Method started');
Log::debug('Variable x is:', $x);
Log::info('About to query database');
$result = DB::query();
Log::info('Query completed');
Log::debug('Result is:', $result);
Log::info('Method ending');

// ✅ CORRECT - Minimal, meaningful logging
try {
    $result = DB::query();
    Log::info('Query successful', ['count' => $result->count()]);
} catch (\Exception $e) {
    Log::error('Query failed', ['error' => $e->getMessage()]);
}
```

**Rules:**
- Max 1 log per 50 lines of code
- ONLY log errors requiring human intervention
- ONLY log business events (user created, order placed)
- NO debug statements in production

### 3. Unused Code
```typescript
// ❌ WRONG - Unused imports/variables
import { useState, useEffect, useMemo } from 'react'  // useMemo unused!
import { eventService } from '@/services/eventService'  // unused!

const MyComponent = () => {
  const [data, setData] = useState(null)
  const unusedVariable = 'test'  // ❌ unused!
  
  return <div>{data}</div>
}
```

**Rules:**
- ZERO unused imports
- ZERO unused variables
- ZERO dead code
- Run linter before completing task

### 4. Superficial Tests
```typescript
// ❌ WRONG - Test validates nothing
test('function works', () => {
  const result = doSomething()
  expect(result).toBeDefined()  // ❌ Meaningless!
})

// ✅ CORRECT - Test validates behavior
test('calculates total price including tax correctly', () => {
  const result = calculateTotal({ price: 100, taxRate: 0.21 })
  expect(result).toBe(121)  // ✅ Specific, meaningful
})
```

---

## 📋 COMMON PATTERNS (USE THESE)

### Backend: Service Pattern
```php
// Controller (≤ 200 lines, delegation only)
class EventController extends Controller
{
    public function __construct(
        private EventService $eventService
    ) {}
    
    public function store(StoreEventRequest $request): JsonResponse
    {
        $event = $this->eventService->createEvent($request->validated());
        return response()->json($event, 201);
    }
}

// Service (business logic + transactions)
class EventService
{
    public function createEvent(array $data): Event
    {
        return DB::transaction(function () use ($data) {
            $event = Event::create($data);
            
            // Business logic here
            
            Log::info('Event created', ['event_id' => $event->id]);
            return $event;
        });
    }
}
```

### Frontend: Smart/Dumb Components
```typescript
// Dumb (Presentational - src/features/events/components/dumb/)
interface EventCardProps {
  event: Event
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}

export const EventCard = ({ event, onEdit, onDelete }: EventCardProps) => {
  return (
    <div>
      <h3>{event.title}</h3>
      <button onClick={() => onEdit(event.id)}>Edit</button>
    </div>
  )
}

// Smart (Container - src/features/events/components/smart/)
export const EventCardContainer = ({ eventId }: { eventId: number }) => {
  const { event, loading, handleEdit, handleDelete } = useEventManager(eventId)
  
  if (loading) return <LoadingSpinner />
  
  return (
    <EventCard
      event={event}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}
```

### Frontend: Custom Hooks
```typescript
// src/features/events/hooks/useEventManager.ts
export const useEventManager = (eventId?: number) => {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchEvent = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await eventService.getById(eventId)
      setEvent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }
  
  const handleEdit = async (data: Partial<Event>) => {
    // ... implementation
  }
  
  return { event, loading, error, fetchEvent, handleEdit }
}
```

---

## 🎯 CURRENT FOCUS

**Sprint 1 Goal:** Completar Panel Organizador (Semanas 1-2)

**Active Cards:**
- [ ] CARD-001: Organizer Stats API (backend)
- [ ] CARD-002: Organizer Stats UI (frontend)
- [ ] CARD-003: Event List API (backend)
- [ ] CARD-004: Event List UI (frontend)
- [ ] CARD-005: Integration Testing (E2E)

**Current Card:** CARD-001 (Organizer Stats API)

**Files Being Worked On:**
- backend/app/Features/Dashboard/Controllers/OrganizerStatsController.php
- backend/app/Features/Dashboard/Services/OrganizerStatsService.php
- backend/tests/Feature/OrganizerStatsTest.php

**Success Criteria:**
- [ ] 8 tests written and passing
- [ ] Coverage >60% on new code
- [ ] Architectural review score >8/10
- [ ] Zero over-engineering
- [ ] Max 2 log statements total

---

## 📝 RECENT ARCHITECTURAL DECISIONS (ADRs)

### ADR-001: PostgreSQL 3NF over MySQL
**Date:** Octubre 2025  
**Decision:** Migrar de MySQL a PostgreSQL con normalización 3NF  
**Reason:** Escalabilidad multi-tenant, lookup tables para i18n  
**Impact:** Base de datos profesional, vendible a provincias

### ADR-002: Features-Based Architecture
**Date:** Octubre 2025  
**Decision:** Migrar de monolítico a Features-based (backend y frontend)  
**Reason:** Mantenibilidad, escalabilidad, separación de concerns  
**Impact:** 100% código reorganizado, más fácil de mantener

### ADR-003: TypeScript Strict Mode
**Date:** Octubre 2025  
**Decision:** Enforcement de TypeScript strict, zero any types  
**Reason:** Type safety, reducción de bugs runtime  
**Impact:** Interfaces consolidadas de 85+ a 27 (-68%)

### ADR-004: TDD Obligatorio
**Date:** Octubre 24, 2025  
**Decision:** Tests escritos ANTES de implementación (TDD RED→GREEN→REFACTOR)  
**Reason:** Prevenir bugs, forzar diseño, documentación viva  
**Impact:** Workflow cambia a test-first, más lento inicial pero mejor calidad

### ADR-005: Human-in-the-Loop para Claude Code
**Date:** Octubre 24, 2025  
**Decision:** Human review en 6 puntos críticos del workflow  
**Reason:** Prevenir deuda técnica generada por IA (sobre-ingeniería, logging, tests superficiales)  
**Impact:** +35% tiempo humano, pero tech debt mínima

---

## 🛠️ TECH STACK

### Backend
- **Framework:** Laravel 11.x
- **Database:** PostgreSQL 15.13 (Docker)
- **Auth:** Laravel Sanctum (JWT)
- **Testing:** PHPUnit 11.x
- **Logging:** Laravel Log facade
- **Ports:** Backend 8000, DB 5432

### Frontend
- **Framework:** Next.js 15.5.4 (App Router)
- **Library:** React 19.1.0
- **Language:** TypeScript 5.9.2 (strict mode)
- **Styling:** Tailwind CSS 4.x
- **Testing:** Jest + React Testing Library
- **E2E:** Cypress
- **Port:** Frontend 3000

### Development
- **Container:** Docker + Docker Compose
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions (pending)
- **Linting:** ESLint 9.x, PHPStan (pending)

---

## 📚 DOCUMENTATION STRUCTURE

```
docs/
├── ARCHITECTURE.md          # Arquitectura detallada (READ THIS!)
├── ROADMAP-ESTRATEGICO.md   # Roadmap 6 meses
├── ROADMAP-EJECUTIVO.md     # Versión no-técnica para management
├── ANALISIS-DECISION.md     # Análisis Opción A vs B vs C
├── TECHNICAL-DEBT-INVENTORY.md  # Tracking de deuda técnica
├── tasks/
│   ├── TASK-001-organizer-stats.md
│   └── [otras tasks...]
└── cards/
    ├── CARD-001-stats-api.md
    └── [otras cards...]
```

**Read Before Starting ANY Task:**
1. claude.md (this file) - Architecture rules
2. docs/ARCHITECTURE.md - Detailed architecture
3. docs/cards/CARD-XXX.md - Current card spec

---

## 🚀 WORKFLOW CHECKLIST

When generating code, ALWAYS follow this checklist:

### Before Generating Code
- [ ] Read claude.md (architecture rules)
- [ ] Read relevant CARD spec
- [ ] Read reference implementations (similar features)
- [ ] Identify files to create/modify (explicit paths)

### During Code Generation
- [ ] Follow Features-based structure
- [ ] Apply KISS principle (no over-engineering)
- [ ] Wrap DB writes in transactions (backend)
- [ ] Use path aliases only (frontend)
- [ ] Zero console.log (frontend)
- [ ] Max 1 log per 50 lines (backend)
- [ ] Remove unused imports/variables

### After Code Generation
- [ ] Run linter (ESLint / PHPStan)
- [ ] Run tests
- [ ] Verify tests have >3 assertions
- [ ] Verify tests include edge cases
- [ ] Check architectural compliance
- [ ] ZERO warnings

---

## ⚠️ RED FLAGS (Stop and Ask Human)

If you encounter these situations, STOP and ask the human:

1. **Solution exceeds 100 lines**
   - Ask: "This seems complex. Is there a simpler way?"

2. **Needing 3+ abstractions for simple task**
   - Ask: "Am I over-engineering this?"

3. **Test only has 1-2 assertions**
   - Ask: "These tests seem superficial. Should I add more?"

4. **Unclear requirement in spec**
   - Ask: "Can you clarify [specific requirement]?"

5. **Conflicting patterns in codebase**
   - Ask: "I see pattern A and pattern B. Which should I follow?"

6. **Performance concern (N+1, missing index)**
   - Ask: "This might have performance issues. Should I optimize?"

---

## 📊 PROJECT METRICS (Current)

**Code Quality:**
- Backend Tests: 26/26 passing (100%)
- Frontend Tests: 91/91 passing (100%)
- Total Tests: 117
- Backend Coverage: ~65%
- Frontend Coverage: ~83%
- TypeScript Errors: 0
- ESLint Warnings: 0

**Architecture:**
- Features-based: 100%
- Smart/Dumb Separation: 100%
- Relative Imports: 0
- Any Types: 0

**Technical Debt:**
- Critical Items: 0
- High Items: 0
- Medium Items: 2 (npm dependencies, PHPUnit warnings)
- Low Items: 1 (Jest types config)
- Score: 9/10 (Excellent)

**Progress:**
- MVP Completion: 75%
- Panel Organizador: 60%
- Sistema Notificaciones: 0%
- Dashboard Analytics: 0%

---

## 🎓 REMINDERS FOR CLAUDE CODE

1. **Read claude.md FIRST** before every task
2. **Ask for explicit file paths** in prompts
3. **Use checkpoints** after each successful card
4. **Test quality > Test quantity**
5. **Simplicity > Cleverness** (KISS principle)
6. **Human review is NOT optional**
7. **When in doubt, ask the human**

---

**This file is the SOURCE OF TRUTH for the project.**

**Update this file whenever:**
- New architectural decision is made (add to ADRs)
- New pattern is established (add to Common Patterns)
- New anti-pattern is discovered (add to Anti-Patterns)
- Focus changes (update Current Focus)
- Metrics change significantly (update Project Metrics)

---

Last Human Review: Octubre 24, 2025  
Next Review: After Sprint 1 (2 semanas)