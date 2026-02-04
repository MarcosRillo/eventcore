/**
 * Tests for OrganizerEventListItem (Dumb Component)
 *
 * Tests rendering of event item with status, date, location, and action buttons.
 * Updated for new layout with status badge at top, horizontal metadata, and Card wrapper.
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { OrganizerEventListItem } from '@/features/organizer/components/dumb/OrganizerEventListItem'
import { OrganizerEvent } from '@/features/organizer/types/event.types'

// Mock EventActionButtonsContainer to simplify testing
jest.mock('@/features/organizer/components/smart/EventActionButtonsContainer', () => ({
  EventActionButtonsContainer: ({ event, onSuccess }: { event: { id: number }; onSuccess?: () => void }) => (
    <div data-testid="action-buttons">
      <span data-testid="action-event-id">{event.id}</span>
      <button onClick={onSuccess}>Action Success</button>
    </div>
  )
}))

describe('OrganizerEventListItem', () => {
  const mockOnEdit = jest.fn()
  const mockOnView = jest.fn()
  const mockOnSuccess = jest.fn()

  const baseEvent: OrganizerEvent = {
    id: 1,
    title: 'Test Event',
    description: 'Test description',
    start_date: '2025-06-15',
    end_date: '2025-06-15',
    status: 'draft',
    event_type: { id: 1, name: 'Category 1' },
    locations: [{ id: 1, name: 'Location 1' }]
  }

  const defaultProps = {
    event: baseEvent,
    onEdit: mockOnEdit,
    onView: mockOnView,
    onSuccess: mockOnSuccess
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    test('should render event title', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByText('Test Event')).toBeInTheDocument()
    })

    test('should render event title in h3 element', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Test Event')
    })

    test('should render event date with icon', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      // Date is now displayed with Intl.DateTimeFormat 'short' preset
      // Format varies by timezone: "14 jun 2025" or "15 jun 2025" (Spanish locale)
      expect(screen.getByText(/\d+\s+jun\s+2025/i)).toBeInTheDocument()
    })

    test('should render location name with icon', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByText('Location 1')).toBeInTheDocument()
    })

    test('should render event type name with icon', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByText('Category 1')).toBeInTheDocument()
    })

    test('should render status badge with translated label', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      // Status is now translated via getOrganizerStatusLabel
      expect(screen.getByText('Borrador')).toBeInTheDocument()
    })

    test('should render Ver button', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByRole('button', { name: /ver test event/i })).toBeInTheDocument()
    })

    test('should render Editar button', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByRole('button', { name: /editar test event/i })).toBeInTheDocument()
    })

    test('should render EventActionButtonsContainer', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByTestId('action-buttons')).toBeInTheDocument()
    })

    test('should render as article element', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByRole('article')).toBeInTheDocument()
    })
  })

  describe('status styling', () => {
    // Badge component uses semantic color variants
    const statusTests: Array<{ status: OrganizerEvent['status']; expectedClass: string; expectedLabel: string }> = [
      { status: 'draft', expectedClass: 'bg-neutral-100', expectedLabel: 'Borrador' },
      { status: 'pending_internal_approval', expectedClass: 'bg-warning-50', expectedLabel: 'Pendiente revision' },
      { status: 'approved_internal', expectedClass: 'bg-primary-50', expectedLabel: 'Aprobado interno' },
      { status: 'rejected', expectedClass: 'bg-error-50', expectedLabel: 'Rechazado' },
      { status: 'published', expectedClass: 'bg-success-50', expectedLabel: 'Publicado' },
      { status: 'requires_changes', expectedClass: 'bg-warning-50', expectedLabel: 'Requiere cambios' },
      { status: 'cancelled', expectedClass: 'bg-neutral-100', expectedLabel: 'Cancelado' },
    ]

    statusTests.forEach(({ status, expectedClass, expectedLabel }) => {
      test(`should apply correct styling for ${typeof status === 'string' ? status : status.status_code} status`, () => {
        const event: OrganizerEvent = { ...baseEvent, status }
        render(<OrganizerEventListItem {...defaultProps} event={event} />)

        const badge = screen.getByText(expectedLabel)
        expect(badge).toHaveClass(expectedClass)
      })
    })

    test('should apply default styling for unknown status object', () => {
      const event: OrganizerEvent = {
        ...baseEvent,
        status: { id: 99, status_code: 'unknown', status_name: 'Unknown Status' }
      }
      render(<OrganizerEventListItem {...defaultProps} event={event} />)

      // For unknown status_code, getOrganizerStatusLabel falls back to the code itself
      const badge = screen.getByText('unknown')
      expect(badge).toHaveClass('bg-neutral-100')
    })
  })

  describe('status object handling', () => {
    test('should handle status as object with status_code and status_name', () => {
      const event: OrganizerEvent = {
        ...baseEvent,
        status: { id: 5, status_code: 'published', status_name: 'Published Event' }
      }
      render(<OrganizerEventListItem {...defaultProps} event={event} />)

      // Always uses translated label from status_code, ignoring status_name
      expect(screen.getByText('Publicado')).toBeInTheDocument()
    })
  })

  describe('date handling', () => {
    test('should use start_date when available', () => {
      const event = { ...baseEvent, start_date: '2025-12-25' }
      render(<OrganizerEventListItem {...defaultProps} event={event} />)

      // Should show December 2025 in Spanish locale format
      // Format varies by timezone: "24 dic 2025" or "25 dic 2025"
      expect(screen.getByText(/\d+\s+dic\s+2025/i)).toBeInTheDocument()
    })

    test('should show Sin fecha when no date is available', () => {
      // Type assertion needed for edge case testing - component handles missing dates gracefully
      const event = { ...baseEvent, start_date: '' } as OrganizerEvent
      render(<OrganizerEventListItem {...defaultProps} event={event} />)

      expect(screen.getByText('Sin fecha')).toBeInTheDocument()
    })
  })

  describe('location handling', () => {
    test('should use locations array when available', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByText('Location 1')).toBeInTheDocument()
    })

    test('should show N/A when locations array is empty', () => {
      const event = { ...baseEvent, locations: [] }
      render(<OrganizerEventListItem {...defaultProps} event={event} />)

      expect(screen.getByText('N/A')).toBeInTheDocument()
    })

    test('should show N/A when no location is available', () => {
      // Type assertion needed for edge case testing - component handles missing locations gracefully
      const event = { ...baseEvent, locations: undefined } as unknown as OrganizerEvent
      render(<OrganizerEventListItem {...defaultProps} event={event} />)

      expect(screen.getByText('N/A')).toBeInTheDocument()
    })
  })

  describe('event type handling', () => {
    test('should render event type when available', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByText('Category 1')).toBeInTheDocument()
    })

    test('should render event subtype when available', () => {
      const event = {
        ...baseEvent,
        event_type: { id: 1, name: 'Main Type' },
        event_subtype: { id: 2, name: 'Sub Type' }
      }
      render(<OrganizerEventListItem {...defaultProps} event={event} />)

      expect(screen.getByText('Main Type - Sub Type')).toBeInTheDocument()
    })

    test('should show N/A when event type is not available', () => {
      // Type assertion needed for edge case testing - component handles missing event type gracefully
      const event = { ...baseEvent, event_type: undefined } as unknown as OrganizerEvent
      render(<OrganizerEventListItem {...defaultProps} event={event} />)

      // Multiple N/A may appear (for location and type), check that at least one exists
      expect(screen.getAllByText('N/A').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('button interactions', () => {
    test('should call onView when View button is clicked', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /ver test event/i }))

      expect(mockOnView).toHaveBeenCalledTimes(1)
    })

    test('should call onEdit when Edit button is clicked', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /editar test event/i }))

      expect(mockOnEdit).toHaveBeenCalledTimes(1)
    })

    test('should pass event to EventActionButtonsContainer', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByTestId('action-event-id')).toHaveTextContent('1')
    })

    test('should pass onSuccess to EventActionButtonsContainer', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      fireEvent.click(screen.getByText('Action Success'))

      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  describe('disabled state', () => {
    test('should disable View button when disabled is true', () => {
      render(<OrganizerEventListItem {...defaultProps} disabled={true} />)

      expect(screen.getByRole('button', { name: /ver test event/i })).toBeDisabled()
    })

    test('should disable Edit button when disabled is true', () => {
      render(<OrganizerEventListItem {...defaultProps} disabled={true} />)

      expect(screen.getByRole('button', { name: /editar test event/i })).toBeDisabled()
    })

    test('should not disable buttons by default', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByRole('button', { name: /ver test event/i })).not.toBeDisabled()
      expect(screen.getByRole('button', { name: /editar test event/i })).not.toBeDisabled()
    })
  })

  describe('accessibility', () => {
    test('should have accessible aria-label on View button', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Ver Test Event' })).toBeInTheDocument()
    })

    test('should have accessible aria-label on Edit button', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Editar Test Event' })).toBeInTheDocument()
    })

    test('should have aria-hidden on decorative icons', () => {
      const { container } = render(<OrganizerEventListItem {...defaultProps} />)

      // All lucide-react icons should have aria-hidden="true"
      const svgs = container.querySelectorAll('svg')
      svgs.forEach(svg => {
        expect(svg).toHaveAttribute('aria-hidden', 'true')
      })
    })

    test('should have aria-hidden on decorative separators', () => {
      const { container } = render(<OrganizerEventListItem {...defaultProps} />)

      // Dot separators should have aria-hidden="true"
      const separators = container.querySelectorAll('[aria-hidden="true"]')
      expect(separators.length).toBeGreaterThan(0)
    })
  })

  describe('memoization', () => {
    test('should be memoized component', () => {
      // memo() creates a component that includes the original function name
      // The $$typeof symbol indicates it's a memo component
      expect(typeof OrganizerEventListItem).toBe('object')
      expect(OrganizerEventListItem.$$typeof?.toString()).toContain('react.memo')
    })
  })
})
