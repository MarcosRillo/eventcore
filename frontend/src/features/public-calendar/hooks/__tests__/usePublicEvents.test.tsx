/**
 * Tests for usePublicEvents hook
 * Covers cascading filter logic, data fetching, error handling
 */

import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { act } from 'react'
import { SWRConfig } from 'swr'

import { usePublicEvents } from '@/features/public-calendar/hooks/usePublicEvents'
import type { EventSubtype, EventType, Location, PublicEvent } from '@/features/public-calendar/types/public-calendar.types'

jest.mock('@/lib/swr/fetcher', () => ({
  publicFetcher: jest.fn(),
}))

import { publicFetcher } from '@/lib/swr/fetcher'

const mockedFetcher = publicFetcher as jest.Mock

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
)

describe('usePublicEvents', () => {
  const mockEvents: PublicEvent[] = [
    {
      id: 1,
      title: 'Event 1',
      description: 'Description 1',
      image_url: 'https://example.com/image1.jpg',
      start_date: '2025-12-10',
      end_date: '2025-12-10',
      is_featured: false,
      event_type: { id: 1, name: 'Cultural' },
      event_subtype: { id: 1, name: 'Music', event_type_id: 1 },
      locations: [{ id: 1, name: 'Teatro San Martín', city: 'CABA' }]
    }
  ]

  const mockEventTypes: EventType[] = [
    { id: 1, name: 'Cultural', slug: 'cultural', is_active: true },
    { id: 2, name: 'Deportes', slug: 'deportes', is_active: true }
  ]

  const mockEventSubtypes: EventSubtype[] = [
    { id: 1, name: 'Music', slug: 'music', event_type_id: 1, is_active: true },
    { id: 2, name: 'Theater', slug: 'theater', event_type_id: 1, is_active: true }
  ]

  const mockLocations: Location[] = [
    { id: 1, name: 'Teatro San Martín', city: 'CABA' },
    { id: 2, name: 'Estadio Monumental', city: 'CABA' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    mockedFetcher.mockImplementation((url: string) => {
      if (url.includes('/public/event-types/') && url.includes('/subtypes')) {
        return Promise.resolve({ data: mockEventSubtypes })
      }
      if (url.includes('/public/event-types')) {
        return Promise.resolve({ data: mockEventTypes })
      }
      if (url.includes('/public/locations/active')) {
        return Promise.resolve({ data: mockLocations })
      }
      if (url.includes('/public/events')) {
        return Promise.resolve({ data: mockEvents, meta: { current_page: 1, per_page: 10, total: 1 } })
      }
      return Promise.resolve({ data: [] })
    })
  })

  describe('Initial State', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      expect(result.current.hasActiveFilters).toBe(false)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should initialize filters with null values', () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      expect(result.current.filters.event_type_id).toBeNull()
      expect(result.current.filters.event_subtype_id).toBeNull()
      expect(result.current.filters.location_id).toBeNull()
      expect(result.current.filters.start_date).toBeNull()
      expect(result.current.filters.end_date).toBeNull()
    })
  })

  describe('Data Fetching', () => {
    it('should fetch events, event types, and locations on mount', async () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.events).toEqual(mockEvents)
      expect(result.current.eventTypes).toEqual(mockEventTypes)
      expect(result.current.locations).toEqual(mockLocations)
    })

    it('should handle errors when fetching events', async () => {
      mockedFetcher.mockImplementation((url: string) => {
        if (url.includes('/public/events')) {
          return Promise.reject(new Error('Network error'))
        }
        if (url.includes('/public/event-types')) {
          return Promise.resolve({ data: mockEventTypes })
        }
        if (url.includes('/public/locations/active')) {
          return Promise.resolve({ data: mockLocations })
        }
        return Promise.resolve({ data: [] })
      })

      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
      expect(result.current.events).toEqual([])
    })

    it('should silently handle errors when fetching event types and locations', async () => {
      mockedFetcher.mockImplementation((url: string) => {
        if (url.includes('/public/event-types')) {
          return Promise.reject(new Error('Network error'))
        }
        if (url.includes('/public/locations/active')) {
          return Promise.reject(new Error('Network error'))
        }
        if (url.includes('/public/events')) {
          return Promise.resolve({ data: mockEvents, meta: { current_page: 1, per_page: 10, total: 1 } })
        }
        return Promise.resolve({ data: [] })
      })

      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.eventTypes).toEqual([])
      expect(result.current.locations).toEqual([])
      expect(result.current.error).toBeNull()
    })
  })

  describe('EventType Filter (Cascading Trigger)', () => {
    it('should update event_type_id filter when handleEventTypeFilter is called', async () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      expect(result.current.filters.event_type_id).toBe(1)
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('should reset event_subtype_id when event_type_id changes (CASCADING RESET)', async () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set type first
      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      await waitFor(() => {
        expect(result.current.eventSubtypes.length).toBeGreaterThan(0)
      })

      // Set subtype
      act(() => {
        result.current.handleEventSubtypeFilter(2)
      })

      expect(result.current.filters.event_subtype_id).toBe(2)

      // Change event type - subtype should reset
      act(() => {
        result.current.handleEventTypeFilter(2)
      })

      expect(result.current.filters.event_type_id).toBe(2)
      expect(result.current.filters.event_subtype_id).toBeNull()
    })

    it('should fetch event subtypes when event type is selected', async () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      await waitFor(() => {
        expect(result.current.eventSubtypes).toEqual(mockEventSubtypes)
      })

      // Verify the subtypes URL was called
      const subtypeCalls = mockedFetcher.mock.calls.filter(
        (call: string[]) => call[0].includes('/public/event-types/1/subtypes')
      )
      expect(subtypeCalls.length).toBeGreaterThan(0)
    })

    it('should clear event subtypes when event type is set to null', async () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Select a type to load subtypes
      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      await waitFor(() => {
        expect(result.current.eventSubtypes.length).toBeGreaterThan(0)
      })

      // Clear the type
      act(() => {
        result.current.handleEventTypeFilter(null)
      })

      expect(result.current.filters.event_type_id).toBeNull()
      expect(result.current.eventSubtypes).toEqual([])
    })

    it('should refetch events when event_type_id changes', async () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialCallCount = mockedFetcher.mock.calls.length

      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      await waitFor(() => {
        expect(mockedFetcher.mock.calls.length).toBeGreaterThan(initialCallCount)
      })

      const eventCalls = mockedFetcher.mock.calls.filter(
        (call: string[]) => call[0].includes('/public/events') && call[0].includes('event_type_id=1')
      )
      expect(eventCalls.length).toBeGreaterThan(0)
    })
  })

  describe('EventSubtype Filter', () => {
    it('should update event_subtype_id filter when handleEventSubtypeFilter is called', async () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEventSubtypeFilter(2)
      })

      expect(result.current.filters.event_subtype_id).toBe(2)
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('should clear event_subtype_id when set to null', async () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEventSubtypeFilter(2)
      })

      expect(result.current.filters.event_subtype_id).toBe(2)

      act(() => {
        result.current.handleEventSubtypeFilter(null)
      })

      expect(result.current.filters.event_subtype_id).toBeNull()
      expect(result.current.hasActiveFilters).toBe(false)
    })
  })

  describe('Location Filter', () => {
    it('should update location_id filter when handleLocationFilter is called', async () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleLocationFilter(1)
      })

      expect(result.current.filters.location_id).toBe(1)
      expect(result.current.hasActiveFilters).toBe(true)
    })
  })

  describe('Date Range Filter', () => {
    it('should update date filters when handleDateRangeFilter is called', async () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleDateRangeFilter('2025-12-01', '2025-12-31')
      })

      expect(result.current.filters.start_date).toBe('2025-12-01')
      expect(result.current.filters.end_date).toBe('2025-12-31')
      expect(result.current.hasActiveFilters).toBe(true)
    })
  })

  describe('Clear Filters', () => {
    it('should reset all filters when clearFilters is called', async () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set multiple filters
      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      await waitFor(() => {
        expect(result.current.eventSubtypes.length).toBeGreaterThan(0)
      })

      act(() => {
        result.current.handleEventSubtypeFilter(2)
        result.current.handleLocationFilter(1)
        result.current.handleDateRangeFilter('2025-12-01', '2025-12-31')
      })

      expect(result.current.hasActiveFilters).toBe(true)

      // Clear all
      act(() => {
        result.current.clearFilters()
      })

      expect(result.current.filters.event_type_id).toBeNull()
      expect(result.current.filters.event_subtype_id).toBeNull()
      expect(result.current.filters.location_id).toBeNull()
      expect(result.current.filters.start_date).toBeNull()
      expect(result.current.filters.end_date).toBeNull()
      expect(result.current.eventSubtypes).toEqual([])
      expect(result.current.hasActiveFilters).toBe(false)
    })
  })

  describe('hasActiveFilters', () => {
    it('should return false when no filters are active', () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      expect(result.current.hasActiveFilters).toBe(false)
    })

    it('should return true when event_type_id is set', async () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      expect(result.current.hasActiveFilters).toBe(true)
    })
  })

  describe('Retry', () => {
    it('should refetch events when retry is called', async () => {
      mockedFetcher.mockImplementation((url: string) => {
        if (url.includes('/public/events')) {
          return Promise.reject(new Error('Network error'))
        }
        if (url.includes('/public/event-types')) {
          return Promise.resolve({ data: mockEventTypes })
        }
        if (url.includes('/public/locations/active')) {
          return Promise.resolve({ data: mockLocations })
        }
        return Promise.resolve({ data: [] })
      })

      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')

      // Mock success for retry
      mockedFetcher.mockImplementation((url: string) => {
        if (url.includes('/public/events')) {
          return Promise.resolve({ data: mockEvents, meta: { current_page: 1, per_page: 10, total: 1 } })
        }
        if (url.includes('/public/event-types')) {
          return Promise.resolve({ data: mockEventTypes })
        }
        if (url.includes('/public/locations/active')) {
          return Promise.resolve({ data: mockLocations })
        }
        return Promise.resolve({ data: [] })
      })

      act(() => {
        result.current.retry()
      })

      await waitFor(() => {
        expect(result.current.error).toBeNull()
        expect(result.current.events).toEqual(mockEvents)
      })
    })
  })

  describe('Complex Cascading Scenarios', () => {
    it('should handle complete filter workflow: type → subtype → clear type', async () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Step 1: Select event type
      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      await waitFor(() => {
        expect(result.current.eventSubtypes.length).toBeGreaterThan(0)
      })

      expect(result.current.filters.event_type_id).toBe(1)

      // Step 2: Select event subtype
      act(() => {
        result.current.handleEventSubtypeFilter(2)
      })

      expect(result.current.filters.event_subtype_id).toBe(2)

      // Step 3: Clear event type → subtype should also reset
      act(() => {
        result.current.handleEventTypeFilter(null)
      })

      expect(result.current.filters.event_type_id).toBeNull()
      expect(result.current.filters.event_subtype_id).toBeNull()
      expect(result.current.eventSubtypes).toEqual([])
    })

    it('should handle switching between event types (cascading reset)', async () => {
      const { result } = renderHook(() => usePublicEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Select type 1 and subtype
      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      await waitFor(() => {
        expect(result.current.eventSubtypes.length).toBeGreaterThan(0)
      })

      act(() => {
        result.current.handleEventSubtypeFilter(2)
      })

      expect(result.current.filters.event_type_id).toBe(1)
      expect(result.current.filters.event_subtype_id).toBe(2)

      // Switch to type 2 → should reset subtype and fetch new subtypes
      const mockType2Subtypes: EventSubtype[] = [
        { id: 3, name: 'Football', slug: 'football', event_type_id: 2, is_active: true }
      ]

      mockedFetcher.mockImplementation((url: string) => {
        if (url.includes('/public/event-types/2/subtypes')) {
          return Promise.resolve({ data: mockType2Subtypes })
        }
        if (url.includes('/public/event-types')) {
          return Promise.resolve({ data: mockEventTypes })
        }
        if (url.includes('/public/locations/active')) {
          return Promise.resolve({ data: mockLocations })
        }
        if (url.includes('/public/events')) {
          return Promise.resolve({ data: mockEvents, meta: { current_page: 1, per_page: 10, total: 1 } })
        }
        return Promise.resolve({ data: [] })
      })

      act(() => {
        result.current.handleEventTypeFilter(2)
      })

      expect(result.current.filters.event_type_id).toBe(2)
      expect(result.current.filters.event_subtype_id).toBeNull()

      await waitFor(() => {
        expect(result.current.eventSubtypes).toEqual(mockType2Subtypes)
      })
    })
  })
})
