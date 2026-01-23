import { act, renderHook, waitFor } from '@testing-library/react'

import { useCalendarEvents } from '@/features/public-calendar/hooks/useCalendarEvents'
import { publicEventsService } from '@/features/public-calendar/services/public-events.service'
import {
  EventsResponse,
  EventType,
  Location,
  PublicEvent,
} from '@/features/public-calendar/types/public-calendar.types'

// Mock dependencies
jest.mock('@/features/public-calendar/services/public-events.service')
jest.mock('date-fns', () => ({
  startOfMonth: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), 1)),
  endOfMonth: jest.fn((date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'yyyy-MM-dd') {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    return ''
  }),
}))

const mockPublicEventsService = publicEventsService as jest.Mocked<typeof publicEventsService>

describe('useCalendarEvents', () => {
  const mockEvent: PublicEvent = {
    id: 1,
    title: 'Test Event',
    description: 'Test Description',
    start_date: '2025-12-15T10:00:00Z',
    end_date: '2025-12-15T18:00:00Z',
    is_featured: true,
    event_type: { id: 1, name: 'Cultural' },
    event_subtype: { id: 1, name: 'Music Festival' },
    locations: [{ id: 1, name: 'Teatro', city: 'City 1' }],
  }

  const mockEventsResponse: EventsResponse = {
    data: [mockEvent],
    meta: {
      current_page: 1,
      per_page: 15,
      total: 1,
    },
  }

  const mockEventTypes: EventType[] = [
    { id: 1, name: 'Cultural', is_active: true },
    { id: 2, name: 'Business', is_active: true },
  ]

  const mockLocations: Location[] = [
    { id: 1, name: 'Teatro', city: 'City 1' },
    { id: 2, name: 'Estadio', city: 'City 2' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mocks
    mockPublicEventsService.getAll.mockResolvedValue(mockEventsResponse)
    mockPublicEventsService.getEventTypes.mockResolvedValue({ data: mockEventTypes })
    mockPublicEventsService.getLocations.mockResolvedValue({ data: mockLocations })
  })

  describe('Initialization', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.currentView).toBe('month')
      expect(result.current.selectedEventType).toBeNull()
      expect(result.current.selectedLocation).toBeNull()
      expect(result.current.currentDate).toBeInstanceOf(Date)

      // Wait for async effects to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should fetch event types and locations on mount', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(mockPublicEventsService.getEventTypes).toHaveBeenCalled()
        expect(mockPublicEventsService.getLocations).toHaveBeenCalled()
      })

      // Wait for all async effects to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should fetch events on mount', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(mockPublicEventsService.getAll).toHaveBeenCalled()
      })

      // Wait for all async effects to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should populate event types and locations after fetch', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.eventTypes).toEqual(mockEventTypes)
        expect(result.current.locations).toEqual(mockLocations)
      })

      // Wait for all async effects to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should set loading to false after successful fetch', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('Events Fetching', () => {
    it('should fetch events with date range params', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(mockPublicEventsService.getAll).toHaveBeenCalledWith(
          expect.objectContaining({
            start_date: expect.any(String),
            end_date: expect.any(String),
            page: 1,
          })
        )
      })

      // Wait for all async effects to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should transform events to calendar format', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.calendarEvents).toHaveLength(1)
        expect(result.current.calendarEvents[0]).toHaveProperty('id')
        expect(result.current.calendarEvents[0]).toHaveProperty('title')
        expect(result.current.calendarEvents[0]).toHaveProperty('start')
        expect(result.current.calendarEvents[0]).toHaveProperty('end')
        expect(result.current.calendarEvents[0]).toHaveProperty('resource')
      })

      // Wait for all async effects to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should set events from API response', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.calendarEvents).toHaveLength(1)
        expect(result.current.calendarEvents[0].id).toBe(mockEvent.id)
        expect(result.current.calendarEvents[0].title).toBe(mockEvent.title)
      })

      // Wait for all async effects to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle empty events response', async () => {
      mockPublicEventsService.getAll.mockResolvedValueOnce({
        data: [],
        meta: {
          current_page: 1,
          per_page: 15,
          total: 0,
        },
      })

      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.calendarEvents).toHaveLength(0)
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle fetch error', async () => {
      mockPublicEventsService.getAll.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load calendar events')
        expect(result.current.calendarEvents).toHaveLength(0)
        expect(result.current.loading).toBe(false)
      })
    })

    it('should clear previous error on successful fetch', async () => {
      mockPublicEventsService.getAll
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce(mockEventsResponse)

      const { result, rerender } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load calendar events')
      })

      act(() => {
        result.current.handleNavigate(new Date())
      })

      rerender()

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })

      // Wait for all async effects to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('handleNavigate', () => {
    it('should update current date when navigating', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newDate = new Date('2026-01-15')

      act(() => {
        result.current.handleNavigate(newDate)
      })

      expect(result.current.currentDate).toEqual(newDate)

      // Wait for refetch to complete after navigation
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should trigger refetch when navigating to new date', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialCallCount = mockPublicEventsService.getAll.mock.calls.length

      act(() => {
        result.current.handleNavigate(new Date('2026-01-01'))
      })

      await waitFor(() => {
        expect(mockPublicEventsService.getAll.mock.calls.length).toBeGreaterThan(initialCallCount)
      })

      // Wait for refetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('handleViewChange', () => {
    it('should update current view to week', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleViewChange('week')
      })

      expect(result.current.currentView).toBe('week')
    })

    it('should update current view to day', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleViewChange('day')
      })

      expect(result.current.currentView).toBe('day')
    })

    it('should update current view to agenda', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleViewChange('agenda')
      })

      expect(result.current.currentView).toBe('agenda')
    })
  })

  describe('handleEventTypeFilter', () => {
    it('should update selected event type', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      expect(result.current.selectedEventType).toBe(1)

      // Wait for refetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should clear event type filter when null', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEventTypeFilter(1)
      })
      expect(result.current.selectedEventType).toBe(1)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEventTypeFilter(null)
      })

      expect(result.current.selectedEventType).toBeNull()

      // Wait for refetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should trigger refetch with event type filter', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialCallCount = mockPublicEventsService.getAll.mock.calls.length

      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      await waitFor(() => {
        expect(mockPublicEventsService.getAll.mock.calls.length).toBeGreaterThan(initialCallCount)
      })

      await waitFor(() => {
        expect(mockPublicEventsService.getAll).toHaveBeenCalledWith(
          expect.objectContaining({
            event_type_id: 1,
          })
        )
      })

      // Wait for refetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('handleLocationFilter', () => {
    it('should update selected location', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleLocationFilter(2)
      })

      expect(result.current.selectedLocation).toBe(2)

      // Wait for refetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should clear location filter when null', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleLocationFilter(2)
      })
      expect(result.current.selectedLocation).toBe(2)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleLocationFilter(null)
      })

      expect(result.current.selectedLocation).toBeNull()

      // Wait for refetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should trigger refetch with location filter', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const initialCallCount = mockPublicEventsService.getAll.mock.calls.length

      act(() => {
        result.current.handleLocationFilter(2)
      })

      await waitFor(() => {
        expect(mockPublicEventsService.getAll.mock.calls.length).toBeGreaterThan(initialCallCount)
      })

      await waitFor(() => {
        expect(mockPublicEventsService.getAll).toHaveBeenCalledWith(
          expect.objectContaining({
            location_id: 2,
          })
        )
      })

      // Wait for refetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('Combined Filters', () => {
    it('should apply both event type and location filters', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEventTypeFilter(1)
        result.current.handleLocationFilter(2)
      })

      await waitFor(() => {
        expect(mockPublicEventsService.getAll).toHaveBeenCalledWith(
          expect.objectContaining({
            event_type_id: 1,
            location_id: 2,
          })
        )
      })

      // Wait for refetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('Filter Error Handling', () => {
    it('should continue working if event types fetch fails', async () => {
      mockPublicEventsService.getEventTypes.mockRejectedValueOnce(new Error('Failed'))

      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should still fetch events even if event types failed
      expect(mockPublicEventsService.getAll).toHaveBeenCalled()
      expect(result.current.calendarEvents).toHaveLength(1)
    })

    it('should continue working if locations fetch fails', async () => {
      mockPublicEventsService.getLocations.mockRejectedValueOnce(new Error('Failed'))

      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should still fetch events even if locations failed
      expect(mockPublicEventsService.getAll).toHaveBeenCalled()
      expect(result.current.calendarEvents).toHaveLength(1)
    })

    it('should handle both filters failing gracefully', async () => {
      mockPublicEventsService.getEventTypes.mockRejectedValueOnce(new Error('Failed'))
      mockPublicEventsService.getLocations.mockRejectedValueOnce(new Error('Failed'))

      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.eventTypes).toHaveLength(0)
      expect(result.current.locations).toHaveLength(0)
      expect(result.current.calendarEvents).toHaveLength(1)
    })
  })

  describe('Event Transformation', () => {
    it('should correctly transform start date to Date object', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.calendarEvents[0].start).toBeInstanceOf(Date)
      })

      // Wait for all async effects to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should correctly transform end date to Date object', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.calendarEvents[0].end).toBeInstanceOf(Date)
      })

      // Wait for all async effects to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should include original event data in resource field', async () => {
      const { result } = renderHook(() => useCalendarEvents())

      await waitFor(() => {
        expect(result.current.calendarEvents[0].resource).toEqual(mockEvent)
      })

      // Wait for all async effects to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })
})
