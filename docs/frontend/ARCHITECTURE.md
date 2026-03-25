# Frontend Architecture - Plataforma Calendario

---

## 1. Resumen General

Aplicacion frontend de gestion de eventos y calendario construida con Next.js 15 App Router, React 19 y TypeScript strict. Sigue una arquitectura basada en **Features** con separacion clara de responsabilidades mediante el patron Smart/Dumb, service layer para comunicacion con la API, y SWR para data fetching optimizado.

El proyecto cuenta con 14 features, 189 componentes, 38 hooks, 26 services, 27 paginas y 2882 tests pasando.

---

## 2. Stack Tecnologico

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| **Next.js** | 15.5.9 | Framework React con App Router |
| **React** | 19.2.3 | Biblioteca UI |
| **TypeScript** | 5.9.3 | Tipado estatico (strict mode) |
| **Tailwind CSS** | 4 | Estilos utility-first |
| **Jest** | 30.2.0 | Testing framework |
| **SWR** | - | Data fetching y cache |

---

## 3. Arquitectura Features

El proyecto esta organizado en 14 features, cada una encapsulando su dominio completo:

| Feature | Descripcion |
|---------|-------------|
| **auth** | Autenticacion, login, reset de password, aceptacion de invitaciones |
| **entity-admin** | Administracion de entidades del sistema |
| **event-types** | Gestion de tipos de eventos |
| **events** | Gestion de eventos (CRUD, aprobacion) |
| **internal-calendar** | Calendario interno para usuarios autenticados |
| **invitations** | Gestion de invitaciones a la plataforma |
| **landing** | Pagina de inicio publica |
| **locations** | Gestion de ubicaciones |
| **organizations** | Gestion de organizaciones |
| **organizer** | Panel del organizador (eventos, calendario, CRUD) |
| **organizer-dashboard** | Dashboard con estadisticas del organizador |
| **public-calendar** | Calendario publico y detalle de eventos |
| **registration-requests** | Solicitudes de registro a la plataforma |
| **users** | Gestion de usuarios del sistema |

Cada feature sigue la estructura interna:

```
features/[feature]/
├── components/
│   ├── smart/      # Contenedores con logica (hooks, estado)
│   └── dumb/       # Componentes presentacionales puros
├── hooks/          # Custom hooks del dominio
├── services/       # Llamadas a la API
├── types/          # Definiciones de tipos TypeScript
└── index.ts        # Barrel export
```

---

## 4. Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                        # Next.js 15 App Router
│   │   ├── (auth)/                 # Rutas de autenticacion
│   │   │   ├── login/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── accept-invitation/
│   │   ├── (admin)/                # Rutas protegidas (admin)
│   │   │   ├── event-types/
│   │   │   ├── events/
│   │   │   ├── internal-calendar/
│   │   │   ├── invitations/
│   │   │   ├── locations/
│   │   │   ├── organizations/
│   │   │   ├── registration-requests/
│   │   │   ├── users/
│   │   │   └── layout.tsx
│   │   ├── (organizer)/            # Rutas del organizador
│   │   │   ├── dashboard/
│   │   │   ├── events/
│   │   │   ├── calendar/
│   │   │   └── layout.tsx
│   │   └── (public)/               # Rutas publicas
│   │       ├── landing/
│   │       ├── calendar/
│   │       ├── register-request/
│   │       └── layout.tsx
│   ├── features/                   # 14 features (ver seccion 3)
│   ├── shared/
│   │   ├── components/             # 80 componentes compartidos
│   │   │   ├── alerts/
│   │   │   ├── display/
│   │   │   ├── event/
│   │   │   ├── feedback/
│   │   │   ├── form/
│   │   │   ├── layout/
│   │   │   ├── modals/
│   │   │   ├── stats/
│   │   │   └── tables/
│   │   └── hooks/                  # Hooks compartidos (shared)
│   ├── hooks/                      # Hooks compartidos (globales)
│   ├── services/                   # Services compartidos (API client base)
│   ├── context/                    # Contextos React
│   │   └── AuthContext.tsx
│   └── types/                      # Definiciones de tipos globales
├── public/                         # Assets estaticos
└── [archivos de configuracion]
```

---

## 5. Patrones de Diseno

### 5.1 Smart/Dumb Components

**Dumb (Presentational):**
- Solo reciben props
- No manejan estado complejo ni efectos
- Enfocados en renderizado de UI
- Altamente reutilizables y testeables

**Smart (Container):**
- Manejan logica de negocio via hooks
- Conectan con services para obtener datos
- Transforman y pasan datos a componentes dumb
- Usan la directiva `'use client'`

### 5.2 Service Layer

Centraliza toda la comunicacion con la API backend. Cada feature tiene sus propios services, y existen 5 services compartidos a nivel global (apiClient, authService, etc.).

### 5.3 SWR para Data Fetching

Se utiliza SWR con las siguientes optimizaciones:
- `keepPreviousData` para evitar flashes de contenido vacio
- `dedupingInterval` para deduplicar requests simultaneos
- Cache automatico y revalidacion

### 5.4 Path Aliases

Todos los imports usan el prefijo `@/`. No se permiten imports relativos (`../`):

```typescript
// Correcto
import { eventService } from '@/features/events/services/eventService'
import { Button } from '@/shared/components/form/Button'

// No permitido
import { eventService } from '../../../features/events/services/eventService'
```

### 5.5 Barrel Exports

Cada feature expone su API publica a traves de un archivo `index.ts` en la raiz de la feature.

### 5.6 Tokens de Diseno Semanticos

El sistema de diseno usa tokens semanticos en lugar de colores directos:
- `primary-*`, `secondary-*` para la marca
- `neutral-*` para fondos y textos
- `error-*`, `warning-*`, `success-*` para estados

---

## 6. Componentes

### 6.1 Componentes por Feature (109)

| Feature | Smart | Dumb | Total |
|---------|-------|------|-------|
| auth | 2 | 0 | 2 |
| entity-admin | 1 | 9 | 10 |
| event-types | 2 | 1 | 3 |
| events | 1 | 1 | 2 |
| internal-calendar | 5 | 11 | 16 |
| invitations | 2 | 4 | 6 |
| landing | 1 | 6 | 7 |
| locations | 2 | 1 | 3 |
| organizations | 1 | 2 | 3 |
| organizer | 6 | 14 | 20 |
| organizer-dashboard | 1 | 1 | 2 |
| public-calendar | 3 | 6 | 9 |
| registration-requests | 3 | 8 | 11 |
| users | 3 | 2 | 5 |
| **Total** | **33** | **66** | **109** |

### 6.2 Componentes Compartidos (80)

Organizados en `shared/components/` por categoria:

| Categoria | Proposito |
|-----------|-----------|
| alerts | Alertas y notificaciones |
| display | Componentes de visualizacion de datos |
| event | Componentes reutilizables de eventos |
| feedback | Indicadores de carga, estados vacios |
| form | Inputs, selects, botones, formularios |
| layout | Header, sidebar, contenedores |
| modals | Modales genericos y de formulario |
| stats | Tarjetas y graficos de estadisticas |
| tables | Tablas, paginacion, ordenamiento |

### 6.3 Total: 189 componentes (109 feature + 80 shared)

---

## 7. Hooks

### 7.1 Hooks Compartidos (7)

Hooks reutilizables disponibles para todas las features:

| Hook | Proposito |
|------|-----------|
| useDebounce | Debounce de valores para busqueda |
| useEventActions | Acciones comunes sobre eventos |
| useModal | Control de apertura/cierre de modales |
| usePagination | Logica de paginacion |
| usePermissions | Verificacion de permisos del usuario |
| useTableSelection | Seleccion de filas en tablas |
| useTableSorting | Ordenamiento de columnas en tablas |

### 7.2 Hooks por Feature (31)

Cada feature define sus propios hooks especificos de dominio en su directorio `hooks/`.

### 7.3 Total: 38 hooks (7 shared + 31 feature)

---

## 8. Services

### 8.1 Services Compartidos (5)

Services globales que proveen funcionalidad base:

| Service | Proposito |
|---------|-----------|
| apiClient | Cliente HTTP base (Axios) con interceptores |
| publicApiClient | Cliente para endpoints publicos sin auth |
| authService | Login, logout, registro, gestion de sesion |
| eventApprovalService | Aprobacion/rechazo de eventos |
| tokenUtils | Utilidades para manejo de tokens |

### 8.2 Services por Feature (21)

Cada feature define sus propios services para comunicarse con los endpoints especificos de la API.

### 8.3 Total: 26 services (5 shared + 21 feature)

---

## 9. Rutas

### 27 paginas organizadas en 4 secciones:

### 9.1 Auth (4 paginas)

| Ruta | Descripcion |
|------|-------------|
| `/login` | Inicio de sesion |
| `/forgot-password` | Solicitud de restablecimiento |
| `/reset-password` | Restablecimiento de contrasena |
| `/accept-invitation` | Aceptacion de invitacion |

### 9.2 Admin (9 paginas)

| Ruta | Descripcion |
|------|-------------|
| `/event-types` | Gestion de tipos de eventos |
| `/events` | Gestion de eventos |
| `/internal-calendar` | Calendario interno |
| `/internal-calendar/[id]` | Detalle de evento interno |
| `/invitations` | Gestion de invitaciones |
| `/locations` | Gestion de ubicaciones |
| `/organizations` | Gestion de organizaciones |
| `/registration-requests` | Solicitudes de registro |
| `/users` | Gestion de usuarios |

### 9.3 Public (4 paginas)

| Ruta | Descripcion |
|------|-------------|
| `/` | Landing page |
| `/calendar` | Calendario publico |
| `/calendar/[id]` | Detalle de evento publico |
| `/register-request` | Formulario de solicitud de registro |

### 9.4 Organizer (10 paginas)

| Ruta | Descripcion |
|------|-------------|
| `/dashboard` | Dashboard con estadisticas |
| `/events` | Listado de eventos del organizador |
| `/events/create` | Creacion de evento |
| `/events/[id]` | Detalle de evento |
| `/events/[id]/edit` | Edicion de evento |
| `/calendar` | Calendario del organizador |
| `/calendar/[id]` | Detalle de evento en calendario |
| `/create` | Creacion rapida |
| `/[id]` | Vista de recurso |
| `/[id]/edit` | Edicion de recurso |

---

## 10. Estado y Contextos

### 10.1 AuthContext (1 context provider)

Contexto global que maneja el estado de autenticacion del usuario:
- Estado del usuario autenticado
- Funciones de login y logout
- Verificacion de autenticacion
- Verificacion de permisos por rol

### 10.2 Middleware (1)

Middleware de Next.js para proteccion de rutas basado en el rol del usuario. Redirige a los usuarios no autenticados y valida que tengan el rol necesario para acceder a cada seccion (admin, organizer, public).

---

## 11. Testing

### Herramientas

- **Jest 30.2.0** como test runner
- **React Testing Library** para testing de componentes
- Politica estricta de consola: console.error/warn/log inesperados hacen fallar el test

### Metricas

| Metrica | Valor |
|---------|-------|
| Archivos de test | 160 |
| Tests pasando | 2882 |

### Cobertura

Los tests cubren:
- Componentes (smart y dumb)
- Hooks personalizados
- Services
- Integracion de features completas

---

## 12. Metricas Resumen

| Metrica | Valor |
|---------|-------|
| Features | 14 |
| Componentes totales | 189 (109 feature + 80 shared) |
| Hooks totales | 38 (7 shared + 31 feature) |
| Services totales | 26 (5 shared + 21 feature) |
| Archivos de tipos | 21 |
| Paginas/Rutas | 27 |
| Archivos de test | 160 |
| Tests pasando | 2882 |
| Context providers | 1 (AuthContext) |
| Middleware | 1 (proteccion de rutas por rol) |

---

## 13. Ultima actualizacion: 25 de marzo de 2026
