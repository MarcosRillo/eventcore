/**
 * InternalCalendarViewContainer Component Tests
 *
 * Tests for calendar view container with BigCalendar and navigation functionality.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { InternalCalendarViewContainer } from '../InternalCalendarViewContainer';
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';
import { useRouter } from 'next/navigation';
import type { InternalCalendarEvent, BigCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';

// Mock dependencies
jest.mock('@/features/internal-calendar/hooks/useInternalCalendarEvents');
jest.mock('next/navigation');
jest.mock('@/features/internal-calendar/components/dumb/BigCalendarView', () => ({
  BigCalendarView: ({ events, loading, onSelectEvent }: {
    events: BigCalendarEvent[];
    loading: boolean;
    onSelectEvent: (event: BigCalendarEvent) => void;
  }) => {
    if (loading) {
      return <div data-testid="loading">Loading calendar...</div>;
    }
    return (
      <div data-testid="big-calendar-view">
        {events.map((event) => (
          <div
            key={event.id}
            data-testid={`calendar-event-${event.id}`}
            onClick={() => onSelectEvent(event)}
          >
            {event.title}
          </div>
        ))}
      </div>
    );
  },
}));

describe('InternalCalendarViewContainer', () => {
  const mockEvents: InternalCalendarEvent[] = [
    {
      id: 1,
      title: 'Conference 2025',
      start_date: '2025-12-15T10:00:00Z',
      end_date: '2025-12-15T12:00:00Z',
      status: { id: 1, status_code: 'approved_internal', status_name: 'Approved', description: 'Event approved for internal use' },
      organization: { id: 1, name: 'Org A' },
      eventType: { id: 1, name: 'Conference', color: '#FF0000' },
    },
    {
      id: 2,
      title: 'Workshop 2025',
      start_date: '2025-12-20T14:00:00Z',
      end_date: '2025-12-20T16:00:00Z',
      status: { id: 2, status_code: 'published', status_name: 'Published', description: 'Event published' },
      organization: { id: 2, name: 'Org B' },
      eventType: { id: 2, name: 'Workshop', color: '#00FF00' },
    },
  ];

  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      loading: false,
      error: null,
    });
  });

  test('should render without crashing', () => {
    render(<InternalCalendarViewContainer />);

    expect(screen.getByTestId('big-calendar-view')).toBeInTheDocument();
  });

  test('should render BigCalendarView with transformed events', () => {
    render(<InternalCalendarViewContainer />);

    // BigCalendarView should be rendered
    expect(screen.getByTestId('big-calendar-view')).toBeInTheDocument();

    // Events should be displayed
    expect(screen.getByTestId('calendar-event-1')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-event-2')).toBeInTheDocument();
    expect(screen.getByText('Conference 2025')).toBeInTheDocument();
    expect(screen.getByText('Workshop 2025')).toBeInTheDocument();
  });

  test('should pass loading state to BigCalendarView', () => {
    (useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: true,
      error: null,
    });

    render(<InternalCalendarViewContainer />);

    // Loading state should be shown
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText(/loading calendar/i)).toBeInTheDocument();
  });

  test('should show error message when there is an error', () => {
    (useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: false,
      error: 'Failed to load events',
    });

    render(<InternalCalendarViewContainer />);

    // Error message should be displayed
    expect(screen.getByText('Failed to load events')).toBeInTheDocument();

    // BigCalendarView should not be rendered
    expect(screen.queryByTestId('big-calendar-view')).not.toBeInTheDocument();
  });

  test('should navigate to event detail page when event is selected', () => {
    render(<InternalCalendarViewContainer />);

    // Click on first event
    const eventElement = screen.getByTestId('calendar-event-1');
    fireEvent.click(eventElement);

    // Should navigate to the event detail page
    expect(mockPush).toHaveBeenCalledWith('/internal-calendar/1');
  });

  test('should navigate to correct event when different events are selected', () => {
    render(<InternalCalendarViewContainer />);

    // Select first event
    const event1 = screen.getByTestId('calendar-event-1');
    fireEvent.click(event1);

    expect(mockPush).toHaveBeenCalledWith('/internal-calendar/1');

    // Select second event
    const event2 = screen.getByTestId('calendar-event-2');
    fireEvent.click(event2);

    expect(mockPush).toHaveBeenCalledWith('/internal-calendar/2');
    expect(mockPush).toHaveBeenCalledTimes(2);
  });

  test('should transform events to BigCalendar format correctly', () => {
    render(<InternalCalendarViewContainer />);

    // Events should be rendered (transformation successful)
    expect(screen.getByTestId('calendar-event-1')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-event-2')).toBeInTheDocument();

    // Should have correct titles from transformed events
    expect(screen.getByText('Conference 2025')).toBeInTheDocument();
    expect(screen.getByText('Workshop 2025')).toBeInTheDocument();
  });

  test('should pass filters to useInternalCalendarEvents hook', () => {
    const filters = { eventTypeId: 1, status: 'published' as const };
    render(<InternalCalendarViewContainer filters={filters} />);

    expect(useInternalCalendarEvents).toHaveBeenCalledWith(filters);
  });

  test('should use empty filters by default', () => {
    render(<InternalCalendarViewContainer />);

    expect(useInternalCalendarEvents).toHaveBeenCalledWith({});
  });
});
