/**
 * Tests for OrganizerStatsWidget (Smart Component)
 *
 * Tests integration with useOrganizerStats hook and rendering states.
 */

import { fireEvent,render, screen } from '@testing-library/react'

import { OrganizerStatsWidget } from '@/features/organizer-dashboard/components/smart/OrganizerStatsWidget'
import { useOrganizerStats } from '@/features/organizer-dashboard/hooks/useOrganizerStats'

jest.mock('@/features/organizer-dashboard/hooks/useOrganizerStats')

// Mock OrganizerStatsCard to simplify testing
jest.mock('@/features/organizer-dashboard/components/dumb/OrganizerStatsCard', () => ({
  OrganizerStatsCard: ({ stats, totalEvents }: { stats: unknown[]; totalEvents: number }) => (
    <div data-testid="stats-card">
      <span data-testid="total-events">{totalEvents}</span>
      <span data-testid="stats-count">{Array.isArray(stats) ? stats.length : 0}</span>
    </div>
  )
}))

describe('OrganizerStatsWidget', () => {
  const mockStats = {
    total_events: 50,
    pending_internal: 10,
    approved_internal: 15,
    pending_public: 5,
    published: 15,
    requires_changes: 3,
    rejected: 2
  }

  const mockRefetch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    ;(useOrganizerStats as jest.Mock).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
      refetch: mockRefetch
    })
  })

  describe('loading state', () => {
    test('should render loading skeleton when loading is true', () => {
      ;(useOrganizerStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: true,
        error: null,
        refetch: mockRefetch
      })

      render(<OrganizerStatsWidget />)

      // Should show animated skeleton
      const container = document.querySelector('.animate-pulse')
      expect(container).toBeInTheDocument()
    })

    test('should render 6 skeleton cards when loading', () => {
      ;(useOrganizerStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: true,
        error: null,
        refetch: mockRefetch
      })

      render(<OrganizerStatsWidget />)

      const skeletonCards = document.querySelectorAll('.h-24.bg-gray-200')
      expect(skeletonCards).toHaveLength(6)
    })

    test('should not render OrganizerStatsCard when loading', () => {
      ;(useOrganizerStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: true,
        error: null,
        refetch: mockRefetch
      })

      render(<OrganizerStatsWidget />)

      expect(screen.queryByTestId('stats-card')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    test('should render error message when error exists', () => {
      ;(useOrganizerStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: false,
        error: 'Network error',
        refetch: mockRefetch
      })

      render(<OrganizerStatsWidget />)

      expect(screen.getByText('Error al cargar estadísticas')).toBeInTheDocument()
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    test('should render retry button when error exists', () => {
      ;(useOrganizerStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: false,
        error: 'Network error',
        refetch: mockRefetch
      })

      render(<OrganizerStatsWidget />)

      expect(screen.getByText('Reintentar')).toBeInTheDocument()
    })

    test('should call refetch when retry button is clicked', () => {
      ;(useOrganizerStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: false,
        error: 'Network error',
        refetch: mockRefetch
      })

      render(<OrganizerStatsWidget />)

      fireEvent.click(screen.getByText('Reintentar'))

      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })

    test('should not render OrganizerStatsCard when error exists', () => {
      ;(useOrganizerStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: false,
        error: 'Network error',
        refetch: mockRefetch
      })

      render(<OrganizerStatsWidget />)

      expect(screen.queryByTestId('stats-card')).not.toBeInTheDocument()
    })
  })

  describe('no data state', () => {
    test('should return null when stats is null and no loading/error', () => {
      ;(useOrganizerStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: false,
        error: null,
        refetch: mockRefetch
      })

      const { container } = render(<OrganizerStatsWidget />)

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('success state', () => {
    test('should render OrganizerStatsCard when stats are loaded', () => {
      render(<OrganizerStatsWidget />)

      expect(screen.getByTestId('stats-card')).toBeInTheDocument()
    })

    test('should pass total_events to OrganizerStatsCard', () => {
      render(<OrganizerStatsWidget />)

      expect(screen.getByTestId('total-events')).toHaveTextContent('50')
    })

    test('should transform stats into 6 stat cards', () => {
      render(<OrganizerStatsWidget />)

      expect(screen.getByTestId('stats-count')).toHaveTextContent('6')
    })
  })

  describe('stats transformation', () => {
    test('should include all expected stat categories', () => {
      // We verify that 6 stats are passed (the number of categories)
      render(<OrganizerStatsWidget />)

      expect(screen.getByTestId('stats-count')).toHaveTextContent('6')
    })

    test('should handle zero values in stats', () => {
      ;(useOrganizerStats as jest.Mock).mockReturnValue({
        stats: {
          total_events: 0,
          pending_internal: 0,
          approved_internal: 0,
          pending_public: 0,
          published: 0,
          requires_changes: 0,
          rejected: 0
        },
        loading: false,
        error: null,
        refetch: mockRefetch
      })

      render(<OrganizerStatsWidget />)

      expect(screen.getByTestId('total-events')).toHaveTextContent('0')
      expect(screen.getByTestId('stats-card')).toBeInTheDocument()
    })

    test('should handle large values in stats', () => {
      ;(useOrganizerStats as jest.Mock).mockReturnValue({
        stats: {
          total_events: 999999,
          pending_internal: 100000,
          approved_internal: 200000,
          pending_public: 150000,
          published: 300000,
          requires_changes: 50000,
          rejected: 199999
        },
        loading: false,
        error: null,
        refetch: mockRefetch
      })

      render(<OrganizerStatsWidget />)

      expect(screen.getByTestId('total-events')).toHaveTextContent('999999')
    })
  })

  describe('hooks integration', () => {
    test('should call useOrganizerStats hook', () => {
      render(<OrganizerStatsWidget />)

      expect(useOrganizerStats).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    test('should have accessible retry button', () => {
      ;(useOrganizerStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: false,
        error: 'Network error',
        refetch: mockRefetch
      })

      render(<OrganizerStatsWidget />)

      const button = screen.getByText('Reintentar')
      expect(button).toHaveClass('px-4', 'py-2')
      expect(button.tagName).toBe('BUTTON')
    })
  })
})
