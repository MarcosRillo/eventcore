# AUDITORÍA: Panel Organizador - Componentes Existentes vs Nuevos

## 📋 CONTEXTO

Lee el archivo completo: `docs/tasks/ORGANIZER_PANEL_SPEC.md`

Este documento contiene la especificación completa del Panel Organizador que vamos a implementar.

## 🎯 OBJETIVO DE ESTA AUDITORÍA

Determinar exactamente **qué existe** y **qué se puede reutilizar** del código actual antes de empezar a implementar.

## 🔍 TAREAS DE AUDITORÍA

### 1. FRONTEND - Componentes Reutilizables

**Buscar y reportar:**

```bash
# A. Formulario de Eventos
Buscar: CreateEventForm.tsx
Ubicación esperada: frontend/src/features/events/components/
Reportar:
- ✅ Existe / ❌ No existe
- Si existe: Líneas de código, props que recibe, qué campos tiene
- Evaluación: ¿Se puede reutilizar 100% para organizadores?

# B. Componentes de Estado/Badge
Buscar: Badge, StatusBadge, EventStatus
Ubicación esperada: frontend/src/features/events/components/ o frontend/src/components/ui/
Reportar:
- Lista de componentes relacionados con estado de eventos
- ¿Manejan los 8 estados del sistema?

# C. API Client
Buscar: api.ts, apiClient.ts
Ubicación esperada: frontend/src/lib/ o frontend/src/services/
Reportar:
- Configuración actual
- ¿Maneja tokens?
- ¿Tiene interceptors?
- Base URL configurada

# D. AuthContext
Buscar: AuthContext.tsx
Ubicación esperada: frontend/src/context/
Reportar:
- Roles que maneja actualmente
- ¿Incluye organizer_admin?
- Funciones disponibles (login, logout, hasPermission, etc.)

# E. Componentes UI Base
Buscar: Button, Input, Table, Modal, Card
Ubicación esperada: frontend/src/components/ui/
Reportar: Lista completa de componentes UI disponibles
```

### 2. BACKEND - Endpoints y Lógica

**Buscar y reportar:**

```bash
# A. Estructura de Features
Listar: backend/app/Features/
Reportar: Qué features existen actualmente

# B. Event Controller
Buscar: EventController.php
Ubicación esperada: backend/app/Features/Events/Controllers/
Reportar:
- Endpoints disponibles
- Métodos (create, update, delete, etc.)
- ¿Hay validaciones de organization_id?

# C. Approval Controller
Buscar: ApprovalController.php
Ubicación esperada: backend/app/Features/Approval/Controllers/
Reportar:
- Endpoints de aprobación
- Flujo de estados implementado

# D. Middleware de Permisos
Buscar: auth middleware, permission middleware
Ubicación: backend/app/Http/Middleware/
Reportar:
- Middleware de autenticación existente
- ¿Hay verificación de roles?

# E. Rutas API
Archivo: backend/routes/api.php
Reportar:
- Rutas existentes de /events
- Rutas existentes de /approval
- ¿Hay namespace /organizer ya?
```

### 3. BASE DE DATOS - Estructura

**Buscar y reportar:**

```bash
# A. Migration de Organizations
Buscar: *_create_organizations_table.php
Ubicación: backend/database/migrations/
Reportar:
- Campo trust_level existe? ¿Tipo de dato?
- Campos: name, organization_type_id, status_id
- Relaciones definidas

# B. Migration de Events
Buscar: *_create_events_table.php
Reportar:
- Campo organization_id existe?
- Campo status existe? ¿Es ENUM o FK?
- Campo entity_id existe? (¡importante! puede causar problemas)
- Todos los campos necesarios para el formulario

# C. Estados de Eventos
Buscar: *_create_event_statuses_table.php o ENUMs
Reportar:
- ¿8 estados existen? (draft, pending_internal_approval, etc.)
- ¿Es lookup table o ENUM?

# D. Seeders
Buscar: *Seeder.php relacionados con organizations, events, statuses
Reportar: Datos de prueba disponibles
```

### 4. TESTS - Coverage Actual

**Buscar y reportar:**

```bash
# Frontend Tests
Buscar: *.test.ts, *.test.tsx
Ubicación: frontend/src/**/__tests__/
Reportar:
- Tests existentes de eventos
- Coverage actual según docs (debería ser ~83%)

# Backend Tests
Buscar: *Test.php
Ubicación: backend/tests/Feature/
Reportar:
- EventTest.php existe?
- ApprovalTest.php existe?
- Qué tests cubren CRUD de eventos
```

## 📊 FORMATO DE REPORTE

Genera un reporte en este formato:

```markdown
# AUDITORÍA: Panel Organizador - Resultados

Fecha: [fecha]
Ejecutado por: Claude Code

## 🟢 COMPONENTES EXISTENTES (Reutilizables)

### Frontend
- ✅ CreateEventForm.tsx
  - Ubicación: frontend/src/features/events/components/CreateEventForm.tsx
  - LOC: XXX
  - Props: { onSubmit, initialData, isEditing }
  - Campos: title, description, start_date, end_date, category_id, location_ids
  - Evaluación: ✅ 100% reutilizable con ajustes menores

- ✅ API Client
  - Ubicación: frontend/src/lib/api.ts
  - Configuración: Axios con interceptors
  - Token handling: ✅ Implementado

### Backend
- ✅ EventController.php
  - Endpoints: index, show, store, update, destroy
  - Validación de organization_id: ❌ Falta implementar

## 🔴 COMPONENTES FALTANTES (A Crear)

### Frontend
- ❌ Layout (organizer)
- ❌ OrganizerDashboard
- ❌ useOrganizerEvents hook
- ❌ organizerService

### Backend
- ❌ Feature Organizer
- ❌ OrganizerController
- ❌ Namespace /api/v1/organizer/

## ⚠️ PROBLEMAS DETECTADOS

1. [Describir cualquier inconsistencia o problema potencial]
2. [Ejemplo: entity_id en tabla events pero no en $fillable]

## 💡 RECOMENDACIONES

1. [Priorización de implementación]
2. [Refactors necesarios antes de continuar]

## 📈 ESTIMACIÓN DE TRABAJO

- Componentes reutilizables: XX% del total
- Componentes nuevos a crear: XX% del total
- Tiempo estimado: X días
```

## ✅ CRITERIOS DE ÉXITO

Esta auditoría está completa cuando:
- [x] Todos los archivos mencionados en la spec fueron buscados
- [x] Cada componente tiene status: ✅ Existe / ❌ No existe
- [x] Hay evaluación de reutilización para componentes existentes
- [x] Problemas detectados están documentados
- [x] Reporte está en formato markdown limpio

## 🚀 COMANDO DE EJECUCIÓN

```bash
# Guarda el reporte en:
docs/audit-outputs/ORGANIZER_PANEL_AUDIT.md
```

---

**Tiempo estimado:** 15-20 minutos
**Output:** Archivo markdown con auditoría completa