/**
 * InternalCalendarGridContainer Component Tests
 *
 * Tests for the grid view container component with navigation functionality.
 */

import { fireEvent,render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { InternalCalendarGridContainer } from '@/features/internal-calendar/components/smart/InternalCalendarGridContainer';
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';
import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';

// Mock the hooks
jest.mock('@/features/internal-calendar/hooks/useInternalCalendarEvents');
jest.mock('next/navigation');

describe('InternalCalendarGridContainer', () => {
  const mockEvents: InternalCalendarEvent[] = [
    {
      id: 1,
      title: 'Test Event 1',
      start_date: '2025-12-15T10:00:00Z',
      end_date: '2025-12-15T12:00:00Z',
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
      title: 'Test Event 2',
      start_date: '2025-12-20T14:00:00Z',
      end_date: '2025-12-20T16:00:00Z',
      status: {
        id: 2,
        status_code: 'published',
        name: 'Published',
      },
      organization: {
        id: 2,
        name: 'Another Org',
      },
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

  test('should render InternalCalendar with events', () => {
    render(<InternalCalendarGridContainer />);

    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Event 2')).toBeInTheDocument();
  });

  test('should navigate to event detail page when event is clicked', () => {
    render(<InternalCalendarGridContainer />);

    // Click on the first event card
    const eventCard = screen.getByText('Test Event 1').closest('div');
    expect(eventCard).toBeInTheDocument();

    if (eventCard) {
      fireEvent.click(eventCard);
    }

    // Should navigate to the event detail page
    expect(mockPush).toHaveBeenCalledWith('/internal-calendar/1');
  });

  test('should navigate to correct event when different events are clicked', () => {
    render(<InternalCalendarGridContainer />);

    // Click on first event
    const eventCard1 = screen.getByText('Test Event 1').closest('div');
    if (eventCard1) {
      fireEvent.click(eventCard1);
    }

    expect(mockPush).toHaveBeenCalledWith('/internal-calendar/1');

    // Click on second event
    const eventCard2 = screen.getByText('Test Event 2').closest('div');
    if (eventCard2) {
      fireEvent.click(eventCard2);
    }

    expect(mockPush).toHaveBeenCalledWith('/internal-calendar/2');
    expect(mockPush).toHaveBeenCalledTimes(2);
  });

  test('should show loading state correctly', () => {
    (useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: true,
      error: null,
    });

    render(<InternalCalendarGridContainer />);

    expect(screen.getByText(/cargando eventos/i)).toBeInTheDocument();
  });

  test('should show error state correctly', () => {
    (useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: false,
      error: 'Failed to fetch events',
    });

    render(<InternalCalendarGridContainer />);

    expect(screen.getByText('Failed to fetch events')).toBeInTheDocument();
  });

  test('should pass filters to useInternalCalendarEvents hook', () => {
    const filters = { eventTypeId: 1, status: 'published' as const };
    render(<InternalCalendarGridContainer filters={filters} />);

    expect(useInternalCalendarEvents).toHaveBeenCalledWith(filters);
  });

  test('should use empty filters by default', () => {
    render(<InternalCalendarGridContainer />);

    expect(useInternalCalendarEvents).toHaveBeenCalledWith({});
  });
});
