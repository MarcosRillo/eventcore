# Panel Organizador - Especificación Completa

**Fecha:** Octubre 7, 2025  
**Propósito:** Permitir que organizaciones (hoteles, restaurantes) gestionen sus eventos de forma autónoma  
**Estado actual:** 0% implementado  
**Prioridad:** Alta - Es el 25% faltante del MVP

---

## 📋 ÍNDICE

1. [Contexto del Sistema](#contexto-del-sistema)
2. [Componentes Reutilizables](#componentes-reutilizables)
3. [Componentes Nuevos](#componentes-nuevos)
4. [Backend - Endpoints](#backend-endpoints)
5. [Frontend - Estructura](#frontend-estructura)
6. [Flujos de Usuario](#flujos-de-usuario)
7. [Reglas de Negocio](#reglas-de-negocio)
8. [Sistema de Trust Level](#sistema-de-trust-level)

---

## CONTEXTO DEL SISTEMA

### Actores del Sistema

**1. Ente de Turismo (Ya implementado)**
- Roles: `entity_admin`, `entity_staff`
- Dashboard en: `/admin/` (ruta grupo `(admin)`)
- Funcionalidades: Aprobar/rechazar eventos, gestionar todo

**2. Organizadores (A IMPLEMENTAR)**
- Rol: `organizer_admin`
- Dashboard en: `/organizer/` (nueva ruta grupo `(organizer)`)
- Funcionalidades: CRUD eventos propios, ver estados, recibir feedback

**3. Público General (Ya implementado)**
- Sin autenticación
- Ruta: `/calendar` (grupo `(public)`)
- Solo lectura de eventos publicados

### Estados de Eventos (Ya implementado en BD)

```
draft                       → Borrador del organizador
pending_internal_approval   → Enviado al Ente, esperando revisión
under_review                → Ente revisando activamente
changes_requested           → Ente solicitó cambios
approved                    → Aprobado, listo para publicar
scheduled                   → Programado para publicación
published                   → Visible en calendario público
cancelled                   → Evento cancelado
```

### Sistema de Trust Level (Ya en BD, falta implementar lógica)

**trust_level en tabla organizations:**
- **Level 1 (Nuevo):** Todos los eventos → `pending_internal_approval`
- **Level 2 (Confiable):** Algunos eventos → auto-approve a `approved`
- **Level 3 (Premium):** Máxima autonomía → auto-approve a `published`

---

## COMPONENTES REUTILIZABLES

### ✅ Del Sistema Existente

**1. Formulario de Eventos (CreateEventForm.tsx)**
- **Ubicación:** `frontend/src/features/events/components/CreateEventForm.tsx`
- **Reutilizar:** TODO el formulario es el mismo para Ente y Organizador
- **Diferencias mínimas:**
  - Organizador NO puede cambiar `organization_id` (siempre es la suya)
  - Organizador NO puede setear estado directamente (siempre es `draft`)
  - Organizador NO ve opciones de aprobación

**2. Estados de Eventos (Badge de estado)**
- **Ubicación:** Probablemente en `frontend/src/features/events/components/`
- **Reutilizar:** Mismos estados, mismos colores
- **Ejemplo:**
  ```tsx
  <Badge status="pending_internal_approval">Pendiente de Aprobación</Badge>
  <Badge status="changes_requested">Cambios Solicitados</Badge>
  ```

**3. Calendario Interno**
- **Ubicación:** `frontend/src/app/(public)/calendar/`
- **Reutilizar:** Mismo calendario, pero con permisos
- **Nota:** Tanto Ente como Organizadores ven calendario interno con TODOS los eventos (no solo públicos)

**4. API Client Base**
- **Ubicación:** `frontend/src/lib/api.ts`
- **Reutilizar:** Mismo cliente HTTP con tokens

**5. AuthContext y Permisos**
- **Ubicación:** `frontend/src/context/AuthContext.tsx`
- **Reutilizar:** Ya maneja roles, incluido `organizer_admin`

**6. Componentes UI Base**
- **Ubicación:** `frontend/src/components/ui/`
- **Reutilizar:** Buttons, Inputs, Tables, Cards, Modals, etc.

---

## COMPONENTES NUEVOS

### 🆕 A Crear para Organizadores

**1. Layout Organizador**
```tsx
// frontend/src/app/(organizer)/layout.tsx
- Sidebar específico de organizador
- Header con info de la organización
- Navegación: Dashboard | Mis Eventos | Calendario | Perfil
```

**2. Dashboard Organizador**
```tsx
// frontend/src/app/(organizer)/dashboard/page.tsx
- Resumen de eventos por estado
- Métricas simples (eventos totales, aprobados, rechazados)
- Eventos próximos
- Notificaciones/alertas (cambios solicitados)
```

**3. Lista de Eventos del Organizador**
```tsx
// frontend/src/app/(organizer)/eventos/page.tsx
- Tabla filtrable de eventos PROPIOS
- Filtros: estado, fecha, categoría
- Acciones: Ver | Editar | Duplicar | Eliminar
- Botón "Crear Nuevo Evento"
```

**4. Vista Detalle de Evento**
```tsx
// frontend/src/app/(organizer)/eventos/[id]/page.tsx
- Información completa del evento
- Historial de cambios de estado
- Comentarios del Ente (si hay changes_requested)
- Botones: Editar | Duplicar | Enviar a Aprobación
```

**5. Página Crear Evento**
```tsx
// frontend/src/app/(organizer)/eventos/crear/page.tsx
- REUTILIZA CreateEventForm.tsx
- Pre-llena organization_id del usuario logueado
- Estado inicial siempre es `draft`
```

**6. Página Editar Evento**
```tsx
// frontend/src/app/(organizer)/eventos/editar/[id]/page.tsx
- REUTILIZA CreateEventForm.tsx
- Solo permite editar si estado es `draft` o `changes_requested`
- Muestra comentarios del Ente si los hay
```

**7. Hook useOrganizerEvents**
```tsx
// frontend/src/features/organizer/hooks/useOrganizerEvents.ts
- Fetch eventos de la organización del usuario
- Filtros locales
- CRUD operations (create, update, delete, duplicate)
```

**8. Organizer Service**
```tsx
// frontend/src/features/organizer/services/organizerService.ts
- API calls específicas de organizador
- GET /api/v1/organizer/events
- POST /api/v1/organizer/events
- PUT /api/v1/organizer/events/{id}
- DELETE /api/v1/organizer/events/{id}
- POST /api/v1/organizer/events/{id}/submit-for-approval
```

---

## BACKEND - ENDPOINTS

### 🔴 Nuevos Endpoints Necesarios

**Namespace:** `/api/v1/organizer/`

**1. Listar Eventos del Organizador**
```
GET /api/v1/organizer/events
Auth: organizer_admin
Response: Eventos de la organización del usuario
Filtros: status, date_from, date_to, category_id
```

**2. Crear Evento**
```
POST /api/v1/organizer/events
Auth: organizer_admin
Validación:
- organization_id debe ser la del usuario logueado
- status siempre inicia en 'draft'
- Solo puede crear eventos de su propia organización
```

**3. Actualizar Evento**
```
PUT /api/v1/organizer/events/{id}
Auth: organizer_admin
Validación:
- Solo puede editar eventos de su organización
- Solo puede editar si status es 'draft' o 'changes_requested'
```

**4. Eliminar Evento**
```
DELETE /api/v1/organizer/events/{id}
Auth: organizer_admin
Validación:
- Solo puede eliminar eventos de su organización
- Solo puede eliminar si status es 'draft'
```

**5. Enviar a Aprobación**
```
POST /api/v1/organizer/events/{id}/submit-for-approval
Auth: organizer_admin
Lógica:
- Validar que evento está completo
- Cambiar status según trust_level:
  - Level 1: pending_internal_approval
  - Level 2: approved (si cumple criterios)
  - Level 3: published (auto-publicación)
- Enviar notificación al Ente
```

**6. Duplicar Evento**
```
POST /api/v1/organizer/events/{id}/duplicate
Auth: organizer_admin
Copia evento con status 'draft'
```

**7. Dashboard Stats**
```
GET /api/v1/organizer/dashboard/stats
Auth: organizer_admin
Response:
{
  total_events: 25,
  draft: 5,
  pending_approval: 3,
  approved: 10,
  published: 7,
  changes_requested: 2,
  upcoming_events: [...],
  recent_notifications: [...]
}
```

### ✅ Endpoints Existentes a Reutilizar

**Categorías (GET):**
```
GET /api/v1/categories
```

**Ubicaciones (GET):**
```
GET /api/v1/locations
```

**Calendario Interno:**
```
GET /api/v1/events (con auth)
```

---

## FRONTEND - ESTRUCTURA

### Nueva Estructura de Carpetas

```
frontend/src/
├── app/
│   ├── (admin)/           ✅ Ya existe
│   ├── (auth)/            ✅ Ya existe
│   ├── (public)/          ✅ Ya existe
│   └── (organizer)/       🆕 CREAR
│       ├── layout.tsx     🆕
│       ├── dashboard/
│       │   └── page.tsx   🆕
│       ├── eventos/
│       │   ├── page.tsx              🆕 (lista)
│       │   ├── crear/page.tsx        🆕
│       │   ├── editar/[id]/page.tsx  🆕
│       │   └── [id]/page.tsx         🆕 (detalle)
│       └── calendario/
│           └── page.tsx   🆕 (vista calendario interno)
│
├── features/
│   ├── events/            ✅ Ya existe - REUTILIZAR
│   │   └── components/
│   │       └── CreateEventForm.tsx  ✅ REUTILIZAR
│   └── organizer/         🆕 CREAR
│       ├── components/
│       │   ├── OrganizerDashboard.tsx     🆕
│       │   ├── OrganizerEventsList.tsx    🆕
│       │   ├── EventDetailView.tsx        🆕
│       │   └── SubmitForApprovalButton.tsx 🆕
│       ├── hooks/
│       │   └── useOrganizerEvents.ts      🆕
│       └── services/
│           └── organizerService.ts        🆕
│
└── components/
    ├── ui/                ✅ REUTILIZAR TODO
    └── layout/
        └── OrganizerSidebar.tsx  🆕
```

---

## FLUJOS DE USUARIO

### Flujo 1: Organizador Crea Evento Nuevo

**Pasos:**
1. Login como `organizer_admin`
2. Dashboard muestra resumen
3. Clic en "Crear Nuevo Evento"
4. Llena formulario (REUTILIZA CreateEventForm)
   - organization_id pre-llenado (no editable)
   - Estado inicial: `draft`
5. Guarda como borrador → puede editar después
6. Cuando está listo: "Enviar a Aprobación"
7. Sistema evalúa trust_level:
   - **Level 1:** Estado → `pending_internal_approval`, notifica al Ente
   - **Level 2:** Si cumple criterios → `approved`, sino → `pending_internal_approval`
   - **Level 3:** Auto-aprobación → `published`
8. Organizador recibe confirmación
9. Evento aparece en lista con nuevo estado

### Flujo 2: Ente Solicita Cambios

**Pasos:**
1. Ente revisa evento y solicita cambios
2. Evento cambia a estado `changes_requested`
3. Organizador recibe notificación (email + in-app)
4. Organizador abre evento en su panel
5. Ve comentarios del Ente
6. Edita evento (formulario habilitado porque estado permite edición)
7. Guarda cambios → vuelve a `draft`
8. Re-envía a aprobación → vuelve a `pending_internal_approval`
9. Ente recibe notificación de cambios realizados

### Flujo 3: Duplicar Evento

**Pasos:**
1. Organizador va a lista de eventos
2. Encuentra evento exitoso anterior
3. Clic en "Duplicar"
4. Sistema crea copia con:
   - Mismo contenido
   - Estado: `draft`
   - Fechas vacías (para que las ajuste)
5. Redirige a formulario de edición
6. Ajusta fechas y detalles
7. Envía a aprobación

---

## REGLAS DE NEGOCIO

### Permisos del Organizador

**PUEDE:**
- ✅ Ver SOLO eventos de su organización
- ✅ Crear eventos de su organización
- ✅ Editar eventos propios en estado `draft` o `changes_requested`
- ✅ Eliminar eventos propios en estado `draft`
- ✅ Duplicar cualquier evento propio
- ✅ Enviar eventos a aprobación
- ✅ Ver calendario interno (todos los eventos, todas las organizaciones)
- ✅ Ver historial de cambios de estado de sus eventos

**NO PUEDE:**
- ❌ Ver eventos de otras organizaciones (excepto en calendario)
- ❌ Editar eventos una vez aprobados
- ❌ Cambiar estados manualmente (solo enviar a aprobación)
- ❌ Aprobar/rechazar eventos
- ❌ Gestionar categorías o ubicaciones
- ❌ Ver métricas globales del sistema
- ❌ Gestionar usuarios o roles

### Validaciones Críticas

**Al Crear Evento:**
```php
// Backend validation
$request->validate([
    'title' => 'required|max:255',
    'description' => 'required',
    'start_date' => 'required|date|after:today',
    'end_date' => 'required|date|after:start_date',
    'category_id' => 'required|exists:categories,id',
    'location_ids' => 'required|array|min:1',
]);

// Business rules
if ($event->organization_id !== auth()->user()->organization_id) {
    abort(403, 'Cannot create events for other organizations');
}

$event->status = 'draft'; // Siempre iniciar en draft
```

**Al Editar Evento:**
```php
// Solo permitir edición en ciertos estados
$allowedStatuses = ['draft', 'changes_requested'];
if (!in_array($event->status, $allowedStatuses)) {
    abort(403, 'Cannot edit event in current status');
}

// Solo puede editar eventos propios
if ($event->organization_id !== auth()->user()->organization_id) {
    abort(403, 'Cannot edit events from other organizations');
}
```

**Al Enviar a Aprobación:**
```php
// Validar que evento está completo
if (empty($event->title) || empty($event->start_date) || empty($event->location_ids)) {
    throw new ValidationException('Event is incomplete');
}

// Evaluar trust_level
$organization = $event->organization;
switch ($organization->trust_level) {
    case 1:
        $event->status = 'pending_internal_approval';
        // Notificar al Ente
        break;
    case 2:
        // Criterios de auto-aprobación (ej: evento similar aprobado antes)
        $event->status = $this->canAutoApprove($event) 
            ? 'approved' 
            : 'pending_internal_approval';
        break;
    case 3:
        $event->status = 'published';
        // Auto-publicación directa
        break;
}
```

---

## SISTEMA DE TRUST LEVEL

### Definición de Niveles

**Level 1: Nuevo (trust_level = 1)**
- Organizaciones recién registradas
- Todos los eventos requieren aprobación manual del Ente
- Sin auto-aprobación

**Level 2: Confiable (trust_level = 2)**
- Organizaciones con historial positivo
- Algunos eventos auto-aprobados si cumplen criterios:
  - Evento similar aprobado en el pasado
  - Categoría conocida
  - Ubicación validada
- Eventos "riesgosos" aún requieren aprobación

**Level 3: Premium (trust_level = 3)**
- Organizaciones de máxima confianza (ej: Sheraton, museos estatales)
- Auto-publicación directa sin aprobación del Ente
- Solo revisión post-publicación si hay reportes

### Criterios de Auto-Aprobación (Level 2)

```php
// Función de ejemplo
private function canAutoApprove(Event $event): bool
{
    $organization = $event->organization;
    
    // Verificar historial de eventos aprobados
    $approvedEvents = Event::where('organization_id', $organization->id)
        ->where('status', 'approved')
        ->count();
    
    if ($approvedEvents < 5) {
        return false; // Necesita al menos 5 eventos aprobados
    }
    
    // Verificar si hay eventos similares aprobados
    $similarEvent = Event::where('organization_id', $organization->id)
        ->where('category_id', $event->category_id)
        ->where('status', 'approved')
        ->exists();
    
    if (!$similarEvent) {
        return false; // Primera vez en esta categoría
    }
    
    // Verificar que no tenga alertas recientes
    $recentRejections = Event::where('organization_id', $organization->id)
        ->where('status', 'cancelled')
        ->where('updated_at', '>=', now()->subMonths(3))
        ->count();
    
    if ($recentRejections > 2) {
        return false; // Demasiados rechazos recientes
    }
    
    return true; // Cumple todos los criterios
}
```

### Progresión de Trust Level

**Cómo sube de nivel:**
- **1 → 2:** Después de 5 eventos aprobados sin problemas en 6 meses
- **2 → 3:** Después de 20 eventos aprobados sin problemas en 1 año + aprobación manual del Ente

**Cómo baja de nivel:**
- **3 → 2:** Después de 3+ eventos rechazados en 6 meses
- **2 → 1:** Después de 5+ eventos rechazados en 6 meses
- **Cualquier nivel → 1:** Violación grave de políticas

**Implementación:**
```php
// Tarea programada (Laravel Scheduler)
// app/Console/Kernel.php
$schedule->call(function () {
    $this->evaluateTrustLevels();
})->monthly();

private function evaluateTrustLevels()
{
    $organizations = Organization::all();
    
    foreach ($organizations as $org) {
        $approved = Event::where('organization_id', $org->id)
            ->where('status', 'approved')
            ->where('created_at', '>=', now()->subMonths(6))
            ->count();
            
        $rejected = Event::where('organization_id', $org->id)
            ->whereIn('status', ['cancelled', 'rejected'])
            ->where('created_at', '>=', now()->subMonths(6))
            ->count();
        
        // Lógica de upgrade/downgrade
        if ($org->trust_level == 1 && $approved >= 5 && $rejected == 0) {
            $org->trust_level = 2;
            $org->save();
            // Notificar a la organización del upgrade
        }
        
        if ($org->trust_level == 2 && $rejected >= 5) {
            $org->trust_level = 1;
            $org->save();
            // Notificar a la organización del downgrade
        }
        
        // ... más lógica
    }
}
```

---

## DIFERENCIAS VISUALES ENTE VS ORGANIZADOR

### Color Scheme

**Dashboard Ente:**
- Color primario: Azul (#3B82F6)
- Sidebar: Gris oscuro
- Foco: Aprobaciones y gestión global

**Dashboard Organizador:**
- Color primario: Verde/Teal (#10B981)
- Sidebar: Gris medio
- Foco: Creación y estado de eventos propios

### Navegación

**Ente:**
```
- Dashboard
- Eventos (todos)
- Organizaciones
- Categorías
- Ubicaciones
- Usuarios
- Configuración
```

**Organizador:**
```
- Dashboard
- Mis Eventos
- Crear Evento
- Calendario
- Perfil
```

### Métricas

**Ente:**
- Total de eventos en sistema
- Eventos pendientes de aprobación
- Organizaciones activas
- Eventos por categoría
- Tendencias temporales

**Organizador:**
- Mis eventos totales
- Eventos en borrador
- Eventos pendientes de aprobación
- Eventos aprobados/publicados
- Eventos con cambios solicitados

---

## TESTING DEL PANEL ORGANIZADOR

### Test Cases Frontend

**1. Autenticación y Acceso**
- ✅ Login como organizer_admin redirige a /organizer/dashboard
- ✅ entity_admin NO puede acceder a rutas /organizer/
- ✅ organizer_admin NO puede acceder a rutas /admin/

**2. CRUD de Eventos**
- ✅ Crear evento guarda con organization_id correcto
- ✅ No puede editar evento en estado `approved`
- ✅ Puede editar evento en estado `draft`
- ✅ Puede editar evento en estado `changes_requested`
- ✅ Eliminar evento solo funciona en estado `draft`

**3. Trust Level**
- ✅ Level 1: Enviar a aprobación → `pending_internal_approval`
- ✅ Level 2: Con criterios → `approved`
- ✅ Level 3: Auto-publicación → `published`

**4. Permisos**
- ✅ Solo ve eventos de su organización en lista
- ✅ Ve todos los eventos en calendario
- ✅ No puede acceder a evento de otra organización por URL directa

### Test Cases Backend

**1. API Authorization**
```php
// tests/Feature/OrganizerEventTest.php
public function test_organizer_can_only_see_own_events()
{
    $org1 = Organization::factory()->create();
    $org2 = Organization::factory()->create();
    
    $user = User::factory()->create([
        'role' => 'organizer_admin',
        'organization_id' => $org1->id
    ]);
    
    Event::factory()->create(['organization_id' => $org1->id]);
    Event::factory()->create(['organization_id' => $org2->id]);
    
    $response = $this->actingAs($user)->get('/api/v1/organizer/events');
    
    $this->assertEquals(1, count($response->json()['data']));
}

public function test_organizer_cannot_edit_approved_event()
{
    $org = Organization::factory()->create();
    $user = User::factory()->create([
        'role' => 'organizer_admin',
        'organization_id' => $org->id
    ]);
    
    $event = Event::factory()->create([
        'organization_id' => $org->id,
        'status' => 'approved'
    ]);
    
    $response = $this->actingAs($user)
        ->put("/api/v1/organizer/events/{$event->id}", [
            'title' => 'Updated Title'
        ]);
    
    $response->assertStatus(403);
}
```

---

## PRIORIZACIÓN DE IMPLEMENTACIÓN

### Fase 1: Backend API (3-4 días)
**Prioridad:** ALTA - Sin API, no hay frontend

1. Crear Feature Organizer en backend
2. Implementar OrganizerController con 7 endpoints
3. Implementar OrganizerService con lógica de negocio
4. Agregar middleware de permisos
5. Tests unitarios y de integración

### Fase 2: Frontend Core (4-5 días)
**Prioridad:** ALTA - Funcionalidad base

1. Crear carpeta (organizer) en app router
2. Layout organizador con sidebar
3. Dashboard con stats básicas
4. Lista de eventos con filtros
5. Integrar CreateEventForm existente

### Fase 3: Flujos Completos (3-4 días)
**Prioridad:** MEDIA - Completar experiencia

1. Vista detalle de evento
2. Edición de eventos
3. Duplicación de eventos
4. Sistema de notificaciones
5. Historial de cambios de estado

### Fase 4: Trust Level (2-3 días)
**Prioridad:** BAJA - Feature avanzada

1. Lógica de auto-aprobación
2. Evaluación automática mensual
3. Notificaciones de cambio de nivel
4. Dashboard para ver progreso de trust

---

## ARCHIVOS A REVISAR/REUTILIZAR

### Formulario de Eventos
```bash
# Ver si existe y qué contiene
frontend/src/features/events/components/CreateEventForm.tsx
```

### API Client
```bash
# Ver configuración actual
frontend/src/lib/api.ts
frontend/src/services/apiClient.ts
```

### AuthContext
```bash
# Verificar manejo de roles
frontend/src/context/AuthContext.tsx
```

### Backend Controllers
```bash
# Ver estructura actual
backend/app/Features/Events/Controllers/EventController.php
backend/app/Features/Approval/Controllers/ApprovalController.php
```

### Migrations
```bash
# Verificar estructura BD
backend/database/migrations/*_create_organizations_table.php
backend/database/migrations/*_create_events_table.php
```

---

## ENTREGABLES FINALES

### MVP Panel Organizador (Mínimo Viable)

**Backend:**
- ✅ 7 endpoints funcionales
- ✅ Validaciones de permisos
- ✅ Tests con coverage >60%
- ✅ Lógica básica de trust_level (Level 1)

**Frontend:**
- ✅ Dashboard con métricas
- ✅ Lista de eventos con CRUD
- ✅ Formulario de creación (reutilizado)
- ✅ Vista de detalle
- ✅ Envío a aprobación funcional

**Documentación:**
- ✅ README del feature
- ✅ Guía de usuario básica
- ✅ Tests documentados

### Mejoras Futuras (Post-MVP)

- Sistema de notificaciones avanzado
- Trust Level 2 y 3 completos
- Analytics de eventos del organizador
- Exportación de reportes
- Integración con calendar externo (iCal)
- App mobile para organizadores

---

## PRÓXIMOS PASOS

1. **Auditoría de código existente** con Claude Code
   - Buscar CreateEventForm y verificar reutilización
   - Verificar estructura de BD (trust_level, organization_id)
   - Confirmar endpoints existentes que se puedan reutilizar

2. **Crear Feature Backend**
   - Implementar OrganizerController
   - Implementar OrganizerService
   - Tests

3. **Crear Feature Frontend**
   - Estructura de carpetas
   - Layout y sidebar
   - Dashboard y lista

4. **Integración y Testing**
   - E2E tests del flujo completo
   - Testing con usuarios reales

---

**Tiempo estimado total:** 2-3 semanas
**Bloqueantes:** Ninguno - todo lo necesario está implementado o es reutilizable
**Riesgo:** BAJO - Arquitectura clara, patrones ya establecidos