/**
 * InternalCalendarGridContainer Component Tests
 *
 * Tests for the grid view container component.
 */

import { render, screen } from '@testing-library/react';

import { InternalCalendarGridContainer } from '@/features/internal-calendar/components/smart/InternalCalendarGridContainer';
import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';

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
      event_type: {
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
        status_name: 'Published',
        description: 'Event published',
      },
      organization: {
        id: 2,
        name: 'Another Org',
      },
    },
  ];

  const defaultProps = {
    events: mockEvents,
    loading: false,
    error: null,
    basePath: '/internal-calendar',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render InternalCalendar with events', () => {
    render(<InternalCalendarGridContainer {...defaultProps} />);

    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Event 2')).toBeInTheDocument();
  });

  test('should render event cards as links for navigation', () => {
    render(<InternalCalendarGridContainer {...defaultProps} />);

    // Event cards are now Link components, check they exist
    const eventCard1 = screen.getByText('Test Event 1').closest('a');
    expect(eventCard1).toBeInTheDocument();
    expect(eventCard1).toHaveAttribute('href', '/internal-calendar/1');

    const eventCard2 = screen.getByText('Test Event 2').closest('a');
    expect(eventCard2).toBeInTheDocument();
    expect(eventCard2).toHaveAttribute('href', '/internal-calendar/2');
  });

  test('should show loading state correctly', () => {
    render(<InternalCalendarGridContainer {...defaultProps} loading={true} events={[]} />);

    expect(screen.getByText(/cargando eventos/i)).toBeInTheDocument();
  });

  test('should show error state correctly', () => {
    render(<InternalCalendarGridContainer {...defaultProps} error="Failed to fetch events" events={[]} />);

    expect(screen.getByText('Failed to fetch events')).toBeInTheDocument();
  });

  test('should handle empty events array', () => {
    render(<InternalCalendarGridContainer events={[]} loading={false} error={null} basePath="/internal-calendar" />);

    expect(screen.getByRole('heading', { name: /no hay eventos/i })).toBeInTheDocument();
  });
});
