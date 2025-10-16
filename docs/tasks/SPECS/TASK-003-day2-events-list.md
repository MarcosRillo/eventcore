# TASK-003 DÍA 2: Lista de Eventos del Organizador
## Panel Organizador - Event Management Table

**Fecha:** Octubre 7, 2025  
**Prioridad:** Alta (feature principal del panel)  
**Tiempo estimado:** 4 horas (2h mañana + 2h tarde)  
**Dependencias:** TASK-001, TASK-002, TASK-004 completadas ✅

---

## 🎯 OBJETIVO

Implementar tabla completa de gestión de eventos para el organizador con:
- Lista paginada de eventos propios
- Filtros por estado y búsqueda
- Acciones CRUD (Ver, Editar, Eliminar, Crear)
- Interfaz responsive y funcional

---

## 📋 CONTEXTO

### Ya Completado (TASK-003 Día 1):
✅ Dashboard con stats en `/organizer/dashboard`  
✅ Backend endpoint `/organizer/dashboard/stats`  
✅ Layout con sidebar verde  
✅ `organizerService` base  
✅ `useOrganizerEvents` hook

### Hoy Implementamos:
- Backend endpoint con filtros y paginación
- Frontend tabla de eventos
- Sistema de filtros (estado + búsqueda)
- Paginación
- Acciones CRUD

---

## 🔧 IMPLEMENTACIÓN BACKEND

### 1. Endpoint Lista de Eventos con Filtros

**Archivo:** `backend/app/Features/Organizer/Controllers/OrganizerController.php`

**Método a agregar:**

```php
/**
 * Get paginated list of organization's events with filters
 * 
 * @queryParam status string Filter by status code (optional)
 * @queryParam search string Search by title (optional)
 * @queryParam per_page int Items per page (default: 10)
 * @queryParam page int Page number (default: 1)
 */
public function events(Request $request)
{
    $user = $request->user();
    
    if (!$user->organization_id) {
        Log::warning('User without organization tried to access events', [
            'user_id' => $user->id
        ]);
        return response()->json([
            'error' => 'User not associated with organization'
        ], 403);
    }
    
    $perPage = $request->input('per_page', 10);
    $search = $request->input('search');
    $statusFilter = $request->input('status');
    
    $query = Event::withoutGlobalScopes()
        ->with(['status', 'category', 'location'])
        ->where('organization_id', $user->organization_id);
    
    // Apply search filter
    if ($search) {
        $query->where('title', 'ILIKE', "%{$search}%");
    }
    
    // Apply status filter
    if ($statusFilter) {
        $query->whereHas('status', function ($q) use ($statusFilter) {
            $q->where('status_code', $statusFilter);
        });
    }
    
    // Order by most recent first
    $query->orderBy('created_at', 'desc');
    
    $events = $query->paginate($perPage);
    
    Log::info('Organizer events list retrieved', [
        'user_id' => $user->id,
        'organization_id' => $user->organization_id,
        'total' => $events->total(),
        'per_page' => $perPage,
        'search' => $search,
        'status_filter' => $statusFilter
    ]);
    
    return response()->json($events);
}
```

### 2. Agregar Ruta

**Archivo:** `backend/routes/api.php`

**Dentro del grupo `organizer`:**

```php
Route::get('events', [OrganizerController::class, 'events']);
```

### 3. Verificar Endpoint

```bash
# Login como organizador
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria.rodriguez@sheraton.com","password":"password"}'
  
# Guardar TOKEN del response

# Test lista de eventos
curl -X GET "http://localhost:8000/api/v1/organizer/events?per_page=10" \
  -H "Authorization: Bearer {TOKEN}"
  
# Test con filtro de estado
curl -X GET "http://localhost:8000/api/v1/organizer/events?status=draft" \
  -H "Authorization: Bearer {TOKEN}"
  
# Test con búsqueda
curl -X GET "http://localhost:8000/api/v1/organizer/events?search=gastr" \
  -H "Authorization: Bearer {TOKEN}"
```

**Response esperado:**

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "title": "Festival Gastronómico",
      "start_date": "2025-11-15",
      "end_date": "2025-11-17",
      "status": {
        "id": 1,
        "status_code": "draft",
        "name": "Borrador"
      },
      "category": {
        "id": 1,
        "name": "Gastronomía"
      },
      "location": {
        "id": 1,
        "name": "San Miguel de Tucumán"
      }
    }
  ],
  "total": 1,
  "per_page": 10,
  "current_page": 1,
  "last_page": 1
}
```

---

## 🎨 IMPLEMENTACIÓN FRONTEND

### 1. Actualizar organizerService

**Archivo:** `frontend/src/features/events/services/organizerService.ts`

**Agregar método:**

```typescript
export interface EventsListParams {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
}

export interface PaginatedEvents {
  data: Event[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const organizerService = {
  // ... métodos existentes
  
  /**
   * Get paginated list of organization's events
   */
  async getEvents(params?: EventsListParams): Promise<PaginatedEvents> {
    const response = await apiClient.get<PaginatedEvents>('/organizer/events', {
      params
    });
    return response.data;
  }
};
```

### 2. Hook useOrganizerEvents (actualizar)

**Archivo:** `frontend/src/features/events/hooks/useOrganizerEvents.ts`

**Reemplazar contenido:**

```typescript
import { useState, useEffect } from 'react';
import { organizerService, EventsListParams } from '../services/organizerService';
import type { Event } from '@/types';

export const useOrganizerEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0
  });

  const [filters, setFilters] = useState<EventsListParams>({
    page: 1,
    per_page: 10,
    status: undefined,
    search: undefined
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await organizerService.getEvents(filters);
      
      setEvents(response.data);
      setPagination({
        currentPage: response.current_page,
        lastPage: response.last_page,
        perPage: response.per_page,
        total: response.total
      });
    } catch (err) {
      console.error('Error fetching organizer events:', err);
      setError('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const updateFilters = (newFilters: Partial<EventsListParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const changePage = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const changePerPage = (perPage: number) => {
    setFilters(prev => ({ ...prev, per_page: perPage, page: 1 }));
  };

  return {
    events,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    changePerPage,
    refetch: fetchEvents
  };
};
```

### 3. Componente EventsListPage

**Archivo:** `frontend/src/app/(organizer)/organizer/events/page.tsx`

**Crear:**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizerEvents } from '@/features/events/hooks/useOrganizerEvents';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'draft', label: 'Borrador' },
  { value: 'pending_approval', label: 'Pendiente Aprobación' },
  { value: 'approved_internal', label: 'Aprobado Interno' },
  { value: 'published', label: 'Publicado' },
  { value: 'requires_changes', label: 'Requiere Cambios' },
  { value: 'rejected', label: 'Rechazado' }
];

const STATUS_COLORS = {
  draft: 'gray',
  pending_approval: 'yellow',
  approved_internal: 'blue',
  published: 'green',
  requires_changes: 'orange',
  rejected: 'red'
} as const;

export default function OrganizerEventsPage() {
  const router = useRouter();
  const {
    events,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    changePerPage
  } = useOrganizerEvents();

  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    updateFilters({ search: searchInput });
  };

  const handleStatusChange = (status: string) => {
    updateFilters({ status: status || undefined });
  };

  const handleView = (eventId: number) => {
    router.push(`/organizer/events/${eventId}`);
  };

  const handleEdit = (eventId: number) => {
    router.push(`/organizer/events/${eventId}/edit`);
  };

  const handleDelete = async (eventId: number) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;
    
    try {
      // TODO: Implementar delete en organizerService
      console.log('Delete event:', eventId);
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const handleCreate = () => {
    router.push('/organizer/events/create');
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Eventos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los eventos de tu organización
          </p>
        </div>
        <Button onClick={handleCreate} variant="primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Crear Evento
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por título..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                Buscar
              </Button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <Select
              value={filters.status || ''}
              onChange={(e) => handleStatusChange(e.target.value)}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={[
            {
              key: 'title',
              label: 'Título',
              render: (event) => (
                <div>
                  <div className="font-medium text-gray-900">{event.title}</div>
                  <div className="text-sm text-gray-500">{event.category?.name}</div>
                </div>
              )
            },
            {
              key: 'dates',
              label: 'Fechas',
              render: (event) => (
                <div className="text-sm">
                  <div>{new Date(event.start_date).toLocaleDateString('es-AR')}</div>
                  {event.end_date && (
                    <div className="text-gray-500">
                      a {new Date(event.end_date).toLocaleDateString('es-AR')}
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'location',
              label: 'Ubicación',
              render: (event) => (
                <div className="text-sm text-gray-600">
                  {event.location?.name || '-'}
                </div>
              )
            },
            {
              key: 'status',
              label: 'Estado',
              render: (event) => (
                <Badge color={STATUS_COLORS[event.status?.status_code as keyof typeof STATUS_COLORS]}>
                  {event.status?.name}
                </Badge>
              )
            },
            {
              key: 'actions',
              label: 'Acciones',
              render: (event) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(event.id)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Ver"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(event.id)}
                    className="text-green-600 hover:text-green-800"
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              )
            }
          ]}
          data={events}
          loading={loading}
        />

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {((pagination.currentPage - 1) * pagination.perPage) + 1} a{' '}
                {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} de{' '}
                {pagination.total} eventos
              </div>

              <div className="flex items-center gap-4">
                {/* Per page selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Por página:</span>
                  <Select
                    value={pagination.perPage.toString()}
                    onChange={(e) => changePerPage(Number(e.target.value))}
                    options={[
                      { value: '10', label: '10' },
                      { value: '25', label: '25' },
                      { value: '50', label: '50' }
                    ]}
                    className="w-20"
                  />
                </div>

                {/* Page navigation */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => changePage(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => changePage(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.lastPage}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {events.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">
            No hay eventos que coincidan con los filtros seleccionados
          </p>
          {(filters.search || filters.status) && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearchInput('');
                updateFilters({ search: undefined, status: undefined });
              }}
            >
              Limpiar Filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
```

### 4. Actualizar Sidebar

**Archivo:** `frontend/src/app/(organizer)/layout.tsx`

**Agregar link a eventos en el sidebar:**

```typescript
// En la sección de navigation items
const navigation = [
  { name: 'Dashboard', href: '/organizer/dashboard', icon: HomeIcon },
  { name: 'Mis Eventos', href: '/organizer/events', icon: CalendarIcon }, // NUEVO
  // ... otros items
];
```

---

## 🧪 TESTING

### Test 1: Listar Eventos (Backend)

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria.rodriguez@sheraton.com","password":"password"}'

# Obtener lista
curl -X GET http://localhost:8000/api/v1/organizer/events \
  -H "Authorization: Bearer {TOKEN}"

# Verificar:
# ✅ Status 200
# ✅ Array de eventos
# ✅ Paginación incluida
# ✅ Solo eventos de la organización del usuario
```

### Test 2: Filtros (Backend)

```bash
# Filtro por estado
curl -X GET "http://localhost:8000/api/v1/organizer/events?status=draft" \
  -H "Authorization: Bearer {TOKEN}"

# Búsqueda por título
curl -X GET "http://localhost:8000/api/v1/organizer/events?search=festival" \
  -H "Authorization: Bearer {TOKEN}"

# Paginación
curl -X GET "http://localhost:8000/api/v1/organizer/events?per_page=5&page=2" \
  -H "Authorization: Bearer {TOKEN}"
```

### Test 3: Frontend Completo

```bash
cd frontend
npm run dev
```

**En browser:**

1. **Login como organizador**
   - Email: maria.rodriguez@sheraton.com
   - Password: password

2. **Navegar a** `/organizer/events`
   - ✅ Tabla carga con eventos
   - ✅ Se muestran todas las columnas
   - ✅ Badges de estado con colores correctos

3. **Probar búsqueda**
   - Escribir texto en campo de búsqueda
   - Presionar "Buscar"
   - ✅ Tabla se actualiza con resultados filtrados

4. **Probar filtro de estado**
   - Seleccionar estado del dropdown
   - ✅ Tabla se actualiza mostrando solo ese estado

5. **Probar paginación**
   - Cambiar "por página" a 25
   - ✅ Tabla se actualiza con más items
   - Click "Siguiente"
   - ✅ Cambia a página 2

6. **Probar acciones**
   - Click en ícono ojo (Ver)
   - ✅ Navega a página de detalle (aunque no exista aún)
   - Click en ícono lápiz (Editar)
   - ✅ Navega a página de edición
   - Click en ícono basura (Eliminar)
   - ✅ Muestra confirmación

7. **Botón crear**
   - Click "Crear Evento"
   - ✅ Navega a página de creación

8. **Estado vacío**
   - Buscar texto que no existe
   - ✅ Muestra mensaje "No hay eventos..."
   - ✅ Botón para limpiar filtros

### Test 4: TypeScript

```bash
cd frontend
npx tsc --noEmit
# ✅ 0 errores
```

### Test 5: Build

```bash
cd frontend
npm run build
# ✅ Compilación exitosa
# ✅ 0 errores
# ✅ 0 warnings
```

---

## ✅ CRITERIOS DE ÉXITO

### Backend:
- [ ] Endpoint `/organizer/events` funciona
- [ ] Retorna solo eventos de la organización del usuario
- [ ] Filtro por estado funciona
- [ ] Búsqueda por título funciona (ILIKE)
- [ ] Paginación funciona correctamente
- [ ] Logs completos en cada operación
- [ ] Validación de usuario sin organización

### Frontend:
- [ ] Página `/organizer/events` carga sin errores
- [ ] Tabla muestra eventos correctamente
- [ ] Todas las columnas visibles (Título, Fechas, Ubicación, Estado, Acciones)
- [ ] Filtro de búsqueda funciona
- [ ] Filtro de estado funciona
- [ ] Paginación funciona (siguiente, anterior, per_page)
- [ ] Botones de acción presentes (Ver, Editar, Eliminar)
- [ ] Botón "Crear Evento" visible y funcional
- [ ] Loading states funcionan
- [ ] Estado vacío muestra mensaje apropiado
- [ ] Sidebar tiene link a "Mis Eventos"

### Calidad:
- [ ] TypeScript: 0 errores
- [ ] Build: exitoso
- [ ] Responsive en mobile/tablet/desktop
- [ ] Sin console.errors en runtime
- [ ] Badges de estado con colores correctos

---

## 📦 COMMIT STRATEGY

### Después de Backend:

```bash
git add backend/app/Features/Organizer/Controllers/OrganizerController.php
git add backend/routes/api.php
git commit -m "feat(backend): add organizer events list endpoint with filters

- Add GET /organizer/events with pagination
- Support status filter (status_code)
- Support search filter (title ILIKE)
- Support pagination (per_page, page)
- Validate user has organization
- Include relationships (status, category, location)
- Comprehensive logging

Part of: TASK-003 Day 2 - Organizer Events List
Time: ~1h
Tests: Manual curl tests passing"
```

### Después de Frontend:

```bash
git add frontend/src/features/events/services/organizerService.ts
git add frontend/src/features/events/hooks/useOrganizerEvents.ts
git add frontend/src/app/(organizer)/organizer/events/page.tsx
git add frontend/src/app/(organizer)/layout.tsx
git commit -m "feat(frontend): implement organizer events list page

- Add EventsListPage with table, filters, pagination
- Update organizerService with getEvents method
- Enhance useOrganizerEvents hook with filters
- Add search by title
- Add status filter dropdown
- Add pagination controls (per_page, prev/next)
- Add action buttons (View, Edit, Delete, Create)
- Add empty state with clear filters option
- Add sidebar link to events page

UI Features:
- Responsive table with all event data
- Status badges with colors
- Loading states
- Error handling
- Professional layout

Part of: TASK-003 Day 2 - Organizer Events List
Time: ~3h
Tests: Manual browser tests passing
Build: ✅ Success, 0 errors"
```

---

## 🚀 PRÓXIMOS PASOS

**Después de completar TASK-003 Día 2:**

**Mañana (Martes):**
- TASK-003 Día 3: Formulario crear/editar evento
- TASK-003 Día 4: Validaciones y feedback

**Nota sobre acciones:**
- Los botones Ver, Editar, Eliminar ya están en la UI
- Las rutas destino se implementarán en días 3-4
- Por ahora, solo necesitan navegar (aunque las páginas no existan)

---

## ⏰ TIMELINE ESTIMADO

**Backend:** 1 hora
- 30 min: Endpoint con filtros
- 15 min: Testing curl
- 15 min: Ajustes y logging

**Frontend:** 3 horas
- 45 min: Actualizar service y hook
- 90 min: Componente EventsListPage completo
- 30 min: Testing browser
- 15 min: Refinamiento y responsive

**Total:** 4 horas

---

**TASK-003 DÍA 2 COMPLETADA = Organizador puede ver y gestionar su lista de eventos**