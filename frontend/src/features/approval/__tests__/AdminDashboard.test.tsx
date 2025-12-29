/**
 * Tests for Admin Dashboard Integration
 *
 * Tests the complete admin dashboard layout, stats display,
 * event list, and integration with approval actions.
 */

import { render, screen, fireEvent } from '@testing-library/react'

import { ToastProvider } from '@/components/ui/Toast'
import { AdminDashboard } from '@/features/approval/components/dumb/AdminDashboard'
import { Event } from '@/features/approval/types/approval.types'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  })
}))

// Helper to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(<ToastProvider>{component}</ToastProvider>)
}

describe('AdminDashboard', () => {
  const mockStats = {
    pending: 15,
    approved: 25,
    published: 40,
    rejected: 5,
    total: 85
  }

  const mockEvents = {
    data: [
      {
        id: 1,
        title: 'Festival de Música',
        status: 'pending_internal',
        organizer: 'Hotel Plaza',
        start_date: '2025-11-15',
        category_id: 1,
        location_id: 1
      },
      {
        id: 2,
        title: 'Exposición de Arte',
        status: 'approved_internal',
        organizer: 'Museo Provincial',
        start_date: '2025-11-20',
        category_id: 2,
        location_id: 2
      }
    ] as Event[],
    meta: {
      current_page: 1,
      total: 15
    }
  }

  const mockHandlers = {
    onFilterChange: jest.fn(),
    onApprove: jest.fn(),
    onReject: jest.fn(),
    onRequestChanges: jest.fn(),
    onPublish: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Layout Structure', () => {
    test('renders admin dashboard with all main sections', () => {
      renderWithProviders(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByText('Event Approvals')).toBeInTheDocument()
      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    test('displays stats cards with correct values', () => {
      renderWithProviders(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('15')).toBeInTheDocument() // pending
      expect(screen.getByText('25')).toBeInTheDocument() // approved
      expect(screen.getByText('40')).toBeInTheDocument() // published
      expect(screen.getByText('5')).toBeInTheDocument()  // rejected
      expect(screen.getByText('85')).toBeInTheDocument() // total
    })

    test('displays stats cards in correct order', () => {
      renderWithProviders(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      const statsCards = screen.getAllByRole('article')

      expect(statsCards).toHaveLength(5)
      expect(statsCards[0]).toHaveTextContent('Pending')
      expect(statsCards[1]).toHaveTextContent('Approved')
      expect(statsCards[2]).toHaveTextContent('Published')
      expect(statsCards[3]).toHaveTextContent('Rejected')
      expect(statsCards[4]).toHaveTextContent('Total')
    })

    test('applies responsive grid classes to stats section', () => {
      renderWithProviders(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      const statsGrid = screen.getByTestId('admin-stats-grid')

      expect(statsGrid.className).toContain('grid')
      expect(statsGrid.className).toMatch(/grid-cols-1/)
      expect(statsGrid.className).toMatch(/md:grid-cols-2/)
      expect(statsGrid.className).toMatch(/lg:grid-cols-5/)
    })
  })

  describe('Event List Integration', () => {
    test('renders event list with organizer information', () => {
      renderWithProviders(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Festival de Música')).toBeInTheDocument()
      expect(screen.getByText('Hotel Plaza')).toBeInTheDocument()
      expect(screen.getByText('Exposición de Arte')).toBeInTheDocument()
      expect(screen.getByText('Museo Provincial')).toBeInTheDocument()
    })

    test('displays loading state when fetching events', () => {
      renderWithProviders(
        <AdminDashboard
          stats={mockStats}
          events={{ data: [], meta: { current_page: 1, total: 0 } }}
          loading={true}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
    })

    test('displays error message when fetch fails', () => {
      renderWithProviders(
        <AdminDashboard
          stats={mockStats}
          events={{ data: [], meta: { current_page: 1, total: 0 } }}
          loading={false}
          error="Failed to fetch events"
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/failed to fetch events/i)).toBeInTheDocument()
    })

    test('displays empty state when no events pending', () => {
      renderWithProviders(
        <AdminDashboard
          stats={mockStats}
          events={{ data: [], meta: { current_page: 1, total: 0 } }}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/no events to review/i)).toBeInTheDocument()
    })
  })

  describe('Quick Filters', () => {
    test('renders status filter buttons', () => {
      renderWithProviders(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /pending/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /approved/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /published/i })).toBeInTheDocument()
    })

    test('calls onFilterChange when filter button clicked', () => {
      renderWithProviders(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /pending/i }))

      expect(mockHandlers.onFilterChange).toHaveBeenCalledWith('pending_internal')
    })

    test('highlights active filter button', () => {
      renderWithProviders(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter="pending_internal"
          {...mockHandlers}
        />
      )

      const pendingButton = screen.getByRole('button', { name: /pending/i })

      expect(pendingButton.className).toContain('bg-blue-600')
      expect(pendingButton.getAttribute('aria-pressed')).toBe('true')
    })
  })

  describe('Accessibility', () => {
    test('main container has role="main"', () => {
      renderWithProviders(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    test('stats cards have role="article"', () => {
      renderWithProviders(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      const articles = screen.getAllByRole('article')
      expect(articles).toHaveLength(5)
    })

    test('event table has proper table structure', () => {
      renderWithProviders(
        <AdminDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('columnheader')).toHaveLength(6) // Title, Organizer, Category, Date, Status, Actions
      expect(screen.getAllByRole('row')).toHaveLength(3) // Header + 2 events
    })
  })
})
