/**
 * InternalCalendarPageContainer Component Tests
 *
 * Tests for the main page container with view toggle and stats bar.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { InternalCalendarPageContainer } from '../InternalCalendarPageContainer';
import { useAuth } from '@/context/AuthContext';

// Mock dependencies
jest.mock('@/context/AuthContext');
jest.mock('../StatsBarContainer', () => ({
  StatsBarContainer: ({ token }: { token: string }) => (
    <div data-testid="stats-bar-container">StatsBar with token: {token}</div>
  ),
}));
jest.mock('../InternalCalendarGridContainer', () => ({
  InternalCalendarGridContainer: () => (
    <div data-testid="grid-container">Grid View</div>
  ),
}));
jest.mock('../InternalCalendarViewContainer', () => ({
  InternalCalendarViewContainer: () => (
    <div data-testid="calendar-container">Calendar View</div>
  ),
}));

describe('InternalCalendarPageContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      token: 'mock-token-12345',
      user: { id: 1, name: 'Test User' },
      isAuthenticated: true,
    });
  });

  test('should render without crashing', () => {
    render(<InternalCalendarPageContainer />);

    // Should have main container
    expect(screen.getByTestId('stats-bar-container')).toBeInTheDocument();
    expect(screen.getByText('Vista Grid')).toBeInTheDocument();
    expect(screen.getByText('Vista Calendario')).toBeInTheDocument();
  });

  test('should render StatsBarContainer with auth token', () => {
    render(<InternalCalendarPageContainer />);

    const statsBar = screen.getByTestId('stats-bar-container');
    expect(statsBar).toBeInTheDocument();
    expect(statsBar).toHaveTextContent('StatsBar with token: mock-token-12345');
  });

  test('should render both view toggle buttons', () => {
    render(<InternalCalendarPageContainer />);

    const gridButton = screen.getByText('Vista Grid');
    const calendarButton = screen.getByText('Vista Calendario');

    expect(gridButton).toBeInTheDocument();
    expect(calendarButton).toBeInTheDocument();
    expect(gridButton.closest('button')).toBeInTheDocument();
    expect(calendarButton.closest('button')).toBeInTheDocument();
  });

  test('should default to calendar view', () => {
    render(<InternalCalendarPageContainer />);

    // Calendar view should be rendered by default
    expect(screen.getByTestId('calendar-container')).toBeInTheDocument();
    expect(screen.queryByTestId('grid-container')).not.toBeInTheDocument();

    // Calendar button should be active
    const calendarButton = screen.getByText('Vista Calendario').closest('button');
    expect(calendarButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should switch to grid view when grid button is clicked', () => {
    render(<InternalCalendarPageContainer />);

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
    render(<InternalCalendarPageContainer />);

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
    render(<InternalCalendarPageContainer />);

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
    render(<InternalCalendarPageContainer />);

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

    render(<InternalCalendarPageContainer />);

    // Should render with empty token
    const statsBar = screen.getByTestId('stats-bar-container');
    expect(statsBar).toHaveTextContent('StatsBar with token:');

    // Rest of component should still work
    expect(screen.getByText('Vista Grid')).toBeInTheDocument();
    expect(screen.getByText('Vista Calendario')).toBeInTheDocument();
  });
});
