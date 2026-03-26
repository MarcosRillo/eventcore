# Plataforma de Eventos Turisticos - Tucuman

> Multi-tenant event management platform for tourism in Argentina

[![Tests](https://img.shields.io/badge/tests-3409%20passing-brightgreen)]()
[![Backend](https://img.shields.io/badge/Laravel-12-red)]()
[![Frontend](https://img.shields.io/badge/Next.js-15.5.9-black)]()
[![PHP](https://img.shields.io/badge/PHP-8.2-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)]()

---

## Overview

Professional platform for centralized management of tourism events with multi-tenant approval and publication workflow.

**Client:** Ente de Turismo de Tucuman
**Model:** Multi-tenant (government entities, hotels, restaurants, organizers)
**Architecture:** Monorepo with Features-based architecture

---

## Stack

### Backend
- **Framework:** Laravel 12, PHP 8.2, Sanctum 4.2
- **Database:** PostgreSQL 15
- **Cache:** Redis (Upstash in production)
- **Testing:** PHPUnit (527 tests, 2172 assertions)
- **API:** RESTful, versioned (/api/v1/), 97 endpoints

### Frontend
- **Framework:** Next.js 15.5.9 (App Router)
- **React:** 19.2.3, TypeScript 5.9.3 (strict mode)
- **Styling:** Tailwind CSS 4
- **Testing:** Jest 30.2.0 + React Testing Library (2882 tests)

### Infrastructure
- **Backend Deploy:** Render (Docker/FrankenPHP)
- **Frontend Deploy:** Vercel
- **Database:** Neon PostgreSQL (serverless)
- **Cache:** Upstash Redis
- **Dev:** Docker Compose (PostgreSQL 15 + Redis 7 + Nginx + MailHog)

---

## Metrics

### Backend (verified 2026-03-25)
| Category | Count |
|----------|-------|
| Features | 12 (Approval, Auth, Dashboard, EventTypes, Events, InternalCalendar, Locations, Organizations, Organizer, PublicEvents, Shared, Users) |
| Controllers | 18 |
| Services | 24 |
| Models | 21 |
| Migrations | 46 |
| API Routes | 97 (GET:48, POST:21, PUT:6, PATCH:14, DELETE:8) |
| Form Requests | 29 |
| Tests | 527 passing (40 test files) |

### Frontend (verified 2026-03-25)
| Category | Count |
|----------|-------|
| Features | 14 (auth, entity-admin, event-types, events, internal-calendar, invitations, landing, locations, organizations, organizer, organizer-dashboard, public-calendar, registration-requests, users) |
| Components | 189 (109 feature + 80 shared) |
| Hooks | 38 (7 shared + 31 feature) |
| Services | 26 (5 shared + 21 feature) |
| Pages/Routes | 27 |
| Tests | 2882 passing (160 test files) |

**Total Tests: 3409 passing (100%)**

---

## Quick Start

### Prerequisites
- Docker Desktop
- Node.js 22+
- Git

### Installation

```bash
git clone https://github.com/MarcosRillo/plataforma-calendario.git
cd plataforma-calendario

# Start backend services
make install    # First time: builds, migrates, seeds
# OR
make up         # Subsequent runs

# Start frontend
cd frontend && pnpm install && pnpm dev
```

### Access
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/v1/
- **Database:** localhost:5432

### Running Tests

```bash
# Backend (Docker required)
docker compose exec backend php artisan test

# Frontend
cd frontend && pnpm test

# Code style
docker compose exec backend vendor/bin/pint --test
cd frontend && pnpm run lint
```

---

## Project Structure

```
plataforma-calendario/
├── frontend/                      # Next.js 15 + React 19
│   └── src/
│       ├── app/                   # App Router (27 pages)
│       ├── features/              # 14 feature modules
│       │   ├── auth/
│       │   ├── entity-admin/
│       │   ├── event-types/
│       │   ├── events/
│       │   ├── internal-calendar/
│       │   ├── invitations/
│       │   ├── landing/
│       │   ├── locations/
│       │   ├── organizations/
│       │   ├── organizer/
│       │   ├── organizer-dashboard/
│       │   ├── public-calendar/
│       │   ├── registration-requests/
│       │   └── users/
│       ├── shared/                # 80 shared components
│       └── context/               # AuthContext
│
├── backend/                       # Laravel 12 + PHP 8.2
│   └── app/
│       ├── Features/              # 12 feature modules
│       │   ├── Approval/
│       │   ├── Auth/
│       │   ├── Dashboard/
│       │   ├── EventTypes/
│       │   ├── Events/
│       │   ├── InternalCalendar/
│       │   ├── Locations/
│       │   ├── Organizations/
│       │   ├── Organizer/
│       │   ├── PublicEvents/
│       │   ├── Shared/
│       │   └── Users/
│       └── Models/                # 21 Eloquent models
│
├── docs/                          # Architecture & changelogs
├── docker-compose.yml             # Dev environment
├── render.yaml                    # Render deploy config
└── Makefile                       # Dev automation
```

---

## Architecture

Both backend and frontend follow a **Features-based architecture**, organizing code by business domain rather than technical layers. Each feature encapsulates its own controllers, services, components, hooks, and tests.

See detailed documentation:
- [Backend Architecture](docs/backend/ARCHITECTURE.md)
- [Frontend Architecture](docs/frontend/ARCHITECTURE.md)

---

## Key Features

### Entity Admin (Tourism Board)
- Approve/reject/request changes on events
- Manage organizations, users, invitations
- Internal calendar with stats dashboard
- Event type and location management

### Organizers (Hotels, Restaurants, etc.)
- Create and manage events with image upload
- Track approval workflow status
- Statistics dashboard
- Calendar view of own events

### Public (Tourists)
- Browse public event calendar
- Filter by type, location, date range
- Search events
- View event details with QR codes

### Platform Security
- Role-based access control (4 roles)
- API rate limiting (3 named limiters)
- Redis caching with tag invalidation
- CORS with credentials whitelist
- HTML sanitization (XSS prevention)
- Multi-tenant data isolation (TenantScope)

---

## Testing

- **Backend:** PHPUnit with RefreshDatabase, SQLite in-memory for isolation
- **Frontend:** Jest + React Testing Library, strict console policy
- **CI:** GitHub Actions (test + lint + security audit)

**Current: 3409/3409 tests passing (100%)**

Note: Backend tests must run in Docker (PostgreSQL required for full migration compatibility).

---

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines
- [Backend Architecture](docs/backend/ARCHITECTURE.md)
- [Frontend Architecture](docs/frontend/ARCHITECTURE.md)
- [Backend Changelog](docs/backend/CHANGELOG.md)
- [Frontend Changelog](docs/frontend/CHANGELOG.md)

---

## License

Proprietary - Ente de Turismo de Tucuman

---

**Lead Developer:** Marcos Rillo Cabanne
**Last Updated:** March 25, 2026
**Version:** 2.1.0
