# TASK-SECURITY-part2: Organization Scoping y Testing Completo

**Creado:** Octubre 6, 2025  
**Prioridad:** ALTA - Complemento de TASK-SECURITY  
**Tiempo estimado:** 1-2 horas  
**Dependencias:** TASK-SECURITY completada (middleware CheckRole funcionando)

---

## PROBLEMA IDENTIFICADO

**Issue crítico pendiente de TASK-SECURITY:**

El OrganizerController NO verifica que los eventos pertenezcan a la organización del usuario. Esto permite:

**Escenario de ataque:**
```bash
# Usuario de Sheraton (organization_id: 3)
TOKEN="..." 

# Puede ver evento de La Rural (organization_id: 4)
curl -X GET http://localhost:8000/api/v1/organizer/events/5 \
  -H "Authorization: Bearer $TOKEN"

# Puede editar evento de otra organización
curl -X PUT http://localhost:8000/api/v1/organizer/events/5 \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Evento hackeado"}'

# Puede eliminar eventos de otros
curl -X DELETE http://localhost:8000/api/v1/organizer/events/5 \
  -H "Authorization: Bearer $TOKEN"
```

**Impacto:** Un Event Organizer puede:
- Ver eventos de otras organizaciones
- Modificar eventos que no le pertenecen
- Eliminar eventos de competidores
- Acceder a datos sensibles de otras organizaciones

---

## OBJETIVOS

1. **Implementar scoping de organization_id** en todos los métodos de OrganizerController
2. **Crear usuario Entity Staff** para testing completo de roles
3. **Verificar ownership** en todas las operaciones CRUD del organizador
4. **Tests exhaustivos** de los 4 roles con casos edge

---

## IMPLEMENTACIÓN

### 1. Actualizar OrganizerController con Organization Scoping

**Ubicación:** `backend/app/Features/Organizer/Controllers/OrganizerController.php`

**Estrategia:**
- Usar `organization_id` accessor del modelo User
- Aplicar `where('organization_id', $user->organization_id)` en todas las queries
- Usar `firstOrFail()` para retornar 404 si no pertenece a la organización
- Logging para auditoría

**Código completo actualizado:**

```php
<?php

namespace App\Features\Organizer\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class OrganizerController
{
    /**
     * Lista eventos de la organización del usuario
     * 
     * GET /api/v1/organizer/events
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user || !$user->organization_id) {
            Log::warning('OrganizerController@index: User has no organization', [
                'user_id' => $user?->id
            ]);
            return response()->json(['error' => 'No organization assigned'], 403);
        }

        $query = Event::where('organization_id', $user->organization_id)
            ->with(['status', 'category', 'location', 'type']);

        // Filtros
        if ($request->has('status')) {
            $query->whereHas('status', function($q) use ($request) {
                $q->where('status_code', $request->status);
            });
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                  ->orWhere('description', 'ILIKE', "%{$search}%");
            });
        }

        // Paginación
        $perPage = $request->get('per_page', 10);
        $events = $query->paginate($perPage);

        Log::info('OrganizerController@index: Events retrieved', [
            'user_id' => $user->id,
            'organization_id' => $user->organization_id,
            'total' => $events->total()
        ]);

        return response()->json($events);
    }

    /**
     * Muestra un evento específico de la organización
     * 
     * GET /api/v1/organizer/events/{id}
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        if (!$user || !$user->organization_id) {
            return response()->json(['error' => 'No organization assigned'], 403);
        }

        // CRÍTICO: Verificar ownership por organization_id
        $event = Event::where('id', $id)
            ->where('organization_id', $user->organization_id)
            ->with(['status', 'category', 'location', 'type'])
            ->firstOrFail();

        Log::info('OrganizerController@show: Event retrieved', [
            'user_id' => $user->id,
            'organization_id' => $user->organization_id,
            'event_id' => $id
        ]);

        return response()->json($event);
    }

    /**
     * Crea un nuevo evento para la organización
     * 
     * POST /api/v1/organizer/events
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->organization_id) {
            return response()->json(['error' => 'No organization assigned'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'category_id' => 'required|exists:categories,id',
            'location_id' => 'nullable|exists:locations,id',
            'type_id' => 'nullable|exists:event_types,id',
            'featured_image' => 'nullable|string',
            'virtual_link' => 'nullable|url',
            'cta_link' => 'nullable|url',
            'cta_text' => 'nullable|string|max:100',
            'max_attendees' => 'nullable|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            // Estado inicial: draft
            $draftStatus = \App\Models\EventStatus::where('status_code', 'draft')->firstOrFail();

            $event = Event::create([
                ...$validated,
                'organization_id' => $user->organization_id, // CRÍTICO: Usar org del usuario
                'entity_id' => 1, // TODO: Obtener entity_id dinámicamente
                'status_id' => $draftStatus->id,
                'created_by' => $user->id,
            ]);

            DB::commit();

            Log::info('OrganizerController@store: Event created', [
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
                'event_id' => $event->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Event created successfully',
                'data' => $event->load(['status', 'category', 'location'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('OrganizerController@store: Failed to create event', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualiza un evento de la organización
     * 
     * PUT /api/v1/organizer/events/{id}
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();

        if (!$user || !$user->organization_id) {
            return response()->json(['error' => 'No organization assigned'], 403);
        }

        // CRÍTICO: Verificar ownership antes de actualizar
        $event = Event::where('id', $id)
            ->where('organization_id', $user->organization_id)
            ->firstOrFail();

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'category_id' => 'sometimes|required|exists:categories,id',
            'location_id' => 'nullable|exists:locations,id',
            'type_id' => 'nullable|exists:event_types,id',
            'featured_image' => 'nullable|string',
            'virtual_link' => 'nullable|url',
            'cta_link' => 'nullable|url',
            'cta_text' => 'nullable|string|max:100',
            'max_attendees' => 'nullable|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $event->update($validated);
            DB::commit();

            Log::info('OrganizerController@update: Event updated', [
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
                'event_id' => $id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Event updated successfully',
                'data' => $event->fresh(['status', 'category', 'location'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('OrganizerController@update: Failed to update event', [
                'user_id' => $user->id,
                'event_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina un evento de la organización
     * 
     * DELETE /api/v1/organizer/events/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if (!$user || !$user->organization_id) {
            return response()->json(['error' => 'No organization assigned'], 403);
        }

        // CRÍTICO: Verificar ownership antes de eliminar
        $event = Event::where('id', $id)
            ->where('organization_id', $user->organization_id)
            ->firstOrFail();

        DB::beginTransaction();
        try {
            $event->delete();
            DB::commit();

            Log::info('OrganizerController@destroy: Event deleted', [
                'user_id' => $user->id,
                'organization_id' => $user->organization_id,
                'event_id' => $id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Event deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('OrganizerController@destroy: Failed to delete event', [
                'user_id' => $user->id,
                'event_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtiene estadísticas del dashboard del organizador
     * 
     * GET /api/v1/organizer/dashboard/stats
     */
    public function dashboardStats(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->organization_id) {
            return response()->json(['error' => 'No organization assigned'], 403);
        }

        // CRÍTICO: Contar solo eventos de la organización
        $stats = [
            'total_events' => Event::where('organization_id', $user->organization_id)->count(),
            'draft' => Event::where('organization_id', $user->organization_id)
                ->whereHas('status', fn($q) => $q->where('status_code', 'draft'))->count(),
            'pending_approval' => Event::where('organization_id', $user->organization_id)
                ->whereHas('status', fn($q) => $q->where('status_code', 'pending_internal_approval'))->count(),
            'approved_internal' => Event::where('organization_id', $user->organization_id)
                ->whereHas('status', fn($q) => $q->where('status_code', 'approved_internal'))->count(),
            'published' => Event::where('organization_id', $user->organization_id)
                ->whereHas('status', fn($q) => $q->where('status_code', 'published'))->count(),
            'requires_changes' => Event::where('organization_id', $user->organization_id)
                ->whereHas('status', fn($q) => $q->where('status_code', 'requires_changes'))->count(),
            'rejected' => Event::where('organization_id', $user->organization_id)
                ->whereHas('status', fn($q) => $q->where('status_code', 'rejected'))->count(),
            'archived' => Event::where('organization_id', $user->organization_id)
                ->whereHas('status', fn($q) => $q->where('status_code', 'cancelled'))->count(),
        ];

        Log::info('OrganizerController@dashboardStats: Stats retrieved', [
            'user_id' => $user->id,
            'organization_id' => $user->organization_id,
            'stats' => $stats
        ]);

        return response()->json($stats);
    }
}
```

**Cambios clave:**
1. Todos los métodos verifican `$user->organization_id` primero
2. Todas las queries incluyen `->where('organization_id', $user->organization_id)`
3. `firstOrFail()` retorna 404 automáticamente si no encuentra o no pertenece
4. Logging completo en todas las operaciones
5. Transacciones DB en operaciones de escritura

---

### 2. Crear Usuario Entity Staff para Testing

**Ubicación:** `backend/database/seeders/UserSeeder.php` (o ejecutar en tinker)

```php
// Opción A: Agregar al seeder existente

// En UserSeeder.php, agregar:
$entityStaffRole = UserRole::where('role_name', 'Entity Staff')->first();
$enteOrganization = Organization::where('slug', 'ente-turismo-tucuman')->first();

$entityStaff = User::create([
    'name' => 'Pedro Gómez',
    'email' => 'pedro.gomez@enteturismo.gov.ar',
    'password' => bcrypt('password123'),
    'role_id' => $entityStaffRole->id,
    'email_verified_at' => now(),
]);

// Asociar a organización
$entityStaff->organizations()->attach($enteOrganization->id);
```

**Opción B: Crear directamente en tinker**

```bash
docker exec plataforma-calendario-backend php artisan tinker
```

```php
$staffRole = \App\Models\UserRole::where('role_name', 'Entity Staff')->first();
$enteOrg = \App\Models\Organization::where('slug', 'ente-turismo-tucuman')->first();

$staff = \App\Models\User::create([
    'name' => 'Pedro Gómez',
    'email' => 'pedro.gomez@enteturismo.gov.ar',
    'password' => bcrypt('password123'),
    'role_id' => $staffRole->id,
    'email_verified_at' => now(),
]);

$staff->organizations()->attach($enteOrg->id);

echo "Usuario Entity Staff creado: pedro.gomez@enteturismo.gov.ar / password123\n";
```

---

## VERIFICACIÓN Y TESTING EXHAUSTIVO

### Test 1: Event Organizer - Ownership Verification

**Setup:**
```bash
# Login como Sheraton (organization_id: 3)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria.rodriguez@sheraton.com","password":"password123"}'

TOKEN_SHERATON="..." # Guardar token

# Login como La Rural (organization_id: 4)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan.perez@larural.com.ar","password":"password123"}'

TOKEN_LARURAL="..." # Guardar token
```

**Test A: Ver solo eventos propios**
```bash
# Sheraton puede ver sus eventos
curl -X GET http://localhost:8000/api/v1/organizer/events \
  -H "Authorization: Bearer $TOKEN_SHERATON"

# Resultado esperado: Solo eventos de organization_id=3
```

**Test B: NO puede ver eventos de otra organización**
```bash
# Obtener ID de evento de La Rural
EVENT_LARURAL_ID=... # ejemplo: 5

# Sheraton intenta ver evento de La Rural
curl -X GET http://localhost:8000/api/v1/organizer/events/$EVENT_LARURAL_ID \
  -H "Authorization: Bearer $TOKEN_SHERATON"

# Resultado esperado: 404 Not Found
# Log esperado: "firstOrFail() threw exception"
```

**Test C: NO puede editar eventos de otra organización**
```bash
# Sheraton intenta editar evento de La Rural
curl -X PUT http://localhost:8000/api/v1/organizer/events/$EVENT_LARURAL_ID \
  -H "Authorization: Bearer $TOKEN_SHERATON" \
  -H "Content-Type: application/json" \
  -d '{"title":"Evento hackeado"}'

# Resultado esperado: 404 Not Found
# El evento NO debe ser modificado
```

**Test D: NO puede eliminar eventos de otra organización**
```bash
# Sheraton intenta eliminar evento de La Rural
curl -X DELETE http://localhost:8000/api/v1/organizer/events/$EVENT_LARURAL_ID \
  -H "Authorization: Bearer $TOKEN_SHERATON"

# Resultado esperado: 404 Not Found
# El evento NO debe ser eliminado
```

**Test E: Dashboard stats - solo eventos propios**
```bash
# Sheraton ve sus stats
curl -X GET http://localhost:8000/api/v1/organizer/dashboard/stats \
  -H "Authorization: Bearer $TOKEN_SHERATON"

# Resultado esperado: Conteos solo de events con organization_id=3
# Verificar que total_events coincide con:
# SELECT COUNT(*) FROM events WHERE organization_id = 3;
```

---

### Test 2: Entity Staff - Permisos Correctos

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pedro.gomez@enteturismo.gov.ar","password":"password123"}'

TOKEN_STAFF="..." # Guardar token
```

**Test A: Puede ver dashboard del Ente**
```bash
curl -X GET http://localhost:8000/api/v1/dashboard/events/summary \
  -H "Authorization: Bearer $TOKEN_STAFF"

# Resultado esperado: 200 OK con stats
# Log esperado: "CheckRole: Access granted"
```

**Test B: Puede ver eventos**
```bash
curl -X GET http://localhost:8000/api/v1/events \
  -H "Authorization: Bearer $TOKEN_STAFF"

# Resultado esperado: 200 OK con lista de eventos
```

**Test C: NO puede crear eventos**
```bash
curl -X POST http://localhost:8000/api/v1/events \
  -H "Authorization: Bearer $TOKEN_STAFF" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test",...}'

# Resultado esperado: 403 Forbidden
# Log esperado: "CheckRole: Access denied"
```

**Test D: NO puede aprobar eventos**
```bash
curl -X PATCH http://localhost:8000/api/v1/events/1/approve \
  -H "Authorization: Bearer $TOKEN_STAFF"

# Resultado esperado: 403 Forbidden
```

**Test E: NO puede crear categorías**
```bash
curl -X POST http://localhost:8000/api/v1/categories \
  -H "Authorization: Bearer $TOKEN_STAFF" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Category"}'

# Resultado esperado: 403 Forbidden
```

**Test F: NO puede acceder al panel organizador**
```bash
curl -X GET http://localhost:8000/api/v1/organizer/dashboard/stats \
  -H "Authorization: Bearer $TOKEN_STAFF"

# Resultado esperado: 403 Forbidden
```

---

### Test 3: Cross-Organization Attack Scenarios

**Escenario 1: Event ID guessing**
```bash
# Sheraton intenta IDs secuenciales de otros
for id in {1..10}; do
  echo "Testing event ID: $id"
  curl -X GET http://localhost:8000/api/v1/organizer/events/$id \
    -H "Authorization: Bearer $TOKEN_SHERATON"
done

# Resultado esperado: 
# - 200 OK solo para eventos de organization_id=3
# - 404 Not Found para todos los demás
```

**Escenario 2: Crear evento con organization_id manipulado**
```bash
# Sheraton intenta crear evento para otra organización
curl -X POST http://localhost:8000/api/v1/organizer/events \
  -H "Authorization: Bearer $TOKEN_SHERATON" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Evento malicioso",
    "description":"Test",
    "organization_id": 4,  # La Rural
    "start_date":"2025-12-01",
    "end_date":"2025-12-02",
    "category_id":1
  }'

# Resultado esperado: 
# - Event creado con organization_id=3 (ignorando el parámetro)
# - O validation error si organization_id no es fillable
```

---

### Test 4: Logs Audit Trail

```bash
# Ver logs de operaciones del organizador
docker exec plataforma-calendario-backend tail -f storage/logs/laravel.log | grep OrganizerController
```

**Verificar que se loggea:**
- `OrganizerController@index: Events retrieved` con organization_id
- `OrganizerController@show: Event retrieved` con event_id y organization_id
- `OrganizerController@store: Event created` con detalles
- `OrganizerController@update: Event updated`
- `OrganizerController@destroy: Event deleted`
- `OrganizerController@dashboardStats: Stats retrieved`

**Verificar que se loggean errores:**
- `User has no organization` cuando falta organization_id
- `Failed to create event` con detalles del error
- Excepciones de firstOrFail() cuando intenta acceder a eventos de otros

---

## CRITERIOS DE ÉXITO

### Seguridad
- [ ] Event Organizer NO puede ver eventos de otra organización (404)
- [ ] Event Organizer NO puede editar eventos de otra organización (404)
- [ ] Event Organizer NO puede eliminar eventos de otra organización (404)
- [ ] Dashboard stats muestra solo eventos propios
- [ ] Eventos creados tienen organization_id del usuario (no manipulable)
- [ ] Todas las operaciones verifican ownership antes de ejecutar

### Roles y Permisos
- [ ] Entity Staff puede ver dashboard del Ente
- [ ] Entity Staff puede ver eventos (read-only)
- [ ] Entity Staff NO puede crear/editar/eliminar eventos
- [ ] Entity Staff NO puede aprobar/rechazar eventos
- [ ] Entity Staff NO puede crear categorías/ubicaciones
- [ ] Entity Staff NO puede acceder a panel organizador

### Logging y Auditoría
- [ ] Todos los métodos de OrganizerController loggean operaciones
- [ ] Logs incluyen user_id, organization_id, event_id
- [ ] Errores se loggean con stack trace
- [ ] Intentos fallidos de acceso se registran

### Database Integrity
- [ ] Transacciones DB en todas las operaciones de escritura
- [ ] Rollback automático en caso de error
- [ ] No hay eventos huérfanos sin organization_id

---

## ISSUES CONOCIDOS Y NOTAS

### Issue 1: entity_id hardcodeado
```php
'entity_id' => 1, // TODO: Obtener entity_id dinámicamente
```

**Solución futura:** Obtener entity_id del Ente correspondiente a la provincia/región del organizador.

### Issue 2: Validation de organization_id en request
Actualmente el controller sobrescribe organization_id con el del usuario. Considerar agregar validation que rechace el parámetro si viene en el request:

```php
$request->validate([
    'organization_id' => 'prohibited', // No permitir en request
]);
```

### Issue 3: Soft deletes
Si Event tiene soft deletes, considerar:
```php
$event = Event::where('id', $id)
    ->where('organization_id', $user->organization_id)
    ->withTrashed() // Si necesita ver eventos eliminados
    ->firstOrFail();
```

---

## COMMIT

```bash
git add backend/app/Features/Organizer/Controllers/OrganizerController.php
git add backend/database/seeders/UserSeeder.php  # Si se modificó
git commit -m "fix(security): add organization scoping to OrganizerController

CRITICAL SECURITY FIX - Prevent cross-organization data access

Changes:
- Add organization_id verification to all OrganizerController methods
- Use where('organization_id', user->organization_id) in all queries
- Return 404 instead of 403 for non-existent/unauthorized resources
- Add comprehensive logging for audit trail
- Wrap write operations in DB transactions
- Create Entity Staff test user (pedro.gomez@enteturismo.gov.ar)

Security improvements:
- Event Organizers can only access their own organization's events
- Prevents viewing/editing/deleting events from other organizations
- Dashboard stats scoped to organization
- All operations logged with user_id and organization_id

Tests verified:
- Cross-organization access blocked (404)
- Event ID guessing prevented
- Entity Staff permissions correct (read-only)
- Logs show proper audit trail

Resolves: TASK-SECURITY-part2 (Organization scoping)"
```

---

**Tiempo real esperado:** 1-2 horas  
**Bloqueantes:** Ninguno  
**Prioridad:** ALTA - Cierre completo de vulnerabilidades de seguridad