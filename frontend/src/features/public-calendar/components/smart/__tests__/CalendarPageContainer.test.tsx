/**
 * Tests for CalendarPageContainer (Smart Component)
 *
 * Tests view toggle, stats fetching, conditional rendering, and accessibility.
 */

import { act,fireEvent, render, screen, waitFor } from '@testing-library/react'

import { CalendarPageContainer } from '@/features/public-calendar/components/smart/CalendarPageContainer'
import { publicEventsService } from '@/features/public-calendar/services/public-events.service'
import { PublicStats } from '@/features/public-calendar/types/public-calendar.types'

// Mock services and components
jest.mock('@/features/public-calendar/services/public-events.service')
jest.mock('@/features/public-calendar/components/smart/PublicCalendarContainer', () => ({
  PublicCalendarContainer: () => <div data-testid="public-calendar-container">Grid View</div>
}))
jest.mock('@/features/public-calendar/components/smart/CalendarViewContainer', () => ({
  CalendarViewContainer: () => <div data-testid="calendar-view-container">Calendar View</div>
}))
jest.mock('@/shared/components/stats', () => ({
  StatsBar: ({ items, loading }: { items: { value: number }[]; loading: boolean }) => (
    <div data-testid="stats-bar">
      {loading ? 'Loading' : items.length > 0 ? `Stats: ${items[0].value}` : 'No stats'}
    </div>
  )
}))

describe('CalendarPageContainer', () => {
  const mockStats: PublicStats = {
    total_events: 45,
    total_event_types: 12,
    events_this_month: 8
  }

  const mockGetStats = publicEventsService.getStats as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial rendering', () => {
    test('should render with calendar view by default', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      await act(async () => {
        render(<CalendarPageContainer />)
      })

      await waitFor(() => {
        expect(screen.getByTestId('calendar-view-container')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('public-calendar-container')).not.toBeInTheDocument()
    })

    test('should render description text', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      await act(async () => {
        render(<CalendarPageContainer />)
      })

      await waitFor(() => {
        expect(screen.getByText(/Explorá el calendario de eventos/i)).toBeInTheDocument()
      })
    })

    test('should render both view toggle buttons', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      await act(async () => {
        render(<CalendarPageContainer />)
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /vista calendario/i })).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: /vista cuadrícula/i })).toBeInTheDocument()
    })

    test('should highlight calendar button by default', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      await act(async () => {
        render(<CalendarPageContainer />)
      })

      await waitFor(() => {
        const calendarButton = screen.getByRole('button', { name: /vista calendario/i })
        expect(calendarButton).toHaveClass('bg-white', 'text-primary-600', 'shadow-sm', 'font-semibold')
      })
    })

    test('should not highlight grid button by default', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      await act(async () => {
        render(<CalendarPageContainer />)
      })

      await waitFor(() => {
        const gridButton = screen.getByRole('button', { name: /vista cuadrícula/i })
        expect(gridButton).toHaveClass('text-neutral-600', 'hover:text-neutral-900')
        expect(gridButton).not.toHaveClass('bg-white')
      })
    })
  })

  describe('stats fetching', () => {
    test('should fetch stats on mount', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      await act(async () => {
        render(<CalendarPageContainer />)
      })

      await waitFor(() => {
        expect(mockGetStats).toHaveBeenCalledTimes(1)
      })
    })

    test('should show loading state initially', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      render(<CalendarPageContainer />)

      expect(screen.getByTestId('stats-bar')).toHaveTextContent('Loading')

      // Wait for async operations to complete to avoid warnings
      await waitFor(() => {
        expect(mockGetStats).toHaveBeenCalled()
      })
    })

    test('should display stats after successful fetch', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      await act(async () => {
        render(<CalendarPageContainer />)
      })

      await waitFor(() => {
        expect(screen.getByTestId('stats-bar')).toHaveTextContent('Stats: 45')
      })
    })

    test('should handle stats fetch error', async () => {
      mockGetStats.mockRejectedValue(new Error('Failed to fetch'))
      await act(async () => {
        render(<CalendarPageContainer />)
      })

      await waitFor(() => {
        expect(screen.getByTestId('stats-bar')).toHaveTextContent('No stats')
      })
    })
  })

  describe('view mode toggling', () => {
    test('should switch to grid view when grid button is clicked', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      await act(async () => {
        render(<CalendarPageContainer />)
      })

      const gridButton = screen.getByRole('button', { name: /vista cuadrícula/i })
      await act(async () => {
        fireEvent.click(gridButton)
      })

      await waitFor(() => {
        expect(screen.getByTestId('public-calendar-container')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('calendar-view-container')).not.toBeInTheDocument()
    })

    test('should switch to calendar view when calendar button is clicked', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      await act(async () => {
        render(<CalendarPageContainer />)
      })

      // First switch to grid
      const gridButton = screen.getByRole('button', { name: /vista cuadrícula/i })
      await act(async () => {
        fireEvent.click(gridButton)
      })

      await waitFor(() => {
        expect(screen.getByTestId('public-calendar-container')).toBeInTheDocument()
      })

      // Then switch back to calendar
      const calendarButton = screen.getByRole('button', { name: /vista calendario/i })
      await act(async () => {
        fireEvent.click(calendarButton)
      })

      await waitFor(() => {
        expect(screen.getByTestId('calendar-view-container')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('public-calendar-container')).not.toBeInTheDocument()
    })

    test('should update button styles when switching views', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      await act(async () => {
        render(<CalendarPageContainer />)
      })

      const calendarButton = screen.getByRole('button', { name: /vista calendario/i })
      const gridButton = screen.getByRole('button', { name: /vista cuadrícula/i })

      // Initially calendar is active
      expect(calendarButton).toHaveClass('bg-white', 'text-primary-600')

      // Click grid button
      await act(async () => {
        fireEvent.click(gridButton)
      })

      await waitFor(() => {
        expect(gridButton).toHaveClass('bg-white', 'text-primary-600', 'shadow-sm', 'font-semibold')
      })
      expect(calendarButton).not.toHaveClass('bg-white')
      expect(calendarButton).toHaveClass('text-neutral-600')
    })
  })

  describe('conditional content rendering', () => {
    test('should render CalendarViewContainer when viewMode is calendar', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      await act(async () => {
        render(<CalendarPageContainer />)
      })

      await waitFor(() => {
        expect(screen.getByTestId('calendar-view-container')).toBeInTheDocument()
      })
    })

    test('should render PublicCalendarContainer when viewMode is grid', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      await act(async () => {
        render(<CalendarPageContainer />)
      })

      const gridButton = screen.getByRole('button', { name: /vista cuadrícula/i })
      await act(async () => {
        fireEvent.click(gridButton)
      })

      await waitFor(() => {
        expect(screen.getByTestId('public-calendar-container')).toBeInTheDocument()
      })
    })

    test('should render StatsBar in all view modes', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      await act(async () => {
        render(<CalendarPageContainer />)
      })

      // Check in calendar view
      await waitFor(() => {
        expect(screen.getByTestId('stats-bar')).toBeInTheDocument()
      })

      // Switch to grid view
      const gridButton = screen.getByRole('button', { name: /vista cuadrícula/i })
      await act(async () => {
        fireEvent.click(gridButton)
      })

      // StatsBar should still be present
      expect(screen.getByTestId('stats-bar')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    test('should have aria-label on calendar button', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      await act(async () => {
        render(<CalendarPageContainer />)
      })

      await waitFor(() => {
        const calendarButton = screen.getByRole('button', { name: 'Vista calendario' })
        expect(calendarButton).toHaveAttribute('aria-label', 'Vista calendario')
      })
    })

    test('should have aria-label on grid button', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      await act(async () => {
        render(<CalendarPageContainer />)
      })

      await waitFor(() => {
        const gridButton = screen.getByRole('button', { name: 'Vista cuadrícula' })
        expect(gridButton).toHaveAttribute('aria-label', 'Vista cuadrícula')
      })
    })

    test('should hide decorative icons from screen readers', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      let container: HTMLElement
      await act(async () => {
        const result = render(<CalendarPageContainer />)
        container = result.container
      })

      await waitFor(() => {
        const icons = container.querySelectorAll('svg[aria-hidden="true"]')
        expect(icons.length).toBeGreaterThanOrEqual(2) // At least 2 toggle button icons
      })
    })
  })

  describe('layout and styling', () => {
    test('should render with correct container classes', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      let container: HTMLElement
      await act(async () => {
        const result = render(<CalendarPageContainer />)
        container = result.container
      })

      await waitFor(() => {
        const mainDiv = container.querySelector('.bg-neutral-50')
        expect(mainDiv).toBeInTheDocument()
      })
    })

    test('should render toggle bar with correct styling', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      let container: HTMLElement
      await act(async () => {
        const result = render(<CalendarPageContainer />)
        container = result.container
      })

      await waitFor(() => {
        const toggleBar = container.querySelector('.bg-white.border-b.border-neutral-200')
        expect(toggleBar).toBeInTheDocument()
      })
    })

    test('should render toggle buttons in rounded container', async () => {
      mockGetStats.mockResolvedValue({ data: mockStats })
      let container: HTMLElement
      await act(async () => {
        const result = render(<CalendarPageContainer />)
        container = result.container
      })

      await waitFor(() => {
        const toggleContainer = container.querySelector('.bg-neutral-100.p-1.rounded-lg')
        expect(toggleContainer).toBeInTheDocument()
        expect(toggleContainer).toHaveClass('flex', 'gap-2')
      })
    })
  })
})
