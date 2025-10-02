# Backend Architecture Documentation

## Overview
Laravel API-first application with Features-based architecture and PostgreSQL 3NF database.

**Last Updated:** October 2, 2025
**Version:** 2.0 (Post-Consolidation)
**Status:** Production Ready

---

## Architecture Style

### Features-Based Organization
The backend follows a domain-driven **Features** architecture, organizing code by business functionality rather than technical layers.

```
app/Features/
├── Appearance/
│   └── Controllers/AppearanceController.php
├── Approval/
│   ├── Controllers/ApprovalController.php
│   └── Services/ApprovalService.php
├── Auth/
│   ├── Controllers/AuthController.php
│   └── Services/AuthService.php
├── Categories/
│   ├── Controllers/CategoryController.php
│   └── Services/CategoryService.php
├── Dashboard/
│   ├── Controllers/DashboardController.php
│   └── Services/DashboardService.php
├── Events/
│   ├── Controllers/EventController.php
│   └── Services/EventService.php
├── Locations/
│   ├── Controllers/LocationController.php
│   └── Services/LocationService.php
└── PublicEvents/
    └── Controllers/PublicEventController.php
```

**Features Count:** 8
**Total LOC:** 3,160 lines
**Controllers:** 8
**Services:** 6

---

## Design Patterns

### 1. Single Responsibility Principle
- **Controllers**: ≤ 200 lines, only routing and delegation
- **Services**: Business logic and validations
- **Models**: Data representation and relationships

### 2. Service Layer Pattern
All business logic is centralized in Service classes:
- Input validation
- Business rule enforcement
- Data transformation
- Transaction coordination

### 3. Database Transactions
**All write operations** are wrapped in `DB::transaction()`:
- Create operations
- Update operations
- Delete operations
- Bulk operations

**Total transactions implemented:** 12
**Services with transactions:**
- CategoryService: 3 transactions
- LocationService: 3 transactions
- ApprovalService: 4 transactions
- EventService: 2 transactions

### 4. Comprehensive Error Logging
Every operation includes error logging:
```php
try {
    // Operation
    Log::info('Operation successful', ['context']);
} catch (\Exception $e) {
    Log::error('Operation failed', ['error' => $e->getMessage()]);
    throw $e;
}
```

**Total log statements:** 39
- Log::info: 20
- Log::error: 18
- Log::warning: 1

---

## Database Architecture

### Technology
- **Engine:** PostgreSQL 15.13
- **Normalization:** Third Normal Form (3NF)
- **Port:** 5432 (Docker internal)

### Key Design Decisions

#### Lookup Tables (3NF)
Replaced hardcoded ENUMs with database lookup tables:
- `user_roles`
- `event_statuses`
- `event_types`
- `organization_types`
- `organization_statuses`

**Benefits:**
- Dynamic data without code changes
- Multi-language support ready
- Historical tracking possible
- No application redeployment for new values

#### Relationships
All foreign keys use:
- Native PostgreSQL foreign key constraints
- `onDelete` and `onUpdate` cascade rules
- Eloquent relationship methods

**Total Models:** 13
**Total Migrations:** 19

---

## API Structure

### Versioning
- **Base URL:** `/api/v1/`
- **Format:** REST with JSON responses
- **Total Routes:** 50
- **Routes using Features:** 100%

### Authentication
- **Method:** Laravel Sanctum with JWT Bearer tokens
- **Roles:** 4 hierarchical levels
  1. `platform_admin` - Global administration
  2. `entity_admin` - Entity (Ente) administration
  3. `entity_staff` - Entity staff members
  4. `organizer_admin` - Organization administrators

### Endpoints by Feature

**Appearance:** 5 endpoints (admin/appearance)
**Approval:** 6 endpoints (events approval workflow)
**Auth:** 4 endpoints (login, register, logout, me)
**Categories:** 5 endpoints (CRUD + active list)
**Dashboard:** 3 endpoints (stats, summaries)
**Events:** 8 endpoints (CRUD + duplicate, featured, stats)
**Locations:** 5 endpoints (CRUD + active list)
**PublicEvents:** 5 endpoints (public-facing event listing)

---

## Testing

### Test Suite
- **Total Tests:** 26
- **Test Files:** 6
- **Coverage:** ~65% on critical paths
- **All Passing:** ✅

### Test Breakdown
- **ApprovalTest:** 6 tests (15 assertions)
- **CategoryTest:** 5 tests (21 assertions)
- **EventTest:** 8 tests (33 assertions)
- **LocationTest:** 5 tests (21 assertions)
- **ExampleTest:** 1 test (1 assertion)
- **Unit Tests:** 1 test (1 assertion)

### Test Organization
Tests are organized by Feature:
```
tests/Feature/
├── ApprovalTest.php
├── CategoryTest.php
├── EventTest.php
├── LocationTest.php
└── ExampleTest.php
```

### Running Tests
```bash
# Full suite
docker exec plataforma-calendario-backend php artisan test

# Specific feature
docker exec plataforma-calendario-backend php artisan test --filter=EventTest

# With coverage (requires Xdebug)
php artisan test --coverage
```

---

## Code Quality Metrics

### Architecture
- **Features-based:** 100% ✅
- **Legacy code:** 0 files ✅
- **Monolithic controllers:** 0 ✅

### Code Statistics
- **Total LOC:** 3,160 (Features only)
- **Controllers:** 8
- **Services:** 6
- **Models:** 13
- **Migrations:** 19
- **Seeders:** 13

### Quality Indicators
- ✅ All write operations transactional
- ✅ Comprehensive error logging
- ✅ Type hints enforced
- ✅ PHPDoc standards followed
- ✅ Zero TODO/FIXME comments
- ✅ No backup or versioned files

---

## Development

### Local Setup
```bash
# Start services
docker-compose up -d

# Run migrations
docker exec plataforma-calendario-backend php artisan migrate

# Seed database
docker exec plataforma-calendario-backend php artisan db:seed

# Run tests
docker exec plataforma-calendario-backend php artisan test
```

### Environment
- **Backend Port:** 8000
- **Database Port:** 5432
- **Development:** Hot reload enabled
- **Container Names:**
  - Backend: `plataforma-calendario-backend`
  - Database: `plataforma-calendario-db`

---

## Future Improvements

### Planned
- [ ] Increase test coverage to >80%
- [ ] Add API rate limiting
- [ ] Implement Redis caching layer
- [ ] Add request validation middleware
- [ ] Implement event sourcing for audit trail

### Under Consideration
- GraphQL endpoint alongside REST
- Microservices architecture for scale
- Elasticsearch for advanced search

---

## Migration History

### Version 2.0 - Features Architecture (2025)
- Migrated from MySQL to PostgreSQL 3NF
- Implemented Features-based architecture
- Added comprehensive test suite (26 tests)
- Implemented database transactions (12 total)
- Removed all monolithic controllers
- Added comprehensive logging (39 statements)
- Achieved 100% Features architecture

### Version 1.0 - Initial (2024)
- Basic CRUD operations
- Monolithic controller structure
- MySQL with hardcoded ENUMs

---

**For detailed migration history, see:** `CHANGELOG.md`
**For consolidated metrics, see:** `audits/2025-10-phase5/outputs/04-metrics.txt`
**For audit summary, see:** `audits/2025-10-phase5/outputs/00-AUDIT-SUMMARY.md`
