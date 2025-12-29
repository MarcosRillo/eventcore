/**
 * Organizer Calendar Page Tests
 * Tests page rendering and integration with InternalCalendarContainer
 */
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';

import CalendarPage from '../page';

// Mock the hooks
jest.mock('@/features/internal-calendar/hooks/useInternalCalendarEvents');
jest.mock('next/navigation');
jest.mock('@/context/AuthContext');

describe('Organizer Calendar Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
    (useAuth as jest.Mock).mockReturnValue({
      token: 'mock-token',
      user: { id: 1, name: 'Test User' },
      isAuthenticated: true,
    });
    (useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  test('should render view toggle buttons', () => {
    render(<CalendarPage />);

    expect(screen.getByText('Vista Grid')).toBeInTheDocument();
    expect(screen.getByText('Vista Calendario')).toBeInTheDocument();
  });

  test('should render InternalCalendarContainer with organizer events', () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Mi Evento',
        start_date: '2025-12-15',
        end_date: '2025-12-16',
        status: {
          id: 1,
          status_code: 'approved_internal',
          name: 'Approved Internal',
        },
        organization: {
          id: 1,
          name: 'Mi Organización',
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
    expect(screen.getByText('Mi Evento')).toBeInTheDocument();
  });
});
