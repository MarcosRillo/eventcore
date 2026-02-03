/**
 * InternalCalendarPageContainer Component Tests
 *
 * Tests for the main page container with view toggle, stats bar, and URL sync.
 */

import { fireEvent, render, screen } from '@testing-library/react';

import { useAuth } from '@/context/AuthContext';
import { InternalCalendarPageContainer } from '@/features/internal-calendar/components/smart/InternalCalendarPageContainer';
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';
import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';

// Mock dependencies
jest.mock('@/context/AuthContext');
jest.mock('@/features/internal-calendar/hooks/useInternalCalendarEvents');
jest.mock('@/features/event-types/services/eventType.service', () => ({
  getEventTypes: jest.fn().mockResolvedValue({ data: [] }),
}));
jest.mock('@/features/internal-calendar/services/internalCalendar.service', () => ({
  internalCalendarService: {
    getAvailableStatuses: jest.fn().mockResolvedValue([]),
  },
}));

const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => '/internal-calendar',
}));

jest.mock('../StatsBarContainer', () => ({
  StatsBarContainer: ({ token }: { token: string }) => (
    <div data-testid="stats-bar-container">StatsBar with token: {token}</div>
  ),
}));
jest.mock('../InternalCalendarGridContainer', () => ({
  InternalCalendarGridContainer: ({ events, loading, error, basePath }: {
    events: InternalCalendarEvent[];
    loading: boolean;
    error: string | null;
    basePath: string;
  }) => (
    <div data-testid="grid-container">
      Grid View - Events: {events.length}, Loading: {String(loading)}, Error: {error || 'none'}, BasePath: {basePath}
    </div>
  ),
}));
jest.mock('../InternalCalendarViewContainer', () => ({
  InternalCalendarViewContainer: ({ events, loading, error, basePath }: {
    events: InternalCalendarEvent[];
    loading: boolean;
    error: string | null;
    basePath: string;
  }) => (
    <div data-testid="calendar-container">
      Calendar View - Events: {events.length}, Loading: {String(loading)}, Error: {error || 'none'}, BasePath: {basePath}
    </div>
  ),
}));

describe('InternalCalendarPageContainer', () => {
  const mockEvents: InternalCalendarEvent[] = [
    {
      id: 1,
      title: 'Test Event',
      start_date: '2025-12-15',
      end_date: '2025-12-15',
      status: { id: 1, status_code: 'approved_internal', status_name: 'Approved', description: 'Approved' },
      organization: { id: 1, name: 'Org' },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      token: 'mock-token-12345',
      user: { id: 1, name: 'Test User' },
      isAuthenticated: true,
    });
    (useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      loading: false,
      error: null,
    });
  });

  test('should render without crashing', () => {
    render(<InternalCalendarPageContainer basePath="/internal-calendar" />);

    // Should have main container
    expect(screen.getByTestId('stats-bar-container')).toBeInTheDocument();
    expect(screen.getByText('Vista Grid')).toBeInTheDocument();
    expect(screen.getByText('Vista Calendario')).toBeInTheDocument();
  });

  test('should render StatsBarContainer with auth token', () => {
    render(<InternalCalendarPageContainer basePath="/internal-calendar" />);

    const statsBar = screen.getByTestId('stats-bar-container');
    expect(statsBar).toBeInTheDocument();
    expect(statsBar).toHaveTextContent('StatsBar with token: mock-token-12345');
  });

  test('should render both view toggle buttons', () => {
    render(<InternalCalendarPageContainer basePath="/internal-calendar" />);

    const gridButton = screen.getByText('Vista Grid');
    const calendarButton = screen.getByText('Vista Calendario');

    expect(gridButton).toBeInTheDocument();
    expect(calendarButton).toBeInTheDocument();
    expect(gridButton.closest('button')).toBeInTheDocument();
    expect(calendarButton.closest('button')).toBeInTheDocument();
  });

  test('should default to calendar view', () => {
    render(<InternalCalendarPageContainer basePath="/internal-calendar" />);

    // Calendar view should be rendered by default
    expect(screen.getByTestId('calendar-container')).toBeInTheDocument();
    expect(screen.queryByTestId('grid-container')).not.toBeInTheDocument();

    // Calendar button should be active
    const calendarButton = screen.getByText('Vista Calendario').closest('button');
    expect(calendarButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should switch to grid view when grid button is clicked', () => {
    render(<InternalCalendarPageContainer basePath="/internal-calendar" />);

    // Initially calendar view
    expect(screen.getByTestId('calendar-container')).toBeInTheDocument();
    expect(screen.queryByTestId('grid-container')).not.toBeInTheDocument();

    // Click grid button
    const gridButton = screen.getByText('Vista Grid').closest('button');
    if (gridButton) {
      fireEvent.click(gridButton);
    }

    // Should switch to grid view
    expect(screen.getByTestId('grid-container')).toBeInTheDocument();
    expect(screen.queryByTestId('calendar-container')).not.toBeInTheDocument();
  });

  test('should switch back to calendar view when calendar button is clicked', () => {
    render(<InternalCalendarPageContainer basePath="/internal-calendar" />);

    // Switch to grid view first
    const gridButton = screen.getByText('Vista Grid').closest('button');
    if (gridButton) {
      fireEvent.click(gridButton);
    }
    expect(screen.getByTestId('grid-container')).toBeInTheDocument();

    // Click calendar button
    const calendarButton = screen.getByText('Vista Calendario').closest('button');
    if (calendarButton) {
      fireEvent.click(calendarButton);
    }

    // Should switch back to calendar view
    expect(screen.getByTestId('calendar-container')).toBeInTheDocument();
    expect(screen.queryByTestId('grid-container')).not.toBeInTheDocument();
  });

  test('should have correct aria-pressed attributes on buttons', () => {
    render(<InternalCalendarPageContainer basePath="/internal-calendar" />);

    const gridButton = screen.getByText('Vista Grid').closest('button');
    const calendarButton = screen.getByText('Vista Calendario').closest('button');

    // Initially calendar is active
    expect(gridButton).toHaveAttribute('aria-pressed', 'false');
    expect(calendarButton).toHaveAttribute('aria-pressed', 'true');

    // Click grid button
    if (gridButton) {
      fireEvent.click(gridButton);
    }

    // Grid should be active now
    expect(gridButton).toHaveAttribute('aria-pressed', 'true');
    expect(calendarButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('should apply active styles to selected view button', () => {
    render(<InternalCalendarPageContainer basePath="/internal-calendar" />);

    const gridButton = screen.getByText('Vista Grid').closest('button');
    const calendarButton = screen.getByText('Vista Calendario').closest('button');

    // Initially calendar button has active styles
    expect(calendarButton).toHaveClass('bg-white');
    expect(calendarButton).toHaveClass('text-neutral-900');
    expect(calendarButton).toHaveClass('shadow-sm');

    // Grid button has inactive styles
    expect(gridButton).toHaveClass('text-neutral-600');

    // Click grid button
    if (gridButton) {
      fireEvent.click(gridButton);
    }

    // Grid button should have active styles
    expect(gridButton).toHaveClass('bg-white');
    expect(gridButton).toHaveClass('text-neutral-900');
    expect(gridButton).toHaveClass('shadow-sm');

    // Calendar button should have inactive styles
    expect(calendarButton).toHaveClass('text-neutral-600');
  });

  test('should handle missing auth token gracefully', () => {
    (useAuth as jest.Mock).mockReturnValue({
      token: null,
      user: null,
      isAuthenticated: false,
    });

    render(<InternalCalendarPageContainer basePath="/internal-calendar" />);

    // Should render with empty token
    const statsBar = screen.getByTestId('stats-bar-container');
    expect(statsBar).toHaveTextContent('StatsBar with token:');

    // Rest of component should still work
    expect(screen.getByText('Vista Grid')).toBeInTheDocument();
    expect(screen.getByText('Vista Calendario')).toBeInTheDocument();
  });

  test('should pass events to view containers', () => {
    render(<InternalCalendarPageContainer basePath="/internal-calendar" />);

    // Calendar view receives events
    expect(screen.getByTestId('calendar-container')).toHaveTextContent('Events: 1');
    expect(screen.getByTestId('calendar-container')).toHaveTextContent('Loading: false');
    expect(screen.getByTestId('calendar-container')).toHaveTextContent('Error: none');
  });

  test('should pass loading state to view containers', () => {
    (useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: true,
      error: null,
    });

    render(<InternalCalendarPageContainer basePath="/internal-calendar" />);

    expect(screen.getByTestId('calendar-container')).toHaveTextContent('Loading: true');
  });

  test('should pass error state to view containers', () => {
    (useInternalCalendarEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: false,
      error: 'Failed to load',
    });

    render(<InternalCalendarPageContainer basePath="/internal-calendar" />);

    expect(screen.getByTestId('calendar-container')).toHaveTextContent('Error: Failed to load');
  });

  test('should update URL when view mode changes to grid', () => {
    render(<InternalCalendarPageContainer basePath="/internal-calendar" />);

    const gridButton = screen.getByText('Vista Grid').closest('button');
    if (gridButton) {
      fireEvent.click(gridButton);
    }

    expect(mockReplace).toHaveBeenCalledWith('/internal-calendar?view=grid');
  });

  test('should update URL when switching back to calendar (removes view param)', () => {
    render(<InternalCalendarPageContainer basePath="/internal-calendar" />);

    // Switch to grid first
    const gridButton = screen.getByText('Vista Grid').closest('button');
    if (gridButton) {
      fireEvent.click(gridButton);
    }

    mockReplace.mockClear();

    // Switch back to calendar
    const calendarButton = screen.getByText('Vista Calendario').closest('button');
    if (calendarButton) {
      fireEvent.click(calendarButton);
    }

    expect(mockReplace).toHaveBeenCalledWith('/internal-calendar');
  });
});
