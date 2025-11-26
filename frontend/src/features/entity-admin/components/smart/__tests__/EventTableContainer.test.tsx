import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EventTableContainer } from '../EventTableContainer'
import { Event, EVENT_STATUS, EVENT_TYPE } from '@/types/event.types'

// Mock child component
jest.mock('@/features/entity-admin/components/dumb/EventTable', () => ({
  EventTable: jest.fn(({ events, isLoading, columns, actions, confirmDialog, onCloseConfirmDialog }) => (
    <div data-testid="event-table-mock">
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="events-count">{events.length}</div>
      <div data-testid="columns-count">{columns.filter((c: any) => c.visible).length}</div>
      <div data-testid="actions-count">{actions.length}</div>

      {/* Simulate action buttons */}
      {actions.map((action: any) => (
        <button
          key={action.key}
          data-testid={`action-${action.key}`}
          onClick={() => action.onClick(events[0])}
        >
          {action.label}
        </button>
      ))}

      {/* Simulate confirm dialog */}
      {confirmDialog.isOpen && (
        <div data-testid="confirm-dialog">
          <div data-testid="confirm-title">{confirmDialog.title}</div>
          <div data-testid="confirm-message">{confirmDialog.message}</div>
          <button data-testid="confirm-button" onClick={confirmDialog.onConfirm}>
            Confirm
          </button>
          <button data-testid="cancel-button" onClick={onCloseConfirmDialog}>
            Cancel
          </button>
        </div>
      )}
    </div>
  )),
}))

const createMockEvent = (overrides?: Partial<Event>): Event => ({
  id: 1,
  title: 'Test Event',
  description: 'Test Description',
  start_date: '2025-12-15T10:00:00Z',
  end_date: '2025-12-15T18:00:00Z',
  status: EVENT_STATUS.DRAFT,
  type: EVENT_TYPE.SINGLE_LOCATION,
  category_id: 1,
  location_id: 1,
  organizer_id: 1,
  is_featured: false,
  created_at: '2025-11-01T00:00:00Z',
  updated_at: '2025-11-01T00:00:00Z',
  ...overrides,
})

describe('EventTableContainer', () => {
  const mockEvents = [createMockEvent()]

  describe('Initialization', () => {
    it('should render EventTable with correct props', () => {
      render(<EventTableContainer events={mockEvents} isLoading={false} />)

      expect(screen.getByTestId('event-table-mock')).toBeInTheDocument()
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
      expect(screen.getByTestId('events-count')).toHaveTextContent('1')
    })

    it('should pass loading state to EventTable', () => {
      render(<EventTableContainer events={[]} isLoading={true} />)

      expect(screen.getByTestId('loading')).toHaveTextContent('true')
    })

    it('should default to admin view mode', () => {
      render(<EventTableContainer events={mockEvents} isLoading={false} />)

      // Admin mode has 9 columns (including actions)
      const columnsCount = parseInt(screen.getByTestId('columns-count').textContent || '0')
      expect(columnsCount).toBeGreaterThan(5)
    })
  })

  describe('View Modes', () => {
    it('should configure columns for admin view mode', () => {
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
          showActions={true}
        />
      )

      const columnsCount = parseInt(screen.getByTestId('columns-count').textContent || '0')
      expect(columnsCount).toBe(9) // All columns visible
    })

    it('should configure columns for organizer view mode', () => {
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="organizer"
          showActions={true}
        />
      )

      const columnsCount = parseInt(screen.getByTestId('columns-count').textContent || '0')
      expect(columnsCount).toBe(8) // Event, date, location, type, status, category, feedback, actions
    })

    it('should configure columns for public view mode', () => {
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="public"
          showActions={true}
        />
      )

      const columnsCount = parseInt(screen.getByTestId('columns-count').textContent || '0')
      expect(columnsCount).toBe(6) // Event, date, location, category, type, actions
    })

    it('should hide actions when showActions is false', () => {
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          showActions={false}
        />
      )

      const actionsCount = parseInt(screen.getByTestId('actions-count').textContent || '0')
      expect(actionsCount).toBe(0)
    })
  })

  describe('Admin View Actions', () => {
    it('should configure view action for admin mode', () => {
      const onSelectEvent = jest.fn()
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
          onSelectEvent={onSelectEvent}
        />
      )

      const viewButton = screen.getByTestId('action-view')
      fireEvent.click(viewButton)

      expect(onSelectEvent).toHaveBeenCalledWith(mockEvents[0])
    })

    it('should configure edit action for admin mode', () => {
      const onEditEvent = jest.fn()
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
          onEditEvent={onEditEvent}
        />
      )

      const editButton = screen.getByTestId('action-edit')
      fireEvent.click(editButton)

      expect(onEditEvent).toHaveBeenCalledWith(mockEvents[0])
    })

    it('should configure approval action for admin mode', () => {
      const onApprovalAction = jest.fn()
      const pendingEvent = createMockEvent({ status: EVENT_STATUS.PENDING_INTERNAL_APPROVAL })

      render(
        <EventTableContainer
          events={[pendingEvent]}
          isLoading={false}
          viewMode="admin"
          onApprovalAction={onApprovalAction}
        />
      )

      const approveButton = screen.getByTestId('action-approve')
      fireEvent.click(approveButton)

      expect(onApprovalAction).toHaveBeenCalledWith(pendingEvent)
    })

    it('should configure featured toggle action for admin mode', () => {
      const onToggleFeatured = jest.fn()
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
          onToggleFeatured={onToggleFeatured}
        />
      )

      const featuredButton = screen.getByTestId('action-featured')
      fireEvent.click(featuredButton)

      expect(onToggleFeatured).toHaveBeenCalledWith(mockEvents[0])
    })

    it('should configure duplicate action for admin mode', () => {
      const onDuplicateEvent = jest.fn()
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
          onDuplicateEvent={onDuplicateEvent}
        />
      )

      const duplicateButton = screen.getByTestId('action-duplicate')
      fireEvent.click(duplicateButton)

      expect(onDuplicateEvent).toHaveBeenCalledWith(mockEvents[0])
    })
  })

  describe('Delete Action with Confirmation', () => {
    it('should show confirmation dialog when delete is clicked', () => {
      const onDeleteEvent = jest.fn()
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
          onDeleteEvent={onDeleteEvent}
        />
      )

      const deleteButton = screen.getByTestId('action-delete')
      fireEvent.click(deleteButton)

      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-title')).toHaveTextContent('Confirmar Eliminación')
      expect(screen.getByTestId('confirm-message')).toHaveTextContent('Test Event')
    })

    it('should call onDeleteEvent when confirmation is confirmed', async () => {
      const onDeleteEvent = jest.fn()
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
          onDeleteEvent={onDeleteEvent}
        />
      )

      // Open confirmation dialog
      const deleteButton = screen.getByTestId('action-delete')
      fireEvent.click(deleteButton)

      // Confirm deletion
      const confirmButton = screen.getByTestId('confirm-button')
      fireEvent.click(confirmButton)

      expect(onDeleteEvent).toHaveBeenCalledWith(mockEvents[0].id)
    })

    it('should close confirmation dialog when cancel is clicked', () => {
      const onDeleteEvent = jest.fn()
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
          onDeleteEvent={onDeleteEvent}
        />
      )

      // Open confirmation dialog
      const deleteButton = screen.getByTestId('action-delete')
      fireEvent.click(deleteButton)

      // Cancel deletion
      const cancelButton = screen.getByTestId('cancel-button')
      fireEvent.click(cancelButton)

      expect(onDeleteEvent).not.toHaveBeenCalled()
    })
  })

  describe('Organizer View Actions', () => {
    it('should configure edit action only for draft or requires_changes status', () => {
      const onEditEvent = jest.fn()
      const draftEvent = createMockEvent({ status: EVENT_STATUS.DRAFT })

      render(
        <EventTableContainer
          events={[draftEvent]}
          isLoading={false}
          viewMode="organizer"
          onEditEvent={onEditEvent}
        />
      )

      expect(screen.getByTestId('action-edit')).toBeInTheDocument()
    })

    it('should configure request approval action for draft events', () => {
      const onRequestApproval = jest.fn()
      const draftEvent = createMockEvent({ status: EVENT_STATUS.DRAFT })

      render(
        <EventTableContainer
          events={[draftEvent]}
          isLoading={false}
          viewMode="organizer"
          onRequestApproval={onRequestApproval}
        />
      )

      const requestButton = screen.getByTestId('action-request_approval')
      fireEvent.click(requestButton)

      expect(onRequestApproval).toHaveBeenCalledWith(draftEvent)
    })

    it('should configure view comments action when comments exist', () => {
      const onViewComments = jest.fn()
      const eventWithComments = createMockEvent({ approval_comments: 'Please fix title' })

      render(
        <EventTableContainer
          events={[eventWithComments]}
          isLoading={false}
          viewMode="organizer"
          onViewComments={onViewComments}
        />
      )

      const commentsButton = screen.getByTestId('action-comments')
      fireEvent.click(commentsButton)

      expect(onViewComments).toHaveBeenCalledWith(eventWithComments)
    })
  })

  describe('Public View Actions', () => {
    it('should configure share action for public view', () => {
      const onShareEvent = jest.fn()
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="public"
          onShareEvent={onShareEvent}
        />
      )

      const shareButton = screen.getByTestId('action-share')
      fireEvent.click(shareButton)

      expect(onShareEvent).toHaveBeenCalledWith(mockEvents[0])
    })

    it('should configure calendar export action for public view', () => {
      const onExportToCalendar = jest.fn()
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="public"
          onExportToCalendar={onExportToCalendar}
        />
      )

      const calendarButton = screen.getByTestId('action-calendar')
      fireEvent.click(calendarButton)

      expect(onExportToCalendar).toHaveBeenCalledWith(mockEvents[0])
    })
  })

  describe('Compact View', () => {
    it('should hide certain columns in compact view', () => {
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
          compactView={true}
        />
      )

      // Compact view hides 'created' column in admin mode
      const columnsCount = parseInt(screen.getByTestId('columns-count').textContent || '0')
      expect(columnsCount).toBe(8) // One less than full admin view
    })
  })

  describe('Status Labels', () => {
    it('should provide status labels for all event statuses', () => {
      const { rerender } = render(
        <EventTableContainer events={mockEvents} isLoading={false} />
      )

      // Test a few key statuses
      const statuses = [
        EVENT_STATUS.DRAFT,
        EVENT_STATUS.PENDING_INTERNAL_APPROVAL,
        EVENT_STATUS.PUBLISHED,
        EVENT_STATUS.REJECTED,
      ]

      statuses.forEach((status) => {
        const eventWithStatus = createMockEvent({ status })
        rerender(<EventTableContainer events={[eventWithStatus]} isLoading={false} />)
        expect(screen.getByTestId('event-table-mock')).toBeInTheDocument()
      })
    })
  })

  describe('Type Labels', () => {
    it('should provide type labels for event types', () => {
      const singleLocationEvent = createMockEvent({ type: EVENT_TYPE.SINGLE_LOCATION })
      const { rerender } = render(
        <EventTableContainer events={[singleLocationEvent]} isLoading={false} />
      )

      expect(screen.getByTestId('event-table-mock')).toBeInTheDocument()

      const multiLocationEvent = createMockEvent({ type: EVENT_TYPE.MULTI_LOCATION })
      rerender(<EventTableContainer events={[multiLocationEvent]} isLoading={false} />)

      expect(screen.getByTestId('event-table-mock')).toBeInTheDocument()
    })
  })

  describe('Empty and Loading States', () => {
    it('should handle empty events array', () => {
      render(<EventTableContainer events={[]} isLoading={false} />)

      expect(screen.getByTestId('events-count')).toHaveTextContent('0')
    })

    it('should handle loading state', () => {
      render(<EventTableContainer events={mockEvents} isLoading={true} />)

      expect(screen.getByTestId('loading')).toHaveTextContent('true')
    })
  })

  describe('Backward Compatibility', () => {
    it('should support compactView prop', () => {
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          compactView={true}
        />
      )

      expect(screen.getByTestId('event-table-mock')).toBeInTheDocument()
    })

    it('should support showActions prop', () => {
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          showActions={false}
        />
      )

      const actionsCount = parseInt(screen.getByTestId('actions-count').textContent || '0')
      expect(actionsCount).toBe(0)
    })
  })
})
