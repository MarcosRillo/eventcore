/**
 * Tests for Organizer Dashboard Integration
 *
 * Tests the main dashboard layout, widget integration,
 * filtering, and user interactions.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { OrganizerDashboard } from '../components/dumb/OrganizerDashboard'
import { OrganizerEvent } from '@/features/organizer/types/event.types'
import { ToastProvider } from '@/components/ui/Toast'

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

describe('OrganizerDashboard', () => {
  const mockStats = {
    total_events: 25,
    pending_internal: 5,
    approved_internal: 8,
    pending_public: 3,
    published: 10,
    requires_changes: 2,
    rejected: 2
  }

  const mockEvents: OrganizerEvent[] = [
    {
      id: 1,
      title: 'Event 1',
      status: 'draft',
      start_date: '2025-11-01T10:00:00'
    },
    {
      id: 2,
      title: 'Event 2',
      status: 'published',
      start_date: '2025-11-15T10:00:00'
    }
  ]

  const mockHandlers = {
    onFilterChange: jest.fn(),
    onOpenCreateModal: jest.fn(),
    onCloseCreateModal: jest.fn(),
    onCreateSuccess: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Layout Structure', () => {
    test('renders dashboard with all main sections', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByText('My Events')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create new event/i })).toBeInTheDocument()
    })

    test('displays stats cards in correct order', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      const statsCards = screen.getAllByRole('article')

      expect(statsCards).toHaveLength(5)
      expect(statsCards[0]).toHaveTextContent('Total Events')
      expect(statsCards[1]).toHaveTextContent('Pending')
      expect(statsCards[2]).toHaveTextContent('Approved')
      expect(statsCards[3]).toHaveTextContent('Published')
      expect(statsCards[4]).toHaveTextContent('Requires Changes')
    })

    test('displays correct stat values', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('25')).toBeInTheDocument() // total
      expect(screen.getByText('5')).toBeInTheDocument()  // pending
      expect(screen.getByText('8')).toBeInTheDocument()  // approved
      expect(screen.getByText('10')).toBeInTheDocument() // published
      expect(screen.getByText('2')).toBeInTheDocument()  // requires_changes
    })

    test('applies responsive grid classes to stats section', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      const statsGrid = screen.getByTestId('stats-grid')

      expect(statsGrid.className).toContain('grid')
      expect(statsGrid.className).toMatch(/grid-cols-1/)
      expect(statsGrid.className).toMatch(/md:grid-cols-2/)
      expect(statsGrid.className).toMatch(/lg:grid-cols-5/)
    })
  })

  describe('Event List Integration', () => {
    test('renders event list with data', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Event 1')).toBeInTheDocument()
      expect(screen.getByText('Event 2')).toBeInTheDocument()
    })

    test('displays loading state when fetching events', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={[]}
          loading={true}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
    })

    test('displays error message when fetch fails', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={[]}
          loading={false}
          error="Failed to fetch events"
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/failed to fetch events/i)).toBeInTheDocument()
    })

    test('displays empty state when no events', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={[]}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/no events found/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create your first event/i })).toBeInTheDocument()
    })
  })

  describe('Quick Filters', () => {
    test('renders status filter buttons', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^draft$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /pending/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /published/i })).toBeInTheDocument()
    })

    test('calls onFilterChange when filter button clicked', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /^draft$/i }))

      expect(mockHandlers.onFilterChange).toHaveBeenCalledWith('draft')
    })

    test('highlights active filter button', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter="draft"
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      const draftButton = screen.getByRole('button', { name: /^draft$/i })

      expect(draftButton.className).toContain('bg-blue-600')
      expect(draftButton.getAttribute('aria-pressed')).toBe('true')
    })
  })

  describe('Create Event Modal', () => {
    test('calls onOpenCreateModal when create button clicked', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /create new event/i }))

      expect(mockHandlers.onOpenCreateModal).toHaveBeenCalled()
    })

    test('does not render modal when createModalOpen is false', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    test('renders modal when createModalOpen is true', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getAllByText(/create new event/i).length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    test('main container has role="main"', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    test('stats cards have role="article"', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter={null}
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      const articles = screen.getAllByRole('article')
      expect(articles).toHaveLength(5)
    })

    test('filter buttons have aria-pressed attribute', () => {
      renderWithProviders(
        <OrganizerDashboard
          stats={mockStats}
          events={mockEvents}
          loading={false}
          error={null}
          activeFilter="draft"
          createModalOpen={false}
          {...mockHandlers}
        />
      )

      const draftButton = screen.getByRole('button', { name: /^draft$/i })
      expect(draftButton).toHaveAttribute('aria-pressed')
    })
  })
})
