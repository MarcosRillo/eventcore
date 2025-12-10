/**
 * Admin Calendar Page Tests
 * Tests page rendering and integration with InternalCalendarContainer
 */
import { render, screen } from '@testing-library/react';
import CalendarPage from '../page';
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Mock the hooks
jest.mock('@/features/internal-calendar/hooks/useInternalCalendarEvents');
jest.mock('@/context/AuthContext');
jest.mock('next/navigation');

describe('Admin Calendar Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
    (useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
    (useAuth as jest.Mock).mockReturnValue({
      token: 'mock-token',
      user: { id: 1, name: 'Test User' },
      isAuthenticated: true,
    });
  });

  test('should render view toggle buttons', () => {
    render(<CalendarPage />);

    expect(screen.getByText('Vista Grid')).toBeInTheDocument();
    expect(screen.getByText('Vista Calendario')).toBeInTheDocument();
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
