# PROJECT CONTEXT - Plataforma de Eventos Turísticos

**Fecha:** Octubre 29, 2025
**Estado:** MVP 90% completo, 164/164 tests passing ✅

---

## STACK TECNOLÓGICO

**Backend:**
- Laravel 12.24.0 + PHP 8.2.29 + PostgreSQL 15 (Docker)
- Tests: 36/36 passing ✅

**Frontend:**
- Next.js 15.5.4 + React 19.2.0 + TypeScript 5.9.3
- Tests: 128/128 passing ✅

---

## ARQUITECTURA

**Features-Based en ambos lados:**

Backend: 9 features (Appearance, Approval, Auth, Categories, Dashboard, Events, Locations, Organizer, PublicEvents)
Frontend: 6 features (appearance, auth, categories, events, locations, organizer)

**Métricas verificadas:**
- Backend: 10 controllers, 7 services, 13 models, 20 migrations, 61 API endpoints
- Frontend: 78 components, 23 custom hooks, 14 services

---

## FUNCIONALIDAD IMPLEMENTADA ✅

1. **Autenticación completa** (register, login, logout, JWT)
2. **Gestión de Eventos** (CRUD completo, 14 endpoints)
3. **Workflow de Aprobación** (draft → pending → approved → published, 6 endpoints)
4. **Categorías y Locations** (CRUD completo, 14 endpoints)
5. **Panel de Organizador** (stats dashboard, event management)
6. **API Pública** (11 endpoints para calendario público)

---

## LO QUE FALTA PARA 100% MVP ⏳

1. **Frontend Público** (calendario para turistas)
2. **Dashboard Entity Admin** (panel de aprobación completo)
3. **Notificaciones** (sistema de alerts)
4. **Analytics Avanzados** (métricas y reportes)
5. **Búsqueda Avanzada** (filtros complejos)

---

## PRINCIPIOS CRÍTICOS (NO NEGOCIABLES)

1. **TDD obligatorio** - Tests antes de código
2. **Features-based** - Todo organizado por dominio
3. **TypeScript strict** - Zero `any` types
4. **DB Transactions** - TODO write en transaction
5. **Path aliases only** - Zero relative imports
6. **Smart/Dumb components** - Separación clara
7. **Quality over speed** - Siempre

Ver claude.md para reglas detalladas.

---

## PRÓXIMOS PASOS SUGERIDOS

**Prioridad Alta:**
1. Completar calendario público (feature más visible)
2. Dashboard Entity Admin (workflow de aprobación)
3. Sistema de notificaciones (UX crítico)

**Prioridad Media:**
4. Analytics dashboard (valor agregado)
5. Búsqueda avanzada (nice to have)

**Infraestructura:**
6. CI/CD con GitHub Actions
7. Staging environment
8. Production deployment prep

---

Para contexto completo, ver:
- README.md (overview detallado)
- claude.md (reglas arquitectónicas)
- docs/backend/ARCHITECTURE.md
- docs/frontend/ARCHITECTURE.md
