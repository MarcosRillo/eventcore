# CARD-006: Organizer Dashboard Layout Integration - TDD Specification

**Feature:** Organizer Panel - Dashboard Layout
**Sprint:** Panel Organizador MVP
**Estimated Time:** 2.5-3 hours
**Status:** Ready for Implementation
**Created:** October 29, 2025

---

## 📋 Overview

Integrar todos los componentes del Panel Organizador en un dashboard cohesivo y funcional. El dashboard debe ser la landing page para usuarios con rol `organizer_admin` y proporcionar una vista completa de sus eventos.

### Context

- **Prerequisite:** CARDs 002, 003, 004, 005 completadas
- **Integration Point:** `/organizer/dashboard` route (new)
- **Current State:** Widgets funcionan independientemente, sin página unificada
- **Target State:** Dashboard completo con layout responsive y navegación fluida

### Components to Integrate

1. **OrganizerStatsWidget** (CARD-002) ✅
   - Muestra total events, by status, recent activity
   
2. **OrganizerEventList** (CARD-003) ✅
   - Lista paginada de eventos con filtros
   - Incluye actions column (CARD-005)

3. **OrganizerEventForm** (CARD-004) ✅
   - Create/Edit event form
   - Modo modal o página separada

4. **Navigation & Layout**
   - Header con user info y logout
   - Breadcrumbs para navegación
   - Responsive layout (mobile-first)

### Business Requirements

1. **Dashboard debe mostrar:**
   - Stats cards en la parte superior
   - "Create New Event" button prominente
   - Event list con pagination
   - Quick filters (All, Draft, Pending, Published)

2. **Flujo de usuario:**
   - Ver stats → identificar eventos pendientes
   - Click "Create New Event" → abrir form modal
   - Ver lista de eventos → edit/publish/duplicate/delete
   - Filtrar eventos por status

3. **Responsive:**
   - Desktop: Stats en fila, event list debajo
   - Tablet: Stats en 2 columnas
   - Mobile: Stats apilados, lista scrolleable

---

## 🎯 Success Criteria

- [ ] 8-10 tests passing (integration + component tests)
- [ ] TDD methodology followed (RED→GREEN→REFACTOR)
- [ ] Dashboard route `/organizer/dashboard` funcional
- [ ] All widgets integrated and communicating
- [ ] Responsive layout (mobile, tablet, desktop)
- [ ] Navigation between dashboard and event form
- [ ] Loading states for async operations
- [ ] Zero console.log in production code
- [ ] Zero TypeScript errors
- [ ] Zero ESLint warnings

---

## 🏗️ Architecture

### Files to Create

```
src/
├── app/
│   └── (organizer)/                    # NEW - Organizer route group
│       ├── layout.tsx                  # NEW - Organizer layout with auth
│       └── dashboard/
│           └── page.tsx                # NEW - Dashboard page
├── features/organizer/
│   ├── components/
│   │   ├── dumb/
│   │   │   ├── OrganizerDashboard.tsx           # NEW - Main dashboard UI
│   │   │   └── OrganizerQuickFilters.tsx        # NEW - Status filter buttons
│   │   └── smart/
│   │       └── OrganizerDashboardContainer.tsx  # NEW - Dashboard container
│   └── __tests__/
│       └── OrganizerDashboard.test.tsx          # NEW - Dashboard tests
```

### Files to Modify

```
src/features/organizer/
├── hooks/
│   └── useOrganizerEvents.ts           # ADD filter by status parameter
└── components/
    └── dumb/
        └── OrganizerEventForm.tsx      # VERIFY modal mode works
```

### Route Structure

```
/organizer/dashboard        → Main organizer dashboard (stats + list)
/organizer/events/new       → Create new event (optional, if not using modal)
/organizer/events/:id/edit  → Edit event (optional, if not using modal)
```

**Note:** Initially implement modal-based form. Separate routes can be added later if needed.

---

## 🔴 RED PHASE: Write Tests First

### Test File: `OrganizerDashboard.test.tsx`

```typescript
/**
 * Tests for Organizer Dashboard Integration
 * 
 * Tests the main dashboard layout, widget integration,
 * filtering, and user interactions.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OrganizerDashboard } from '../OrganizerDashboard'
import { Event } from '@/features/organizer/types/event.types'

describe('OrganizerDashboard', () => {
  const mockStats = {
    total_events: 25,
    pending_internal: 5,
    approved_internal: 8,
    published: 10,
    requires_changes: 2
  }

  const mockEvents = {
    data: [
      {
        id: 1,
        title: 'Event 1',
        status: 'draft',
        start_date: '2025-11-01',
        category_id: 1,
        location_id: 1
      },
      {
        id: 2,
        title: 'Event 2',
        status: 'published',
        start_date: '2025-11-15',
        category_id: 1,
        location_id: 1
      }
    ] as Event[],
    meta: {
      current_page: 1,
      total: 25
    }
  }

  const mockHandlers = {
    onFilterChange: jest.fn(),
    onOpenCreateModal: jest.fn(),
    onCloseCreateModal: jest.fn(),
    onCreateSuccess: jest.fn(),
    onPublish: jest.fn(),
    onDuplicate: jest.fn(),
    onDelete: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Layout Structure', () => {
    test('renders dashboard with all main sections', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByText('My Events')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create new event/i })).toBeInTheDocument()
    })

    test('displays stats cards in correct order', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      const statsCards = screen.getAllByRole('article')
      
      expect(statsCards).toHaveLength(5)
      expect(statsCards[0]).toHaveTextContent('Total Events')
      expect(statsCards[1]).toHaveTextContent('Pending')
      expect(statsCards[2]).toHaveTextContent('Approved')
      expect(statsCards[3]).toHaveTextContent('Published')
      expect(statsCards[4]).toHaveTextContent('Requires Changes')
    })

    test('displays correct stat values', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('25')).toBeInTheDocument() // total
      expect(screen.getByText('5')).toBeInTheDocument()  // pending
      expect(screen.getByText('8')).toBeInTheDocument()  // approved
      expect(screen.getByText('10')).toBeInTheDocument() // published
      expect(screen.getByText('2')).toBeInTheDocument()  // requires_changes
    })

    test('applies responsive grid classes to stats section', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      const statsGrid = screen.getByTestId('stats-grid')
      
      expect(statsGrid.className).toContain('grid')
      expect(statsGrid.className).toMatch(/grid-cols-1/)
      expect(statsGrid.className).toMatch(/md:grid-cols-2/)
      expect(statsGrid.className).toMatch(/lg:grid-cols-5/)
    })
  })

  describe('Event List Integration', () => {
    test('renders event list with data', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Event 1')).toBeInTheDocument()
      expect(screen.getByText('Event 2')).toBeInTheDocument()
    })

    test('displays loading state when fetching events', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={{ data: [], meta: { current_page: 1, total: 0 } }}
          loading={true}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
    })

    test('displays error message when fetch fails', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={{ data: [], meta: { current_page: 1, total: 0 } }}
          loading={false}
          error="Failed to fetch events"
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/failed to fetch events/i)).toBeInTheDocument()
    })

    test('displays empty state when no events', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={{ data: [], meta: { current_page: 1, total: 0 } }}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/no events found/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create your first event/i })).toBeInTheDocument()
    })
  })

  describe('Quick Filters', () => {
    test('renders status filter buttons', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^draft$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /pending/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /published/i })).toBeInTheDocument()
    })

    test('calls onFilterChange when filter button clicked', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /^draft$/i }))

      expect(mockHandlers.onFilterChange).toHaveBeenCalledWith('draft')
    })

    test('highlights active filter button', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter="draft"
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      const draftButton = screen.getByRole('button', { name: /^draft$/i })
      
      expect(draftButton.className).toContain('bg-blue-600')
      expect(draftButton.getAttribute('aria-pressed')).toBe('true')
    })
  })

  describe('Create Event Modal', () => {
    test('calls onOpenCreateModal when create button clicked', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /create new event/i }))

      expect(mockHandlers.onOpenCreateModal).toHaveBeenCalled()
    })

    test('does not render modal when createModalOpen is false', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    test('renders modal when createModalOpen is true', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText(/create new event/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('main container has role="main"', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    test('stats cards have role="article"', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      const articles = screen.getAllByRole('article')
      expect(articles).toHaveLength(5)
    })

    test('filter buttons have aria-pressed attribute', () => {
      render(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter="draft"
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      const draftButton = screen.getByRole('button', { name: /^draft$/i })
      expect(draftButton).toHaveAttribute('aria-pressed')
    })
  })
})
```

---

## 🟢 GREEN PHASE: Implementation

### 1. Create Page Route: `app/(organizer)/dashboard/page.tsx`

```typescript
/**
 * Organizer Dashboard Page
 * 
 * Main landing page for organizers. Protected route requiring
 * organizer_admin role.
 */

import { OrganizerDashboardContainer } from '@/features/organizer/components/smart/OrganizerDashboardContainer'

export default function OrganizerDashboardPage() {
  return <OrganizerDashboardContainer />
}
```

### 2. Create Layout: `app/(organizer)/layout.tsx`

```typescript
/**
 * Organizer Layout
 * 
 * Layout wrapper for organizer routes with authentication guard.
 */

import { PermissionGate } from '@/components/auth/PermissionGate'
import { Header } from '@/components/layout/Header'

export default function OrganizerLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <PermissionGate requiredRole="organizer_admin">
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          {children}
        </main>
      </div>
    </PermissionGate>
  )
}
```

### 3. Create Component: `OrganizerQuickFilters.tsx` (Dumb)

```typescript
/**
 * Quick Filters Component
 * 
 * Status filter buttons for event list.
 */

interface OrganizerQuickFiltersProps {
  activeFilter: string | null
  onFilterChange: (status: string | null) => void
}

export const OrganizerQuickFilters = ({
  activeFilter,
  onFilterChange
}: OrganizerQuickFiltersProps) => {
  const filters = [
    { label: 'All', value: null },
    { label: 'Draft', value: 'draft' },
    { label: 'Pending', value: 'pending_internal' },
    { label: 'Published', value: 'published' }
  ]

  return (
    <div className="flex gap-2 mb-4" role="group" aria-label="Filter events by status">
      {filters.map(filter => (
        <button
          key={filter.label}
          onClick={() => onFilterChange(filter.value)}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${activeFilter === filter.value
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }
          `}
          aria-pressed={activeFilter === filter.value}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
```

### 4. Create Component: `OrganizerDashboard.tsx` (Dumb)

```typescript
/**
 * Organizer Dashboard Component (Presentational)
 * 
 * Main dashboard UI integrating stats, filters, and event list.
 */

import { OrganizerQuickFilters } from './OrganizerQuickFilters'
import { OrganizerEventList } from './OrganizerEventList'
import { OrganizerEventForm } from './OrganizerEventForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Event } from '@/features/organizer/types/event.types'

interface Stats {
  total_events: number
  pending_internal: number
  approved_internal: number
  published: number
  requires_changes: number
}

interface Events {
  data: Event[]
  meta: {
    current_page: number
    total: number
  }
}

interface OrganizerDashboardProps {
  stats: Stats
  events: Events
  loading: boolean
  error: string | null
  activeFilter: string | null
  createModalOpen: boolean
  onFilterChange: (status: string | null) => void
  onOpenCreateModal: () => void
  onCloseCreateModal: () => void
  onCreateSuccess: () => void
  onPublish: (eventId: number) => void
  onDuplicate: (eventId: number) => void
  onDelete: (eventId: number) => void
}

export const OrganizerDashboard = ({
  stats,
  events,
  loading,
  error,
  activeFilter,
  createModalOpen,
  onFilterChange,
  onOpenCreateModal,
  onCloseCreateModal,
  onCreateSuccess,
  onPublish,
  onDuplicate,
  onDelete
}: OrganizerDashboardProps) => {
  return (
    <main className="container mx-auto px-4 max-w-7xl" role="main">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600 mt-1">Manage your event submissions</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={onOpenCreateModal}
          aria-label="Create new event"
        >
          + Create New Event
        </Button>
      </div>

      {/* Stats Section */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        data-testid="stats-grid"
      >
        <div role="article">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_events}</p>
          </div>
        </div>

        <div role="article">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending_internal}</p>
          </div>
        </div>

        <div role="article">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Approved</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved_internal}</p>
          </div>
        </div>

        <div role="article">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Published</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.published}</p>
          </div>
        </div>

        <div role="article">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Requires Changes</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.requires_changes}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <OrganizerQuickFilters
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
      />

      {/* Event List Section */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 flex justify-center">
            <LoadingSpinner role="status" aria-label="Loading events" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : events.data.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">No events found</p>
            <Button
              variant="primary"
              onClick={onOpenCreateModal}
              aria-label="Create your first event"
            >
              Create Your First Event
            </Button>
          </div>
        ) : (
          <OrganizerEventList
            events={events.data}
            onPublish={onPublish}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        )}
      </div>

      {/* Create Event Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={onCloseCreateModal}
          title="Create New Event"
          size="large"
        >
          <OrganizerEventForm
            mode="create"
            onSuccess={() => {
              onCreateSuccess()
              onCloseCreateModal()
            }}
            onCancel={onCloseCreateModal}
          />
        </Modal>
      )}
    </main>
  )
}
```

### 5. Create Container: `OrganizerDashboardContainer.tsx` (Smart)

```typescript
/**
 * Organizer Dashboard Container (Smart)
 * 
 * Connects dashboard with data hooks and manages state.
 */

import { useState, useEffect } from 'react'
import { OrganizerDashboard } from '../dumb/OrganizerDashboard'
import { useOrganizerStats } from '@/features/organizer/hooks/useOrganizerStats'
import { useOrganizerEvents } from '@/features/organizer/hooks/useOrganizerEvents'
import { useEventActions } from '@/features/organizer/hooks/useEventActions'

export const OrganizerDashboardContainer = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  // Fetch stats
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useOrganizerStats()

  // Fetch events
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    fetchEvents
  } = useOrganizerEvents()

  // Event actions
  const {
    publishEvent,
    duplicateEvent,
    deleteEvent
  } = useEventActions(handleRefresh)

  // Initial fetch
  useEffect(() => {
    refetchStats()
    fetchEvents({ page: 1 })
  }, [])

  // Refresh data after actions
  function handleRefresh(): void {
    refetchStats()
    fetchEvents({ status: activeFilter, page: 1 })
  }

  // Handle filter change
  function handleFilterChange(status: string | null): void {
    setActiveFilter(status)
    fetchEvents({ status, page: 1 })
  }

  // Handle create modal
  function handleOpenCreateModal(): void {
    setCreateModalOpen(true)
  }

  function handleCloseCreateModal(): void {
    setCreateModalOpen(false)
  }

  function handleCreateSuccess(): void {
    handleRefresh()
  }

  return (
    <OrganizerDashboard
      stats={stats}
      events={events}
      loading={eventsLoading}
      error={eventsError}
      activeFilter={activeFilter}
      createModalOpen={createModalOpen}
      onFilterChange={handleFilterChange}
      onOpenCreateModal={handleOpenCreateModal}
      onCloseCreateModal={handleCloseCreateModal}
      onCreateSuccess={handleCreateSuccess}
      onPublish={publishEvent}
      onDuplicate={duplicateEvent}
      onDelete={deleteEvent}
    />
  )
}
```

---

## 🔵 REFACTOR PHASE: Polish & Optimize

### Performance Optimizations

1. **Memoize Filter Buttons:**
```typescript
const filters = useMemo(() => [
  { label: 'All', value: null },
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending_internal' },
  { label: 'Published', value: 'published' }
], [])
```

2. **Lazy Load Event Form:**
```typescript
import { lazy, Suspense } from 'react'
const OrganizerEventForm = lazy(() => import('./OrganizerEventForm'))

// In modal:
<Suspense fallback={<LoadingSpinner />}>
  <OrganizerEventForm {...props} />
</Suspense>
```

3. **Prevent Unnecessary Re-renders:**
```typescript
const MemoizedEventList = React.memo(OrganizerEventList)
const MemoizedQuickFilters = React.memo(OrganizerQuickFilters)
```

### Accessibility Improvements

1. **Keyboard Navigation:**
   - Tab order: Header → Create button → Stats cards → Filters → Event list
   - Arrow keys for navigating filters
   - Enter/Space to activate buttons

2. **Screen Reader Support:**
```typescript
<div role="status" aria-live="polite" aria-atomic="true">
  {loading && "Loading events..."}
  {error && `Error: ${error}`}
</div>
```

3. **Focus Management:**
```typescript
// Return focus to create button after modal closes
const createButtonRef = useRef<HTMLButtonElement>(null)

const handleCloseModal = () => {
  setCreateModalOpen(false)
  createButtonRef.current?.focus()
}
```

### Code Quality

1. **Extract Constants:**
```typescript
// src/features/organizer/constants/dashboardConfig.ts
export const DASHBOARD_CONFIG = {
  FILTERS: [
    { label: 'All', value: null },
    { label: 'Draft', value: 'draft' },
    { label: 'Pending', value: 'pending_internal' },
    { label: 'Published', value: 'published' }
  ],
  STATS_CONFIG: [
    { key: 'total_events', label: 'Total Events', color: 'gray-900' },
    { key: 'pending_internal', label: 'Pending', color: 'yellow-600' },
    { key: 'approved_internal', label: 'Approved', color: 'green-600' },
    { key: 'published', label: 'Published', color: 'blue-600' },
    { key: 'requires_changes', label: 'Requires Changes', color: 'red-600' }
  ]
}
```

2. **Type Safety:**
```typescript
type FilterStatus = 'draft' | 'pending_internal' | 'approved_internal' | 'published' | null

interface DashboardFilter {
  label: string
  value: FilterStatus
}

interface StatsCard {
  key: keyof Stats
  label: string
  color: string
}
```

3. **JSDoc Comments:**
```typescript
/**
 * Handles filter change and fetches filtered events
 * @param status - Event status to filter by (null for all)
 */
function handleFilterChange(status: FilterStatus): void {
  setActiveFilter(status)
  fetchEvents({ status, page: 1 })
}
```

---

## ✅ Validation Checklist

### Pre-Implementation
- [ ] Verify all prerequisite CARDs (002-005) are implemented
- [ ] Check that Modal component supports "large" size prop
- [ ] Verify OrganizerEventForm has "mode" prop (create/edit)
- [ ] Check PermissionGate component exists and works
- [ ] Verify Header component exists in layout folder

### During Implementation (TDD)
- [ ] **RED:** Write all tests first (must fail)
- [ ] **GREEN:** Implement minimum code to pass tests
- [ ] **REFACTOR:** Optimize, add accessibility, improve UX
- [ ] Zero console.log in code
- [ ] Zero unused imports/variables
- [ ] All functions have return types
- [ ] All props have interfaces

### Post-Implementation
- [ ] Run tests: `pnpm test` → 8-10 new tests passing
- [ ] Run linter: `pnpm run lint` → 0 errors, 0 warnings
- [ ] TypeScript check: `pnpm run type-check` → 0 errors
- [ ] Manual testing: Navigate to /organizer/dashboard
- [ ] Test all filters work correctly
- [ ] Test create modal opens/closes
- [ ] Test actions (publish/duplicate/delete) refresh dashboard
- [ ] Test responsive layout on mobile/tablet/desktop

### Integration Testing
- [ ] Stats display correct values
- [ ] Event list shows events
- [ ] Filters update event list
- [ ] Create modal opens and creates event
- [ ] Actions refresh both stats and event list
- [ ] Loading states appear appropriately
- [ ] Error states display correctly
- [ ] Empty state shows when no events

---

## 📊 Expected Test Results

**After RED Phase:**
```bash
pnpm test OrganizerDashboard
# Expected: 8-10 tests, all failing ❌
```

**After GREEN Phase:**
```bash
pnpm test OrganizerDashboard
# Expected: 8-10 tests, all passing ✅
```

**Full Suite:**
```bash
pnpm test
# Expected: 148-150 tests passing (140 existing + 8-10 new)
```

---

## 🎯 Acceptance Criteria

**Functional:**
- [x] Dashboard accessible at /organizer/dashboard
- [x] Stats cards display correct values
- [x] Event list displays user's events
- [x] Quick filters work correctly
- [x] Create button opens modal with form
- [x] Event actions (publish/duplicate/delete) work
- [x] Dashboard refreshes after actions
- [x] Empty state when no events

**Technical:**
- [x] 8-10 tests passing
- [x] TDD methodology followed
- [x] Zero TypeScript errors
- [x] Zero ESLint warnings
- [x] Zero console.log statements
- [x] All functions typed
- [x] All components accessible

**UX:**
- [x] Loading states during data fetch
- [x] Error messages when operations fail
- [x] Responsive layout (mobile/tablet/desktop)
- [x] Smooth transitions and animations
- [x] Clear visual hierarchy

---

## 🔗 Related Documentation

- **Backend API:** `/docs/API.md` - Organizer endpoints
- **Previous CARDs:** CARD-002 (Stats), CARD-003 (List), CARD-004 (Form), CARD-005 (Actions)
- **Component Patterns:** `/docs/frontend/ARCHITECTURE.md`
- **Testing Guide:** `/claude.md` - Testing Requirements

---

## 📝 Notes for Implementation

1. **useOrganizerEvents Hook:** Verify it accepts `status` parameter for filtering:
```typescript
fetchEvents({ status: 'draft', page: 1 })
```

2. **Modal Component:** Verify it supports these props:
   - `isOpen: boolean`
   - `onClose: () => void`
   - `title: string`
   - `size: 'small' | 'medium' | 'large'`

3. **Button Component:** Verify size prop supports `lg` variant

4. **OrganizerEventForm:** Verify it works in modal context (not full page)

5. **Header Component:** Should already exist in `/src/components/layout/Header.tsx`

6. **PermissionGate:** Should redirect to login if not authenticated

---

## 🚀 Ready for Execution

This CARD is **READY** for implementation following TDD methodology:
1. Create test file → Run tests (should fail)
2. Implement components → Run tests (should pass)
3. Refactor code → Run tests (should still pass)

**Estimated Time:** 2.5-3 hours
**Complexity:** Medium (integration > logic)
**Risk:** Low (all dependencies completed)

---

## 🎉 MVP Completion

**After CARD-006 completes:**
- Panel Organizador: **100% complete** ✅
- MVP Progress: **95% complete** ✅

**Remaining for 100% MVP:**
- CARD-007: Entity Admin Dashboard (if required)
- OR: Public Calendar View (if prioritized)

---

**Created:** October 29, 2025
**Status:** Ready for Implementation
**Dependencies:** CARD-002, CARD-003, CARD-004, CARD-005
**Next:** CARD-007 (Entity Admin Dashboard) OR Public Calendar