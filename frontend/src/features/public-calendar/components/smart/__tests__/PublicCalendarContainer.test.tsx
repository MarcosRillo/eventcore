/**
 * Tests for PublicCalendarContainer (Smart Component)
 *
 * Tests integration with usePublicEvents hook and navigation.
 */

import { fireEvent,render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'

import { PublicCalendarContainer } from '@/features/public-calendar/components/smart/PublicCalendarContainer'
import { usePublicEvents } from '@/features/public-calendar/hooks/usePublicEvents'

jest.mock('@/features/public-calendar/hooks/usePublicEvents')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock PublicCalendar to simplify testing
jest.mock('@/features/public-calendar/components/dumb/PublicCalendar', () => ({
  PublicCalendar: ({
    events,
    eventTypes,
    eventSubtypes,
    locations,
    loading,
    error,
    onEventTypeFilter,
    onEventSubtypeFilter,
    onLocationFilter,
    onEventClick
  }: {
    events: unknown[]
    eventTypes: unknown[]
    eventSubtypes: unknown[]
    locations: unknown[]
    loading: boolean
    error: string | null
    onEventTypeFilter: (id: number | null) => void
    onEventSubtypeFilter: (id: number | null) => void
    onLocationFilter: (id: number | null) => void
    onEventClick: (id: number) => void
  }) => (
    <div data-testid="public-calendar">
      <span data-testid="events-count">{events.length}</span>
      <span data-testid="event-types-count">{eventTypes.length}</span>
      <span data-testid="event-subtypes-count">{eventSubtypes.length}</span>
      <span data-testid="locations-count">{locations.length}</span>
      <span data-testid="loading-state">{loading ? 'loading' : 'loaded'}</span>
      <span data-testid="error-state">{error || 'no-error'}</span>
      <button onClick={() => onEventTypeFilter(1)}>Filter EventType 1</button>
      <button onClick={() => onEventTypeFilter(null)}>Clear EventType Filter</button>
      <button onClick={() => onEventSubtypeFilter(2)}>Filter EventSubtype 2</button>
      <button onClick={() => onLocationFilter(2)}>Filter Location 2</button>
      <button onClick={() => onLocationFilter(null)}>Clear Location Filter</button>
      <button onClick={() => onEventClick(456)}>Click Event</button>
    </div>
  )
}))

describe('PublicCalendarContainer', () => {
  const mockPush = jest.fn()
  const mockHandleEventTypeFilter = jest.fn()
  const mockHandleEventSubtypeFilter = jest.fn()
  const mockHandleLocationFilter = jest.fn()

  const mockEvents = [
    { id: 1, title: 'Event 1' },
    { id: 2, title: 'Event 2' },
    { id: 3, title: 'Event 3' }
  ]

  const mockEventTypes = [
    { id: 1, name: 'Cultural', is_active: true },
    { id: 2, name: 'Business', is_active: true }
  ]

  const mockEventSubtypes = [
    { id: 1, name: 'Festival', event_type_id: 1, is_active: true },
    { id: 2, name: 'Conference', event_type_id: 2, is_active: true }
  ]

  const mockLocations = [
    { id: 1, name: 'Location 1' },
    { id: 2, name: 'Location 2' },
    { id: 3, name: 'Location 3' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })

    ;(usePublicEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      eventTypes: mockEventTypes,
      eventSubtypes: mockEventSubtypes,
      locations: mockLocations,
      loading: false,
      error: null,
      handleEventTypeFilter: mockHandleEventTypeFilter,
      handleEventSubtypeFilter: mockHandleEventSubtypeFilter,
      handleLocationFilter: mockHandleLocationFilter
    })
  })

  describe('rendering', () => {
    test('should render PublicCalendar component', () => {
      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('public-calendar')).toBeInTheDocument()
    })

    test('should pass events to PublicCalendar', () => {
      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('events-count')).toHaveTextContent('3')
    })

    test('should pass event types to PublicCalendar', () => {
      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('event-types-count')).toHaveTextContent('2')
    })

    test('should pass locations to PublicCalendar', () => {
      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('locations-count')).toHaveTextContent('3')
    })

    test('should pass loading state to PublicCalendar', () => {
      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded')
    })

    test('should show loading when loading is true', () => {
      ;(usePublicEvents as jest.Mock).mockReturnValue({
        events: [],
        eventTypes: [],
        eventSubtypes: [],
        locations: [],
        loading: true,
        error: null,
        handleEventTypeFilter: mockHandleEventTypeFilter,
        handleEventSubtypeFilter: mockHandleEventSubtypeFilter,
        handleLocationFilter: mockHandleLocationFilter
      })

      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading')
    })

    test('should pass error to PublicCalendar', () => {
      ;(usePublicEvents as jest.Mock).mockReturnValue({
        events: [],
        eventTypes: [],
        eventSubtypes: [],
        locations: [],
        loading: false,
        error: 'Failed to load',
        handleEventTypeFilter: mockHandleEventTypeFilter,
        handleEventSubtypeFilter: mockHandleEventSubtypeFilter,
        handleLocationFilter: mockHandleLocationFilter
      })

      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to load')
    })
  })

  describe('filtering', () => {
    test('should call handleEventTypeFilter when event type filter is applied', () => {
      render(<PublicCalendarContainer />)

      fireEvent.click(screen.getByText('Filter EventType 1'))

      expect(mockHandleEventTypeFilter).toHaveBeenCalledWith(1)
    })

    test('should call handleEventTypeFilter with null to clear filter', () => {
      render(<PublicCalendarContainer />)

      fireEvent.click(screen.getByText('Clear EventType Filter'))

      expect(mockHandleEventTypeFilter).toHaveBeenCalledWith(null)
    })

    test('should call handleLocationFilter when location filter is applied', () => {
      render(<PublicCalendarContainer />)

      fireEvent.click(screen.getByText('Filter Location 2'))

      expect(mockHandleLocationFilter).toHaveBeenCalledWith(2)
    })

    test('should call handleLocationFilter with null to clear filter', () => {
      render(<PublicCalendarContainer />)

      fireEvent.click(screen.getByText('Clear Location Filter'))

      expect(mockHandleLocationFilter).toHaveBeenCalledWith(null)
    })
  })

  describe('navigation', () => {
    test('should navigate to event detail page when event is clicked', () => {
      render(<PublicCalendarContainer />)

      fireEvent.click(screen.getByText('Click Event'))

      expect(mockPush).toHaveBeenCalledWith('/calendar/456')
    })

    test('should construct correct URL for different event IDs', () => {
      render(<PublicCalendarContainer />)

      fireEvent.click(screen.getByText('Click Event'))

      expect(mockPush).toHaveBeenCalledWith('/calendar/456')
    })
  })

  describe('hooks integration', () => {
    test('should call usePublicEvents hook', () => {
      render(<PublicCalendarContainer />)

      expect(usePublicEvents).toHaveBeenCalled()
    })

    test('should call useRouter hook', () => {
      render(<PublicCalendarContainer />)

      expect(useRouter).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    test('should handle empty events array', () => {
      ;(usePublicEvents as jest.Mock).mockReturnValue({
        events: [],
        eventTypes: mockEventTypes,
        eventSubtypes: mockEventSubtypes,
        locations: mockLocations,
        loading: false,
        error: null,
        handleEventTypeFilter: mockHandleEventTypeFilter,
        handleEventSubtypeFilter: mockHandleEventSubtypeFilter,
        handleLocationFilter: mockHandleLocationFilter
      })

      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('events-count')).toHaveTextContent('0')
    })

    test('should handle empty event types array', () => {
      ;(usePublicEvents as jest.Mock).mockReturnValue({
        events: mockEvents,
        eventTypes: [],
        eventSubtypes: [],
        locations: mockLocations,
        loading: false,
        error: null,
        handleEventTypeFilter: mockHandleEventTypeFilter,
        handleEventSubtypeFilter: mockHandleEventSubtypeFilter,
        handleLocationFilter: mockHandleLocationFilter
      })

      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('event-types-count')).toHaveTextContent('0')
    })

    test('should handle empty locations array', () => {
      ;(usePublicEvents as jest.Mock).mockReturnValue({
        events: mockEvents,
        eventTypes: mockEventTypes,
        eventSubtypes: mockEventSubtypes,
        locations: [],
        loading: false,
        error: null,
        handleEventTypeFilter: mockHandleEventTypeFilter,
        handleEventSubtypeFilter: mockHandleEventSubtypeFilter,
        handleLocationFilter: mockHandleLocationFilter
      })

      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('locations-count')).toHaveTextContent('0')
    })

    test('should handle all data being empty', () => {
      ;(usePublicEvents as jest.Mock).mockReturnValue({
        events: [],
        eventTypes: [],
        eventSubtypes: [],
        locations: [],
        loading: false,
        error: null,
        handleEventTypeFilter: mockHandleEventTypeFilter,
        handleEventSubtypeFilter: mockHandleEventSubtypeFilter,
        handleLocationFilter: mockHandleLocationFilter
      })

      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('public-calendar')).toBeInTheDocument()
      expect(screen.getByTestId('events-count')).toHaveTextContent('0')
      expect(screen.getByTestId('event-types-count')).toHaveTextContent('0')
      expect(screen.getByTestId('locations-count')).toHaveTextContent('0')
    })
  })

  describe('filter state management', () => {
    test('should pass hasActiveFilters as false when no filters are active', () => {
      ;(usePublicEvents as jest.Mock).mockReturnValue({
        events: mockEvents,
        eventTypes: mockEventTypes,
        eventSubtypes: mockEventSubtypes,
        locations: mockLocations,
        loading: false,
        error: null,
        hasActiveFilters: false,
        handleEventTypeFilter: mockHandleEventTypeFilter,
        handleEventSubtypeFilter: mockHandleEventSubtypeFilter,
        handleLocationFilter: mockHandleLocationFilter
      })

      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('public-calendar')).toBeInTheDocument()
    })

    test('should pass hasActiveFilters as true when filters are active', () => {
      ;(usePublicEvents as jest.Mock).mockReturnValue({
        events: mockEvents,
        eventTypes: mockEventTypes,
        eventSubtypes: mockEventSubtypes,
        locations: mockLocations,
        loading: false,
        error: null,
        hasActiveFilters: true,
        handleEventTypeFilter: mockHandleEventTypeFilter,
        handleEventSubtypeFilter: mockHandleEventSubtypeFilter,
        handleLocationFilter: mockHandleLocationFilter
      })

      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('public-calendar')).toBeInTheDocument()
    })

    test('should pass clearFilters callback to PublicCalendar', () => {
      const mockClearFilters = jest.fn()
      ;(usePublicEvents as jest.Mock).mockReturnValue({
        events: mockEvents,
        eventTypes: mockEventTypes,
        eventSubtypes: mockEventSubtypes,
        locations: mockLocations,
        loading: false,
        error: null,
        hasActiveFilters: true,
        handleEventTypeFilter: mockHandleEventTypeFilter,
        handleEventSubtypeFilter: mockHandleEventSubtypeFilter,
        handleLocationFilter: mockHandleLocationFilter,
        clearFilters: mockClearFilters
      })

      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('public-calendar')).toBeInTheDocument()
    })

    test('should pass event subtype filter callback to PublicCalendar', () => {
      render(<PublicCalendarContainer />)

      fireEvent.click(screen.getByText('Filter EventSubtype 2'))

      expect(mockHandleEventSubtypeFilter).toHaveBeenCalledWith(2)
    })
  })

  describe('advanced filtering scenarios', () => {
    test('should handle event type and location filters simultaneously', () => {
      render(<PublicCalendarContainer />)

      fireEvent.click(screen.getByText('Filter EventType 1'))
      fireEvent.click(screen.getByText('Filter Location 2'))

      expect(mockHandleEventTypeFilter).toHaveBeenCalledWith(1)
      expect(mockHandleLocationFilter).toHaveBeenCalledWith(2)
    })

    test('should handle filter clearing and reapplication', () => {
      render(<PublicCalendarContainer />)

      fireEvent.click(screen.getByText('Filter EventType 1'))
      expect(mockHandleEventTypeFilter).toHaveBeenCalledWith(1)

      fireEvent.click(screen.getByText('Clear EventType Filter'))
      expect(mockHandleEventTypeFilter).toHaveBeenCalledWith(null)

      fireEvent.click(screen.getByText('Filter EventType 1'))
      expect(mockHandleEventTypeFilter).toHaveBeenCalledWith(1)
      expect(mockHandleEventTypeFilter).toHaveBeenCalledTimes(3)
    })

    test('should handle all three filter types in sequence', () => {
      render(<PublicCalendarContainer />)

      fireEvent.click(screen.getByText('Filter EventType 1'))
      fireEvent.click(screen.getByText('Filter EventSubtype 2'))
      fireEvent.click(screen.getByText('Filter Location 2'))

      expect(mockHandleEventTypeFilter).toHaveBeenCalledWith(1)
      expect(mockHandleEventSubtypeFilter).toHaveBeenCalledWith(2)
      expect(mockHandleLocationFilter).toHaveBeenCalledWith(2)
    })
  })
})
