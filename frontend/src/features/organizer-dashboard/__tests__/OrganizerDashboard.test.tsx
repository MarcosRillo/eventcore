/**
 * Tests for Organizer Dashboard Integration
 *
 * Tests the main dashboard layout with stats summary bar,
 * unified filters, and event list.
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { OrganizerEvent } from '@/features/organizer/types/event.types'
import { OrganizerDashboard } from '@/features/organizer-dashboard/components/dumb/OrganizerDashboard'
import { ToastProvider } from '@/shared/context'

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
    upcoming_events: 12,
    past_events: 6,
    pending_internal: 5,
    approved_internal: 8,
    pending_public: 3,
    published: 10,
    requires_changes: 2,
    rejected: 2,
    draft: 3
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
    onShowPastChange: jest.fn(),
    onPageChange: jest.fn(),
    onSuccess: jest.fn(),
    onEdit: jest.fn(),
    onView: jest.fn()
  }

  const defaultProps = {
    stats: mockStats,
    statsLoading: false,
    events: mockEvents,
    loading: false,
    error: null,
    activeFilter: null,
    showPast: false,
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

    test('renders stats summary bar', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      const statsRegion = screen.getByRole('region', { name: /estadisticas/i })
      expect(statsRegion).toBeInTheDocument()
    })

    test('displays stat values in summary bar', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      expect(screen.getByText('25')).toBeInTheDocument() // total
      expect(screen.getByText('12')).toBeInTheDocument() // upcoming
      expect(screen.getByText('6')).toBeInTheDocument()  // past
      expect(screen.getByText('5')).toBeInTheDocument()  // pending
      expect(screen.getByText('2')).toBeInTheDocument()  // requires_changes
    })

    test('renders stats loading skeleton', () => {
      renderWithProviders(
        <OrganizerDashboard {...defaultProps} stats={null} statsLoading={true} />
      )

      expect(screen.getByTestId('stats-loading')).toBeInTheDocument()
    })
  })

  describe('Event List Integration', () => {
    test('renders event list with data', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      expect(screen.getByText('Event 1')).toBeInTheDocument()
      expect(screen.getByText('Event 2')).toBeInTheDocument()
    })

    test('displays loading state when fetching events', () => {
      const { container } = renderWithProviders(
        <OrganizerDashboard {...defaultProps} events={[]} loading={true} />
      )

      // Loading state now shows skeleton cards instead of spinner text
      // Verify skeleton elements are present via role="status" with aria-label
      expect(screen.getByRole('status', { name: /cargando eventos/i })).toBeInTheDocument()

      // Verify skeleton pulse animations are present
      const pulseElements = container.querySelectorAll('.animate-pulse')
      expect(pulseElements.length).toBeGreaterThan(0)
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

      expect(screen.getByText(/aun no tienes eventos/i)).toBeInTheDocument()
      expect(screen.getByText(/comienza creando tu primer evento/i)).toBeInTheDocument()
      const createButtons = screen.getAllByRole('button', { name: /crear evento/i })
      expect(createButtons.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Unified Filters', () => {
    test('renders status filter buttons', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      expect(screen.getByRole('button', { name: /^todos/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^borrador/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /pendiente/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /publicado/i })).toBeInTheDocument()
    })

    test('renders time scope toggle', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Proximos' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Pasados' })).toBeInTheDocument()
    })

    test('calls onFilterChange when filter button clicked', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /^borrador/i }))

      expect(mockHandlers.onFilterChange).toHaveBeenCalledWith('draft')
    })

    test('calls onShowPastChange when time scope changed', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Pasados' }))

      expect(mockHandlers.onShowPastChange).toHaveBeenCalledWith(true)
    })

    test('displays count badges in filter buttons', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      // "Todos" should show total count
      const todosButton = screen.getByRole('button', { name: /^todos/i })
      expect(todosButton).toHaveTextContent('(25)')

      // "Pendiente" should show pending count
      const pendienteButton = screen.getByRole('button', { name: /pendiente/i })
      expect(pendienteButton).toHaveTextContent('(5)')
    })

    test('highlights active filter button', () => {
      renderWithProviders(
        <OrganizerDashboard {...defaultProps} activeFilter="draft" />
      )

      const draftButton = screen.getByRole('button', { name: /^borrador/i })
      expect(draftButton.className).toContain('bg-primary-600')
      expect(draftButton.getAttribute('aria-pressed')).toBe('true')
    })
  })

  describe('Accessibility', () => {
    test('main container has role="main"', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    test('filter buttons have aria-pressed attribute', () => {
      renderWithProviders(
        <OrganizerDashboard {...defaultProps} activeFilter="draft" />
      )

      const draftButton = screen.getByRole('button', { name: /^borrador/i })
      expect(draftButton).toHaveAttribute('aria-pressed')
    })

    test('stats summary has role="region"', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      expect(screen.getByRole('region', { name: /estadisticas/i })).toBeInTheDocument()
    })

    test('filter groups have proper aria-labels', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      expect(screen.getByRole('group', { name: /filtrar eventos por estado/i })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /filtrar por periodo/i })).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    test('does not render pagination when only one page', () => {
      renderWithProviders(<OrganizerDashboard {...defaultProps} />)

      expect(screen.queryByRole('navigation', { name: /paginaci[oó]n/i })).not.toBeInTheDocument()
    })

    test('renders pagination when multiple pages', () => {
      renderWithProviders(
        <OrganizerDashboard {...defaultProps} totalPages={3} />
      )

      expect(screen.getByRole('navigation', { name: /paginaci[oó]n/i })).toBeInTheDocument()
    })
  })
})
