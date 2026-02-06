/**
 * Tests for OrganizerDashboardContainer (Smart Component)
 *
 * Tests integration of dashboard with data hooks and state management.
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { useOrganizerEvents } from '@/features/organizer/hooks/useOrganizerEvents'
import { OrganizerDashboardContainer } from '@/features/organizer-dashboard/components/smart/OrganizerDashboardContainer'
import { useOrganizerStats } from '@/features/organizer-dashboard/hooks/useOrganizerStats'

jest.mock('@/features/organizer-dashboard/hooks/useOrganizerStats')
jest.mock('@/features/organizer/hooks/useOrganizerEvents')

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/organizer/dashboard'
}))

// Mock OrganizerDashboard to simplify testing
jest.mock('@/features/organizer-dashboard/components/dumb/OrganizerDashboard', () => ({
  OrganizerDashboard: ({
    stats,
    statsLoading,
    events,
    loading,
    error,
    activeFilter,
    onFilterChange,
    onSuccess,
    onEdit,
    onView
  }: {
    stats: unknown
    statsLoading: boolean
    events: unknown
    loading: boolean
    error: string | null
    activeFilter: string | null
    onFilterChange: (status: string | null) => void
    onSuccess: () => void
    onEdit: (id: number) => void
    onView: (id: number) => void
  }) => (
    <div data-testid="organizer-dashboard">
      <span data-testid="loading-state">{loading ? 'loading' : 'loaded'}</span>
      <span data-testid="stats-loading-state">{statsLoading ? 'loading' : 'loaded'}</span>
      <span data-testid="error-state">{error || 'no-error'}</span>
      <span data-testid="active-filter">{activeFilter || 'all'}</span>
      <span data-testid="stats-present">{stats ? 'yes' : 'no'}</span>
      <span data-testid="events-count">{Array.isArray((events as { data: unknown[] })?.data) ? (events as { data: unknown[] }).data.length : 0}</span>
      <button onClick={() => onFilterChange('draft')}>Filter Draft</button>
      <button onClick={() => onFilterChange(null)}>Show All</button>
      <button onClick={() => onSuccess()}>Refresh Data</button>
      <button onClick={() => onEdit(1)}>Edit Event 1</button>
      <button onClick={() => onView(1)}>View Event 1</button>
    </div>
  )
}))

describe('OrganizerDashboardContainer', () => {
  const mockStats = {
    total_events: 50,
    pending_internal: 10,
    approved_internal: 15,
    pending_public: 5,
    published: 15,
    requires_changes: 3,
    rejected: 2
  }

  const mockEvents = {
    data: [
      { id: 1, title: 'Event 1', status: 'draft' },
      { id: 2, title: 'Event 2', status: 'published' }
    ],
    meta: { current_page: 1, total: 2 }
  }

  const mockRefetchStats = jest.fn()
  const mockRetry = jest.fn()
  const mockHandleStatusFilter = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()

    ;(useOrganizerStats as jest.Mock).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
      refetch: mockRefetchStats
    })

    ;(useOrganizerEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      loading: false,
      error: null,
      statusFilter: null,
      showPast: false,
      handleStatusFilter: mockHandleStatusFilter,
      optimisticRemove: jest.fn(),
      retry: mockRetry
    })
  })

  describe('rendering', () => {
    test('should render OrganizerDashboard component', () => {
      render(<OrganizerDashboardContainer />)

      expect(screen.getByTestId('organizer-dashboard')).toBeInTheDocument()
    })

    test('should pass stats to OrganizerDashboard', () => {
      render(<OrganizerDashboardContainer />)

      expect(screen.getByTestId('stats-present')).toHaveTextContent('yes')
    })

    test('should pass events to OrganizerDashboard', () => {
      render(<OrganizerDashboardContainer />)

      expect(screen.getByTestId('events-count')).toHaveTextContent('2')
    })

    test('should pass loading state to OrganizerDashboard', () => {
      ;(useOrganizerEvents as jest.Mock).mockReturnValue({
        events: mockEvents,
        loading: true,
        error: null,
        statusFilter: null,
        showPast: false,
        handleStatusFilter: mockHandleStatusFilter,
        optimisticRemove: jest.fn(),
        retry: mockRetry
      })

      render(<OrganizerDashboardContainer />)

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading')
    })

    test('should pass stats loading state to OrganizerDashboard', () => {
      ;(useOrganizerStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: true,
        error: null,
        refetch: mockRefetchStats
      })

      render(<OrganizerDashboardContainer />)

      expect(screen.getByTestId('stats-loading-state')).toHaveTextContent('loading')
    })

    test('should pass error state to OrganizerDashboard', () => {
      ;(useOrganizerEvents as jest.Mock).mockReturnValue({
        events: mockEvents,
        loading: false,
        error: 'Failed to load',
        statusFilter: null,
        showPast: false,
        handleStatusFilter: mockHandleStatusFilter,
        optimisticRemove: jest.fn(),
        retry: mockRetry
      })

      render(<OrganizerDashboardContainer />)

      expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to load')
    })

    test('should pass activeFilter to OrganizerDashboard', () => {
      ;(useOrganizerEvents as jest.Mock).mockReturnValue({
        events: mockEvents,
        loading: false,
        error: null,
        statusFilter: 'draft',
        showPast: false,
        handleStatusFilter: mockHandleStatusFilter,
        optimisticRemove: jest.fn(),
        retry: mockRetry
      })

      render(<OrganizerDashboardContainer />)

      expect(screen.getByTestId('active-filter')).toHaveTextContent('draft')
    })
  })

  describe('filter handling', () => {
    test('should call handleStatusFilter when filter is changed', () => {
      render(<OrganizerDashboardContainer />)

      fireEvent.click(screen.getByText('Filter Draft'))

      expect(mockHandleStatusFilter).toHaveBeenCalledWith('draft')
    })

    test('should call handleStatusFilter with null to show all', () => {
      render(<OrganizerDashboardContainer />)

      fireEvent.click(screen.getByText('Show All'))

      expect(mockHandleStatusFilter).toHaveBeenCalledWith(null)
    })
  })

  describe('refresh handling', () => {
    test('should call refetchStats and retry when onSuccess is called', () => {
      render(<OrganizerDashboardContainer />)

      fireEvent.click(screen.getByText('Refresh Data'))

      expect(mockRefetchStats).toHaveBeenCalledTimes(1)
      expect(mockRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('hooks integration', () => {
    test('should call useOrganizerStats hook', () => {
      render(<OrganizerDashboardContainer />)

      expect(useOrganizerStats).toHaveBeenCalled()
    })

    test('should call useOrganizerEvents hook', () => {
      render(<OrganizerDashboardContainer />)

      expect(useOrganizerEvents).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    test('should handle null stats', () => {
      ;(useOrganizerStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: false,
        error: null,
        refetch: mockRefetchStats
      })

      render(<OrganizerDashboardContainer />)

      expect(screen.getByTestId('stats-present')).toHaveTextContent('no')
    })

    test('should handle empty events', () => {
      ;(useOrganizerEvents as jest.Mock).mockReturnValue({
        events: { data: [], meta: { current_page: 1, total: 0 } },
        loading: false,
        error: null,
        statusFilter: null,
        showPast: false,
        handleStatusFilter: mockHandleStatusFilter,
        optimisticRemove: jest.fn(),
        retry: mockRetry
      })

      render(<OrganizerDashboardContainer />)

      expect(screen.getByTestId('events-count')).toHaveTextContent('0')
    })

    test('should handle both loading states independently', () => {
      ;(useOrganizerStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: true,
        error: null,
        refetch: mockRefetchStats
      })

      ;(useOrganizerEvents as jest.Mock).mockReturnValue({
        events: mockEvents,
        loading: false,
        error: null,
        statusFilter: null,
        showPast: false,
        handleStatusFilter: mockHandleStatusFilter,
        optimisticRemove: jest.fn(),
        retry: mockRetry
      })

      render(<OrganizerDashboardContainer />)

      // Events loading is what's passed to dashboard
      expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded')
      expect(screen.getByTestId('stats-loading-state')).toHaveTextContent('loading')
    })
  })

  describe('navigation handling', () => {
    test('should navigate to edit page when onEdit is called', () => {
      render(<OrganizerDashboardContainer />)

      fireEvent.click(screen.getByText('Edit Event 1'))

      expect(mockPush).toHaveBeenCalledWith('/organizer/1/edit')
    })

    test('should navigate to event detail when onView is called', () => {
      render(<OrganizerDashboardContainer />)

      fireEvent.click(screen.getByText('View Event 1'))

      expect(mockPush).toHaveBeenCalledWith('/organizer/1')
    })
  })
})
