# Plataforma de Eventos Turísticos - Tucumán

> Sistema multi-tenant de gestión de eventos turísticos para Argentina

[![Tests](https://img.shields.io/badge/tests-164%2F164%20passing-brightgreen)]()
[![Backend](https://img.shields.io/badge/Laravel-12.24.0-red)]()
[![Frontend](https://img.shields.io/badge/Next.js-15-black)]()
[![PHP](https://img.shields.io/badge/PHP-8.2.29-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)]()

---

## 🎯 Overview

Plataforma profesional para la gestión centralizada de eventos turísticos con sistema de aprobación y publicación multi-tenant.

**Cliente Principal:** Ente de Turismo de Tucumán
**Modelo:** Multi-tenant (gobiernos, hoteles, restaurantes, organizadores)
**Arquitectura:** Monorepo con Features-based architecture

---

## 🏗️ Stack Tecnológico

### Backend
- **Framework:** Laravel 12.24.0
- **PHP:** 8.2.29
- **Database:** PostgreSQL 15 (Docker)
- **Testing:** PHPUnit (36 tests, 153 assertions)
- **API:** RESTful, versionada (/api/v1/)

### Frontend
- **Framework:** Next.js 15.5.4 (App Router)
- **React:** 19.2.0
- **TypeScript:** 5.9.3 (strict mode)
- **Styling:** Tailwind CSS 4.1
- **Testing:** Jest + React Testing Library (128 tests)
- **Node:** v22.15.1

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Database:** PostgreSQL 15 (port 5432)
- **Backend Server:** PHP 8.2 (port 8000)
- **Frontend Server:** Next.js dev server (port 3000)

---

## 📊 Métricas del Proyecto

### Backend (verified 2025-10-29)
- **Features:** 9 (Appearance, Approval, Auth, Categories, Dashboard, Events, Locations, Organizer, PublicEvents)
- **Controllers:** 10
- **Services:** 7
- **Models:** 13
- **Migrations:** 20
- **API Endpoints:** 61
- **Tests:** 36/36 passing ✅ (100%)

### Frontend (verified 2025-10-29)
- **Features:** 6 (appearance, auth, categories, events, locations, organizer)
- **Components:** 78
- **Custom Hooks:** 23
- **Services:** 14
- **Tests:** 128/128 passing ✅ (100%)

**Total Tests:** 164/164 passing (100%) 🎉

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop
- Git

### Installation

1. **Clone repository:**
```bash
git clone https://github.com/MarcosRillo/plataforma-calendario-monorepo.git
cd plataforma-calendario
```

2. **Start Docker containers:**
```bash
docker compose up -d
```

3. **Install frontend dependencies:**
```bash
npm install
```

4. **Access the application:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/v1/
- **Database:** localhost:5432 (PostgreSQL)

### Running Tests

**Backend (in Docker):**
```bash
docker compose exec backend php artisan test
```

**Frontend:**
```bash
npm test
```

**Run all tests:**
```bash
npm test && docker compose exec backend php artisan test
```

---

## 📂 Project Structure

```
plataforma-calendario/
├── src/                           # Frontend (Next.js + React)
│   ├── app/                       # Next.js App Router pages
│   ├── features/                  # Feature-based organization
│   │   ├── appearance/
│   │   ├── auth/
│   │   ├── categories/
│   │   ├── events/
│   │   ├── locations/
│   │   └── organizer/
│   ├── components/                # Shared components
│   ├── context/                   # React Context providers
│   └── hooks/                     # Custom React hooks
│
├── backend/ (Docker)              # Backend (Laravel + PostgreSQL)
│   ├── app/
│   │   ├── Features/              # Feature-based architecture
│   │   │   ├── Appearance/
│   │   │   ├── Approval/
│   │   │   ├── Auth/
│   │   │   ├── Categories/
│   │   │   ├── Dashboard/
│   │   │   ├── Events/
│   │   │   ├── Locations/
│   │   │   ├── Organizer/
│   │   │   └── PublicEvents/
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── tests/
│
├── docs/                          # Documentation
│   ├── backend/
│   │   ├── ARCHITECTURE.md
│   │   └── CHANGELOG.md
│   └── frontend/
│       ├── ARCHITECTURE.md
│       └── CHANGELOG.md
│
├── docker-compose.yml
├── claude.md                      # AI Assistant instructions
└── README.md                      # This file
```

---

## 🏛️ Architecture

### Features-Based Organization

Both backend and frontend follow a **domain-driven Features architecture**, organizing code by business functionality rather than technical layers.

**Benefits:**
- Clear separation of concerns
- Easy to locate related code
- Scalable for large teams
- Feature-level testing

See detailed architecture documentation:
- [Backend Architecture](docs/backend/ARCHITECTURE.md)
- [Frontend Architecture](docs/frontend/ARCHITECTURE.md)

---

## 🔑 Key Features

### For Tourism Board (Entity Admin)
- ✅ Approve/reject/request changes on events
- ✅ View all pending events
- ✅ Publish approved events to public calendar
- ✅ Analytics dashboard

### For Organizers (Hotels, Restaurants, etc.)
- ✅ Create and manage events
- ✅ View approval status
- ✅ Statistics dashboard (pending, approved, published)
- ✅ Event list with filters

### For Public Users (Tourists)
- 🚧 Browse public calendar
- 🚧 Filter events by category, location, date
- 🚧 View event details

**Legend:** ✅ Implemented | 🚧 In Progress | ⏳ Planned

---

## 🧪 Testing Strategy

**Philosophy:** Quality over speed. TDD approach for all new features.

- **Backend:** PHPUnit for Feature and Unit tests
- **Frontend:** Jest + React Testing Library
- **E2E:** (Planned) Cypress
- **Coverage Target:** >60% backend, >50% frontend

**Current Coverage:** 100% test pass rate (164/164 tests)

---

## 📚 Documentation

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines and setup
- **[docs/API.md](docs/API.md)** - API endpoints documentation
- **[docs/backend/ARCHITECTURE.md](docs/backend/ARCHITECTURE.md)** - Backend architecture deep dive
- **[docs/frontend/ARCHITECTURE.md](docs/frontend/ARCHITECTURE.md)** - Frontend architecture deep dive
- **[claude.md](claude.md)** - AI assistant instructions and coding standards

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development guidelines.

**Quick guidelines:**
- Follow Features-based architecture
- Write tests before code (TDD)
- Use TypeScript strict mode (no `any` types)
- Wrap DB operations in transactions
- Run tests before committing

---

## 📦 Dependencies

### Backend
- Laravel 12.24.0
- PostgreSQL 15
- JWT Auth (Sanctum)
- 84 Composer packages

### Frontend
- Next.js 15.5.4
- React 19.2.0
- TypeScript 5.9.3
- Tailwind CSS 4.1.14
- 28 npm packages (11 prod + 17 dev)

---

## 🐛 Known Issues

None currently. All 164 tests passing.

**Note:** Backend tests must be run in Docker (not locally with SQLite) to ensure all migrations are applied correctly.

---

## 📄 License

Proprietary - Ente de Turismo de Tucumán

---

## 👥 Team

**Lead Developer:** Marcos Rillo Cabanne
**Client:** Ente de Turismo de Tucumán

---

## 📞 Support

For development questions or issues, please refer to:
- [CONTRIBUTING.md](CONTRIBUTING.md) for setup help
- [docs/API.md](docs/API.md) for API documentation
- [claude.md](claude.md) for coding standards

---

**Last Updated:** October 29, 2025
**Version:** 2.0.0
**Status:** Active Development (MVP 90% complete)
