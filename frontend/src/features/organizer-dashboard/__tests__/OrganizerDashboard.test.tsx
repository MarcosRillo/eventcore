/**
 * Tests for Organizer Dashboard Integration
 *
 * Tests the main dashboard layout, widget integration,
 * filtering, and user interactions.
 * Updated Dec 2, 2025 for Spanish UI, pagination, and Link-based navigation.
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
    onPageChange: jest.fn(),
    onSuccess: jest.fn()
  }

  const defaultProps = {
    stats: mockStats,
    events: mockEvents,
    loading: false,
    error: null,
    activeFilter: null,
    currentPage: 1,
    totalPages: 1,
    ...mockHandlers
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Layout Structure', () => {
    test('renders dashboard with all main sections', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByText('Mis Eventos')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /crear nuevo evento/i })).toBeInTheDocument()
    })

    test('create event link points to /organizer/create', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      const createLink = screen.getByRole('link', { name: /crear nuevo evento/i })
      expect(createLink).toHaveAttribute('href', '/organizer/create')
    })

    test('displays stats cards in correct order', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      const statsCards = screen.getAllByRole('article')

      expect(statsCards).toHaveLength(5)
      expect(statsCards[0]).toHaveTextContent('Total Eventos')
      expect(statsCards[1]).toHaveTextContent('Pendientes')
      expect(statsCards[2]).toHaveTextContent('Aprobados')
      expect(statsCards[3]).toHaveTextContent('Publicados')
      expect(statsCards[4]).toHaveTextContent('Requiere Cambios')
    })

    test('displays correct stat values', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      expect(screen.getByText('25')).toBeInTheDocument() // total
      expect(screen.getByText('5')).toBeInTheDocument()  // pending
      expect(screen.getByText('8')).toBeInTheDocument()  // approved
      expect(screen.getByText('10')).toBeInTheDocument() // published
      expect(screen.getByText('2')).toBeInTheDocument()  // requires_changes
    })

    test('applies responsive grid classes to stats section', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      const statsGrid = screen.getByTestId('stats-grid')

      expect(statsGrid.className).toContain('grid')
      expect(statsGrid.className).toMatch(/grid-cols-1/)
      expect(statsGrid.className).toMatch(/md:grid-cols-2/)
      expect(statsGrid.className).toMatch(/lg:grid-cols-5/)
    })
  })

  describe('Event List Integration', () => {
    test('renders event list with data', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      expect(screen.getByText('Event 1')).toBeInTheDocument()
      expect(screen.getByText('Event 2')).toBeInTheDocument()
    })

    test('displays loading state when fetching events', () => {
      renderWithProviders(
        <OrganizerDashboard {...defaultProps} events={[]} loading={true} />
      )

      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
    })

    test('displays error message when fetch fails', () => {
      renderWithProviders(
        <OrganizerDashboard {...defaultProps} events={[]} error="Failed to fetch events" />
      )

      expect(screen.getByText(/failed to fetch events/i)).toBeInTheDocument()
    })

    test('displays empty state when no events', () => {
      renderWithProviders(
        <OrganizerDashboard {...defaultProps} events={[]} />
      )

      expect(screen.getByText(/no se encontraron eventos/i)).toBeInTheDocument()
      const createFirstLink = screen.getByRole('link', { name: /crear tu primer evento/i })
      expect(createFirstLink).toBeInTheDocument()
      expect(createFirstLink).toHaveAttribute('href', '/organizer/create')
    })
  })

  describe('Quick Filters', () => {
    test('renders status filter buttons', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      expect(screen.getByRole('button', { name: /^todos$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^borrador$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /pendiente/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /publicado/i })).toBeInTheDocument()
    })

    test('calls onFilterChange when filter button clicked', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /^borrador$/i }))

      expect(mockHandlers.onFilterChange).toHaveBeenCalledWith('draft')
    })

    test('highlights active filter button', () => {
      renderWithProviders(
        <OrganizerDashboard {...defaultProps} activeFilter="draft" />
      )

      const draftButton = screen.getByRole('button', { name: /^borrador$/i })

      expect(draftButton.className).toContain('bg-primary-600')
      expect(draftButton.getAttribute('aria-pressed')).toBe('true')
    })
  })

  describe('Accessibility', () => {
    test('main container has role="main"', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    test('stats cards have role="article"', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      const articles = screen.getAllByRole('article')
      expect(articles).toHaveLength(5)
    })

    test('filter buttons have aria-pressed attribute', () => {
      renderWithProviders(
        <OrganizerDashboard {...defaultProps} activeFilter="draft" />
      )

      const draftButton = screen.getByRole('button', { name: /^borrador$/i })
      expect(draftButton).toHaveAttribute('aria-pressed')
    })
  })

  describe('Pagination', () => {
    test('does not render pagination when only one page', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      // Pagination should not be rendered when totalPages is 1
      expect(screen.queryByRole('navigation', { name: /paginación/i })).not.toBeInTheDocument()
    })

    test('renders pagination when multiple pages', () => {
      renderWithProviders(
        <OrganizerDashboard {...defaultProps} totalPages={3} />
      )

      // Pagination should be visible when there are multiple pages
      expect(screen.getByRole('navigation', { name: /paginación/i })).toBeInTheDocument()
    })
  })
})
