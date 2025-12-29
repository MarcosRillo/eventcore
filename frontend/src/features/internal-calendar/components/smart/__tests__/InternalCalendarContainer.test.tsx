/**
 * InternalCalendarContainer Component Tests (TDD - Updated)
 *
 * Tests for the updated smart container using BigCalendarView.
 * Tests written following TDD methodology.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { InternalCalendarContainer } from '../InternalCalendarContainer'
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents'
import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types'

// Mock the hook
jest.mock('@/features/internal-calendar/hooks/useInternalCalendarEvents')

// Mock BigCalendarView
jest.mock('@/features/internal-calendar/components/dumb/BigCalendarView', () => ({
  BigCalendarView: ({ events, loading, onSelectEvent }: {
    events: { id: number; title: string }[]
    loading: boolean
    onSelectEvent: (event: { id: number; title: string }) => void
  }) => {
    if (loading) {
      return <div data-testid="loading">Cargando eventos...</div>
    }
    return (
      <div data-testid="big-calendar-view">
        {events.map((event) => (
          <button
            key={event.id}
            data-testid={`event-${event.id}`}
            onClick={() => onSelectEvent(event)}
          >
            {event.title}
          </button>
        ))}
      </div>
    )
  },
}))

// Mock EventDetailModal
jest.mock('@/features/internal-calendar/components/dumb/EventDetailModal', () => ({
  EventDetailModal: ({ event, isOpen, onClose }: {
    event: { title: string } | null
    isOpen: boolean
    onClose: () => void
  }) => {
    if (!isOpen || !event) return null
    return (
      <div data-testid="event-detail-modal">
        <div data-testid="modal-event-title">{event.title}</div>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
      </div>
    )
  },
}))

// Mock transform utility
jest.mock('@/features/internal-calendar/utils/calendarEventTransform', () => ({
  transformToBigCalendarEvents: (events: InternalCalendarEvent[]) =>
    events.map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start_date),
      end: new Date(event.end_date),
      color: event.eventType?.color || '#3B82F6',
      resource: event,
    })),
}))

describe('InternalCalendarContainer', () => {
  const mockEvents: InternalCalendarEvent[] = [
    {
      id: 1,
      title: 'Test Event',
      start_date: '2025-12-15T10:00:00.000Z',
      end_date: '2025-12-16T12:00:00.000Z',
      status: {
        id: 1,
        status_code: 'approved_internal',
        status_name: 'Approved Internal',
        description: 'Event approved for internal use',
      },
      organization: {
        id: 1,
        name: 'Test Org',
      },
      eventType: {
        id: 1,
        name: 'Conference',
        color: '#FF5733',
      },
    },
    {
      id: 2,
      title: 'Another Event',
      start_date: '2025-12-20T14:00:00.000Z',
      end_date: '2025-12-20T16:00:00.000Z',
      status: {
        id: 2,
        status_code: 'published',
        name: 'Published',
      },
      organization: {
        id: 2,
        name: 'Another Org',
      },
      eventType: {
        id: 2,
        name: 'Workshop',
        color: '#00FF00',
      },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should display events when loaded successfully', async () => {
    // Arrange
    ;(useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      loading: false,
      error: null,
      refetch: jest.fn(),
    })

    // Act
    render(<InternalCalendarContainer />)

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('big-calendar-view')).toBeInTheDocument()
      expect(screen.getByTestId('event-1')).toBeInTheDocument()
      expect(screen.getByTestId('event-2')).toBeInTheDocument()
    })
  })

  test('should display loading state while fetching', () => {
    // Arrange
    ;(useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: true,
      error: null,
      refetch: jest.fn(),
    })

    // Act
    render(<InternalCalendarContainer />)

    // Assert
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
    expect(screen.queryByTestId('big-calendar-view')).not.toBeInTheDocument()
  })

  test('should display error message when fetch fails', () => {
    // Arrange
    ;(useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: false,
      error: 'Failed to fetch events',
      refetch: jest.fn(),
    })

    // Act
    render(<InternalCalendarContainer />)

    // Assert
    expect(screen.getByText(/error/i)).toBeInTheDocument()
    expect(screen.getByText(/Failed to fetch events/i)).toBeInTheDocument()
  })

  test('should open modal when event is clicked', async () => {
    // Arrange
    ;(useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      loading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<InternalCalendarContainer />)

    // Act
    const eventButton = screen.getByTestId('event-1')
    fireEvent.click(eventButton)

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('event-detail-modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal-event-title')).toHaveTextContent('Test Event')
    })
  })

  test('should close modal when close button is clicked', async () => {
    // Arrange
    ;(useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      loading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<InternalCalendarContainer />)

    // Act - Open modal
    fireEvent.click(screen.getByTestId('event-1'))
    await waitFor(() => {
      expect(screen.getByTestId('event-detail-modal')).toBeInTheDocument()
    })

    // Act - Close modal
    fireEvent.click(screen.getByTestId('modal-close'))

    // Assert - Modal is closed
    await waitFor(() => {
      expect(screen.queryByTestId('event-detail-modal')).not.toBeInTheDocument()
    })
  })

  test('should pass filters to useInternalCalendarEvents hook', () => {
    // Arrange
    const filters = { status: 'approved_internal' as const }
    ;(useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
    })

    // Act
    render(<InternalCalendarContainer filters={filters} />)

    // Assert
    expect(useInternalCalendarEvents).toHaveBeenCalledWith(filters)
  })
})
