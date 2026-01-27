/**
 * Tests for OrganizerEventListItem (Dumb Component)
 *
 * Tests rendering of event item with status, date, location, and action buttons.
 */

import { fireEvent,render, screen } from '@testing-library/react'

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

    test('should render event date with icon', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      // Date is now displayed with locale format and icon, no label
      // Timezone may shift the day, so we check for June 2025
      expect(screen.getByText(/\d+\/6\/2025/)).toBeInTheDocument()
    })

    test('should render location name with icon', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      // Location is now displayed without label, just the value
      expect(screen.getByText('Location 1')).toBeInTheDocument()
    })

    test('should render event type name with icon', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      // Event type is now displayed without label, just the value
      expect(screen.getByText('Category 1')).toBeInTheDocument()
    })

    test('should render status badge', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByText('draft')).toBeInTheDocument()
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
  })

  describe('status styling', () => {
    // Badge component uses semantic color variants
    const statusTests: Array<{ status: OrganizerEvent['status']; expectedClass: string }> = [
      { status: 'draft', expectedClass: 'bg-neutral-100' },
      { status: 'pending_internal_approval', expectedClass: 'bg-warning-50' },
      { status: 'approved_internal', expectedClass: 'bg-success-50' },
      { status: 'rejected', expectedClass: 'bg-error-50' },
      { status: 'published', expectedClass: 'bg-primary-50' },
    ]

    statusTests.forEach(({ status, expectedClass }) => {
      test(`should apply correct styling for ${typeof status === 'string' ? status : status.status_code} status`, () => {
        const event: OrganizerEvent = { ...baseEvent, status }
        render(<OrganizerEventListItem {...defaultProps} event={event} />)

        const statusText = typeof status === 'string' ? status : status.status_name
        const badge = screen.getByText(statusText)
        expect(badge).toHaveClass(expectedClass)
      })
    })

    test('should apply default styling for unknown status object', () => {
      const event: OrganizerEvent = {
        ...baseEvent,
        status: { id: 99, status_code: 'unknown', status_name: 'Unknown Status' }
      }
      render(<OrganizerEventListItem {...defaultProps} event={event} />)

      const badge = screen.getByText('Unknown Status')
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

      expect(screen.getByText('Published Event')).toBeInTheDocument()
    })
  })

  describe('date handling', () => {
    test('should use start_date when available', () => {
      const event = { ...baseEvent, start_date: '2025-12-25' }
      render(<OrganizerEventListItem {...defaultProps} event={event} />)

      // Should show December 2025 in locale format (timezone may shift the day)
      expect(screen.getByText(/\d+\/12\/2025/)).toBeInTheDocument()
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
  })
})
