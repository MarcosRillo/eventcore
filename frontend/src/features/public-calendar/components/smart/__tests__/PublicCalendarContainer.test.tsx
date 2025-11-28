/**
 * Tests for PublicCalendarContainer (Smart Component)
 *
 * Tests integration with usePublicEvents hook and navigation.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { PublicCalendarContainer } from '../PublicCalendarContainer'
import { usePublicEvents } from '@/features/public-calendar/hooks/usePublicEvents'
import { useRouter } from 'next/navigation'

jest.mock('@/features/public-calendar/hooks/usePublicEvents')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock PublicCalendar to simplify testing
jest.mock('@/features/public-calendar/components/dumb/PublicCalendar', () => ({
  PublicCalendar: ({
    events,
    categories,
    locations,
    loading,
    error,
    onCategoryFilter,
    onLocationFilter,
    onEventClick
  }: {
    events: unknown[]
    categories: unknown[]
    locations: unknown[]
    loading: boolean
    error: string | null
    onCategoryFilter: (id: number | null) => void
    onLocationFilter: (id: number | null) => void
    onEventClick: (id: number) => void
  }) => (
    <div data-testid="public-calendar">
      <span data-testid="events-count">{events.length}</span>
      <span data-testid="categories-count">{categories.length}</span>
      <span data-testid="locations-count">{locations.length}</span>
      <span data-testid="loading-state">{loading ? 'loading' : 'loaded'}</span>
      <span data-testid="error-state">{error || 'no-error'}</span>
      <button onClick={() => onCategoryFilter(1)}>Filter Category 1</button>
      <button onClick={() => onCategoryFilter(null)}>Clear Category Filter</button>
      <button onClick={() => onLocationFilter(2)}>Filter Location 2</button>
      <button onClick={() => onLocationFilter(null)}>Clear Location Filter</button>
      <button onClick={() => onEventClick(456)}>Click Event</button>
    </div>
  )
}))

describe('PublicCalendarContainer', () => {
  const mockPush = jest.fn()
  const mockHandleCategoryFilter = jest.fn()
  const mockHandleLocationFilter = jest.fn()

  const mockEvents = [
    { id: 1, title: 'Event 1' },
    { id: 2, title: 'Event 2' },
    { id: 3, title: 'Event 3' }
  ]

  const mockCategories = [
    { id: 1, name: 'Category 1' },
    { id: 2, name: 'Category 2' }
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
      categories: mockCategories,
      locations: mockLocations,
      loading: false,
      error: null,
      handleCategoryFilter: mockHandleCategoryFilter,
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

    test('should pass categories to PublicCalendar', () => {
      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('categories-count')).toHaveTextContent('2')
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
        categories: [],
        locations: [],
        loading: true,
        error: null,
        handleCategoryFilter: mockHandleCategoryFilter,
        handleLocationFilter: mockHandleLocationFilter
      })

      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading')
    })

    test('should pass error to PublicCalendar', () => {
      ;(usePublicEvents as jest.Mock).mockReturnValue({
        events: [],
        categories: [],
        locations: [],
        loading: false,
        error: 'Failed to load',
        handleCategoryFilter: mockHandleCategoryFilter,
        handleLocationFilter: mockHandleLocationFilter
      })

      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to load')
    })
  })

  describe('filtering', () => {
    test('should call handleCategoryFilter when category filter is applied', () => {
      render(<PublicCalendarContainer />)

      fireEvent.click(screen.getByText('Filter Category 1'))

      expect(mockHandleCategoryFilter).toHaveBeenCalledWith(1)
    })

    test('should call handleCategoryFilter with null to clear filter', () => {
      render(<PublicCalendarContainer />)

      fireEvent.click(screen.getByText('Clear Category Filter'))

      expect(mockHandleCategoryFilter).toHaveBeenCalledWith(null)
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
        categories: mockCategories,
        locations: mockLocations,
        loading: false,
        error: null,
        handleCategoryFilter: mockHandleCategoryFilter,
        handleLocationFilter: mockHandleLocationFilter
      })

      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('events-count')).toHaveTextContent('0')
    })

    test('should handle empty categories array', () => {
      ;(usePublicEvents as jest.Mock).mockReturnValue({
        events: mockEvents,
        categories: [],
        locations: mockLocations,
        loading: false,
        error: null,
        handleCategoryFilter: mockHandleCategoryFilter,
        handleLocationFilter: mockHandleLocationFilter
      })

      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('categories-count')).toHaveTextContent('0')
    })

    test('should handle empty locations array', () => {
      ;(usePublicEvents as jest.Mock).mockReturnValue({
        events: mockEvents,
        categories: mockCategories,
        locations: [],
        loading: false,
        error: null,
        handleCategoryFilter: mockHandleCategoryFilter,
        handleLocationFilter: mockHandleLocationFilter
      })

      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('locations-count')).toHaveTextContent('0')
    })

    test('should handle all data being empty', () => {
      ;(usePublicEvents as jest.Mock).mockReturnValue({
        events: [],
        categories: [],
        locations: [],
        loading: false,
        error: null,
        handleCategoryFilter: mockHandleCategoryFilter,
        handleLocationFilter: mockHandleLocationFilter
      })

      render(<PublicCalendarContainer />)

      expect(screen.getByTestId('public-calendar')).toBeInTheDocument()
      expect(screen.getByTestId('events-count')).toHaveTextContent('0')
      expect(screen.getByTestId('categories-count')).toHaveTextContent('0')
      expect(screen.getByTestId('locations-count')).toHaveTextContent('0')
    })
  })
})
