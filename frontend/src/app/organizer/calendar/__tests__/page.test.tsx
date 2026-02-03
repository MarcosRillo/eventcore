/**
 * Organizer Calendar Page Tests
 *
 * Tests basic page rendering and initial layout.
 * Detailed event rendering is tested in container tests.
 */
import { render, screen } from '@testing-library/react';

import { useAuth } from '@/context/AuthContext';
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';

import CalendarPage from '../page';

// Mock the hooks
jest.mock('@/features/internal-calendar/hooks/useInternalCalendarEvents');
jest.mock('@/context/AuthContext');

const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/organizer/calendar',
}));

// Mock the event types service
jest.mock('@/features/event-types/services/eventType.service', () => ({
  getEventTypes: jest.fn().mockResolvedValue({ data: [] }),
}));

// Mock the internal calendar service
jest.mock('@/features/internal-calendar/services/internalCalendar.service', () => ({
  internalCalendarService: {
    getAvailableStatuses: jest.fn().mockResolvedValue([]),
  },
}));

describe('Organizer Calendar Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
