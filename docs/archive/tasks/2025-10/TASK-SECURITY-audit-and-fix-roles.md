# TASK-SECURITY: Auditoría y Corrección de Roles/Permisos

**Creado:** Octubre 6, 2025  
**Prioridad:** CRÍTICA - Bloquea desarrollo de features  
**Tiempo estimado:** 2-3 horas  
**Estado actual:** 🚨 Agujero de seguridad - todas las rutas accesibles por cualquier usuario autenticado

---

## PROBLEMA IDENTIFICADO

**Situación actual:**
```php
// routes/api.php - TODAS las rutas solo tienen auth:sanctum
Route::middleware('auth:sanctum')->group(function () {
    // ❌ Cualquier usuario autenticado puede acceder a TODAS estas rutas
    Route::prefix('dashboard')->group(function () { ... });  // Dashboard Ente
    Route::prefix('admin')->group(function () { ... });       // Panel Admin
    Route::prefix('organizer')->group(function () { ... });   // Panel Organizador
    Route::patch('events/{id}/approve', ...);                 // Aprobar eventos
    // ... etc
});
```

**Consecuencia:**
- Event Organizer (hotel) puede aprobar eventos
- Event Organizer puede acceder al dashboard del Ente
- Event Organizer puede modificar configuración de apariencia
- Entity Staff puede acceder a rutas de Platform Admin
- **NO hay separación de permisos por rol**

---

## ARQUITECTURA DE ROLES DEL SISTEMA

### Roles Definidos (user_roles table)

```
1. Platform Administrator
   - Acceso total a la plataforma
   - Configuración multi-tenant
   - Gestión de todas las organizaciones
   - No pertenece a ninguna organización específica

2. Entity Administrator  
   - Administrador del Ente de Turismo
   - Aprueba/rechaza eventos de organizadores
   - Ve dashboard con todos los eventos
   - Gestiona categorías y ubicaciones
   - Gestiona apariencia del calendario público

3. Entity Staff
   - Personal del Ente de Turismo
   - Solo puede ver eventos
   - NO puede aprobar/rechazar
   - NO puede crear/editar eventos
   - Acceso limitado al dashboard

4. Event Organizer
   - Administrador de organización (hotel, restaurante)
   - Crea y gestiona eventos propios
   - Ve solo eventos de su organización
   - NO puede aprobar eventos
   - NO puede acceder al dashboard del Ente
```

### Relaciones de Datos

```
User
├── role_id → UserRole (Platform Admin, Entity Admin, etc.)
└── organizations (many-to-many via organization_user)
    └── organization_id (accessor devuelve primera organización)

Event
├── organization_id → Organization (dueño del evento)
├── entity_id → Organization (Ente que aprueba)
├── created_by → User
└── approved_by → User
```

---

## MATRIZ DE PERMISOS POR RUTA

### Rutas de Autenticación (público)
```
POST /api/v1/auth/login         → Público
POST /api/v1/auth/register      → Público  
POST /api/v1/auth/logout        → Autenticado
GET  /api/v1/auth/me            → Autenticado
```

### Rutas de Eventos - CRUD Base
```
GET    /api/v1/events                    → Entity Admin, Entity Staff, Platform Admin
POST   /api/v1/events                    → Entity Admin, Platform Admin
GET    /api/v1/events/{id}               → Entity Admin, Entity Staff, Platform Admin
PUT    /api/v1/events/{id}               → Entity Admin, Platform Admin (solo eventos del Ente)
DELETE /api/v1/events/{id}               → Entity Admin, Platform Admin

GET    /api/v1/events/statistics         → Entity Admin, Platform Admin
PATCH  /api/v1/events/{id}/toggle-featured → Entity Admin, Platform Admin
POST   /api/v1/events/{id}/duplicate     → Entity Admin, Platform Admin
```

### Rutas de Aprobación (Approval Feature)
```
PATCH /api/v1/events/{id}/approve         → Entity Admin, Platform Admin
PATCH /api/v1/events/{id}/request-public  → Entity Admin
PATCH /api/v1/events/{id}/publish         → Entity Admin, Platform Admin
PATCH /api/v1/events/{id}/request-changes → Entity Admin, Platform Admin
PATCH /api/v1/events/{id}/reject          → Entity Admin, Platform Admin
GET   /api/v1/events/approval/statistics  → Entity Admin, Platform Admin
```

### Dashboard del Ente
```
GET /api/v1/dashboard/events/summary  → Entity Admin, Entity Staff, Platform Admin
GET /api/v1/dashboard/events          → Entity Admin, Entity Staff, Platform Admin
GET /api/v1/events/{id}/detail        → Entity Admin, Entity Staff, Platform Admin
```

### Categorías y Ubicaciones
```
GET    /api/v1/categories         → Todos (autenticados)
POST   /api/v1/categories         → Entity Admin, Platform Admin
PUT    /api/v1/categories/{id}    → Entity Admin, Platform Admin
DELETE /api/v1/categories/{id}    → Entity Admin, Platform Admin
GET    /api/v1/categories/active  → Todos (autenticados)

GET    /api/v1/locations          → Todos (autenticados)
POST   /api/v1/locations          → Entity Admin, Platform Admin
PUT    /api/v1/locations/{id}     → Entity Admin, Platform Admin
DELETE /api/v1/locations/{id}     → Entity Admin, Platform Admin
GET    /api/v1/locations/active   → Todos (autenticados)
```

### Admin (Appearance)
```
GET    /api/v1/admin/appearance    → Platform Admin, Entity Admin
POST   /api/v1/admin/appearance    → Platform Admin, Entity Admin
PUT    /api/v1/admin/appearance    → Platform Admin, Entity Admin
DELETE /api/v1/admin/appearance    → Platform Admin, Entity Admin
```

### Panel Organizador
```
GET    /api/v1/organizer/dashboard/stats  → Event Organizer
GET    /api/v1/organizer/events           → Event Organizer
POST   /api/v1/organizer/events           → Event Organizer
GET    /api/v1/organizer/events/{id}      → Event Organizer (solo propios)
PUT    /api/v1/organizer/events/{id}      → Event Organizer (solo propios)
DELETE /api/v1/organizer/events/{id}      → Event Organizer (solo propios)
```

### Rutas Públicas (sin autenticación)
```
GET /api/v1/public/events             → Público
GET /api/v1/public/events/{slug}      → Público
GET /api/v1/public/categories         → Público
GET /api/v1/public/locations          → Público
```

---

## IMPLEMENTACIÓN

### 1. Crear Middleware de Roles

**Ubicación:** `backend/app/Http/Middleware/CheckRole.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            Log::warning('CheckRole: No authenticated user');
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Obtener el role_name del usuario
        $userRole = $user->role?->role_name;

        if (!$userRole) {
            Log::warning('CheckRole: User has no role', ['user_id' => $user->id]);
            return response()->json(['error' => 'No role assigned'], 403);
        }

        // Normalizar nombres de roles (ambos formatos aceptados)
        $normalizedRoles = collect($roles)->map(function ($role) {
            return match($role) {
                'platform_admin' => 'Platform Administrator',
                'entity_admin' => 'Entity Administrator',
                'entity_staff' => 'Entity Staff',
                'organizer' => 'Event Organizer',
                default => $role,
            };
        });

        // Verificar si el usuario tiene alguno de los roles permitidos
        if (!$normalizedRoles->contains($userRole)) {
            Log::warning('CheckRole: Access denied', [
                'user_id' => $user->id,
                'user_role' => $userRole,
                'required_roles' => $normalizedRoles->toArray(),
                'route' => $request->path()
            ]);

            return response()->json([
                'error' => 'Forbidden',
                'message' => 'You do not have permission to access this resource'
            ], 403);
        }

        Log::info('CheckRole: Access granted', [
            'user_id' => $user->id,
            'user_role' => $userRole,
            'route' => $request->path()
        ]);

        return $next($request);
    }
}
```

### 2. Registrar Middleware

**Ubicación:** `backend/app/Http/Kernel.php`

```php
protected $middlewareAliases = [
    // ... otros middlewares
    'role' => \App\Http\Middleware\CheckRole::class,
];
```

O en Laravel 11+ (bootstrap/app.php):

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \App\Http\Middleware\CheckRole::class,
    ]);
})
```

### 3. Actualizar Rutas con Middleware de Roles

**Ubicación:** `backend/routes/api.php`

```php
<?php

// Feature Controllers - Dashboard
use App\Features\Dashboard\Controllers\DashboardController;

// Feature Controllers - Auth
use App\Features\Auth\Controllers\AuthController;

// Feature Controllers - PublicEvents
use App\Features\PublicEvents\Controllers\PublicEventController;

// Feature Controllers - Appearance
use App\Features\Appearance\Controllers\AppearanceController;

// Feature Controllers - SIMPLE
use App\Features\Events\Controllers\EventController as FeatureEventController;
use App\Features\Approval\Controllers\ApprovalController;
use App\Features\Categories\Controllers\CategoryController;
use App\Features\Locations\Controllers\LocationController;
use App\Features\Organizer\Controllers\OrganizerController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Authentication (público)
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

    // Protected routes con roles específicos
    Route::middleware('auth:sanctum')->group(function () {
        
        // ===== PLATFORM ADMIN + ENTITY ADMIN =====
        Route::middleware(['role:platform_admin,entity_admin'])->group(function () {
            // Event statistics y features avanzadas
            Route::get('events/statistics', [FeatureEventController::class, 'statistics']);
            Route::patch('events/{id}/toggle-featured', [FeatureEventController::class, 'toggleFeatured']);
            Route::post('events/{id}/duplicate', [FeatureEventController::class, 'duplicate']);

            // Approval routes
            Route::patch('events/{id}/approve', [ApprovalController::class, 'approve']);
            Route::patch('events/{id}/request-public', [ApprovalController::class, 'requestPublicApproval']);
            Route::patch('events/{id}/publish', [ApprovalController::class, 'publish']);
            Route::patch('events/{id}/request-changes', [ApprovalController::class, 'requestChanges']);
            Route::patch('events/{id}/reject', [ApprovalController::class, 'reject']);
            Route::get('events/approval/statistics', [ApprovalController::class, 'statistics']);

            // Event CRUD (solo para eventos del Ente)
            Route::post('events', [FeatureEventController::class, 'store']);
            Route::put('events/{id}', [FeatureEventController::class, 'update']);
            Route::patch('events/{id}', [FeatureEventController::class, 'update']);
            Route::delete('events/{id}', [FeatureEventController::class, 'destroy']);

            // Categories CRUD
            Route::post('categories', [CategoryController::class, 'store']);
            Route::put('categories/{category}', [CategoryController::class, 'update']);
            Route::delete('categories/{category}', [CategoryController::class, 'destroy']);

            // Locations CRUD
            Route::post('locations', [LocationController::class, 'store']);
            Route::put('locations/{location}', [LocationController::class, 'update']);
            Route::delete('locations/{location}', [LocationController::class, 'destroy']);

            // Admin routes
            Route::prefix('admin')->group(function () {
                Route::apiResource('appearance', AppearanceController::class);
            });
        });

        // ===== PLATFORM ADMIN + ENTITY ADMIN + ENTITY STAFF =====
        Route::middleware(['role:platform_admin,entity_admin,entity_staff'])->group(function () {
            // Dashboard del Ente
            Route::prefix('dashboard')->group(function () {
                Route::get('events/summary', [DashboardController::class, 'eventsSummary']);
                Route::get('events', [DashboardController::class, 'events']);
            });

            // Event detail (for dashboard modal)
            Route::get('events/{id}/detail', [DashboardController::class, 'eventDetail']);

            // Event read-only
            Route::get('events', [FeatureEventController::class, 'index']);
            Route::get('events/{id}', [FeatureEventController::class, 'show']);
        });

        // ===== EVENT ORGANIZER =====
        Route::middleware(['role:organizer'])->group(function () {
            Route::prefix('organizer')->group(function () {
                Route::get('dashboard/stats', [OrganizerController::class, 'dashboardStats']);
                Route::get('events', [OrganizerController::class, 'index']);
                Route::post('events', [OrganizerController::class, 'store']);
                Route::get('events/{id}', [OrganizerController::class, 'show']);
                Route::put('events/{id}', [OrganizerController::class, 'update']);
                Route::delete('events/{id}', [OrganizerController::class, 'destroy']);
            });
        });

        // ===== TODOS LOS AUTENTICADOS =====
        // Categories y Locations - solo lectura
        Route::get('categories', [CategoryController::class, 'index']);
        Route::get('categories/{category}', [CategoryController::class, 'show']);
        Route::get('categories/active', [CategoryController::class, 'active']);

        Route::get('locations', [LocationController::class, 'index']);
        Route::get('locations/{location}', [LocationController::class, 'show']);
        Route::get('locations/active', [LocationController::class, 'active']);
    });

    // ===== PUBLIC ROUTES (sin autenticación) =====
    Route::prefix('public')->group(function () {
        Route::get('events', [PublicEventController::class, 'index']);
        Route::get('events/{slug}', [PublicEventController::class, 'show']);
        Route::get('categories', [PublicEventController::class, 'categories']);
        Route::get('locations', [PublicEventController::class, 'locations']);
    });
});
```

---

## VERIFICACIÓN Y TESTING

### 1. Verificar Middleware Registrado

```bash
cd backend
php artisan route:list --path=api/v1 | grep -E "role|middleware"
```

### 2. Tests con diferentes roles

**Test 1: Platform Admin (acceso total)**
```bash
# Login como Platform Admin
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marcos@plataforma.com","password":"password123"}'

# Guardar token y probar acceso a todas las rutas
TOKEN="..."

# ✅ Debe funcionar: Dashboard Ente
curl -X GET http://localhost:8000/api/v1/dashboard/events/summary \
  -H "Authorization: Bearer $TOKEN"

# ✅ Debe funcionar: Aprobar evento
curl -X PATCH http://localhost:8000/api/v1/events/1/approve \
  -H "Authorization: Bearer $TOKEN"

# ✅ Debe funcionar: Admin appearance
curl -X GET http://localhost:8000/api/v1/admin/appearance \
  -H "Authorization: Bearer $TOKEN"
```

**Test 2: Entity Admin (acceso a Ente)**
```bash
# Login como Entity Admin
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.garcia@enteturismo.gov.ar","password":"password123"}'

TOKEN="..."

# ✅ Debe funcionar: Dashboard Ente
curl -X GET http://localhost:8000/api/v1/dashboard/events/summary \
  -H "Authorization: Bearer $TOKEN"

# ✅ Debe funcionar: Aprobar evento
curl -X PATCH http://localhost:8000/api/v1/events/1/approve \
  -H "Authorization: Bearer $TOKEN"

# ❌ Debe fallar (403): Panel Organizador
curl -X GET http://localhost:8000/api/v1/organizer/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Test 3: Entity Staff (solo lectura)**
```bash
# Login como Entity Staff
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carlos.mendoza@cultura.gov.ar","password":"password123"}'

TOKEN="..."

# ✅ Debe funcionar: Ver dashboard
curl -X GET http://localhost:8000/api/v1/dashboard/events/summary \
  -H "Authorization: Bearer $TOKEN"

# ❌ Debe fallar (403): Aprobar evento
curl -X PATCH http://localhost:8000/api/v1/events/1/approve \
  -H "Authorization: Bearer $TOKEN"

# ❌ Debe fallar (403): Crear evento
curl -X POST http://localhost:8000/api/v1/events \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test"}'
```

**Test 4: Event Organizer (solo panel organizador)**
```bash
# Login como Event Organizer
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria.rodriguez@sheraton.com","password":"password123"}'

TOKEN="..."

# ✅ Debe funcionar: Dashboard organizador
curl -X GET http://localhost:8000/api/v1/organizer/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"

# ✅ Debe funcionar: Crear evento propio
curl -X POST http://localhost:8000/api/v1/organizer/events \
  -H "Authorization: Bearer $TOKEN" \
  -d '{...}'

# ❌ Debe fallar (403): Dashboard Ente
curl -X GET http://localhost:8000/api/v1/dashboard/events/summary \
  -H "Authorization: Bearer $TOKEN"

# ❌ Debe fallar (403): Aprobar evento
curl -X PATCH http://localhost:8000/api/v1/events/1/approve \
  -H "Authorization: Bearer $TOKEN"

# ❌ Debe fallar (403): Admin appearance
curl -X GET http://localhost:8000/api/v1/admin/appearance \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Verificar Logs

```bash
cd backend
tail -f storage/logs/laravel.log | grep CheckRole
```

Debe mostrar:
- `CheckRole: Access granted` para accesos válidos
- `CheckRole: Access denied` para accesos bloqueados

---

## CRITERIOS DE ÉXITO

- [ ] Middleware CheckRole creado y registrado
- [ ] Todas las rutas tienen middleware de rol apropiado
- [ ] Platform Admin puede acceder a todo
- [ ] Entity Admin puede acceder a rutas del Ente y aprobación
- [ ] Entity Staff solo puede leer eventos del Ente
- [ ] Event Organizer solo puede acceder a `/organizer/*`
- [ ] Event Organizer NO puede acceder a dashboard del Ente
- [ ] Event Organizer NO puede aprobar eventos
- [ ] Logs muestran correctamente accesos permitidos/denegados
- [ ] Tests curl para los 4 roles pasan correctamente

---

## ISSUES ADICIONALES A RESOLVER

### Issue 1: Rutas duplicadas para eventos
Actualmente hay dos grupos que definen rutas de eventos:
- Grupo Entity Admin: `GET /events`, `POST /events`, etc.
- Grupo Entity Staff: `GET /events`, `GET /events/{id}`

**Solución:** Las rutas deben estar definidas UNA sola vez con los roles apropiados.

### Issue 2: Scoping de organization_id
El OrganizerController debe verificar que el evento pertenece a la organización del usuario:

```php
// Ejemplo en OrganizerController
public function show(Request $request, $id)
{
    $user = $request->user();
    $event = Event::where('id', $id)
        ->where('organization_id', $user->organization_id)
        ->firstOrFail();
    
    return response()->json($event);
}
```

### Issue 3: Frontend - Redirección por rol
El frontend debe redirigir según el rol del usuario:

```typescript
// src/middleware.ts o en login
if (user.role === 'Event Organizer') {
  redirect('/organizer/dashboard')
} else if (user.role === 'Entity Administrator' || user.role === 'Entity Staff') {
  redirect('/dashboard/eventos')
} else if (user.role === 'Platform Administrator') {
  redirect('/admin/dashboard')
}
```

---

## COMMIT

```bash
git add backend/app/Http/Middleware/CheckRole.php
git add backend/app/Http/Kernel.php  # o bootstrap/app.php
git add backend/routes/api.php
git commit -m "fix(security): implement role-based access control middleware

CRITICAL SECURITY FIX - All protected routes now properly restricted by role

Changes:
- Add CheckRole middleware with role verification
- Register 'role' middleware alias
- Restructure api.php routes with proper role middleware:
  - platform_admin + entity_admin: Full CRUD, approval, admin features
  - platform_admin + entity_admin + entity_staff: Dashboard and read-only
  - organizer: Only /organizer/* routes for own events
  - All authenticated: Read-only categories/locations
- Add logging for access granted/denied
- Prevent Event Organizers from accessing Entity dashboard
- Prevent Entity Staff from approving/creating events

Resolves: TASK-SECURITY (Critical security vulnerability)"
```

---

**Tiempo real esperado:** 2-3 horas  
**Bloqueantes:** Ninguno - pero BLOQUEA desarrollo de nuevas features  
**Prioridad:** CRÍTICA - Debe resolverse antes de continuar