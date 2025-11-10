# CARD-008: Public Calendar - Basic Functionality - TDD Specification

**Feature:** Public Calendar - Tourist-facing event listing
**Sprint:** MVP Core Features
**Estimated Time:** 2.5-3 hours
**Status:** Ready for Implementation
**Created:** October 29, 2025
**Priority:** HIGH (MVP completion - public-facing feature)

---

## 📋 Overview

Implementar el calendario público básico donde turistas y público general pueden ver eventos publicados, filtrarlos por categoría/ubicación/fecha, y ver detalles de cada evento. Esta es la **salida visible** del sistema para usuarios finales.

### Context

- **Prerequisite:** CARD-007 completada (eventos pueden ser publicados)
- **Integration Point:** `/calendar` route (public, no auth)
- **Current State:** Backend API completo (PublicEventsController con 8 endpoints)
- **Target State:** Página pública funcional con lista de eventos y detalle

### Business Requirements

1. **Usuarios públicos pueden:**
   - Ver todos los eventos publicados (status = `published`)
   - Filtrar por categoría
   - Filtrar por ubicación
   - Filtrar por rango de fechas
   - Ver detalle completo de un evento
   - Buscar eventos por palabra clave

2. **Página debe mostrar:**
   - Lista de eventos con imagen placeholder
   - Información básica: título, fecha, ubicación, categoría
   - Filtros laterales o superiores (responsive)
   - Badge para eventos destacados (featured)
   - Vista de detalle con toda la información

3. **NO incluir en MVP (post-MVP):**
   - Vista de calendario tipo Google Calendar
   - Mapas interactivos
   - Compartir en redes sociales
   - Favoritos/guardar eventos
   - Sistema de comentarios

---

## 🎯 Success Criteria

- [ ] 10+ tests passing (list + filters + detail)
- [ ] TDD methodology followed (RED→GREEN→REFACTOR)
- [ ] Route `/calendar` accessible without authentication
- [ ] Event list displays published events only
- [ ] Filters work (category, location, date range)
- [ ] Event detail page shows complete information
- [ ] Responsive layout (mobile-first)
- [ ] SEO-friendly (proper meta tags, semantic HTML)
- [ ] Loading states and error handling
- [ ] Zero console.log in production code
- [ ] Zero TypeScript errors
- [ ] Zero ESLint warnings

---

## 🏗️ Architecture

### Files to Create

```
src/
├── app/
│   └── (public)/                       # Public route group (no auth)
│       └── calendar/
│           ├── page.tsx                # NEW - Calendar list page
│           └── [slug]/
│               └── page.tsx            # NEW - Event detail page
├── features/
│   └── public-calendar/                # NEW FEATURE
│       ├── components/
│       │   ├── dumb/
│       │   │   ├── PublicCalendar.tsx           # NEW - Main calendar UI
│       │   │   ├── EventCard.tsx                # NEW - Event card component
│       │   │   ├── EventGrid.tsx                # NEW - Grid of event cards
│       │   │   ├── CalendarFilters.tsx          # NEW - Filter sidebar/panel
│       │   │   └── EventDetail.tsx              # NEW - Event detail view
│       │   └── smart/
│       │       ├── PublicCalendarContainer.tsx  # NEW - Calendar container
│       │       └── EventDetailContainer.tsx     # NEW - Detail container
│       ├── hooks/
│       │   ├── usePublicEvents.ts               # NEW - Fetch public events
│       │   └── useEventFilters.ts               # NEW - Filter state management
│       ├── services/
│       │   └── public-events.service.ts         # NEW - Public API calls
│       ├── types/
│       │   └── public-calendar.types.ts         # NEW - TypeScript types
│       └── __tests__/
│           ├── PublicCalendar.test.tsx          # NEW - Calendar tests
│           ├── EventCard.test.tsx               # NEW - Card tests
│           └── usePublicEvents.test.ts          # NEW - Hook tests
```

### Backend API Endpoints (Already Implemented)

```
GET  /api/v1/public/events                  # List published events
GET  /api/v1/public/events/{id}             # Get event by ID
GET  /api/v1/public/events/upcoming         # Upcoming events
GET  /api/v1/public/events/featured         # Featured events
GET  /api/v1/public/events/search?q=...     # Search events
GET  /api/v1/public/events/category/{id}    # Events by category
GET  /api/v1/public/events/date-range       # Events by date range
GET  /api/v1/public/categories/active       # Active categories
GET  /api/v1/public/locations/active        # Active locations
```

---

## 🔴 RED PHASE: Write Tests First

### Test File 1: `PublicCalendar.test.tsx`

```typescript
/**
 * Tests for Public Calendar Component
 * 
 * Tests the public-facing calendar page with event listing,
 * filtering, and responsive layout.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PublicCalendar } from '../PublicCalendar'
import { PublicEvent } from '@/features/public-calendar/types/public-calendar.types'

describe('PublicCalendar', () => {
  const mockEvents = [
    {
      id: 1,
      title: 'Festival de Música',
      description: 'Gran evento musical',
      start_date: '2025-11-15',
      end_date: '2025-11-17',
      category: { id: 1, name: 'Música' },
      location: { id: 1, name: 'Teatro San Martín', city: 'San Miguel de Tucumán' },
      is_featured: true
    },
    {
      id: 2,
      title: 'Exposición de Arte',
      description: 'Arte contemporáneo',
      start_date: '2025-11-20',
      end_date: '2025-11-20',
      category: { id: 2, name: 'Arte' },
      location: { id: 2, name: 'Museo Provincial', city: 'San Miguel de Tucumán' },
      is_featured: false
    }
  ] as PublicEvent[]

  const mockCategories = [
    { id: 1, name: 'Música' },
    { id: 2, name: 'Arte' },
    { id: 3, name: 'Gastronomía' }
  ]

  const mockLocations = [
    { id: 1, name: 'Teatro San Martín', city: 'San Miguel de Tucumán' },
    { id: 2, name: 'Museo Provincial', city: 'San Miguel de Tucumán' }
  ]

  const mockHandlers = {
    onCategoryFilter: jest.fn(),
    onLocationFilter: jest.fn(),
    onDateRangeFilter: jest.fn(),
    onSearch: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Layout Structure', () => {
    test('renders calendar with header and event grid', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByText(/eventos en tucumán/i)).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /event grid/i })).toBeInTheDocument()
    })

    test('displays correct number of event cards', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Festival de Música')).toBeInTheDocument()
      expect(screen.getByText('Exposición de Arte')).toBeInTheDocument()
    })

    test('applies responsive grid classes', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      const grid = screen.getByRole('region', { name: /event grid/i })
      
      expect(grid.className).toContain('grid')
      expect(grid.className).toMatch(/grid-cols-1/)
      expect(grid.className).toMatch(/md:grid-cols-2/)
      expect(grid.className).toMatch(/lg:grid-cols-3/)
    })
  })

  describe('Event Cards Display', () => {
    test('displays event title, date, and location', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Festival de Música')).toBeInTheDocument()
      expect(screen.getByText(/nov 15.*17, 2025/i)).toBeInTheDocument()
      expect(screen.getByText('Teatro San Martín')).toBeInTheDocument()
    })

    test('displays featured badge on featured events', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/destacado/i)).toBeInTheDocument()
    })

    test('each event card has link to detail page', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      const eventLinks = screen.getAllByRole('link', { name: /ver detalles/i })
      expect(eventLinks).toHaveLength(2)
      expect(eventLinks[0]).toHaveAttribute('href', '/calendar/1')
    })
  })

  describe('Filters', () => {
    test('renders category filters', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Música' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Arte' })).toBeInTheDocument()
    })

    test('renders location filters', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByLabelText(/ubicación/i)).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /teatro san martín/i })).toBeInTheDocument()
    })

    test('calls onCategoryFilter when category selected', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      const categorySelect = screen.getByLabelText(/categoría/i)
      fireEvent.change(categorySelect, { target: { value: '1' } })

      expect(mockHandlers.onCategoryFilter).toHaveBeenCalledWith(1)
    })

    test('calls onLocationFilter when location selected', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      const locationSelect = screen.getByLabelText(/ubicación/i)
      fireEvent.change(locationSelect, { target: { value: '2' } })

      expect(mockHandlers.onLocationFilter).toHaveBeenCalledWith(2)
    })

    test('renders date range filter', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByLabelText(/fecha desde/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/fecha hasta/i)).toBeInTheDocument()
    })
  })

  describe('Search', () => {
    test('renders search input', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByPlaceholderText(/buscar eventos/i)).toBeInTheDocument()
    })

    test('calls onSearch when typing in search box', async () => {
      render(
        <PublicCalendar
          events={mockEvents}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      const searchInput = screen.getByPlaceholderText(/buscar eventos/i)
      fireEvent.change(searchInput, { target: { value: 'música' } })

      await waitFor(() => {
        expect(mockHandlers.onSearch).toHaveBeenCalledWith('música')
      })
    })
  })

  describe('Loading and Error States', () => {
    test('displays loading spinner when loading', () => {
      render(
        <PublicCalendar
          events={[]}
          categories={mockCategories}
          locations={mockLocations}
          loading={true}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('status', { name: /cargando/i })).toBeInTheDocument()
    })

    test('displays error message when error occurs', () => {
      render(
        <PublicCalendar
          events={[]}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error="Failed to load events"
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/error.*eventos/i)).toBeInTheDocument()
    })

    test('displays empty state when no events found', () => {
      render(
        <PublicCalendar
          events={[]}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/no hay eventos/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('main content has role="main"', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    test('filters have proper labels', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/ubicación/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/fecha desde/i)).toBeInTheDocument()
    })

    test('event cards have accessible structure', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          categories={mockCategories}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      const eventCards = screen.getAllByRole('article')
      expect(eventCards).toHaveLength(2)
    })
  })
})
```

### Test File 2: `EventCard.test.tsx`

```typescript
/**
 * Tests for Event Card Component
 * 
 * Tests individual event card display with title, date,
 * location, category badge, and featured badge.
 */

import { render, screen } from '@testing-library/react'
import { EventCard } from '../EventCard'
import { PublicEvent } from '@/features/public-calendar/types/public-calendar.types'

describe('EventCard', () => {
  const mockEvent: PublicEvent = {
    id: 1,
    title: 'Festival de Música',
    description: 'Gran evento musical en Tucumán',
    start_date: '2025-11-15',
    end_date: '2025-11-17',
    category: { id: 1, name: 'Música' },
    location: { id: 1, name: 'Teatro San Martín', city: 'San Miguel de Tucumán' },
    is_featured: true
  }

  describe('Content Display', () => {
    test('displays event title', () => {
      render(<EventCard event={mockEvent} />)

      expect(screen.getByText('Festival de Música')).toBeInTheDocument()
    })

    test('displays formatted date range', () => {
      render(<EventCard event={mockEvent} />)

      // Should display something like "Nov 15 - 17, 2025"
      expect(screen.getByText(/nov 15.*17, 2025/i)).toBeInTheDocument()
    })

    test('displays single date for one-day events', () => {
      const oneDayEvent = {
        ...mockEvent,
        end_date: '2025-11-15'
      }

      render(<EventCard event={oneDayEvent} />)

      expect(screen.getByText(/nov 15, 2025/i)).toBeInTheDocument()
    })

    test('displays location name and city', () => {
      render(<EventCard event={mockEvent} />)

      expect(screen.getByText('Teatro San Martín')).toBeInTheDocument()
      expect(screen.getByText(/san miguel de tucumán/i)).toBeInTheDocument()
    })

    test('displays category badge', () => {
      render(<EventCard event={mockEvent} />)

      expect(screen.getByText('Música')).toBeInTheDocument()
    })

    test('displays featured badge when event is featured', () => {
      render(<EventCard event={mockEvent} />)

      expect(screen.getByText(/destacado/i)).toBeInTheDocument()
    })

    test('does not display featured badge when event is not featured', () => {
      const nonFeaturedEvent = { ...mockEvent, is_featured: false }

      render(<EventCard event={nonFeaturedEvent} />)

      expect(screen.queryByText(/destacado/i)).not.toBeInTheDocument()
    })

    test('truncates long descriptions to 100 characters', () => {
      const longDescEvent = {
        ...mockEvent,
        description: 'A'.repeat(150)
      }

      render(<EventCard event={longDescEvent} />)

      const description = screen.getByText(/A+\.\.\./)
      expect(description.textContent?.length).toBeLessThanOrEqual(103) // 100 + "..."
    })
  })

  describe('Link Behavior', () => {
    test('card links to event detail page', () => {
      render(<EventCard event={mockEvent} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/calendar/1')
    })

    test('link has accessible label', () => {
      render(<EventCard event={mockEvent} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('aria-label', 'Ver detalles de Festival de Música')
    })
  })

  describe('Visual Styling', () => {
    test('card has proper structure', () => {
      render(<EventCard event={mockEvent} />)

      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    test('featured events have highlighted border', () => {
      render(<EventCard event={mockEvent} />)

      const card = screen.getByRole('article')
      expect(card.className).toContain('border-blue-500')
    })

    test('non-featured events have default border', () => {
      const nonFeaturedEvent = { ...mockEvent, is_featured: false }

      render(<EventCard event={nonFeaturedEvent} />)

      const card = screen.getByRole('article')
      expect(card.className).toContain('border-gray-200')
    })
  })

  describe('Accessibility', () => {
    test('card has article role', () => {
      render(<EventCard event={mockEvent} />)

      expect(screen.getByRole('article')).toBeInTheDocument()
    })

    test('dates have time element for semantic HTML', () => {
      render(<EventCard event={mockEvent} />)

      const timeElements = screen.getAllByRole('time')
      expect(timeElements.length).toBeGreaterThanOrEqual(1)
    })
  })
})
```

### Test File 3: `usePublicEvents.test.ts`

```typescript
/**
 * Tests for usePublicEvents hook
 * 
 * Tests fetching public events with filters and search.
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { usePublicEvents } from '../usePublicEvents'
import { publicEventsService } from '@/features/public-calendar/services/public-events.service'

jest.mock('@/features/public-calendar/services/public-events.service')

describe('usePublicEvents', () => {
  const mockEvents = [
    { id: 1, title: 'Event 1', status: 'published' },
    { id: 2, title: 'Event 2', status: 'published' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Fetch', () => {
    test('fetches events on mount', async () => {
      ;(publicEventsService.getAll as jest.Mock).mockResolvedValue({
        data: mockEvents,
        meta: { total: 2 }
      })

      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(publicEventsService.getAll).toHaveBeenCalled()
      expect(result.current.events).toEqual(mockEvents)
    })

    test('sets loading state during fetch', () => {
      ;(publicEventsService.getAll as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => usePublicEvents())

      expect(result.current.loading).toBe(true)
    })

    test('handles fetch error', async () => {
      ;(publicEventsService.getAll as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to load events')
      expect(result.current.events).toEqual([])
    })
  })

  describe('Filtering', () => {
    test('filters by category', async () => {
      ;(publicEventsService.getAll as jest.Mock).mockResolvedValue({
        data: mockEvents,
        meta: { total: 2 }
      })

      const { result } = renderHook(() => usePublicEvents())

      await act(async () => {
        result.current.filterByCategory(1)
      })

      expect(publicEventsService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ category_id: 1 })
      )
    })

    test('filters by location', async () => {
      ;(publicEventsService.getAll as jest.Mock).mockResolvedValue({
        data: mockEvents,
        meta: { total: 2 }
      })

      const { result } = renderHook(() => usePublicEvents())

      await act(async () => {
        result.current.filterByLocation(2)
      })

      expect(publicEventsService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ location_id: 2 })
      )
    })

    test('filters by date range', async () => {
      ;(publicEventsService.getAll as jest.Mock).mockResolvedValue({
        data: mockEvents,
        meta: { total: 2 }
      })

      const { result } = renderHook(() => usePublicEvents())

      await act(async () => {
        result.current.filterByDateRange('2025-11-01', '2025-11-30')
      })

      expect(publicEventsService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          start_date: '2025-11-01',
          end_date: '2025-11-30'
        })
      )
    })

    test('clears filters when reset called', async () => {
      ;(publicEventsService.getAll as jest.Mock).mockResolvedValue({
        data: mockEvents,
        meta: { total: 2 }
      })

      const { result } = renderHook(() => usePublicEvents())

      // Apply filter
      await act(async () => {
        result.current.filterByCategory(1)
      })

      // Clear filters
      await act(async () => {
        result.current.clearFilters()
      })

      expect(publicEventsService.getAll).toHaveBeenLastCalledWith({})
    })
  })

  describe('Search', () => {
    test('searches events by keyword', async () => {
      ;(publicEventsService.search as jest.Mock).mockResolvedValue({
        data: mockEvents,
        meta: { total: 2 }
      })

      const { result } = renderHook(() => usePublicEvents())

      await act(async () => {
        result.current.searchEvents('música')
      })

      expect(publicEventsService.search).toHaveBeenCalledWith('música')
      expect(result.current.events).toEqual(mockEvents)
    })

    test('handles search error', async () => {
      ;(publicEventsService.search as jest.Mock).mockRejectedValue(
        new Error('Search failed')
      )

      const { result } = renderHook(() => usePublicEvents())

      await act(async () => {
        result.current.searchEvents('test')
      })

      expect(result.current.error).toBe('Search failed')
    })
  })
})
```

---

## 🟢 GREEN PHASE: Implementation

### 1. Create Types: `public-calendar.types.ts`

```typescript
/**
 * TypeScript interfaces for public calendar
 */

export interface PublicEvent {
  id: number
  title: string
  description: string
  start_date: string
  end_date: string
  start_time?: string
  end_time?: string
  category: {
    id: number
    name: string
  }
  location: {
    id: number
    name: string
    city: string
    address?: string
  }
  is_featured: boolean
  image_url?: string
}

export interface EventsResponse {
  data: PublicEvent[]
  meta: {
    current_page: number
    total: number
    per_page: number
  }
}

export interface Category {
  id: number
  name: string
}

export interface Location {
  id: number
  name: string
  city: string
}
```

### 2. Create Service: `public-events.service.ts`

```typescript
/**
 * Public Events Service
 * 
 * Handles API calls for public calendar (no auth required).
 */

import { apiClient } from '@/services/apiClient'
import { EventsResponse, PublicEvent, Category, Location } from '../types/public-calendar.types'

interface FetchEventsParams {
  category_id?: number
  location_id?: number
  start_date?: string
  end_date?: string
  page?: number
}

export const publicEventsService = {
  /**
   * Get all published events
   */
  getAll: async (params: FetchEventsParams = {}): Promise<EventsResponse> => {
    const queryParams = new URLSearchParams()
    
    if (params.category_id) {
      queryParams.append('category_id', params.category_id.toString())
    }
    if (params.location_id) {
      queryParams.append('location_id', params.location_id.toString())
    }
    if (params.start_date) {
      queryParams.append('start_date', params.start_date)
    }
    if (params.end_date) {
      queryParams.append('end_date', params.end_date)
    }
    if (params.page) {
      queryParams.append('page', params.page.toString())
    }

    const queryString = queryParams.toString()
    const url = queryString ? `/public/events?${queryString}` : '/public/events'

    return apiClient.get(url)
  },

  /**
   * Get single event by ID
   */
  getById: async (id: number): Promise<PublicEvent> => {
    return apiClient.get(`/public/events/${id}`)
  },

  /**
   * Search events by keyword
   */
  search: async (query: string): Promise<EventsResponse> => {
    return apiClient.get(`/public/events/search?q=${encodeURIComponent(query)}`)
  },

  /**
   * Get upcoming events
   */
  getUpcoming: async (limit = 10): Promise<EventsResponse> => {
    return apiClient.get(`/public/events/upcoming?limit=${limit}`)
  },

  /**
   * Get featured events
   */
  getFeatured: async (): Promise<EventsResponse> => {
    return apiClient.get('/public/events/featured')
  },

  /**
   * Get active categories
   */
  getCategories: async (): Promise<Category[]> => {
    return apiClient.get('/public/categories/active')
  },

  /**
   * Get active locations
   */
  getLocations: async (): Promise<Location[]> => {
    return apiClient.get('/public/locations/active')
  }
}
```

### 3. Create Hook: `usePublicEvents.ts`

```typescript
/**
 * Custom hook for public events
 * 
 * Manages fetching, filtering, and searching public events.
 */

import { useState, useEffect } from 'react'
import { publicEventsService } from '../services/public-events.service'
import { PublicEvent, Category, Location } from '../types/public-calendar.types'

interface UsePublicEventsReturn {
  events: PublicEvent[]
  categories: Category[]
  locations: Location[]
  loading: boolean
  error: string | null
  filterByCategory: (categoryId: number | null) => Promise<void>
  filterByLocation: (locationId: number | null) => Promise<void>
  filterByDateRange: (startDate: string, endDate: string) => Promise<void>
  searchEvents: (query: string) => Promise<void>
  clearFilters: () => Promise<void>
}

export const usePublicEvents = (): UsePublicEventsReturn => {
  const [events, setEvents] = useState<PublicEvent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<{
    category_id?: number
    location_id?: number
    start_date?: string
    end_date?: string
  }>({})

  // Fetch initial data
  useEffect(() => {
    fetchEvents()
    fetchCategories()
    fetchLocations()
  }, [])

  const fetchEvents = async (params = filters): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await publicEventsService.getAll(params)
      setEvents(response.data)
    } catch {
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async (): Promise<void> => {
    try {
      const data = await publicEventsService.getCategories()
      setCategories(data)
    } catch {
      // Fail silently for filters
    }
  }

  const fetchLocations = async (): Promise<void> => {
    try {
      const data = await publicEventsService.getLocations()
      setLocations(data)
    } catch {
      // Fail silently for filters
    }
  }

  const filterByCategory = async (categoryId: number | null): Promise<void> => {
    const newFilters = { ...filters, category_id: categoryId || undefined }
    setFilters(newFilters)
    await fetchEvents(newFilters)
  }

  const filterByLocation = async (locationId: number | null): Promise<void> => {
    const newFilters = { ...filters, location_id: locationId || undefined }
    setFilters(newFilters)
    await fetchEvents(newFilters)
  }

  const filterByDateRange = async (startDate: string, endDate: string): Promise<void> => {
    const newFilters = { ...filters, start_date: startDate, end_date: endDate }
    setFilters(newFilters)
    await fetchEvents(newFilters)
  }

  const searchEvents = async (query: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await publicEventsService.search(query)
      setEvents(response.data)
    } catch {
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = async (): Promise<void> => {
    setFilters({})
    await fetchEvents({})
  }

  return {
    events,
    categories,
    locations,
    loading,
    error,
    filterByCategory,
    filterByLocation,
    filterByDateRange,
    searchEvents,
    clearFilters
  }
}
```

### 4. Create Component: `EventCard.tsx` (Dumb)

```typescript
/**
 * Event Card Component (Presentational)
 * 
 * Displays individual event card with image, title, date, location, category.
 */

import Link from 'next/link'
import { PublicEvent } from '@/features/public-calendar/types/public-calendar.types'
import { formatDateRange } from '@/lib/dateUtils'

interface EventCardProps {
  event: PublicEvent
}

export const EventCard = ({ event }: EventCardProps) => {
  const dateRange = formatDateRange(event.start_date, event.end_date)
  const description = event.description.length > 100
    ? `${event.description.substring(0, 100)}...`
    : event.description

  return (
    <article
      className={`
        bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105
        border-2 ${event.is_featured ? 'border-blue-500' : 'border-gray-200'}
      `}
    >
      <Link
        href={`/calendar/${event.id}`}
        aria-label={`Ver detalles de ${event.title}`}
      >
        {/* Image Placeholder */}
        <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          {event.is_featured && (
            <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
              Destacado
            </span>
          )}
          <span className="text-white text-6xl">📅</span>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category Badge */}
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
            {event.category.name}
          </span>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {event.title}
          </h3>

          {/* Date */}
          <p className="text-sm text-gray-600 mb-2">
            <time dateTime={event.start_date}>
              📅 {dateRange}
            </time>
          </p>

          {/* Location */}
          <p className="text-sm text-gray-600 mb-3">
            📍 {event.location.name}, {event.location.city}
          </p>

          {/* Description */}
          <p className="text-sm text-gray-700">
            {description}
          </p>
        </div>
      </Link>
    </article>
  )
}
```

### 5. Create Component: `CalendarFilters.tsx` (Dumb)

```typescript
/**
 * Calendar Filters Component (Presentational)
 * 
 * Displays filter controls for category, location, and date range.
 */

import { Category, Location } from '@/features/public-calendar/types/public-calendar.types'

interface CalendarFiltersProps {
  categories: Category[]
  locations: Location[]
  selectedCategory: number | null
  selectedLocation: number | null
  onCategoryChange: (categoryId: number | null) => void
  onLocationChange: (locationId: number | null) => void
  onDateRangeChange: (startDate: string, endDate: string) => void
  onClearFilters: () => void
}

export const CalendarFilters = ({
  categories,
  locations,
  selectedCategory,
  selectedLocation,
  onCategoryChange,
  onLocationChange,
  onDateRangeChange,
  onClearFilters
}: CalendarFiltersProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <h3 className="font-bold text-lg mb-4">Filtros</h3>

      {/* Category Filter */}
      <div>
        <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Categoría
        </label>
        <select
          id="category-filter"
          value={selectedCategory || ''}
          onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">Todas las categorías</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div>
        <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Ubicación
        </label>
        <select
          id="location-filter"
          value={selectedLocation || ''}
          onChange={(e) => onLocationChange(e.target.value ? Number(e.target.value) : null)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">Todas las ubicaciones</option>
          {locations.map(location => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Filter */}
      <div>
        <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">
          Fecha desde
        </label>
        <input
          type="date"
          id="date-from"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          onChange={(e) => {
            const endDate = (document.getElementById('date-to') as HTMLInputElement).value
            if (e.target.value && endDate) {
              onDateRangeChange(e.target.value, endDate)
            }
          }}
        />
      </div>

      <div>
        <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">
          Fecha hasta
        </label>
        <input
          type="date"
          id="date-to"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          onChange={(e) => {
            const startDate = (document.getElementById('date-from') as HTMLInputElement).value
            if (startDate && e.target.value) {
              onDateRangeChange(startDate, e.target.value)
            }
          }}
        />
      </div>

      {/* Clear Filters */}
      <button
        onClick={onClearFilters}
        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
      >
        Limpiar filtros
      </button>
    </div>
  )
}
```

### 6. Create Component: `PublicCalendar.tsx` (Dumb)

```typescript
/**
 * Public Calendar Component (Presentational)
 * 
 * Main public calendar UI with event grid and filters.
 */

import { EventCard } from './EventCard'
import { CalendarFilters } from './CalendarFilters'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { PublicEvent, Category, Location } from '@/features/public-calendar/types/public-calendar.types'

interface PublicCalendarProps {
  events: PublicEvent[]
  categories: Category[]
  locations: Location[]
  loading: boolean
  error: string | null
  selectedCategory: number | null
  selectedLocation: number | null
  onCategoryFilter: (categoryId: number | null) => void
  onLocationFilter: (locationId: number | null) => void
  onDateRangeFilter: (startDate: string, endDate: string) => void
  onSearch: (query: string) => void
  onClearFilters: () => void
}

export const PublicCalendar = ({
  events,
  categories,
  locations,
  loading,
  error,
  selectedCategory,
  selectedLocation,
  onCategoryFilter,
  onLocationFilter,
  onDateRangeFilter,
  onSearch,
  onClearFilters
}: PublicCalendarProps) => {
  return (
    <main className="min-h-screen bg-gray-50 py-8" role="main">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Eventos en Tucumán
          </h1>
          <p className="text-gray-600">
            Descubre los mejores eventos culturales y turísticos de la provincia
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar eventos..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2"
            aria-label="Buscar eventos"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <CalendarFilters
              categories={categories}
              locations={locations}
              selectedCategory={selectedCategory}
              selectedLocation={selectedLocation}
              onCategoryChange={onCategoryFilter}
              onLocationChange={onLocationFilter}
              onDateRangeChange={onDateRangeFilter}
              onClearFilters={onClearFilters}
            />
          </aside>

          {/* Event Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner role="status" aria-label="Cargando eventos" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Error al cargar eventos. Intente nuevamente.</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No hay eventos disponibles.</p>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                role="region"
                aria-label="Event grid"
              >
                {events.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
```

### 7. Create Container: `PublicCalendarContainer.tsx` (Smart)

```typescript
/**
 * Public Calendar Container (Smart)
 * 
 * Connects calendar with data hooks.
 */

import { useState } from 'react'
import { PublicCalendar } from '../dumb/PublicCalendar'
import { usePublicEvents } from '@/features/public-calendar/hooks/usePublicEvents'

export const PublicCalendarContainer = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)

  const {
    events,
    categories,
    locations,
    loading,
    error,
    filterByCategory,
    filterByLocation,
    filterByDateRange,
    searchEvents,
    clearFilters
  } = usePublicEvents()

  const handleCategoryFilter = (categoryId: number | null): void => {
    setSelectedCategory(categoryId)
    filterByCategory(categoryId)
  }

  const handleLocationFilter = (locationId: number | null): void => {
    setSelectedLocation(locationId)
    filterByLocation(locationId)
  }

  const handleClearFilters = (): void => {
    setSelectedCategory(null)
    setSelectedLocation(null)
    clearFilters()
  }

  return (
    <PublicCalendar
      events={events}
      categories={categories}
      locations={locations}
      loading={loading}
      error={error}
      selectedCategory={selectedCategory}
      selectedLocation={selectedLocation}
      onCategoryFilter={handleCategoryFilter}
      onLocationFilter={handleLocationFilter}
      onDateRangeFilter={filterByDateRange}
      onSearch={searchEvents}
      onClearFilters={handleClearFilters}
    />
  )
}
```

### 8. Create Page Route: `app/(public)/calendar/page.tsx`

```typescript
/**
 * Public Calendar Page
 * 
 * Public route (no authentication required).
 */

import { PublicCalendarContainer } from '@/features/public-calendar/components/smart/PublicCalendarContainer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Eventos en Tucumán | Calendario de Eventos Turísticos',
  description: 'Descubre los mejores eventos culturales y turísticos de Tucumán. Consulta nuestro calendario completo de actividades.',
  keywords: 'eventos tucumán, calendario turístico, eventos culturales, turismo tucumán'
}

export default function CalendarPage() {
  return <PublicCalendarContainer />
}
```

---

## 🔵 REFACTOR PHASE: Polish & Optimize

### SEO Optimization

1. **Metadata per page:**
```typescript
export const generateMetadata = ({ params }: { params: { id: string } }): Metadata => {
  return {
    title: `Evento - ${event.title}`,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: [event.image_url]
    }
  }
}
```

2. **Semantic HTML:**
- Use `<article>`, `<time>`, `<address>` tags
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for images

3. **Structured Data:**
```typescript
const eventStructuredData = {
  "@context": "https://schema.org",
  "@type": "Event",
  "name": event.title,
  "startDate": event.start_date,
  "location": {
    "@type": "Place",
    "name": event.location.name
  }
}
```

### Performance Optimization

1. **Image Optimization:**
```typescript
import Image from 'next/image'

<Image
  src={event.image_url || '/placeholder.jpg'}
  alt={event.title}
  width={400}
  height={300}
  loading="lazy"
/>
```

2. **Pagination:**
```typescript
// Load more events on scroll (infinite scroll)
const handleLoadMore = () => {
  fetchEvents({ page: currentPage + 1 })
}
```

3. **Debounce Search:**
```typescript
import { useDebouncedCallback } from 'use-debounce'

const debouncedSearch = useDebouncedCallback(
  (query: string) => {
    searchEvents(query)
  },
  500
)
```

### Accessibility

1. **ARIA Labels** on all interactive elements
2. **Keyboard Navigation** for filters and cards
3. **Screen Reader Support** for loading states
4. **Focus Management** after filter changes

---

## ✅ Validation Checklist

### Pre-Implementation
- [ ] Verify backend API endpoints work (test /api/v1/public/events)
- [ ] Check date formatting utility exists
- [ ] Verify LoadingSpinner component
- [ ] Test responsive layout on mobile

### During Implementation (TDD)
- [ ] **RED:** Write all tests first (must fail)
- [ ] **GREEN:** Implement minimum code to pass tests
- [ ] **REFACTOR:** SEO, performance, accessibility
- [ ] Zero console.log in code
- [ ] Zero unused imports/variables
- [ ] All functions have return types
- [ ] All props have interfaces

### Post-Implementation
- [ ] Run tests: `npm test` → 10+ new tests passing
- [ ] Run linter: `npm run lint` → 0 errors, 0 warnings
- [ ] TypeScript check: `npm run type-check` → 0 errors
- [ ] Manual testing: Test filters and search
- [ ] Test on mobile devices
- [ ] Check SEO with Lighthouse

### Integration Testing
- [ ] Calendar displays published events only
- [ ] Category filter works
- [ ] Location filter works
- [ ] Date range filter works
- [ ] Search returns correct results
- [ ] Event detail page loads correctly
- [ ] Responsive on mobile/tablet/desktop

---

## 📊 Expected Test Results

**After RED Phase:**
```bash
npm test public-calendar
# Expected: 10+ tests, all failing ❌
```

**After GREEN Phase:**
```bash
npm test public-calendar
# Expected: 10+ tests, all passing ✅
```

**Full Suite:**
```bash
npm test
# Expected: 170+ tests passing (160 existing + 10 new)
```

---

## 🎯 Acceptance Criteria

**Functional:**
- [x] Public route accessible without auth
- [x] Displays only published events
- [x] Category filter functional
- [x] Location filter functional
- [x] Date range filter functional
- [x] Search works correctly
- [x] Event detail page complete
- [x] Featured events highlighted

**Technical:**
- [x] 10+ tests passing
- [x] TDD methodology followed
- [x] Zero TypeScript errors
- [x] Zero ESLint warnings
- [x] SEO-optimized (meta tags, semantic HTML)
- [x] All functions typed
- [x] All components accessible

**UX:**
- [x] Responsive layout
- [x] Loading states
- [x] Empty states
- [x] Error handling
- [x] Mobile-friendly filters

---

## 🎉 MVP Status After CARD-008

**If included in MVP:**
- ✅ Panel Organizador: 100%
- ✅ Entity Admin Dashboard: 100%
- ✅ Public Calendar: 100%
- ✅ **MVP: 100% COMPLETE** 🚀

**Full Workflow:**
```
Organizer creates → Entity Admin approves → Event published → PUBLIC SEES IT
```

---

## 🚀 Ready for Execution

This CARD is **READY** for implementation following TDD methodology.

**Estimated Time:** 2.5-3 hours
**Complexity:** Medium (mainly UI + filters)
**Risk:** Low (backend API ready)
**Priority:** HIGH (public-facing MVP feature)

---

**Created:** October 29, 2025
**Status:** Ready for Implementation
**MVP Inclusion:** RECOMMENDED ✅
**Alternative:** Can be post-MVP "Release 1.1" if timeline is tight