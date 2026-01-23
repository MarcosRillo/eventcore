/**
 * StatsBarContainer Component Tests
 *
 * Tests for the smart container that fetches and manages stats data.
 * Following TDD methodology.
 */

import { render, screen, waitFor } from '@testing-library/react'

import { StatsBarContainer } from '@/features/internal-calendar/components/smart/StatsBarContainer'
import { getInternalStats } from '@/features/internal-calendar/services/internal-calendar-stats.service'
import type { InternalStats } from '@/features/internal-calendar/types/internal-calendar.types'

// Mock the service
jest.mock('@/features/internal-calendar/services/internal-calendar-stats.service')

// Mock the dumb component
jest.mock('@/features/internal-calendar/components/dumb/StatsBar', () => ({
  StatsBar: ({ stats, loading }: { stats: InternalStats | null; loading: boolean }) => {
    if (loading) return <div data-testid="stats-loading">Loading...</div>
    if (!stats) return null
    return (
      <div data-testid="stats-bar">
        <span>{stats.total_events}</span>
        <span>{stats.total_event_types}</span>
        <span>{stats.events_this_month}</span>
      </div>
    )
  }
}))

describe('StatsBarContainer', () => {
  const mockToken = 'test-jwt-token-123'
  const mockStats: InternalStats = {
    total_events: 42,
    total_event_types: 8,
    events_this_month: 15
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading State', () => {
    it('shows loading state initially', () => {
      const mockGetStats = getInternalStats as jest.MockedFunction<typeof getInternalStats>
      mockGetStats.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<StatsBarContainer token={mockToken} />)

      expect(screen.getByTestId('stats-loading')).toBeInTheDocument()
    })

    it('calls getInternalStats with token on mount', async () => {
      const mockGetStats = getInternalStats as jest.MockedFunction<typeof getInternalStats>
      mockGetStats.mockResolvedValue(mockStats)

      render(<StatsBarContainer token={mockToken} />)

      expect(mockGetStats).toHaveBeenCalledWith(mockToken)
      expect(mockGetStats).toHaveBeenCalledTimes(1)

      // Wait for state updates to complete to avoid act() warnings
      await waitFor(() => {
        expect(screen.getByTestId('stats-bar')).toBeInTheDocument()
      })
    })
  })

  describe('Success State', () => {
    it('displays stats after successful fetch', async () => {
      const mockGetStats = getInternalStats as jest.MockedFunction<typeof getInternalStats>
      mockGetStats.mockResolvedValue(mockStats)

      render(<StatsBarContainer token={mockToken} />)

      await waitFor(() => {
        expect(screen.getByTestId('stats-bar')).toBeInTheDocument()
      })

      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('passes stats to StatsBar component', async () => {
      const mockGetStats = getInternalStats as jest.MockedFunction<typeof getInternalStats>
      mockGetStats.mockResolvedValue(mockStats)

      render(<StatsBarContainer token={mockToken} />)

      await waitFor(() => {
        expect(screen.getByTestId('stats-bar')).toBeInTheDocument()
      })

      const statsBar = screen.getByTestId('stats-bar')
      expect(statsBar).toBeInTheDocument()
    })

    it('stops showing loading after fetch completes', async () => {
      const mockGetStats = getInternalStats as jest.MockedFunction<typeof getInternalStats>
      mockGetStats.mockResolvedValue(mockStats)

      render(<StatsBarContainer token={mockToken} />)

      await waitFor(() => {
        expect(screen.queryByTestId('stats-loading')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error State', () => {
    it('returns null when fetch fails', async () => {
      const mockGetStats = getInternalStats as jest.MockedFunction<typeof getInternalStats>
      mockGetStats.mockRejectedValue(new Error('API Error'))

      const { container } = render(<StatsBarContainer token={mockToken} />)

      await waitFor(() => {
        expect(container.firstChild).toBeNull()
      })
    })

    it('does not display stats bar on error', async () => {
      const mockGetStats = getInternalStats as jest.MockedFunction<typeof getInternalStats>
      mockGetStats.mockRejectedValue(new Error('Network error'))

      render(<StatsBarContainer token={mockToken} />)

      await waitFor(() => {
        expect(screen.queryByTestId('stats-bar')).not.toBeInTheDocument()
        expect(screen.queryByTestId('stats-loading')).not.toBeInTheDocument()
      })
    })

    it('handles 401 Unauthorized gracefully', async () => {
      const mockGetStats = getInternalStats as jest.MockedFunction<typeof getInternalStats>
      mockGetStats.mockRejectedValue(new Error('Failed to fetch internal stats: 401 Unauthorized'))

      const { container } = render(<StatsBarContainer token={mockToken} />)

      await waitFor(() => {
        expect(container.firstChild).toBeNull()
      })
    })

    it('handles 500 Server Error gracefully', async () => {
      const mockGetStats = getInternalStats as jest.MockedFunction<typeof getInternalStats>
      mockGetStats.mockRejectedValue(new Error('Failed to fetch internal stats: 500 Internal Server Error'))

      const { container } = render(<StatsBarContainer token={mockToken} />)

      await waitFor(() => {
        expect(container.firstChild).toBeNull()
      })
    })
  })

  describe('Token Change', () => {
    it('refetches stats when token changes', async () => {
      const mockGetStats = getInternalStats as jest.MockedFunction<typeof getInternalStats>
      mockGetStats.mockResolvedValue(mockStats)

      const { rerender } = render(<StatsBarContainer token="token-1" />)

      await waitFor(() => {
        expect(mockGetStats).toHaveBeenCalledWith('token-1')
      })

      rerender(<StatsBarContainer token="token-2" />)

      await waitFor(() => {
        expect(mockGetStats).toHaveBeenCalledWith('token-2')
        expect(mockGetStats).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Zero Values', () => {
    it('displays zero stats correctly', async () => {
      const zeroStats: InternalStats = {
        total_events: 0,
        total_event_types: 0,
        events_this_month: 0
      }

      const mockGetStats = getInternalStats as jest.MockedFunction<typeof getInternalStats>
      mockGetStats.mockResolvedValue(zeroStats)

      render(<StatsBarContainer token={mockToken} />)

      await waitFor(() => {
        expect(screen.getByTestId('stats-bar')).toBeInTheDocument()
      })

      const zeros = screen.getAllByText('0')
      expect(zeros).toHaveLength(3)
    })
  })
})
