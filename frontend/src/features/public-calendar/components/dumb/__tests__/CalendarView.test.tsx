/**
 * Tests for CalendarView (Dumb Component)
 *
 * Tests rendering of react-big-calendar with events and callbacks.
 */

import { render, screen } from '@testing-library/react'

import { CalendarView } from '@/features/public-calendar/components/dumb/CalendarView'
import { CalendarEvent, CalendarView as CalendarViewType } from '@/features/public-calendar/types/public-calendar.types'

// Mock react-big-calendar
jest.mock('react-big-calendar', () => ({
  Calendar: ({ events, onSelectEvent, onNavigate, onView, date, view }: {
    events: unknown[]
    onSelectEvent: (event: unknown) => void
    onNavigate: (date: Date) => void
    onView: (view: string) => void
    date: Date
    view: string
  }) => (
    <div data-testid="calendar">
      <span data-testid="events-count">{events.length}</span>
      <span data-testid="current-view">{view}</span>
      <span data-testid="current-date">{date.toISOString()}</span>
      <button onClick={() => onSelectEvent(events[0])}>Select Event</button>
      <button onClick={() => onNavigate(new Date('2025-02-01'))}>Navigate</button>
      <button onClick={() => onView('week')}>Change View</button>
    </div>
  ),
  dateFnsLocalizer: () => ({}),
}))

// Mock CSS imports
jest.mock('react-big-calendar/lib/css/react-big-calendar.css', () => ({}))
jest.mock('@/features/public-calendar/styles/calendar.css', () => ({}))

describe('CalendarView', () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: 1,
      title: 'Event 1',
      start: new Date('2025-01-15'),
      end: new Date('2025-01-15'),
      resource: {
        id: 1,
        title: 'Event 1',
        description: 'Description 1',
        start_date: '2025-01-15',
        end_date: '2025-01-15',
        is_featured: false,
        locations: [{ id: 1, name: 'Location 1', city: 'City 1' }],
        event_type: { id: 1, name: 'Cultural' },
        event_subtype: { id: 1, name: 'Music Festival', event_type_id: 1 }
      }
    },
    {
      id: 2,
      title: 'Event 2',
      start: new Date('2025-01-20'),
      end: new Date('2025-01-20'),
      resource: {
        id: 2,
        title: 'Event 2',
        description: 'Description 2',
        start_date: '2025-01-20',
        end_date: '2025-01-20',
        is_featured: false,
        locations: [{ id: 2, name: 'Location 2', city: 'City 2' }],
        event_type: { id: 2, name: 'Business' },
        event_subtype: { id: 2, name: 'Conference', event_type_id: 2 }
      }
    }
  ]

  const mockOnSelectEvent = jest.fn()
  const mockOnNavigate = jest.fn()
  const mockOnView = jest.fn()
  const currentDate = new Date('2025-01-01')
  const currentView: CalendarViewType = 'month'

  const defaultProps = {
    events: mockEvents,
    onSelectEvent: mockOnSelectEvent,
    onNavigate: mockOnNavigate,
    onView: mockOnView,
    currentDate,
    currentView
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    test('should render calendar component', () => {
      render(<CalendarView {...defaultProps} />)

      expect(screen.getByTestId('calendar')).toBeInTheDocument()
    })

    test('should pass events to calendar', () => {
      render(<CalendarView {...defaultProps} />)

      expect(screen.getByTestId('events-count')).toHaveTextContent('2')
    })

    test('should pass current view to calendar', () => {
      render(<CalendarView {...defaultProps} />)

      expect(screen.getByTestId('current-view')).toHaveTextContent('month')
    })

    test('should pass current date to calendar', () => {
      render(<CalendarView {...defaultProps} />)

      expect(screen.getByTestId('current-date')).toHaveTextContent('2025-01-01')
    })

    test('should render with different view types', () => {
      const views: CalendarViewType[] = ['month', 'week', 'day', 'agenda']

      views.forEach((view) => {
        const { unmount } = render(
          <CalendarView {...defaultProps} currentView={view} />
        )
        expect(screen.getByTestId('current-view')).toHaveTextContent(view)
        unmount()
      })
    })
  })

  describe('loading state', () => {
    test('should show loading spinner when loading is true', () => {
      render(<CalendarView {...defaultProps} loading={true} />)

      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    test('should not show loading spinner when loading is false', () => {
      render(<CalendarView {...defaultProps} loading={false} />)

      const spinner = document.querySelector('.animate-spin')
      expect(spinner).not.toBeInTheDocument()
    })

    test('should show loading overlay with correct styles', () => {
      render(<CalendarView {...defaultProps} loading={true} />)

      const overlay = document.querySelector('.bg-white\\/50')
      expect(overlay).toBeInTheDocument()
    })
  })

  describe('callbacks', () => {
    test('should call onSelectEvent when event is selected', () => {
      render(<CalendarView {...defaultProps} />)

      screen.getByText('Select Event').click()

      expect(mockOnSelectEvent).toHaveBeenCalledWith(mockEvents[0])
    })

    test('should call onNavigate when navigation occurs', () => {
      render(<CalendarView {...defaultProps} />)

      screen.getByText('Navigate').click()

      expect(mockOnNavigate).toHaveBeenCalledWith(new Date('2025-02-01'))
    })

    test('should call onView when view changes', () => {
      render(<CalendarView {...defaultProps} />)

      screen.getByText('Change View').click()

      expect(mockOnView).toHaveBeenCalledWith('week')
    })
  })

  describe('empty state', () => {
    test('should render calendar with empty events', () => {
      render(<CalendarView {...defaultProps} events={[]} />)

      expect(screen.getByTestId('events-count')).toHaveTextContent('0')
      expect(screen.getByTestId('calendar')).toBeInTheDocument()
    })
  })

  describe('styling', () => {
    test('should have container with correct classes', () => {
      render(<CalendarView {...defaultProps} />)

      const container = document.querySelector('.bg-white.rounded-lg.shadow-sm')
      expect(container).toBeInTheDocument()
    })

    test('should have calendar container with responsive height classes', () => {
      render(<CalendarView {...defaultProps} />)

      const calendarContainer = document.querySelector('.calendar-container')
      expect(calendarContainer).toBeInTheDocument()
      expect(calendarContainer).toHaveClass('h-[500px]', 'sm:h-[600px]', 'md:h-[700px]', 'lg:h-[800px]')
    })
  })

  describe('props handling', () => {
    test('should use default loading value of false', () => {
      render(
        <CalendarView
          events={mockEvents}
          onSelectEvent={mockOnSelectEvent}
          onNavigate={mockOnNavigate}
          onView={mockOnView}
          currentDate={currentDate}
          currentView={currentView}
        />
      )

      const spinner = document.querySelector('.animate-spin')
      expect(spinner).not.toBeInTheDocument()
    })
  })
})
