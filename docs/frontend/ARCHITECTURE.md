# Frontend Architecture - Plataforma Calendario

**Version:** 2.0.0
**Stack:** Next.js 15 + React 19 + TypeScript
**Estado:** Production Ready
**Última actualización:** Octubre 2025

---

## 📋 Tabla de Contenidos

1. [Overview](#overview)
2. [Arquitectura Features](#arquitectura-features)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Patrones de Diseño](#patrones-de-diseño)
5. [Stack Tecnológico](#stack-tecnológico)
6. [Métricas del Proyecto](#métricas-del-proyecto)
7. [Rutas y Navegación](#rutas-y-navegación)
8. [Estado y Contextos](#estado-y-contextos)
9. [Componentes Compartidos](#componentes-compartidos)
10. [Guía de Desarrollo](#guía-de-desarrollo)

---

## Overview

Aplicación frontend de gestión de eventos y calendario construida con Next.js 15 App Router, React 19 y TypeScript. Sigue una arquitectura basada en **Features** con separación clara de responsabilidades.

### Características Principales

- ✅ Arquitectura Features 100% implementada
- ✅ TypeScript estricto sin errores
- ✅ Build optimizado (1.4s)
- ✅ 11 rutas generadas con SSR/SSG
- ✅ 0 warnings de ESLint en código fuente
- ✅ Componentes Smart/Dumb pattern
- ✅ Custom hooks para lógica reutilizable
- ✅ Service layer para API calls

---

## Arquitectura Features

### Organización por Dominio

Cada feature encapsula toda su funcionalidad relacionada:

```
src/features/
├── appearance/         # Configuración de apariencia
│   ├── hooks/         # useAppearanceForm
│   └── services/      # appearanceService
├── auth/              # Autenticación
│   ├── components/    # LoginForm, PermissionGate
│   └── hooks/         # useAuth, usePermissions
├── categories/        # Gestión de categorías
│   ├── components/
│   │   ├── dumb/     # CategoryTable (presentacional)
│   │   └── smart/    # CategoryTableContainer (lógica)
│   ├── hooks/        # useCategoryManager
│   └── services/     # categoryService
├── events/            # Gestión de eventos
│   ├── components/
│   │   ├── dumb/     # EventCard, EventTable
│   │   └── smart/    # EventCardContainer, ApprovalModalContainer
│   ├── hooks/        # useEventManager, useApprovalManager
│   └── services/     # eventService, approvalService
└── locations/         # Gestión de ubicaciones
    └── services/      # locationService
```

### Métricas por Feature

| Feature | Archivos | LOC | Componentes | Hooks | Services |
|---------|----------|-----|-------------|-------|----------|
| **events** | 29 | 5,300 | 6 | 6 | 7 |
| **categories** | 11 | 1,153 | 2 | 2 | 2 |
| **appearance** | 5 | 196 | 0 | 2 | 2 |
| **locations** | 1 | 128 | 0 | 0 | 1 |
| **auth** | 3 | 110 | 0 | 2 | 0 |
| **TOTAL** | **49** | **6,887** | **8** | **12** | **12** |

---

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (admin)/           # Rutas protegidas (layout común)
│   │   │   ├── appearance/
│   │   │   ├── categories/
│   │   │   ├── events/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── (auth)/            # Rutas de autenticación
│   │   │   └── login/
│   │   └── (public)/          # Rutas públicas
│   │       └── calendar/
│   ├── components/            # Componentes compartidos
│   │   ├── ui/               # 14 componentes UI base
│   │   ├── layout/           # Header, Sidebar
│   │   └── auth/             # PermissionGate
│   ├── context/              # Contextos React
│   │   ├── AuthContext.tsx
│   │   └── useAuthActions.ts
│   ├── features/             # Ver sección Features
│   ├── hooks/                # Custom hooks compartidos
│   ├── lib/                  # Utilidades
│   ├── services/             # API client base
│   └── test/                 # Configuración de tests
├── public/                   # Assets estáticos
├── audit-outputs/            # Reportes de auditoría
├── docs/                     # Documentación
└── [config files]
```

### Total del Proyecto

- **Total LOC:** 17,832 líneas
- **Features:** 5
- **Componentes:** 40 (16 features + 24 compartidos)
- **Hooks:** 24
- **Services:** 16
- **Interfaces:** 75
- **Types:** 9

---

## Patrones de Diseño

### 1. Smart/Dumb Components

**Dumb (Presentational):**
- Solo reciben props
- No manejan estado complejo
- Enfocados en UI
- Altamente reutilizables

```typescript
// src/features/categories/components/dumb/CategoryTable.tsx
export const CategoryTable = ({
  categories,
  onEdit,
  onDelete
}: CategoryTableProps) => {
  // Solo renderiza UI
}
```

**Smart (Container):**
- Manejan lógica de negocio
- Conectan con hooks y services
- Obtienen y transforman datos
- Pasan props a componentes dumb

```typescript
// src/features/categories/components/smart/CategoryTableContainer.tsx
export const CategoryTableContainer = () => {
  const { categories, loading, handleEdit, handleDelete } = useCategoryManager()

  return <CategoryTable
    categories={categories}
    onEdit={handleEdit}
    onDelete={handleDelete}
  />
}
```

### 2. Custom Hooks Pattern

Encapsulan lógica reutilizable:

```typescript
// src/features/events/hooks/useEventManager.ts
export const useEventManager = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)

  const fetchEvents = async () => {
    setLoading(true)
    const data = await eventService.getAll()
    setEvents(data)
    setLoading(false)
  }

  return { events, loading, fetchEvents }
}
```

### 3. Service Layer Pattern

Centraliza comunicación con API:

```typescript
// src/features/events/services/eventService.ts
export const eventService = {
  getAll: () => apiClient.get<Event[]>('/events'),
  getById: (id: number) => apiClient.get<Event>(`/events/${id}`),
  create: (data: CreateEventDto) => apiClient.post<Event>('/events', data),
  // ...
}
```

### 4. Path Aliases

Usa `@/*` en lugar de imports relativos:

```typescript
// ✅ Correcto
import { eventService } from '@/features/events/services/eventService'
import { Button } from '@/components/ui/Button'

// ❌ Evitar
import { eventService } from '../../../features/events/services/eventService'
```

**Nota:** Actualmente 21 archivos usan imports relativos y requieren refactoring.

---

## Stack Tecnológico

### Core

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 15.5.4 | Framework React con SSR/SSG |
| **React** | 19.1.0 | Biblioteca UI |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 3.x | Estilos utility-first |

### Bibliotecas UI

- **@headlessui/react** (2.2.7): Componentes accesibles
- **@heroicons/react** (2.2.0): Iconos SVG
- **lucide-react** (0.543.0): Iconos adicionales
- **clsx** (2.1.1): Utilidad para clases CSS

### Utilidades

- **axios** (1.11.0): Cliente HTTP
- **date-fns** (4.1.0): Manipulación de fechas
- **moment** (2.30.1): Fechas (legacy, considerar migrar a date-fns)

### Desarrollo

- **ESLint** (9.x): Linting
- **TypeScript ESLint**: Reglas TypeScript
- **PostCSS**: Procesamiento CSS

---

## Métricas del Proyecto

### Distribución de Código

```
LOC por Capa:
├── Features:     6,887 líneas (38.6%)
├── Componentes:  3,550 líneas (19.9%)
├── Services:     2,444 líneas (13.7%)
├── Hooks:        2,425 líneas (13.6%)
└── Otros:        2,526 líneas (14.2%)
────────────────────────────────
TOTAL:           17,832 líneas
```

### Build Output

```
Next.js 15.5.4
✓ Compiled successfully in 1.4s
✓ 11 rutas generadas
✓ Shared JS: 102 kB

Rutas más pesadas:
  /calendar        → 59.3 kB
  /events          → 25.5 kB
  /categories      → 4.88 kB
```

### Calidad de Código

- ✅ **TypeScript:** 0 errores
- ✅ **ESLint (src/):** 0 warnings, 0 errores
- ✅ **Archivos obsoletos:** 0
- ✅ **TODO/FIXME:** 0
- ⚠️ **Imports relativos:** 21 archivos requieren refactor

---

## Rutas y Navegación

### App Router (Next.js 15)

| Ruta | Tipo | Tamaño | Descripción |
|------|------|--------|-------------|
| `/` | Static | 553 B | Dashboard principal |
| `/login` | Static | 3.03 kB | Página de login |
| `/appearance` | Static | 3.24 kB | Configuración de apariencia |
| `/categories` | Static | 4.88 kB | Gestión de categorías |
| `/events` | Static | 25.5 kB | Gestión de eventos |
| `/calendar` | Static | 59.3 kB | Vista de calendario público |
| `/calendar/[slug]` | Dynamic | 5.25 kB | Detalle de evento por slug |
| `/admin/categories` | Static | 342 B | Categorías (admin) |

**Total:** 11 rutas (10 estáticas, 1 dinámica)

### Layouts

```
(admin)/layout.tsx    → Sidebar + Header para rutas admin
(auth)/layout.tsx     → Layout limpio para login
(public)/layout.tsx   → Layout público sin auth
```

---

## Estado y Contextos

### AuthContext

Maneja autenticación global:

```typescript
// src/context/AuthContext.tsx
interface AuthContextType {
  user: User | null
  login: (credentials: LoginDto) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  hasPermission: (permission: string) => boolean
}
```

**Uso:**
```typescript
const { user, isAuthenticated, logout } = useAuth()
```

### Hooks de Contexto

- `useAuth()`: Acceso a contexto de autenticación
- `useAuthActions()`: Acciones de autenticación (login, logout)

---

## Componentes Compartidos

### UI Components (14)

Componentes base reutilizables en `src/components/ui/`:

| Componente | Propósito |
|------------|-----------|
| `Button` | Botón con variantes |
| `Input` | Campo de texto |
| `Select` | Selector dropdown |
| `Textarea` | Campo multilínea |
| `Checkbox` | Casilla de verificación |
| `RadioGroup` | Grupo de radio buttons |
| `Modal` | Modal genérico |
| `FormModal` | Modal con formulario |
| `Table` | Tabla genérica |
| `Card` | Tarjeta contenedora |
| `Badge` | Etiqueta de estado |
| `Toast` | Notificación temporal |
| `LoadingSpinner` | Indicador de carga |
| `Pagination` | Paginación |

### Layout Components (2)

- `Header`: Barra superior con navegación
- `Sidebar`: Menú lateral admin

### Auth Components (1)

- `PermissionGate`: HOC para proteger componentes por permisos

---

## Guía de Desarrollo

### Setup Inicial

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar producción
npm start
```

### Variables de Entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=Plataforma Calendario
```

### Comandos Disponibles

```bash
npm run dev          # Desarrollo (port 3000)
npm run build        # Build optimizado
npm run start        # Servidor producción
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

### Crear Nueva Feature

1. **Estructura básica:**

```bash
mkdir -p src/features/nueva-feature/{components/{dumb,smart},hooks,services}
```

2. **Service:**

```typescript
// src/features/nueva-feature/services/nuevaFeatureService.ts
import { apiClient } from '@/services/apiClient'

export const nuevaFeatureService = {
  getAll: () => apiClient.get('/nueva-feature'),
  create: (data) => apiClient.post('/nueva-feature', data),
}
```

3. **Hook:**

```typescript
// src/features/nueva-feature/hooks/useNuevaFeature.ts
import { useState, useEffect } from 'react'
import { nuevaFeatureService } from '../services/nuevaFeatureService'

export const useNuevaFeature = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    const data = await nuevaFeatureService.getAll()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return { items, loading, fetchItems }
}
```

4. **Componente Dumb:**

```typescript
// src/features/nueva-feature/components/dumb/ItemList.tsx
interface ItemListProps {
  items: Item[]
  onItemClick: (id: number) => void
}

export const ItemList = ({ items, onItemClick }: ItemListProps) => {
  return (
    <div>
      {items.map(item => (
        <div key={item.id} onClick={() => onItemClick(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  )
}
```

5. **Componente Smart:**

```typescript
// src/features/nueva-feature/components/smart/ItemListContainer.tsx
import { ItemList } from '../dumb/ItemList'
import { useNuevaFeature } from '../../hooks/useNuevaFeature'

export const ItemListContainer = () => {
  const { items, loading } = useNuevaFeature()

  const handleItemClick = (id: number) => {
    console.log('Item clicked:', id)
  }

  if (loading) return <LoadingSpinner />

  return <ItemList items={items} onItemClick={handleItemClick} />
}
```

6. **Página:**

```typescript
// src/app/(admin)/nueva-feature/page.tsx
import { ItemListContainer } from '@/features/nueva-feature/components/smart/ItemListContainer'

export default function NuevaFeaturePage() {
  return (
    <div>
      <h1>Nueva Feature</h1>
      <ItemListContainer />
    </div>
  )
}
```

### Buenas Prácticas

1. **Usar path aliases** (`@/`) en lugar de imports relativos
2. **Separar componentes** en smart/dumb cuando sea apropiado
3. **Extraer lógica** a custom hooks cuando se repite
4. **Tipar todo** con TypeScript (evitar `any`)
5. **Manejar errores** en services y mostrar feedback al usuario
6. **Validar props** con TypeScript interfaces
7. **Usar async/await** en lugar de `.then()` para promesas
8. **Loading states** para mejorar UX
9. **Error boundaries** para capturar errores de renderizado
10. **Comentar código complejo** pero evitar comentarios obvios

### TypeScript

```typescript
// ✅ Interfaces para props
interface ButtonProps {
  onClick: () => void
  label: string
  disabled?: boolean
}

// ✅ Types para unions
type ButtonVariant = 'primary' | 'secondary' | 'danger'

// ✅ Generics para funciones reutilizables
function fetchData<T>(url: string): Promise<T> {
  return apiClient.get<T>(url)
}

// ❌ Evitar any
const data: any = {}  // ❌
const data: unknown = {}  // ✅ (luego hacer type guard)
```

### Manejo de Errores

```typescript
// En services
export const eventService = {
  async create(data: CreateEventDto) {
    try {
      const response = await apiClient.post('/events', data)
      return response
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  }
}

// En hooks
export const useEventManager = () => {
  const [error, setError] = useState<string | null>(null)

  const createEvent = async (data: CreateEventDto) => {
    try {
      setError(null)
      await eventService.create(data)
    } catch (err) {
      setError('Error al crear evento')
    }
  }

  return { createEvent, error }
}

// En componentes
const { createEvent, error } = useEventManager()

{error && <Toast message={error} type="error" />}
```

---

## Próximos Pasos

### Refactoring Pendiente

1. **Imports relativos:** Refactorizar 21 archivos para usar path aliases
   - Script disponible: `refactor-imports.sh`
   - Ejecutar: `bash refactor-imports.sh`

2. **Migración moment → date-fns:** Eliminar dependencia de moment
   - date-fns ya está instalado
   - Buscar usos de moment: `grep -r "import.*moment" src/`

### Mejoras Sugeridas

1. **Testing:** Implementar tests con Jest + React Testing Library
2. **Storybook:** Documentar componentes UI
3. **Performance:** Implementar lazy loading para rutas pesadas
4. **SEO:** Agregar metadata a páginas públicas
5. **i18n:** Internacionalización si se requiere multi-idioma
6. **Error Boundary:** Componente global para errores
7. **Analytics:** Integrar Google Analytics o similar

---

## Referencias

- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Mantenido por:** Equipo de Desarrollo
**Última auditoría:** Octubre 2025
**Estado:** Production Ready ✅
