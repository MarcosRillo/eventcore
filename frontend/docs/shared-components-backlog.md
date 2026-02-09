# Backlog: Componentes Compartidos

Analisis de componentes duplicados entre `/organizer/dashboard`, `/calendar` y `/internal-calendar`.

---

## Resumen

| # | Componente | Duplicados | Prioridad | Esfuerzo |
|---|-----------|-----------|-----------|----------|
| 1 | Stats Bar | 3 archivos casi identicos | **Critico** | Bajo |
| 2 | Page Header | 2 inline + 1 ausente | **Alto** | Bajo |
| 3 | Filtros | 3 implementaciones distintas | **Medio** | Medio |
| 4 | Lista/Grid de eventos | 2 grids identicos + 1 list | **Medio** | Medio |
| 5 | Empty/Error states | 2 inline, 1 usa shared | **Bajo** | Bajo |

---

## 1. Stats Bar

**Prioridad: Critico** — 3 copias casi identicas, misma estructura, mismos estilos.

### Estado actual

| Archivo | Lineas | Stats |
|---------|--------|-------|
| `features/internal-calendar/components/dumb/StatsBar.tsx` | 131 | 3 items (total_events, total_event_types, events_this_month) |
| `features/public-calendar/components/dumb/StatsBar.tsx` | 88 | 3 items (idem, distinto label) |
| `features/organizer-dashboard/components/dumb/OrganizerStatsSummary.tsx` | 106 | 5 items (total, upcoming, past, pending, requires_changes) |

### Duplicacion

Los 3 comparten:
- Contenedor: `bg-primary-50 border-b border-primary-100`
- Layout: `container mx-auto px-4 py-3` > `flex flex-wrap justify-center gap-6 md:gap-12`
- Item: `flex items-center gap-2 text-primary-700` > icono + valor + label
- Loading skeleton: misma estructura de pulsos con `bg-primary-200`
- Guard: `if (!stats) return null`

Diferencias:
- Cantidad de items (3 vs 5)
- Labels y campos de datos
- Iconos SVG inline (violacion: deberian usar `lucide-react`)

### Plan de refactorizacion

1. Crear `shared/components/stats/StatsBar.tsx`:

```typescript
interface StatItem {
  value: number
  label: string
  icon: ReactNode
}

interface StatsBarProps {
  items: StatItem[]
  loading: boolean
  ariaLabel?: string
}
```

2. Migrar cada feature a construir su array de `StatItem[]` y pasar al componente compartido.
3. Reemplazar SVGs inline por iconos de `lucide-react` (`Calendar`, `Tag`, `TrendingUp`, `Clock`, `AlertTriangle`).
4. Eliminar los 3 archivos originales.

### Archivos a modificar

- **Crear:** `shared/components/stats/StatsBar.tsx`, test
- **Eliminar:** 3 archivos listados arriba + sus tests
- **Modificar:** smart containers que importan estos componentes

---

## 2. Page Header

**Prioridad: Alto** — Patron titulo+subtitulo+accion repetido inline, facil de extraer.

### Estado actual

| Pagina | Implementacion | Archivo | Lineas |
|--------|---------------|---------|--------|
| Organizer Dashboard | Inline `<div>` con h1 + p + Button | `OrganizerDashboard.tsx` | 71-81 |
| Public Calendar | Inline `<div>` con h1 + p (sin accion) | `PublicCalendar.tsx` | 73-82 |
| Internal Calendar | Sin header explicito | — | — |

### Duplicacion

Ambos usan:
- `text-3xl font-bold text-neutral-900` para el titulo
- `text-neutral-600 mt-1/mt-2` para el subtitulo
- Contenedor con `flex justify-between items-center`

Diferencias:
- Organizer tiene boton de accion ("+ Crear Evento")
- Public tiene border-b y fondo blanco
- Internal no tiene header

### Plan de refactorizacion

1. Crear `shared/components/layout/PageHeader.tsx`:

```typescript
interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}
```

2. Reemplazar bloques inline en ambos componentes.
3. Evaluar agregar header a internal-calendar para consistencia.

### Archivos a modificar

- **Crear:** `shared/components/layout/PageHeader.tsx`, test
- **Modificar:** `OrganizerDashboard.tsx`, `PublicCalendar.tsx`

---

## 3. Filtros

**Prioridad: Medio** — Implementaciones distintas por dominio; compartir container, no logica.

### Estado actual

| Pagina | Componente | Tipo | Controles |
|--------|-----------|------|-----------|
| Internal Calendar | `InternalCalendarFilterBar.tsx` (180 ln) | Componente dedicado | Select + DateTimePicker + Export + Clear (grid 4 cols) |
| Public Calendar | Inline en `PublicCalendar.tsx` (ln 84-205) | Inline | 3 `<select>` nativos + collapsible mobile (grid 3 cols) |
| Organizer Dashboard | `OrganizerEventFilters.tsx` (84 ln) | Componente dedicado | FilterPill + SegmentedControl (flex wrap) |

### Problemas

1. **Public Calendar usa `<select>` nativos** en vez del componente `Select` del design system.
2. No hay un contenedor de filtros estandarizado (cada uno inventa su wrapper con `bg-white rounded-lg shadow-sm border ...`).
3. El patron mobile-collapsible solo existe en public calendar.

### Plan de refactorizacion

1. Crear `shared/components/layout/FilterBar.tsx` — contenedor generico:

```typescript
interface FilterBarProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  collapsible?: boolean       // patron mobile
  hasActiveFilters?: boolean
  onClearFilters?: () => void
  className?: string
}
```

2. Migrar public calendar a usar componente `Select` compartido en vez de `<select>` nativo.
3. Envolver filtros de cada pagina con el `FilterBar` compartido.
4. Logica de filtros sigue siendo especifica de cada feature (no se comparte).

### Archivos a modificar

- **Crear:** `shared/components/layout/FilterBar.tsx`, test
- **Modificar:** `PublicCalendar.tsx` (reemplazar `<select>` nativos), ambos filter bars para usar contenedor

---

## 4. Lista/Grid de eventos

**Prioridad: Medio** — Grids identicos, cards distintas; compartir layout.

### Estado actual

| Pagina | Layout | Card | Paginacion |
|--------|--------|------|-----------|
| Public Calendar | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` | `EventCard.tsx` (138 ln) — imagen, badge featured, tipo | No |
| Internal Calendar | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` | `InternalEventCard.tsx` (124 ln) — sin imagen, status badge, org | No |
| Organizer Dashboard | `div.p-4.space-y-2` (lista vertical) | `OrganizerEventListItem.tsx` — acciones edit/delete/view | Si (`Pagination`) |

### Duplicacion

- Public e Internal usan **el mismo grid CSS** identico con `role="region" aria-label="Event grid"`.
- Las cards son suficientemente distintas (imagen vs sin imagen, click vs link) para no fusionarlas directamente.

### Plan de refactorizacion

1. Crear `shared/components/layout/EventGrid.tsx`:

```typescript
interface EventGridProps {
  children: ReactNode
  columns?: { sm?: number; md?: number; lg?: number }
  gap?: number
  ariaLabel?: string
}
```

2. Reemplazar grids inline en `InternalCalendar.tsx` y `PublicCalendar.tsx`.
3. Las cards (`EventCard`, `InternalEventCard`, `OrganizerEventListItem`) **no se fusionan** — son especificas de dominio.
4. Opcionalmente, extraer sub-componentes compartidos de las cards:
   - `EventCardDate` — icono + fecha formateada
   - `EventCardLocation` — icono + ubicacion

### Archivos a modificar

- **Crear:** `shared/components/layout/EventGrid.tsx`, test
- **Modificar:** `InternalCalendar.tsx`, `PublicCalendar.tsx`

---

## 5. Empty/Error States

**Prioridad: Bajo** — Ya existe `EmptyState` compartido; solo falta adoptarlo en 2 paginas.

### Estado actual

| Pagina | Usa shared `EmptyState`? | Implementacion |
|--------|--------------------------|----------------|
| Organizer Dashboard | Si | `EmptyState` + `EmptyStateIcons.calendar` (ln 104-128) |
| Internal Calendar | **No** | SVG inline + h3 + p (ln 63-85) |
| Public Calendar | **No** | SVG inline + h3 + p + boton clear filters (ln 222-252) |

### Componente existente

`shared/components/feedback/EmptyState.tsx` ya soporta:
- `icon`, `title`, `description`, `action`, `size`, `className`
- `EmptyStateIcons`: calendar, inbox, search, document, users, folder

### Plan de refactorizacion

1. En `InternalCalendar.tsx`, reemplazar empty state inline por:

```tsx
<EmptyState
  icon={EmptyStateIcons.calendar}
  title="No hay eventos"
  description="No hay eventos aprobados en este momento."
  size="md"
/>
```

2. En `PublicCalendar.tsx`, reemplazar empty state inline por:

```tsx
<EmptyState
  icon={EmptyStateIcons.calendar}
  title="No hay eventos"
  description={hasActiveFilters
    ? 'No encontramos eventos con los filtros seleccionados'
    : 'No hay eventos disponibles en este momento'}
  action={hasActiveFilters && onClearFilters && (
    <button onClick={onClearFilters} className="text-primary-600 hover:text-primary-700 font-medium">
      Limpiar filtros
    </button>
  )}
  size="md"
/>
```

3. No se necesita crear nada nuevo.

### Archivos a modificar

- **Modificar:** `InternalCalendar.tsx`, `PublicCalendar.tsx`
- **Tests:** actualizar tests existentes si verifican estructura HTML del empty state

---

## Orden de ejecucion recomendado

```
Paso 1 → #5 Empty/Error States (0 archivos nuevos, adopcion directa)
Paso 2 → #1 Stats Bar (1 componente nuevo, elimina 3)
Paso 3 → #2 Page Header (1 componente nuevo)
Paso 4 → #4 Event Grid (1 componente nuevo)
Paso 5 → #3 Filtros (1 componente nuevo + migrar <select> nativos)
```

Cada paso es independiente y se puede mergear por separado.
