# Changelog - Backend

All notable changes to the backend architecture are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Event sourcing for audit trail
- Increased test coverage (>80%)

---

## [2.1.0] - 2026-03-25

### Performance & Infrastructure Overhaul

This version includes all optimizations from the P1-P4 audit, deploy migration
from Railway to Render, and comprehensive cleanup of dead code.

#### Added

**API Rate Limiting**
- 3 named limiters: public (60/min), public-heavy (20/min), authenticated (120/min)
- Per-route throttle middleware on all 97 endpoints
- Rate limiter uses database store to minimize Upstash Redis commands

**Redis Caching with Tag Invalidation**
- EventCacheObserver and EventTypeCacheObserver for automatic cache invalidation
- Cache tags for granular invalidation (events, event-types, public-events)
- Redis for caching, database for rate limiting (cost optimization for Upstash free tier)

**Database Performance**
- 13 database indexes added for critical query paths
- 2 partial PostgreSQL indexes (WHERE deleted_at IS NULL) for filtered queries
- preventLazyLoading enabled in non-production environments
- N+1 query elimination across all controllers with eager loading

**SEO**
- robots.txt via MetadataRoute.Robots
- sitemap.xml via MetadataRoute.Sitemap
- JSON-LD structured data for events

**Security**
- TenantScope global scope with dynamic entity_id resolution
- HTML sanitization via Purifier::clean in Form Requests
- httpOnly cookie tokens with configurable SameSite attribute
- CORS whitelist with FRONTEND_URL and supports_credentials

**Deploy Configuration**
- Dockerfile.production with FrankenPHP and OPcache optimization
- render.yaml for Render Blueprint (IaC)
- Dynamic PORT binding for cloud providers
- Migrations in entrypoint (idempotent, for Render free tier without pre-deploy hooks)
- Neon PostgreSQL support with sslmode=require

**Testing**
- Test isolation: SQLite in-memory with forced env vars (CACHE_STORE=array, LOG_CHANNEL=null)
- Tests grew from 36 to 527 (40 test files, 2172 assertions)

#### Changed

**Event Approvals Normalization**
- Replaced legacy approval_history JSON column with normalized event_approvals table (3NF)
- EventApproval model with proper relations

**Auth Cookies**
- SameSite attribute now configurable via config('session.same_site') for cross-domain deploy

#### Removed
- Appearance feature (fully removed: controller, requests, migration, routes)
- CustomField and Section models (no tables, no usage)
- Dead code cleanup: 23 files removed (scripts, reports, unused hooks/services)

---

## [2.0.0] - 2025-10-02

### Major Architectural Refactor

This version represents a complete architectural transformation of the backend,
with ~20 hours of systematic consolidation work across 5 phases.

#### Added

##### Features Architecture
- Implemented domain-driven Features organization
- Created 8 dedicated features: Appearance, Approval, Auth, Categories, Dashboard, Events, Locations, PublicEvents
- Organized code by business functionality, not technical layers
- 8 controllers, 6 services in Features architecture

##### Database
- Migrated from MySQL to PostgreSQL 15.13
- Implemented Third Normal Form (3NF)
- Created 5 lookup tables replacing hardcoded ENUMs
- Added comprehensive foreign key constraints
- Total migrations: 19

##### Testing
- Implemented 26 comprehensive tests (92 assertions)
- Achieved ~65% coverage on critical paths
- Added tests for all CRUD operations
- Created feature-specific test files
- All tests passing ✅

##### Quality Improvements
- Added 12 database transactions for all write operations
  - CategoryService: 3 transactions
  - LocationService: 3 transactions
  - ApprovalService: 4 transactions
  - EventService: 2 transactions
- Implemented comprehensive error logging
  - Total: 39 log statements
  - Log::info: 20
  - Log::error: 18
  - Log::warning: 1
- Enforced type hints across codebase
- Applied PHPDoc standards

#### Changed

##### Architecture
- **Controllers:** Migrated from `Api/V1/` to `Features/{Feature}/Controllers/`
- **Services:** Moved from `app/Services/` to `Features/{Feature}/Services/`
- **Organization:** From technical layers to business domains
- **Result:** 100% Features architecture, 0 legacy code

##### Database Schema
- Replaced ENUMs with lookup tables:
  - `user_roles` (replacing role ENUM)
  - `event_statuses` (replacing status ENUM)
  - `event_types` (replacing type ENUM)
  - `organization_types` (replacing type ENUM)
  - `organization_statuses` (replacing status ENUM)

##### Models
- Updated all relationships to use 3NF structure
- Added foreign key relationships
- Removed hardcoded status/type values
- Total models: 13

#### Removed

##### Legacy Code
- Monolithic controllers (100% eliminated)
- Legacy `Api/V1/` structure (directory no longer exists)
- Duplicate route definitions
- Obsolete service files (app/Services/ no longer exists)
- Hardcoded ENUMs in favor of database lookup tables

##### Technical Debt
- Removed architectural inconsistencies
- Eliminated code duplication
- Cleaned obsolete migrations
- Zero backup files (.backup, .old, .tmp)
- Zero versioned files (-v2, -new, -corrected)
- Zero TODO/FIXME comments

#### Fixed

##### Critical Issues
- Route conflicts and duplications
- Transaction atomicity issues
- Missing foreign key constraints
- Inconsistent error handling
- Model relationship bugs

### Testing & Quality

#### Test Results
- ✅ 26/26 tests passing
- ✅ 92 assertions
- ✅ ~65% coverage on critical paths
- ✅ All CRUD operations verified
- ✅ All Features have dedicated tests

#### Architecture Quality
- ✅ 0 monolithic controllers remaining
- ✅ 100% Features architecture
- ✅ 12/12 write operations transactional
- ✅ Comprehensive error logging (39 statements)
- ✅ Zero technical debt files

### Metrics Comparison

#### Architecture Complexity
- **Before:** Mixed monolithic/modular architecture
- **After:** 100% Features-based organization
- **Reduction:** ~40% architectural complexity

#### Code Organization
- **Controllers in Features:** 8
- **Services in Features:** 6
- **Legacy code remaining:** 0 files ✅
- **Total LOC:** 3,160 lines (Features only)

#### Database
- **Before:** MySQL with hardcoded ENUMs
- **After:** PostgreSQL 3NF with lookup tables
- **Flexibility:** Unlimited new statuses/types without code changes

---

## Phase Breakdown (2.0.0)

### Phase 1: Duplications Resolution (1-2h)
- Resolved EventService duplication
- Resolved EventApprovalController duplication
- Consolidated to Features architecture
- Added missing ApprovalService methods

### Phase 2: PostgreSQL 3NF Migration (6-8h)
- Migrated from MySQL to PostgreSQL 15.13
- Created 5 lookup tables
- Updated all models and relationships
- Created comprehensive seeders

### Phase 3: Testing Suite (6-8h)
- Implemented 26 tests across 6 test files
- Created EventFactory with states
- Fixed Event model STATUSES error
- Fixed EventResource column name issues
- All tests passing

### Phase 4: Database Transactions (2-3h)
- Added DB::transaction to CategoryService (3)
- Added DB::transaction to LocationService (3)
- Added DB::transaction to ApprovalService (4)
- EventService already had transactions (2)
- Added comprehensive logging to all services

### Phase 5: Verification & Audit (2-3h)
- Complete architectural analysis
- Generated consolidated metrics
- Analyzed obsolete files
- Verified all tests passing
- Created documentation

**Total Investment:** ~20-25 hours
**Result:** Enterprise-grade architecture ready for production

---

## [1.5.0] - 2025-06-XX

### Intermediate Improvements

#### Added
- Initial route organization
- Basic service layer separation

#### Changed
- Improved controller organization
- Enhanced error handling

---

## [1.0.0] - 2024-XX-XX

### Initial Release

#### Features
- Basic CRUD operations for Events
- Simple authentication system
- MySQL database
- Monolithic controller structure

#### Database
- MySQL 8.0
- Hardcoded ENUMs for statuses and types
- Basic foreign key relationships

---

## Migration Notes

### From 1.0 to 2.0

**Breaking Changes:**
- Database engine changed (MySQL → PostgreSQL)
- Controller namespaces changed (`Api\V1` → `Features\{Feature}`)
- Status/Type values moved to database (no longer hardcoded)

**Migration Path:**
1. Export data from MySQL
2. Run PostgreSQL migrations
3. Seed lookup tables
4. Import data with transformed references
5. Update frontend to use new API structure

**Estimated Migration Time:** 6-8 hours for database, 2-3 hours for code

---

## Acknowledgments

**Consolidation Work:**
- Phase 1: Duplications (1-2h)
- Phase 2: PostgreSQL Migration (6-8h)
- Phase 3: Testing Suite (6-8h)
- Phase 4: Transactions (2-3h)
- Phase 5: Verification (2-3h)

**Total Investment:** ~20-25 hours
**Result:** Enterprise-grade architecture ready for production

**Audit Date:** October 2, 2025
**Final Status:** ✅ Production Ready

---

**For detailed architecture documentation, see:** `ARCHITECTURE.md`
**For audit outputs, see:** `audits/2025-10-phase5/outputs/`
**For metrics, see:** `audits/2025-10-phase5/outputs/04-metrics.txt`
