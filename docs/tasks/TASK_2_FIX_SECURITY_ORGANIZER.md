# TASK 2: Fix Security - Crear OrganizerController con Scoping

**Prioridad:** CRÍTICA (Security Issue)  
**Tiempo estimado:** 1-2 horas  
**Contexto:** EventController actual NO valida organization_id, permitiendo que organizadores vean/editen eventos de otras organizaciones

---

## PROBLEMA DE SEGURIDAD

### Estado Actual (INSEGURO)
```php
// EventController actual
GET /api/v1/events
// Retorna TODOS los eventos sin filtrar por organization_id del usuario
// Un organizer_admin puede ver eventos de CUALQUIER organización
```

**Riesgo:** Un organizador malicioso podría:
- Ver eventos confidenciales de competidores
- Editar/eliminar eventos que no le pertenecen
- Acceder a información privada de otras organizaciones

---

## SOLUCIÓN

Crear namespace `/api/v1/organizer/` con **scoping automático** por `organization_id` del usuario autenticado.

---

## PASOS DE EJECUCIÓN

### 1. Crear Estructura de Feature Organizer

```bash
cd backend

# Crear directorios
mkdir -p app/Features/Organizer/Controllers
mkdir -p app/Features/Organizer/Services
```

### 2. Crear OrganizerController

Crear archivo `backend/app/Features/Organizer/Controllers/OrganizerController.php`:

```php
<?php

namespace App\Features\Organizer\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class OrganizerController extends Controller
{
    /**
     * Lista eventos SOLO de la organización del usuario
     * 
     * GET /api/v1/organizer/events
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        Log::info('Organizer listing events', [
            'user_id' => $user->id,
            'organization_id' => $user->organization_id
        ]);
        
        // CRÍTICO: Filtrar por organization_id del usuario
        $query = Event::where('organization_id', $user->organization_id)
            ->with(['category', 'locations', 'status']);
        
        // Filtros opcionales
        if ($request->has('status_code')) {
            $query->whereHas('status', function ($q) use ($request) {
                $q->where('status_code', $request->status_code);
            });
        }
        
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ILIKE', "%{$search}%")
                  ->orWhere('description', 'ILIKE', "%{$search}%");
            });
        }
        
        $events = $query->orderBy('start_date', 'desc')
            ->paginate(15);
            
        return response()->json($events);
    }
    
    /**
     * Ver detalle de evento (solo si es de su organización)
     * 
     * GET /api/v1/organizer/events/{id}
     */
    public function show(Request $request, $id)
    {
        $user = Auth::user();
        
        $event = Event::where('id', $id)
            ->where('organization_id', $user->organization_id)
            ->with(['category', 'locations', 'status', 'creator'])
            ->firstOrFail();
            
        Log::info('Organizer viewing event', [
            'user_id' => $user->id,
            'event_id' => $event->id
        ]);
            
        return response()->json($event);
    }
    
    /**
     * Crear evento (siempre con organization_id del usuario)
     * 
     * POST /api/v1/organizer/events
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_date' => 'required|date|after:today',
            'end_date' => 'required|date|after:start_date',
            'category_id' => 'required|exists:categories,id',
            'location_ids' => 'required|array|min:1',
            'location_ids.*' => 'exists:locations,id',
            'type_id' => 'required|exists:event_types,id',
            'max_attendees' => 'nullable|integer|min:1',
            'virtual_link' => 'nullable|url',
            'location_text' => 'nullable|string|max:500',
        ]);
        
        // CRÍTICO: Forzar organization_id del usuario
        $validated['organization_id'] = $user->organization_id;
        $validated['entity_id'] = 1; // Default entity (ajustar según tu lógica)
        $validated['status_id'] = 1; // status = 'draft'
        $validated['created_by'] = $user->id;
        
        Log::info('Organizer creating event', [
            'user_id' => $user->id,
            'organization_id' => $validated['organization_id'],
            'title' => $validated['title']
        ]);
        
        // Crear evento
        $event = Event::create($validated);
        
        // Sync locations
        if (isset($validated['location_ids'])) {
            $event->locations()->sync($validated['location_ids']);
        }
        
        // Reload con relationships
        $event->load(['category', 'locations', 'status']);
        
        return response()->json($event, 201);
    }
    
    /**
     * Actualizar evento (solo si es de su organización y estado permite)
     * 
     * PUT /api/v1/organizer/events/{id}
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        
        // Verificar ownership
        $event = Event::where('id', $id)
            ->where('organization_id', $user->organization_id)
            ->with('status')
            ->firstOrFail();
            
        // Validar estado editable
        $editableStatuses = ['draft', 'requires_changes'];
        if (!in_array($event->status->status_code, $editableStatuses)) {
            Log::warning('Organizer attempted to edit non-editable event', [
                'user_id' => $user->id,
                'event_id' => $event->id,
                'current_status' => $event->status->status_code
            ]);
            
            return response()->json([
                'error' => 'Cannot edit event in current status',
                'current_status' => $event->status->status_code,
                'editable_statuses' => $editableStatuses
            ], 403);
        }
        
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'category_id' => 'sometimes|exists:categories,id',
            'location_ids' => 'sometimes|array',
            'location_ids.*' => 'exists:locations,id',
            'type_id' => 'sometimes|exists:event_types,id',
            'max_attendees' => 'nullable|integer|min:1',
            'virtual_link' => 'nullable|url',
            'location_text' => 'nullable|string|max:500',
        ]);
        
        Log::info('Organizer updating event', [
            'user_id' => $user->id,
            'event_id' => $event->id
        ]);
        
        $event->update($validated);
        
        if (isset($validated['location_ids'])) {
            $event->locations()->sync($validated['location_ids']);
        }
        
        $event->load(['category', 'locations', 'status']);
        
        return response()->json($event);
    }
    
    /**
     * Eliminar evento (solo si es de su organización y está en draft)
     * 
     * DELETE /api/v1/organizer/events/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = Auth::user();
        
        // Verificar ownership
        $event = Event::where('id', $id)
            ->where('organization_id', $user->organization_id)
            ->with('status')
            ->firstOrFail();
            
        // Solo permitir eliminar en draft
        if ($event->status->status_code !== 'draft') {
            Log::warning('Organizer attempted to delete non-draft event', [
                'user_id' => $user->id,
                'event_id' => $event->id,
                'current_status' => $event->status->status_code
            ]);
            
            return response()->json([
                'error' => 'Can only delete draft events',
                'current_status' => $event->status->status_code
            ], 403);
        }
        
        Log::info('Organizer deleting event', [
            'user_id' => $user->id,
            'event_id' => $event->id
        ]);
        
        $event->delete();
        
        return response()->json([
            'message' => 'Event deleted successfully'
        ]);
    }
}
```

### 3. Agregar Rutas en routes/api.php

Editar `backend/routes/api.php`, agregar DESPUÉS de las rutas existentes:

```php
// Organizer routes - Eventos con scoping por organization_id
Route::middleware(['auth:sanctum'])->prefix('organizer')->group(function () {
    Route::get('events', [App\Features\Organizer\Controllers\OrganizerController::class, 'index']);
    Route::post('events', [App\Features\Organizer\Controllers\OrganizerController::class, 'store']);
    Route::get('events/{id}', [App\Features\Organizer\Controllers\OrganizerController::class, 'show']);
    Route::put('events/{id}', [App\Features\Organizer\Controllers\OrganizerController::class, 'update']);
    Route::delete('events/{id}', [App\Features\Organizer\Controllers\OrganizerController::class, 'destroy']);
});
```

### 4. Verificar Model Event

Editar `backend/app/Models/Event.php`:

Verificar que estos campos estén en `$fillable`:

```php
protected $fillable = [
    'title',
    'description',
    'start_date',
    'end_date',
    'organization_id', // ← CRÍTICO
    'entity_id',       // ← CRÍTICO
    'category_id',
    'status_id',
    'type_id',
    'created_by',
    'max_attendees',
    'virtual_link',
    'location_text',
    // ... otros campos
];
```

Si `organization_id` o `entity_id` NO están, agregarlos.

---

## TESTING

### Setup: Crear Usuario Organizer de Prueba

```bash
php artisan tinker
```

```php
// Crear organización de prueba
$org = App\Models\Organization::create([
    'name' => 'Test Hotel',
    'cuit' => '20-99999999-9',
    'status_id' => 1,
    'type_id' => 1, // hotel
    'trust_level' => 1
]);

// Crear usuario organizer_admin
$user = App\Models\User::create([
    'name' => 'Test Organizer',
    'email' => 'organizer@test.com',
    'password' => bcrypt('password'),
    'role_id' => 4, // organizer_admin (ajustar según tu tabla user_roles)
    'organization_id' => $org->id
]);
```

### Test 1: Login como Organizer

```bash
# Usando curl
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer@test.com",
    "password": "password"
  }'
```

**Resultado esperado:**
```json
{
  "token": "xxx...",
  "user": {
    "id": 5,
    "name": "Test Organizer",
    "email": "organizer@test.com",
    "organization_id": 2,
    "role": "organizer_admin"
  }
}
```

Guardar el token para siguientes requests.

### Test 2: Listar Eventos (Solo de su organización)

```bash
curl -X GET http://localhost:8000/api/v1/organizer/events \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/json"
```

**Resultado esperado:**
- Solo eventos donde `organization_id = user.organization_id`
- NO eventos de otras organizaciones

### Test 3: Ver Evento Propio

```bash
curl -X GET http://localhost:8000/api/v1/organizer/events/{ID_PROPIO} \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/json"
```

**Resultado esperado:** Status 200, datos del evento

### Test 4: Intentar Ver Evento de Otra Organización (DEBE FALLAR)

```bash
curl -X GET http://localhost:8000/api/v1/organizer/events/{ID_OTRO} \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/json"
```

**Resultado esperado:** Status 404 Not Found

### Test 5: Crear Evento

```bash
curl -X POST http://localhost:8000/api/v1/organizer/events \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "title": "Test Event",
    "description": "Evento de prueba",
    "start_date": "2025-11-01 10:00:00",
    "end_date": "2025-11-01 12:00:00",
    "category_id": 1,
    "location_ids": [1],
    "type_id": 1
  }'
```

**Resultado esperado:**
- Status 201 Created
- Event creado con `organization_id = user.organization_id`
- Event tiene `status_id = 1` (draft)

### Test 6: Editar Evento en Draft

```bash
curl -X PUT http://localhost:8000/api/v1/organizer/events/{ID} \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "title": "Evento Actualizado"
  }'
```

**Resultado esperado:** Status 200, evento actualizado

### Test 7: Intentar Editar Evento Aprobado (DEBE FALLAR)

Primero cambiar status del evento a 'approved':
```php
php artisan tinker
$event = App\Models\Event::find({ID});
$event->status_id = 3; // approved
$event->save();
```

Luego intentar editar:
```bash
curl -X PUT http://localhost:8000/api/v1/organizer/events/{ID} \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title": "No debería funcionar"}'
```

**Resultado esperado:**
- Status 403 Forbidden
- Error: "Cannot edit event in current status"

### Test 8: Eliminar Evento en Draft

```bash
curl -X DELETE http://localhost:8000/api/v1/organizer/events/{ID_DRAFT} \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/json"
```

**Resultado esperado:** Status 200, mensaje de éxito

### Test 9: Intentar Eliminar Evento Aprobado (DEBE FALLAR)

```bash
curl -X DELETE http://localhost:8000/api/v1/organizer/events/{ID_APPROVED} \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Accept: application/json"
```

**Resultado esperado:**
- Status 403 Forbidden
- Error: "Can only delete draft events"

---

## VALIDACIÓN DE SEGURIDAD

### Escenario 1: Organizador A intenta ver evento de Organizador B

```bash
# Login como Organizador A
TOKEN_A=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "organizerA@test.com", "password": "password"}' \
  | jq -r '.token')

# Crear evento de Organizador B (manualmente o con otro usuario)
# Event ID = 999, organization_id = 2

# Organizador A (organization_id = 1) intenta ver evento de B
curl -X GET http://localhost:8000/api/v1/organizer/events/999 \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Accept: application/json"
```

**Resultado esperado:** 404 Not Found (evento no existe para su organization_id)

### Escenario 2: Organizador intenta forzar organization_id en create

```bash
curl -X POST http://localhost:8000/api/v1/organizer/events \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hack Attempt",
    "organization_id": 999,
    ...
  }'
```

**Resultado esperado:** organization_id es ignorado y se usa el del usuario autenticado

---

## CRITERIOS DE ÉXITO

- [ ] OrganizerController creado en app/Features/Organizer/Controllers/
- [ ] Rutas /api/v1/organizer/* agregadas y funcionando
- [ ] GET /organizer/events retorna solo eventos de la organización del usuario
- [ ] POST /organizer/events crea evento con organization_id del usuario
- [ ] PUT /organizer/events/{id} solo funciona si evento es propio y editable
- [ ] DELETE /organizer/events/{id} solo funciona si evento es propio y en draft
- [ ] Organizador NO puede ver eventos de otras organizaciones (404)
- [ ] Organizador NO puede editar eventos en estado no-editable (403)
- [ ] Organizador NO puede eliminar eventos no-draft (403)
- [ ] Todos los logs aparecen correctamente en storage/logs/laravel.log

---

## PROBLEMAS COMUNES

**Error: "Target class [OrganizerController] does not exist"**
- Causa: Namespace incorrecto en routes
- Solución: Usar full namespace: `App\Features\Organizer\Controllers\OrganizerController::class`

**Error: "organization_id is required"**
- Causa: $fillable no incluye organization_id
- Solución: Agregar a $fillable en Event.php

**Error: "Call to undefined relationship"**
- Causa: Relationship no definida en Model
- Solución: Verificar que Event tiene: `public function status()`, `public function locations()`, etc.

---

## PRÓXIMO PASO

Después de completar esta tarea, continuar con:
- **TASK 3:** Fix TypeScript Jest types

---

**Tiempo real esperado:** 1-2 horas  
**Bloqueantes:** Ninguno  
**Dependencias:** Migration events y organizations deben existir