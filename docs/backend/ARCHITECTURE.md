# Backend Architecture

## 1. Overview

Laravel API-first application with Features-based architecture and PostgreSQL 3NF database. All business logic is organized by domain feature, with a strict service layer separating concerns between controllers, services, and models.

- **Framework:** Laravel 12
- **Language:** PHP 8.2
- **Authentication:** Sanctum 4.2
- **Database:** PostgreSQL 15

---

## 2. Features Architecture

The backend organizes code into 12 domain features. Each feature contains its own `Controllers/`, `Services/`, and `Requests/` directories.

| Feature | Description |
|---|---|
| **Approval** | Event approval workflow for entity administrators |
| **Auth** | Authentication, registration, and session management |
| **Dashboard** | Aggregated statistics and summaries for admin panels |
| **EventTypes** | Event type and subtype management (CRUD and hierarchy) |
| **Events** | Core event lifecycle: creation, editing, duplication, status transitions |
| **InternalCalendar** | Internal calendar views and date-based queries for staff |
| **Locations** | Venue and location management with availability tracking |
| **Organizations** | Organization entity management |
| **Organizer** | Organizer-scoped views, statistics, and event management |
| **PublicEvents** | Public-facing event listing, filtering, and detail pages |
| **Shared** | Cross-cutting services and utilities used by multiple features |
| **Users** | User CRUD, role assignment, and invitation handling |

---

## 3. Design Patterns

### Service Layer Pattern

All business logic is centralized in service classes. Controllers are thin -- they accept the request, delegate to a service, and return the response. Services handle:

- Business rule enforcement
- Data transformation
- Transaction coordination
- Cross-feature orchestration

### Form Request Validation

Validation is handled by 29 Form Request classes. These use `prepareForValidation()` to sanitize HTML input before validation rules are applied, providing XSS prevention at the request boundary.

### Database Transactions

All write operations are wrapped in `DB::transaction()` to guarantee atomicity. This covers create, update, delete, and bulk operations across every service.

---

## 4. Database

### Technology

- **Engine:** PostgreSQL 15
- **Normalization:** Third Normal Form (3NF)
- **Models:** 21
- **Migrations:** 46
- **Performance Indexes:** 13 database indexes for query optimization

### Design Decisions

- Lookup tables replace hardcoded ENUMs (user roles, event statuses, event types, organization types, organization statuses), enabling dynamic data changes without code deployments.
- All foreign keys use native PostgreSQL constraints with `onDelete` and `onUpdate` cascade rules.
- `preventLazyLoading` is enabled in non-production environments to catch N+1 query issues during development.

---

## 5. API

### Overview

- **Base URL:** `/api/v1/`
- **Format:** REST with JSON responses
- **Total Routes:** 97 (GET: 48, POST: 21, PUT: 6, PATCH: 14, DELETE: 8)

### Endpoints by Feature

| Feature | Endpoints |
|---|---|
| Auth | 10 |
| Users | 6 |
| Invitations | 4 |
| Registration Requests | 7 |
| Events (Admin) | 7 |
| Events (Approval) | 7 |
| Dashboard | 5 |
| Organizer | 8 |
| Locations | 8 |
| Event Types | 8 |
| Event Subtypes | 7 |
| Organizations | 3 |
| Internal Calendar | 4 |
| Public Events | 11 |
| Legacy | 1 |
| **Total** | **97** |

### Rate Limiting

Three named rate limiters protect the API:

| Limiter | Limit |
|---|---|
| `public` | 60 requests/min |
| `public-heavy` | 20 requests/min |
| `authenticated` | 120 requests/min |

---

## 6. Security

### Authentication

Sanctum token authentication with httpOnly cookies. The `CookieTokenMiddleware` extracts the token from the cookie and attaches it to the request for Sanctum to process.

### Authorization

- **Roles:** 4 hierarchical levels -- `platform_admin`, `entity_admin`, `entity_staff`, `organizer_admin`
- **Middleware:** `CheckRole` enforces role-based access on route groups
- **Middleware:** `CheckActiveUser` blocks deactivated accounts from accessing protected routes
- **Policy:** `EventPolicy` provides fine-grained authorization for event operations

### Multi-Tenancy

`TenantScope` is a global Eloquent scope that automatically filters queries by the authenticated user's entity. This ensures complete data isolation between tenants at the query level.

### CORS

CORS is configured with a `FRONTEND_URL` whitelist and `supports_credentials` enabled to allow cookie-based authentication from the frontend.

### XSS Prevention

Form Requests use `prepareForValidation()` to sanitize HTML input before it reaches the application, stripping dangerous content at the request boundary.

---

## 7. Caching

### Redis Cache Layer

The application uses Redis for response caching with tag-based invalidation.

- **EventCacheObserver** -- automatically invalidates event-related caches when events are created, updated, or deleted.
- **EventTypeCacheObserver** -- automatically invalidates event type caches on changes.

Cache tags allow selective invalidation: when a single event changes, only caches tagged with that event's data are purged rather than flushing all caches.

### Rate Limiter Store

The rate limiting system uses the database store (not Redis) for persistence.

---

## 8. Testing

### Test Suite

- **Test Files:** 40 (39 Feature, 1 Unit)
- **Tests Passing:** 527 (2172 assertions)
- **Database Strategy:** `RefreshDatabase` trait with SQLite in-memory database for test isolation
- **Environment:** Tests run inside Docker against an isolated database instance

### Running Tests

```bash
# Full suite
docker compose exec backend php artisan test

# Specific feature
docker compose exec backend php artisan test --filter=EventTest
```

---

## 9. Metrics Summary

| Metric | Count |
|---|---|
| Features | 12 |
| Controllers | 18 |
| Services | 24 |
| Models | 21 |
| Migrations | 46 |
| API Routes | 97 |
| Form Requests | 29 |
| API Resources | 6 |
| Middleware | 3 |
| Observers | 2 |
| Policies | 1 |
| Seeders | 14 |
| Factories | 6 |
| Test Files | 40 |
| Tests Passing | 527 |
| Assertions | 2172 |
| Database Indexes | 13 |

---

## 10. Last Updated

March 25, 2026
