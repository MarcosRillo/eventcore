/**
 * Admin Calendar Page Tests
 *
 * Tests basic page rendering and initial layout.
 * Detailed event rendering is tested in container tests.
 */
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';

import CalendarPage from '../page';


// Mock the hooks
jest.mock('@/features/internal-calendar/hooks/useInternalCalendarEvents');
jest.mock('@/context/AuthContext');
jest.mock('next/navigation');

// Mock the event types service
jest.mock('@/features/event-types/services/eventType.service', () => ({
  getEventTypes: jest.fn().mockResolvedValue({ data: [] }),
}));

// Mock the internal calendar stats service
jest.mock('@/features/internal-calendar/services/internalCalendar.service', () => ({
  getInternalCalendarStats: jest.fn().mockResolvedValue({ data: { approved: 0, pending: 0, published: 0 } }),
}));

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

  test('should render filter bar with correct labels', () => {
    render(<CalendarPage />);

    // Filter labels
    expect(screen.getByText('Tipo de Evento')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Desde')).toBeInTheDocument();
    expect(screen.getByText('Hasta')).toBeInTheDocument();
  });

  test('should render calendar view by default', () => {
    render(<CalendarPage />);

    // Calendar view button should be active (pressed)
    const calendarButton = screen.getByText('Vista Calendario').closest('button');
    expect(calendarButton).toHaveAttribute('aria-pressed', 'true');
  });
});
