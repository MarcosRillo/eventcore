/**
 * Admin Calendar Page Tests
 * Tests page rendering and integration with InternalCalendarContainer
 */
import { render, screen } from '@testing-library/react';
import CalendarPage from '../page';
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';

// Mock the hook
jest.mock('@/features/internal-calendar/hooks/useInternalCalendarEvents');

describe('Admin Calendar Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  test('should render page title', () => {
    render(<CalendarPage />);

    expect(screen.getByText('Calendario Interno')).toBeInTheDocument();
  });

  test('should render InternalCalendarContainer', () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Test Event',
        start_date: '2025-12-15',
        end_date: '2025-12-16',
        status: {
          id: 1,
          status_code: 'approved_internal',
          name: 'Approved Internal',
        },
        organization: {
          id: 1,
          name: 'Test Org',
        },
      },
    ];

    (useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<CalendarPage />);

    // Should render events from container
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });
});
