/**
 * Tests for OrganizerEventListItem (Dumb Component)
 *
 * Tests rendering of event item with status, date, location, and action buttons.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { OrganizerEventListItem } from '../OrganizerEventListItem'
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

    test('should render event date', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByText(/Date:/)).toBeInTheDocument()
    })

    test('should render location name', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByText('Location: Location 1')).toBeInTheDocument()
    })

    test('should render event type name', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByText('Type: Category 1')).toBeInTheDocument()
    })

    test('should render status badge', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByText('draft')).toBeInTheDocument()
    })

    test('should render View button', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByRole('button', { name: /view test event/i })).toBeInTheDocument()
    })

    test('should render Edit button', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByRole('button', { name: /edit test event/i })).toBeInTheDocument()
    })

    test('should render EventActionButtonsContainer', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByTestId('action-buttons')).toBeInTheDocument()
    })
  })

  describe('status styling', () => {
    const statusTests: Array<{ status: OrganizerEvent['status']; expectedClass: string }> = [
      { status: 'draft', expectedClass: 'bg-gray-200' },
      { status: 'pending_internal_approval', expectedClass: 'bg-yellow-200' },
      { status: 'approved_internal', expectedClass: 'bg-green-200' },
      { status: 'rejected', expectedClass: 'bg-red-200' },
      { status: 'published', expectedClass: 'bg-blue-200' },
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
      expect(badge).toHaveClass('bg-gray-200')
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

      // Should show December 25 - check for date content
      const dateText = screen.getByText(/Date:/).textContent
      expect(dateText).toContain('2025')
    })

    test('should show N/A when no date is available', () => {
      // Type assertion needed for edge case testing - component handles missing dates gracefully
      const event = { ...baseEvent, start_date: '' } as OrganizerEvent
      render(<OrganizerEventListItem {...defaultProps} event={event} />)

      expect(screen.getByText('Date: N/A')).toBeInTheDocument()
    })
  })

  describe('location handling', () => {
    test('should use locations array when available', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByText('Location: Location 1')).toBeInTheDocument()
    })

    test('should show N/A when locations array is empty', () => {
      const event = { ...baseEvent, locations: [] }
      render(<OrganizerEventListItem {...defaultProps} event={event} />)

      expect(screen.getByText('Location: N/A')).toBeInTheDocument()
    })

    test('should show N/A when no location is available', () => {
      // Type assertion needed for edge case testing - component handles missing locations gracefully
      const event = { ...baseEvent, locations: undefined } as unknown as OrganizerEvent
      render(<OrganizerEventListItem {...defaultProps} event={event} />)

      expect(screen.getByText('Location: N/A')).toBeInTheDocument()
    })
  })

  describe('event type handling', () => {
    test('should render event type when available', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByText('Type: Category 1')).toBeInTheDocument()
    })

    test('should show N/A when event type is not available', () => {
      // Type assertion needed for edge case testing - component handles missing event type gracefully
      const event = { ...baseEvent, event_type: undefined } as unknown as OrganizerEvent
      render(<OrganizerEventListItem {...defaultProps} event={event} />)

      expect(screen.getByText('Type: N/A')).toBeInTheDocument()
    })
  })

  describe('button interactions', () => {
    test('should call onView when View button is clicked', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /view test event/i }))

      expect(mockOnView).toHaveBeenCalledTimes(1)
    })

    test('should call onEdit when Edit button is clicked', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /edit test event/i }))

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

      expect(screen.getByRole('button', { name: /view test event/i })).toBeDisabled()
    })

    test('should disable Edit button when disabled is true', () => {
      render(<OrganizerEventListItem {...defaultProps} disabled={true} />)

      expect(screen.getByRole('button', { name: /edit test event/i })).toBeDisabled()
    })

    test('should not disable buttons by default', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByRole('button', { name: /view test event/i })).not.toBeDisabled()
      expect(screen.getByRole('button', { name: /edit test event/i })).not.toBeDisabled()
    })
  })

  describe('accessibility', () => {
    test('should have accessible aria-label on View button', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'View Test Event' })).toBeInTheDocument()
    })

    test('should have accessible aria-label on Edit button', () => {
      render(<OrganizerEventListItem {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Edit Test Event' })).toBeInTheDocument()
    })
  })
})
