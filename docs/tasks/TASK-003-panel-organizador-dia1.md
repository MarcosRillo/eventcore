# TASK-003: Panel de Organizador - Dashboard (Día 1/5)

**Creado:** Octubre 6, 2025  
**Prioridad:** Alta  
**Tiempo estimado:** 4-5 horas  
**Dependencias:** TASK-002 completada (OrganizerController + permisos)

---

## OBJETIVO

Implementar el dashboard inicial del panel de organizador que muestre estadísticas de eventos propios y layout distintivo con sidebar verde.

**Resultado esperado:**
- Layout propio con sidebar verde (diferente del Ente)
- Dashboard con 8 métricas de eventos propios
- Endpoint backend funcional
- Navegación básica implementada

---

## ESTRUCTURA DE ARCHIVOS A CREAR

```
frontend/src/
├── app/
│   └── (organizer)/
│       ├── layout.tsx                    # Layout con sidebar verde
│       └── dashboard/
│           └── page.tsx                  # Dashboard organizador
├── features/
│   └── organizer/
│       ├── services/
│       │   └── organizerService.ts       # API calls organizador
│       ├── hooks/
│       │   └── useOrganizerEvents.ts     # Hook gestión eventos
│       └── types/
│           └── organizerTypes.ts         # Tipos específicos
└── components/
    └── organizer/
        ├── OrganizerSidebar.tsx          # Sidebar verde
        └── OrganizerDashboard.tsx        # Dashboard component

backend/app/Features/Organizer/
└── Controllers/
    └── OrganizerController.php           # Ya existe de TASK-002
```

---

## IMPLEMENTACIÓN PASO A PASO

### 1. Service: organizerService.ts

**Ubicación:** `frontend/src/features/organizer/services/organizerService.ts`

```typescript
import { apiClient } from '@/lib/api';

export interface OrganizerDashboardStats {
  total_events: number;
  draft: number;
  pending_approval: number;
  approved_internal: number;
  published: number;
  requires_changes: number;
  rejected: number;
  archived: number;
}

export interface OrganizerEvent {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: {
    id: number;
    name: string;
    status_code: string;
  };
  category: {
    id: number;
    name: string;
  };
  location: {
    id: number;
    name: string;
  };
}

export interface OrganizerEventsResponse {
  data: OrganizerEvent[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const organizerService = {
  /**
   * Obtiene estadísticas del dashboard del organizador
   */
  getDashboardStats: async (): Promise<OrganizerDashboardStats> => {
    const response = await apiClient.get<OrganizerDashboardStats>(
      '/organizer/dashboard/stats'
    );
    return response;
  },

  /**
   * Obtiene eventos del organizador con filtros y paginación
   */
  getEvents: async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    search?: string;
  }): Promise<OrganizerEventsResponse> => {
    const response = await apiClient.get<OrganizerEventsResponse>(
      '/organizer/events',
      { params }
    );
    return response;
  },

  /**
   * Obtiene un evento específico del organizador
   */
  getEvent: async (id: number): Promise<OrganizerEvent> => {
    const response = await apiClient.get<OrganizerEvent>(
      `/organizer/events/${id}`
    );
    return response;
  },
};
```

---

### 2. Hook: useOrganizerEvents.ts

**Ubicación:** `frontend/src/features/organizer/hooks/useOrganizerEvents.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { organizerService, OrganizerEvent } from '../services/organizerService';

export const useOrganizerEvents = () => {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  const fetchEvents = useCallback(async (params?: {
    page?: number;
    per_page?: number;
    status?: string;
    search?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizerService.getEvents(params);
      
      setEvents(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      });
    } catch (err) {
      setError('Error al cargar eventos');
      console.error('Error fetching organizer events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    pagination,
    fetchEvents,
  };
};
```

---

### 3. Layout: (organizer)/layout.tsx

**Ubicación:** `frontend/src/app/(organizer)/layout.tsx`

```typescript
import { OrganizerSidebar } from '@/components/organizer/OrganizerSidebar';

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <OrganizerSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4">
          {children}
        </div>
      </main>
    </div>
  );
}
```

---

### 4. Component: OrganizerSidebar.tsx

**Ubicación:** `frontend/src/components/organizer/OrganizerSidebar.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CalendarIcon,
  PlusCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/organizer/dashboard', icon: HomeIcon },
  { name: 'Mis Eventos', href: '/organizer/events', icon: CalendarIcon },
  { name: 'Crear Evento', href: '/organizer/events/create', icon: PlusCircleIcon },
  { name: 'Estadísticas', href: '/organizer/stats', icon: ChartBarIcon },
];

export function OrganizerSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gradient-to-b from-green-600 to-green-800 text-white">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Panel Organizador</h2>
        <p className="text-green-100 text-sm mt-1">Gestiona tus eventos</p>
      </div>

      <nav className="mt-6 px-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 mb-2 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-green-700 text-white' 
                  : 'text-green-100 hover:bg-green-700/50'
                }
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-green-700">
        <button
          className="w-full text-left px-3 py-2 text-green-100 hover:bg-green-700/50 rounded-lg transition-colors"
          onClick={() => {/* TODO: Logout */}}
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
```

---

### 5. Component: OrganizerDashboard.tsx

**Ubicación:** `frontend/src/components/organizer/OrganizerDashboard.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { organizerService, OrganizerDashboardStats } from '@/features/organizer/services/organizerService';

export function OrganizerDashboard() {
  const [stats, setStats] = useState<OrganizerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await organizerService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-12">
        Error al cargar estadísticas
      </div>
    );
  }

  const statCards = [
    { label: 'Total Eventos', value: stats.total_events, color: 'bg-blue-500' },
    { label: 'Borradores', value: stats.draft, color: 'bg-gray-500' },
    { label: 'Pendiente Aprobación', value: stats.pending_approval, color: 'bg-yellow-500' },
    { label: 'Aprobados', value: stats.approved_internal, color: 'bg-green-500' },
    { label: 'Publicados', value: stats.published, color: 'bg-emerald-500' },
    { label: 'Requieren Cambios', value: stats.requires_changes, color: 'bg-orange-500' },
    { label: 'Rechazados', value: stats.rejected, color: 'bg-red-500' },
    { label: 'Archivados', value: stats.archived, color: 'bg-gray-400' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-full`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 6. Page: (organizer)/dashboard/page.tsx

**Ubicación:** `frontend/src/app/(organizer)/dashboard/page.tsx`

```typescript
import { OrganizerDashboard } from '@/components/organizer/OrganizerDashboard';

export default function OrganizerDashboardPage() {
  return <OrganizerDashboard />;
}
```

---

### 7. Backend Endpoint: OrganizerController.php

**Ubicación:** `backend/app/Features/Organizer/Controllers/OrganizerController.php`

**Agregar este método al controller existente:**

```php
/**
 * Obtiene estadísticas del dashboard del organizador
 */
public function dashboardStats(Request $request)
{
    $user = $request->user();
    
    if (!$user || !$user->organization_id) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }
    
    // Contar eventos por estado usando scope organizerOwned
    $stats = [
        'total_events' => Event::organizerOwned($user->id)->count(),
        'draft' => Event::organizerOwned($user->id)
            ->whereHas('status', fn($q) => $q->where('status_code', 'draft'))
            ->count(),
        'pending_approval' => Event::organizerOwned($user->id)
            ->whereHas('status', fn($q) => $q->where('status_code', 'pending_approval'))
            ->count(),
        'approved_internal' => Event::organizerOwned($user->id)
            ->whereHas('status', fn($q) => $q->where('status_code', 'approved_internal'))
            ->count(),
        'published' => Event::organizerOwned($user->id)
            ->whereHas('status', fn($q) => $q->where('status_code', 'published'))
            ->count(),
        'requires_changes' => Event::organizerOwned($user->id)
            ->whereHas('status', fn($q) => $q->where('status_code', 'requires_changes'))
            ->count(),
        'rejected' => Event::organizerOwned($user->id)
            ->whereHas('status', fn($q) => $q->where('status_code', 'rejected'))
            ->count(),
        'archived' => Event::organizerOwned($user->id)
            ->whereHas('status', fn($q) => $q->where('status_code', 'archived'))
            ->count(),
    ];
    
    Log::info('Organizer dashboard stats', [
        'user_id' => $user->id,
        'organization_id' => $user->organization_id,
        'stats' => $stats
    ]);
    
    return response()->json($stats);
}
```

**Agregar ruta en routes/api.php:**

```php
// Dentro del grupo middleware organizer_admin
Route::get('dashboard/stats', [OrganizerController::class, 'dashboardStats']);
```

---

## VERIFICACIÓN Y TESTING

### Test 1: Build Frontend

```bash
cd frontend
npm run build
# Debe compilar sin errores
```

### Test 2: Backend Endpoint

```bash
# Login como organizador
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"organizer@test.com","password":"password"}'
# Guardar token

# Test dashboard stats
curl -X GET http://localhost:8000/api/v1/organizer/dashboard/stats \
  -H "Authorization: Bearer {TOKEN}"
  
# Resultado esperado:
# {
#   "total_events": 1,
#   "draft": 1,
#   "pending_approval": 0,
#   ...
# }
```

### Test 3: Frontend en Desarrollo

```bash
cd frontend
npm run dev
```

**Abrir:** http://localhost:3000/organizer/dashboard

**Verificar:**
- Sidebar verde aparece correctamente
- Dashboard carga sin errores
- Stats muestran números correctos
- No hay errores en consola del navegador

---

## CRITERIOS DE ÉXITO

- [ ] Estructura de carpetas creada correctamente
- [ ] organizerService implementado y funcional
- [ ] useOrganizerEvents hook funcional
- [ ] Layout (organizer) con sidebar verde operativo
- [ ] Dashboard muestra stats reales del backend
- [ ] Endpoint /dashboard/stats funciona correctamente
- [ ] Build frontend sin errores TypeScript
- [ ] No hay errores en consola del navegador
- [ ] Dashboard accesible solo para organizer_admin

---

## PRÓXIMO PASO (DÍA 2)

**TASK-004:** Lista de eventos del organizador con filtros y acciones CRUD

---

**Tiempo real esperado:** 4-5 horas  
**Bloqueantes:** Ninguno (backend OrganizerController ya existe)  
**Dependencies:** TASK-002 completada (OrganizerController + permisos)