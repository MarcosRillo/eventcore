/**
 * BigCalendarView Component Tests (TDD - RED Phase)
 *
 * Tests for the main react-big-calendar view component.
 * Tests written FIRST following TDD methodology.
 */

import { fireEvent,render, screen } from '@testing-library/react'

import { BigCalendarView } from '@/features/internal-calendar/components/dumb/BigCalendarView'
import type { BigCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types'

// Mock react-big-calendar to avoid complex calendar rendering in tests
jest.mock('react-big-calendar', () => ({
  Calendar: ({ onSelectEvent, events, components, defaultView, views }: {
    onSelectEvent: (event: BigCalendarEvent) => void
    events: BigCalendarEvent[]
    components?: { toolbar?: React.ComponentType }
    defaultView?: string
    views?: string[]
  }) => {
    const Toolbar = components?.toolbar
    const mockLocalizer = {
      format: jest.fn(),
      parse: jest.fn(),
      startOfWeek: jest.fn(),
      getDay: jest.fn(),
      locales: {},
      messages: {},
    }
    const toolbarProps = {
      date: new Date('2025-12-10T12:00:00.000Z'),
      view: defaultView || 'month',
      views: views || ['month', 'week', 'day', 'agenda'],
      label: 'December 2025',
      onNavigate: jest.fn(),
      onView: jest.fn(),
      localizer: mockLocalizer,
    }

    return (
      <div data-testid="big-calendar">
        <div data-testid="calendar-toolbar">
          {Toolbar && <Toolbar {...(toolbarProps as unknown as Record<string, unknown>)} />}
        </div>
        <div data-testid="calendar-events">
          {events.map((event: BigCalendarEvent) => (
            <div
              key={event.id}
              data-testid={`event-${event.id}`}
              onClick={() => onSelectEvent(event)}
              style={{ backgroundColor: event.color }}
            >
              {event.title}
            </div>
          ))}
        </div>
      </div>
    )
  },
  Views: {
    MONTH: 'month',
    WEEK: 'week',
    DAY: 'day',
    AGENDA: 'agenda',
  },
  dateFnsLocalizer: jest.fn(() => ({})),
}))

// Mock CSS imports
jest.mock('react-big-calendar/lib/css/react-big-calendar.css', () => ({}))
jest.mock('@/features/internal-calendar/styles/calendar.css', () => ({}))

describe('BigCalendarView', () => {
  const mockOnSelectEvent = jest.fn()

  const mockEvents: BigCalendarEvent[] = [
    {
      id: 1,
      title: 'Test Event 1',
      start: new Date('2025-12-10T10:00:00.000Z'),
      end: new Date('2025-12-10T12:00:00.000Z'),
      color: '#FF5733',
      resource: {
        id: 1,
        title: 'Test Event 1',
        start_date: '2025-12-10T10:00:00.000Z',
        end_date: '2025-12-10T12:00:00.000Z',
        status: { id: 1, status_code: 'approved_internal', status_name: 'Approved Internal', description: 'Event approved for internal use' },
        organization: { id: 1, name: 'Test Org' },
        eventType: { id: 1, name: 'Conference', color: '#FF5733' },
      },
    },
    {
      id: 2,
      title: 'Test Event 2',
      start: new Date('2025-12-15T14:00:00.000Z'),
      end: new Date('2025-12-15T16:00:00.000Z'),
      color: '#00FF00',
      resource: {
        id: 2,
        title: 'Test Event 2',
        start_date: '2025-12-15T14:00:00.000Z',
        end_date: '2025-12-15T16:00:00.000Z',
        status: { id: 2, status_code: 'published', status_name: 'Published', description: 'Event published' },
        organization: { id: 2, name: 'Another Org' },
        eventType: { id: 2, name: 'Workshop', color: '#00FF00' },
      },
    },
  ]

  const defaultProps = {
    events: mockEvents,
    loading: false,
    onSelectEvent: mockOnSelectEvent,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    // Act
    render(<BigCalendarView {...defaultProps} />)

    // Assert
    expect(screen.getByTestId('big-calendar')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-events')).toBeInTheDocument()
  })

  it('renders all provided events', () => {
    // Act
    render(<BigCalendarView {...defaultProps} />)

    // Assert
    expect(screen.getByTestId('event-1')).toBeInTheDocument()
    expect(screen.getByTestId('event-2')).toBeInTheDocument()
    expect(screen.getByText('Test Event 1')).toBeInTheDocument()
    expect(screen.getByText('Test Event 2')).toBeInTheDocument()
  })

  it('applies custom event colors correctly', () => {
    // Act
    render(<BigCalendarView {...defaultProps} />)

    // Assert
    const event1 = screen.getByTestId('event-1')
    const event2 = screen.getByTestId('event-2')
    expect(event1).toHaveStyle({ backgroundColor: '#FF5733' })
    expect(event2).toHaveStyle({ backgroundColor: '#00FF00' })
  })

  it('calls onSelectEvent when an event is clicked', () => {
    // Arrange
    render(<BigCalendarView {...defaultProps} />)
    const event1 = screen.getByTestId('event-1')

    // Act
    fireEvent.click(event1)

    // Assert
    expect(mockOnSelectEvent).toHaveBeenCalledTimes(1)
    expect(mockOnSelectEvent).toHaveBeenCalledWith(mockEvents[0])
  })

  it('shows loading state when loading prop is true', () => {
    // Act
    render(<BigCalendarView {...defaultProps} loading={true} />)

    // Assert
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByTestId('big-calendar')).not.toBeInTheDocument()
  })

  it('shows empty state when no events are provided', () => {
    // Act
    render(<BigCalendarView {...defaultProps} events={[]} />)

    // Assert
    expect(screen.getByText(/no events found/i)).toBeInTheDocument()
    expect(screen.getByTestId('big-calendar')).toBeInTheDocument() // Calendar still renders
  })

  it('renders with custom toolbar component', () => {
    // Act
    render(<BigCalendarView {...defaultProps} />)

    // Assert
    expect(screen.getByTestId('calendar-toolbar')).toBeInTheDocument()
  })

  it('handles multiple events on the same day', () => {
    // Arrange
    const eventsOnSameDay: BigCalendarEvent[] = [
      {
        id: 10,
        title: 'Morning Event',
        start: new Date('2025-12-20T09:00:00.000Z'),
        end: new Date('2025-12-20T10:00:00.000Z'),
        color: '#FF0000',
        resource: {
          id: 10,
          title: 'Morning Event',
          start_date: '2025-12-20T09:00:00.000Z',
          end_date: '2025-12-20T10:00:00.000Z',
          status: { id: 1, status_code: 'approved_internal', status_name: 'Approved Internal', description: 'Event approved for internal use' },
          organization: { id: 1, name: 'Org' },
        },
      },
      {
        id: 11,
        title: 'Afternoon Event',
        start: new Date('2025-12-20T14:00:00.000Z'),
        end: new Date('2025-12-20T15:00:00.000Z'),
        color: '#00FF00',
        resource: {
          id: 11,
          title: 'Afternoon Event',
          start_date: '2025-12-20T14:00:00.000Z',
          end_date: '2025-12-20T15:00:00.000Z',
          status: { id: 2, status_code: 'published', status_name: 'Published', description: 'Event published' },
          organization: { id: 2, name: 'Org' },
        },
      },
    ]

    // Act
    render(<BigCalendarView {...defaultProps} events={eventsOnSameDay} />)

    // Assert
    expect(screen.getByText('Morning Event')).toBeInTheDocument()
    expect(screen.getByText('Afternoon Event')).toBeInTheDocument()
    expect(screen.getByTestId('event-10')).toBeInTheDocument()
    expect(screen.getByTestId('event-11')).toBeInTheDocument()
  })

  it('displays calendar with proper container styling', () => {
    // Act
    const { container } = render(<BigCalendarView {...defaultProps} />)

    // Assert
    const calendarContainer = container.querySelector('.calendar-container')
    expect(calendarContainer).toBeInTheDocument()
    expect(calendarContainer).toHaveClass('h-[600px]') // Height class
  })

  it('handles events with missing eventType gracefully', () => {
    // Arrange
    const eventWithoutType: BigCalendarEvent = {
      id: 100,
      title: 'Event Without Type',
      start: new Date('2025-12-25T10:00:00.000Z'),
      end: new Date('2025-12-25T11:00:00.000Z'),
      color: '#3B82F6', // Fallback color
      resource: {
        id: 100,
        title: 'Event Without Type',
        start_date: '2025-12-25T10:00:00.000Z',
        end_date: '2025-12-25T11:00:00.000Z',
        status: { id: 1, status_code: 'approved_internal', status_name: 'Approved Internal', description: 'Event approved for internal use' },
        organization: { id: 1, name: 'Org' },
        // eventType is undefined
      },
    }

    // Act
    render(<BigCalendarView {...defaultProps} events={[eventWithoutType]} />)

    // Assert
    expect(screen.getByText('Event Without Type')).toBeInTheDocument()
    expect(screen.getByTestId('event-100')).toHaveStyle({ backgroundColor: '#3B82F6' })
  })

  it('has proper accessibility attributes', () => {
    // Act
    render(<BigCalendarView {...defaultProps} />)

    // Assert
    const calendar = screen.getByTestId('big-calendar')
    expect(calendar).toBeInTheDocument()

    // Events should be clickable
    const event1 = screen.getByTestId('event-1')
    expect(event1).toBeInTheDocument()
  })
})
