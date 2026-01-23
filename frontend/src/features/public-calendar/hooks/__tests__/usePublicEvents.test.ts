/**
 * Tests for usePublicEvents hook
 * Covers cascading filter logic, data fetching, error handling
 */

import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'

import { usePublicEvents } from '@/features/public-calendar/hooks/usePublicEvents'
import { publicEventsService } from '@/features/public-calendar/services/public-events.service'
import type { EventSubtype, EventType, Location,PublicEvent } from '@/features/public-calendar/types/public-calendar.types'

// Mock the service
jest.mock('@/features/public-calendar/services/public-events.service')
const mockService = publicEventsService as jest.Mocked<typeof publicEventsService>

describe('usePublicEvents', () => {
  // Mock data
  const mockEvents: PublicEvent[] = [
    {
      id: 1,
      title: 'Event 1',
      slug: 'event-1',
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

    // Default mock implementations
    mockService.getAll.mockResolvedValue({ data: mockEvents, meta: { current_page: 1, last_page: 1, per_page: 10, total: 1 } })
    mockService.getEventTypes.mockResolvedValue({ data: mockEventTypes })
    mockService.getEventSubtypes.mockResolvedValue({ data: mockEventSubtypes })
    mockService.getLocations.mockResolvedValue({ data: mockLocations })
  })

  describe('Initial State', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => usePublicEvents())

      // Initial state before data loads
      expect(result.current.loading).toBe(true)
      expect(result.current.events).toEqual([])
      expect(result.current.eventTypes).toEqual([])
      expect(result.current.eventSubtypes).toEqual([])
      expect(result.current.locations).toEqual([])
      expect(result.current.hasActiveFilters).toBe(false)

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should initialize filters with null values', () => {
      const { result } = renderHook(() => usePublicEvents())

      expect(result.current.filters.event_type_id).toBeNull()
      expect(result.current.filters.event_subtype_id).toBeNull()
      expect(result.current.filters.location_id).toBeNull()
      expect(result.current.filters.start_date).toBeNull()
      expect(result.current.filters.end_date).toBeNull()
    })
  })

  describe('Data Fetching', () => {
    it('should fetch events, event types, and locations on mount', async () => {
      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockService.getAll).toHaveBeenCalledTimes(1)
      expect(mockService.getEventTypes).toHaveBeenCalledTimes(1)
      expect(mockService.getLocations).toHaveBeenCalledTimes(1)
      expect(result.current.events).toEqual(mockEvents)
      expect(result.current.eventTypes).toEqual(mockEventTypes)
      expect(result.current.locations).toEqual(mockLocations)
    })

    it('should fetch events with default null filters', async () => {
      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockService.getAll).toHaveBeenCalledWith({
        event_type_id: null,
        event_subtype_id: null,
        location_id: null,
        start_date: null,
        end_date: null
      })
    })

    it('should handle errors when fetching events', async () => {
      mockService.getAll.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to load events')
      expect(result.current.events).toEqual([])
    })

    it('should silently handle errors when fetching event types and locations', async () => {
      mockService.getEventTypes.mockRejectedValueOnce(new Error('Network error'))
      mockService.getLocations.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should not break, just keep empty arrays
      expect(result.current.eventTypes).toEqual([])
      expect(result.current.locations).toEqual([])
      expect(result.current.error).toBeNull() // Error only set for events fetch
    })
  })

  describe('EventType Filter (Cascading Trigger)', () => {
    it('should update event_type_id filter when handleEventTypeFilter is called', async () => {
      const { result } = renderHook(() => usePublicEvents())

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
      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // First set subtype
      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      await waitFor(() => {
        expect(result.current.eventSubtypes.length).toBeGreaterThan(0)
      })

      act(() => {
        result.current.handleEventSubtypeFilter(2)
      })

      expect(result.current.filters.event_subtype_id).toBe(2)

      // Now change event type - subtype should reset
      act(() => {
        result.current.handleEventTypeFilter(2)
      })

      expect(result.current.filters.event_type_id).toBe(2)
      expect(result.current.filters.event_subtype_id).toBeNull() // RESET!
    })

    it('should fetch event subtypes when event type is selected', async () => {
      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      await waitFor(() => {
        expect(mockService.getEventSubtypes).toHaveBeenCalledWith(1)
      })

      await waitFor(() => {
        expect(result.current.eventSubtypes).toEqual(mockEventSubtypes)
      })
    })

    it('should clear event subtypes when event type is set to null', async () => {
      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // First select a type to load subtypes
      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      await waitFor(() => {
        expect(result.current.eventSubtypes.length).toBeGreaterThan(0)
      })

      // Now clear the type
      act(() => {
        result.current.handleEventTypeFilter(null)
      })

      expect(result.current.filters.event_type_id).toBeNull()
      expect(result.current.eventSubtypes).toEqual([])
      expect(mockService.getEventSubtypes).toHaveBeenCalledTimes(1) // Not called again for null
    })

    it('should refetch events when event_type_id changes', async () => {
      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialCallCount = mockService.getAll.mock.calls.length

      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      await waitFor(() => {
        expect(mockService.getAll).toHaveBeenCalledTimes(initialCallCount + 1)
      })

      expect(mockService.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({
          event_type_id: 1,
          event_subtype_id: null // Reset
        })
      )
    })
  })

  describe('EventSubtype Filter', () => {
    it('should update event_subtype_id filter when handleEventSubtypeFilter is called', async () => {
      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEventSubtypeFilter(2)
      })

      expect(result.current.filters.event_subtype_id).toBe(2)
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('should refetch events when event_subtype_id changes', async () => {
      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialCallCount = mockService.getAll.mock.calls.length

      act(() => {
        result.current.handleEventSubtypeFilter(2)
      })

      await waitFor(() => {
        expect(mockService.getAll).toHaveBeenCalledTimes(initialCallCount + 1)
      })

      expect(mockService.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({
          event_subtype_id: 2
        })
      )
    })

    it('should clear event_subtype_id when set to null', async () => {
      const { result } = renderHook(() => usePublicEvents())

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
      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleLocationFilter(1)
      })

      expect(result.current.filters.location_id).toBe(1)
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('should refetch events when location_id changes', async () => {
      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialCallCount = mockService.getAll.mock.calls.length

      act(() => {
        result.current.handleLocationFilter(1)
      })

      await waitFor(() => {
        expect(mockService.getAll).toHaveBeenCalledTimes(initialCallCount + 1)
      })

      expect(mockService.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({
          location_id: 1
        })
      )
    })
  })

  describe('Date Range Filter', () => {
    it('should update date filters when handleDateRangeFilter is called', async () => {
      const { result } = renderHook(() => usePublicEvents())

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

    it('should refetch events when date range changes', async () => {
      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialCallCount = mockService.getAll.mock.calls.length

      act(() => {
        result.current.handleDateRangeFilter('2025-12-01', '2025-12-31')
      })

      await waitFor(() => {
        expect(mockService.getAll).toHaveBeenCalledTimes(initialCallCount + 1)
      })

      expect(mockService.getAll).toHaveBeenLastCalledWith(
        expect.objectContaining({
          start_date: '2025-12-01',
          end_date: '2025-12-31'
        })
      )
    })
  })

  describe('Clear Filters', () => {
    it('should reset all filters when clearFilters is called', async () => {
      const { result } = renderHook(() => usePublicEvents())

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

    it('should refetch events after clearing filters', async () => {
      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      await waitFor(() => {
        expect(mockService.getAll).toHaveBeenCalled()
      })

      const callCountBeforeClear = mockService.getAll.mock.calls.length

      act(() => {
        result.current.clearFilters()
      })

      await waitFor(() => {
        expect(mockService.getAll).toHaveBeenCalledTimes(callCountBeforeClear + 1)
      })

      expect(mockService.getAll).toHaveBeenLastCalledWith({
        event_type_id: null,
        event_subtype_id: null,
        location_id: null,
        start_date: null,
        end_date: null
      })
    })
  })

  describe('hasActiveFilters', () => {
    it('should return false when no filters are active', () => {
      const { result } = renderHook(() => usePublicEvents())

      expect(result.current.hasActiveFilters).toBe(false)
    })

    it('should return true when event_type_id is set', async () => {
      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('should return true when any filter is set', async () => {
      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleLocationFilter(1)
      })

      expect(result.current.hasActiveFilters).toBe(true)

      act(() => {
        result.current.clearFilters()
      })

      expect(result.current.hasActiveFilters).toBe(false)
    })
  })

  describe('Retry', () => {
    it('should refetch events when retry is called', async () => {
      mockService.getAll.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to load events')

      // Mock success for retry
      mockService.getAll.mockResolvedValueOnce({ data: mockEvents, meta: { current_page: 1, last_page: 1, per_page: 10, total: 1 } })

      act(() => {
        result.current.retry()
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeNull()
      expect(result.current.events).toEqual(mockEvents)
    })
  })

  describe('Complex Cascading Scenarios', () => {
    it('should handle complete filter workflow: type → subtype → clear type', async () => {
      const { result } = renderHook(() => usePublicEvents())

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
      expect(mockService.getEventSubtypes).toHaveBeenCalledWith(1)

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
      const { result } = renderHook(() => usePublicEvents())

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
      mockService.getEventSubtypes.mockResolvedValueOnce({ data: mockType2Subtypes })

      act(() => {
        result.current.handleEventTypeFilter(2)
      })

      await waitFor(() => {
        expect(mockService.getEventSubtypes).toHaveBeenCalledWith(2)
      })

      expect(result.current.filters.event_type_id).toBe(2)
      expect(result.current.filters.event_subtype_id).toBeNull() // RESET!

      await waitFor(() => {
        expect(result.current.eventSubtypes).toEqual(mockType2Subtypes)
      })
    })
  })
})
