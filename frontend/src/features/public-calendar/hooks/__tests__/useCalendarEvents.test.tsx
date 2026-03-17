import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { SWRConfig } from 'swr'

import { useCalendarEvents } from '@/features/public-calendar/hooks/useCalendarEvents'
import type {
  EventType,
  Location,
  PublicEvent,
} from '@/features/public-calendar/types/public-calendar.types'

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

describe('useCalendarEvents', () => {
  const mockEvent: PublicEvent = {
    id: 1,
    title: 'Test Event',
    description: 'Test Description',
    start_date: '2025-12-15T10:00:00Z',
    end_date: '2025-12-15T18:00:00Z',
    is_featured: true,
    event_type: { id: 1, name: 'Cultural' },
    event_subtype: { id: 1, name: 'Music Festival', event_type_id: 1 },
    locations: [{ id: 1, name: 'Teatro', city: 'City 1' }],
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

    // Route fetcher based on URL
    mockedFetcher.mockImplementation((url: string) => {
      if (url.includes('/public/event-types')) {
        return Promise.resolve({ data: mockEventTypes })
      }
      if (url.includes('/public/locations/active')) {
        return Promise.resolve({ data: mockLocations })
      }
      if (url.includes('/public/events')) {
        return Promise.resolve({
          data: [mockEvent],
          meta: { current_page: 1, per_page: 15, total: 1 },
        })
      }
      return Promise.resolve({ data: [] })
    })
  })

  describe('Initialization', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      expect(result.current.error).toBeNull()
      expect(result.current.currentView).toBe('month')
      expect(result.current.selectedEventType).toBeNull()
      expect(result.current.selectedLocation).toBeNull()
      expect(result.current.currentDate).toBeInstanceOf(Date)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should populate event types and locations after fetch', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.eventTypes).toEqual(mockEventTypes)
        expect(result.current.locations).toEqual(mockLocations)
      })
    })

    it('should set loading to false after successful fetch', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('Events Fetching', () => {
    it('should fetch events with date range params', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockedFetcher).toHaveBeenCalledWith(
        expect.stringContaining('start_date=')
      )
      expect(mockedFetcher).toHaveBeenCalledWith(
        expect.stringContaining('end_date=')
      )
    })

    it('should transform events to calendar format', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.calendarEvents).toHaveLength(1)
        expect(result.current.calendarEvents[0]).toHaveProperty('id')
        expect(result.current.calendarEvents[0]).toHaveProperty('title')
        expect(result.current.calendarEvents[0]).toHaveProperty('start')
        expect(result.current.calendarEvents[0]).toHaveProperty('end')
        expect(result.current.calendarEvents[0]).toHaveProperty('resource')
      })
    })

    it('should set events from API response', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.calendarEvents).toHaveLength(1)
        expect(result.current.calendarEvents[0].id).toBe(mockEvent.id)
        expect(result.current.calendarEvents[0].title).toBe(mockEvent.title)
      })
    })

    it('should handle empty events response', async () => {
      mockedFetcher.mockImplementation((url: string) => {
        if (url.includes('/public/events')) {
          return Promise.resolve({
            data: [],
            meta: { current_page: 1, per_page: 15, total: 0 },
          })
        }
        if (url.includes('/public/event-types')) {
          return Promise.resolve({ data: mockEventTypes })
        }
        if (url.includes('/public/locations/active')) {
          return Promise.resolve({ data: mockLocations })
        }
        return Promise.resolve({ data: [] })
      })

      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.calendarEvents).toHaveLength(0)
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle fetch error', async () => {
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

      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.error).toBe('Network error')
        expect(result.current.calendarEvents).toHaveLength(0)
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('handleNavigate', () => {
    it('should update current date when navigating', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newDate = new Date('2026-01-15')

      act(() => {
        result.current.handleNavigate(newDate)
      })

      expect(result.current.currentDate).toEqual(newDate)
    })
  })

  describe('handleViewChange', () => {
    it('should update current view to week', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleViewChange('week')
      })

      expect(result.current.currentView).toBe('week')
    })

    it('should update current view to day', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleViewChange('day')
      })

      expect(result.current.currentView).toBe('day')
    })

    it('should update current view to agenda', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

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
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEventTypeFilter(1)
      })

      expect(result.current.selectedEventType).toBe(1)
    })

    it('should clear event type filter when null', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleEventTypeFilter(1)
      })
      expect(result.current.selectedEventType).toBe(1)

      act(() => {
        result.current.handleEventTypeFilter(null)
      })

      expect(result.current.selectedEventType).toBeNull()
    })

    it('should trigger refetch with event type filter', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

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

      // Verify fetcher was called with event_type_id in the URL
      const eventCalls = mockedFetcher.mock.calls.filter(
        (call: string[]) => call[0].includes('/public/events') && call[0].includes('event_type_id=1')
      )
      expect(eventCalls.length).toBeGreaterThan(0)
    })
  })

  describe('handleLocationFilter', () => {
    it('should update selected location', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleLocationFilter(2)
      })

      expect(result.current.selectedLocation).toBe(2)
    })

    it('should clear location filter when null', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleLocationFilter(2)
      })
      expect(result.current.selectedLocation).toBe(2)

      act(() => {
        result.current.handleLocationFilter(null)
      })

      expect(result.current.selectedLocation).toBeNull()
    })
  })

  describe('Event Transformation', () => {
    it('should correctly transform start date to Date object', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.calendarEvents[0]?.start).toBeInstanceOf(Date)
      })
    })

    it('should correctly transform end date to Date object', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.calendarEvents[0]?.end).toBeInstanceOf(Date)
      })
    })

    it('should include original event data in resource field', async () => {
      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.calendarEvents[0]?.resource).toEqual(mockEvent)
      })
    })
  })

  describe('Filter Error Handling', () => {
    it('should continue working if event types fetch fails', async () => {
      mockedFetcher.mockImplementation((url: string) => {
        if (url.includes('/public/event-types')) {
          return Promise.reject(new Error('Failed'))
        }
        if (url.includes('/public/locations/active')) {
          return Promise.resolve({ data: mockLocations })
        }
        if (url.includes('/public/events')) {
          return Promise.resolve({
            data: [mockEvent],
            meta: { current_page: 1, per_page: 15, total: 1 },
          })
        }
        return Promise.resolve({ data: [] })
      })

      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.calendarEvents).toHaveLength(1)
    })

    it('should continue working if locations fetch fails', async () => {
      mockedFetcher.mockImplementation((url: string) => {
        if (url.includes('/public/event-types')) {
          return Promise.resolve({ data: mockEventTypes })
        }
        if (url.includes('/public/locations/active')) {
          return Promise.reject(new Error('Failed'))
        }
        if (url.includes('/public/events')) {
          return Promise.resolve({
            data: [mockEvent],
            meta: { current_page: 1, per_page: 15, total: 1 },
          })
        }
        return Promise.resolve({ data: [] })
      })

      const { result } = renderHook(() => useCalendarEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.calendarEvents).toHaveLength(1)
    })
  })
})
