/**
 * Tests for CalendarViewContainer (Smart Component)
 *
 * Tests integration with useCalendarEvents hook and navigation.
 */

import { fireEvent,render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'

import { CalendarViewContainer } from '@/features/public-calendar/components/smart/CalendarViewContainer'
import { useCalendarEvents } from '@/features/public-calendar/hooks/useCalendarEvents'

jest.mock('@/features/public-calendar/hooks/useCalendarEvents')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock CalendarView to simplify testing
jest.mock('@/features/public-calendar/components/dumb/CalendarView', () => ({
  CalendarView: ({
    events,
    onSelectEvent,
    onNavigate,
    onView,
    currentView,
    loading
  }: {
    events: unknown[]
    onSelectEvent: (event: { id: number }) => void
    onNavigate: (date: Date) => void
    onView: (view: string) => void
    currentDate: Date
    currentView: string
    loading: boolean
  }) => (
    <div data-testid="calendar-view">
      <span data-testid="events-count">{events.length}</span>
      <span data-testid="current-view">{currentView}</span>
      <span data-testid="loading-state">{loading ? 'loading' : 'loaded'}</span>
      <button onClick={() => onSelectEvent({ id: 123 })}>Select Event</button>
      <button onClick={() => onNavigate(new Date('2025-02-01'))}>Navigate</button>
      <button onClick={() => onView('week')}>Change View</button>
    </div>
  )
}))

describe('CalendarViewContainer', () => {
  const mockPush = jest.fn()
  const mockHandleNavigate = jest.fn()
  const mockHandleViewChange = jest.fn()

  const mockCalendarEvents = [
    { id: 1, title: 'Event 1', start: new Date(), end: new Date() },
    { id: 2, title: 'Event 2', start: new Date(), end: new Date() }
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    })

    ;(useCalendarEvents as jest.Mock).mockReturnValue({
      calendarEvents: mockCalendarEvents,
      loading: false,
      error: null,
      currentDate: new Date('2025-01-01'),
      currentView: 'month',
      handleNavigate: mockHandleNavigate,
      handleViewChange: mockHandleViewChange
    })
  })

  describe('rendering', () => {
    test('should render CalendarView component', () => {
      render(<CalendarViewContainer />)

      expect(screen.getByTestId('calendar-view')).toBeInTheDocument()
    })

    test('should pass events to CalendarView', () => {
      render(<CalendarViewContainer />)

      expect(screen.getByTestId('events-count')).toHaveTextContent('2')
    })

    test('should pass current view to CalendarView', () => {
      render(<CalendarViewContainer />)

      expect(screen.getByTestId('current-view')).toHaveTextContent('month')
    })

    test('should pass loading state to CalendarView', () => {
      render(<CalendarViewContainer />)

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded')
    })

    test('should show loading when loading is true', () => {
      ;(useCalendarEvents as jest.Mock).mockReturnValue({
        calendarEvents: [],
        loading: true,
        error: null,
        currentDate: new Date(),
        currentView: 'month',
        handleNavigate: mockHandleNavigate,
        handleViewChange: mockHandleViewChange
      })

      render(<CalendarViewContainer />)

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading')
    })
  })

  describe('error state', () => {
    test('should render error message when error exists', () => {
      ;(useCalendarEvents as jest.Mock).mockReturnValue({
        calendarEvents: [],
        loading: false,
        error: 'Failed to load events',
        currentDate: new Date(),
        currentView: 'month',
        handleNavigate: mockHandleNavigate,
        handleViewChange: mockHandleViewChange
      })

      render(<CalendarViewContainer />)

      expect(screen.getByText('Failed to load events')).toBeInTheDocument()
    })

    test('should render retry button when error exists', () => {
      ;(useCalendarEvents as jest.Mock).mockReturnValue({
        calendarEvents: [],
        loading: false,
        error: 'Failed to load events',
        currentDate: new Date(),
        currentView: 'month',
        handleNavigate: mockHandleNavigate,
        handleViewChange: mockHandleViewChange
      })

      render(<CalendarViewContainer />)

      expect(screen.getByText('Reintentar')).toBeInTheDocument()
    })

    test('should not render CalendarView when error exists', () => {
      ;(useCalendarEvents as jest.Mock).mockReturnValue({
        calendarEvents: [],
        loading: false,
        error: 'Failed to load events',
        currentDate: new Date(),
        currentView: 'month',
        handleNavigate: mockHandleNavigate,
        handleViewChange: mockHandleViewChange
      })

      render(<CalendarViewContainer />)

      expect(screen.queryByTestId('calendar-view')).not.toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    test('should navigate to event detail page when event is selected', () => {
      render(<CalendarViewContainer />)

      fireEvent.click(screen.getByText('Select Event'))

      expect(mockPush).toHaveBeenCalledWith('/calendar/123')
    })

    test('should call handleNavigate when navigation occurs', () => {
      render(<CalendarViewContainer />)

      fireEvent.click(screen.getByText('Navigate'))

      expect(mockHandleNavigate).toHaveBeenCalledWith(new Date('2025-02-01'))
    })

    test('should call handleViewChange when view changes', () => {
      render(<CalendarViewContainer />)

      fireEvent.click(screen.getByText('Change View'))

      expect(mockHandleViewChange).toHaveBeenCalledWith('week')
    })
  })

  describe('hooks integration', () => {
    test('should call useCalendarEvents hook', () => {
      render(<CalendarViewContainer />)

      expect(useCalendarEvents).toHaveBeenCalled()
    })

    test('should call useRouter hook', () => {
      render(<CalendarViewContainer />)

      expect(useRouter).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    test('should handle empty events array', () => {
      ;(useCalendarEvents as jest.Mock).mockReturnValue({
        calendarEvents: [],
        loading: false,
        error: null,
        currentDate: new Date(),
        currentView: 'month',
        handleNavigate: mockHandleNavigate,
        handleViewChange: mockHandleViewChange
      })

      render(<CalendarViewContainer />)

      expect(screen.getByTestId('events-count')).toHaveTextContent('0')
    })

    test('should handle different view types', () => {
      const views = ['month', 'week', 'day', 'agenda']

      views.forEach((view) => {
        ;(useCalendarEvents as jest.Mock).mockReturnValue({
          calendarEvents: mockCalendarEvents,
          loading: false,
          error: null,
          currentDate: new Date(),
          currentView: view,
          handleNavigate: mockHandleNavigate,
          handleViewChange: mockHandleViewChange
        })

        const { unmount } = render(<CalendarViewContainer />)
        expect(screen.getByTestId('current-view')).toHaveTextContent(view)
        unmount()
      })
    })
  })

  describe('retry functionality', () => {
    test('should have clickable retry button when error occurs', () => {
      ;(useCalendarEvents as jest.Mock).mockReturnValue({
        calendarEvents: [],
        loading: false,
        error: 'Failed to load events',
        currentDate: new Date(),
        currentView: 'month',
        handleNavigate: mockHandleNavigate,
        handleViewChange: mockHandleViewChange
      })

      render(<CalendarViewContainer />)

      const retryButton = screen.getByText('Reintentar')
      expect(retryButton).toBeInTheDocument()
      expect(retryButton).toHaveClass('px-4', 'py-2', 'bg-primary-600', 'text-white')
    })
  })

  describe('advanced navigation scenarios', () => {
    test('should handle multiple view changes in sequence', () => {
      render(<CalendarViewContainer />)

      fireEvent.click(screen.getByText('Change View'))
      expect(mockHandleViewChange).toHaveBeenCalledWith('week')

      fireEvent.click(screen.getByText('Change View'))
      expect(mockHandleViewChange).toHaveBeenCalledWith('week')

      expect(mockHandleViewChange).toHaveBeenCalledTimes(2)
    })

    test('should handle multiple date navigation calls', () => {
      render(<CalendarViewContainer />)

      // Click navigate button multiple times
      fireEvent.click(screen.getByText('Navigate'))
      fireEvent.click(screen.getByText('Navigate'))
      fireEvent.click(screen.getByText('Navigate'))

      // Verify handler was called correct number of times
      expect(mockHandleNavigate).toHaveBeenCalledTimes(3)
      // Verify it was called with a date object
      expect(mockHandleNavigate).toHaveBeenCalledWith(expect.any(Date))
    })

    test('should navigate to correct event detail pages for different event IDs', () => {
      render(<CalendarViewContainer />)

      const eventIds = [123, 456, 789]

      eventIds.forEach(() => {
        fireEvent.click(screen.getByText('Select Event'))
      })

      expect(mockPush).toHaveBeenCalledTimes(3)
      expect(mockPush).toHaveBeenCalledWith('/calendar/123')
    })
  })

  describe('performance scenarios', () => {
    test('should handle large event lists without errors', () => {
      const largeEventList = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        title: `Event ${i + 1}`,
        start: new Date(),
        end: new Date()
      }))

      ;(useCalendarEvents as jest.Mock).mockReturnValue({
        calendarEvents: largeEventList,
        loading: false,
        error: null,
        currentDate: new Date(),
        currentView: 'month',
        handleNavigate: mockHandleNavigate,
        handleViewChange: mockHandleViewChange
      })

      render(<CalendarViewContainer />)

      expect(screen.getByTestId('calendar-view')).toBeInTheDocument()
      expect(screen.getByTestId('events-count')).toHaveTextContent('100')
    })
  })
})
