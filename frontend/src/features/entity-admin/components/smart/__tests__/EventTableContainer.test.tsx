import { render, screen, fireEvent } from '@testing-library/react';

import { EventTableContainer } from '@/features/entity-admin/components/smart/EventTableContainer';
import { Event, EVENT_STATUS, EVENT_TYPE } from '@/types/event.types';

// Mock GenericTable to simplify testing the container logic
jest.mock('@/shared/components/tables', () => ({
  GenericTable: jest.fn(({ items, columns, actions, isLoading, emptyMessage, confirmDialog, onCloseConfirmDialog, testId }) => (
    <div data-testid={testId || 'generic-table-mock'}>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="items-count">{items.length}</div>
      <div data-testid="columns-count">{columns.length}</div>
      <div data-testid="actions-count">{actions.length}</div>
      <div data-testid="empty-message">{emptyMessage}</div>

      {/* Render column labels for verification */}
      <div data-testid="column-labels">
        {columns.map((col: { key: string; label: string }) => (
          <span key={col.key} data-testid={`column-${col.key}`}>{col.label}</span>
        ))}
      </div>

      {/* Simulate action buttons */}
      {actions.map((action: { key: string; label: string; onClick: (item: Event) => void; condition?: (item: Event) => boolean }) => {
        const shouldShow = items.length > 0 && (!action.condition || action.condition(items[0]));
        return shouldShow ? (
          <button
            key={action.key}
            data-testid={`action-${action.key}`}
            onClick={() => items[0] && action.onClick(items[0])}
          >
            {action.label}
          </button>
        ) : null;
      })}

      {/* Simulate confirm dialog */}
      {confirmDialog?.isOpen && (
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
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  EyeIcon: () => <span>EyeIcon</span>,
  PencilIcon: () => <span>PencilIcon</span>,
  CheckCircleIcon: () => <span>CheckCircleIcon</span>,
  StarIcon: () => <span>StarIcon</span>,
  DocumentDuplicateIcon: () => <span>DocumentDuplicateIcon</span>,
  TrashIcon: () => <span>TrashIcon</span>,
  PaperAirplaneIcon: () => <span>PaperAirplaneIcon</span>,
  ChatBubbleLeftIcon: () => <span>ChatBubbleLeftIcon</span>,
  ShareIcon: () => <span>ShareIcon</span>,
  CalendarIcon: () => <span>CalendarIcon</span>,
}));

jest.mock('@heroicons/react/24/solid', () => ({
  StarIcon: () => <span>StarIconSolid</span>,
}));

const createMockEvent = (overrides?: Partial<Event>): Event => ({
  id: 1,
  title: 'Test Event',
  description: 'Test Description',
  start_date: '2025-12-15T10:00:00Z',
  end_date: '2025-12-15T18:00:00Z',
  status: EVENT_STATUS.DRAFT,
  type: EVENT_TYPE.SINGLE_LOCATION,
  event_type_id: 1,
  event_subtype_id: 1,
  event_type: { id: 1, name: 'Cultural', entity_id: 1, is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  event_subtype: { id: 1, name: 'Music Festival', event_type_id: 1, entity_id: 1, is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  locations: [],
  location: { id: 1, name: 'Teatro', address: 'Test 123', city: 'CABA', country: 'Argentina', features: [], is_active: true, entity_id: 1, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  organizer: { id: 1, name: 'Test Org', organization: 'Test Org' },
  is_featured: false,
  approval_history: [],
  created_at: '2025-11-01T00:00:00Z',
  updated_at: '2025-11-01T00:00:00Z',
  ...overrides,
});

describe('EventTableContainer', () => {
  const mockEvents = [createMockEvent()];

  describe('Initialization', () => {
    it('should render GenericTable with correct props', () => {
      render(<EventTableContainer events={mockEvents} isLoading={false} />);

      expect(screen.getByTestId('event-table')).toBeInTheDocument();
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    });

    it('should pass loading state to GenericTable', () => {
      render(<EventTableContainer events={[]} isLoading={true} />);

      expect(screen.getByTestId('loading')).toHaveTextContent('true');
    });

    it('should use "event-table" as testId', () => {
      render(<EventTableContainer events={mockEvents} isLoading={false} />);

      expect(screen.getByTestId('event-table')).toBeInTheDocument();
    });

    it('should provide correct empty message', () => {
      render(<EventTableContainer events={mockEvents} isLoading={false} />);

      expect(screen.getByTestId('empty-message')).toHaveTextContent('No hay eventos disponibles');
    });
  });

  describe('View Modes - Column Configuration', () => {
    it('should configure 6 columns for admin view mode', () => {
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
        />
      );

      const columnsCount = parseInt(screen.getByTestId('columns-count').textContent || '0');
      expect(columnsCount).toBe(4); // title, date, type, status (location and category removed)
    });

    it('should configure 4 columns for organizer view mode', () => {
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="organizer"
        />
      );

      const columnsCount = parseInt(screen.getByTestId('columns-count').textContent || '0');
      expect(columnsCount).toBe(3); // title, date, status (location and category removed)
    });

    it('should configure 3 columns for public view mode', () => {
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="public"
        />
      );

      const columnsCount = parseInt(screen.getByTestId('columns-count').textContent || '0');
      expect(columnsCount).toBe(2); // title, date (location and category removed)
    });

    it('should include correct column labels for admin view', () => {
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
        />
      );

      expect(screen.getByTestId('column-title')).toHaveTextContent('Evento');
      expect(screen.getByTestId('column-date')).toHaveTextContent('Fecha');
      expect(screen.getByTestId('column-type')).toHaveTextContent('Tipo');
      expect(screen.getByTestId('column-status')).toHaveTextContent('Estado');
      // Location and Category columns were removed
    });
  });

  describe('Admin View Actions', () => {
    it('should configure view action when onSelectEvent is provided', () => {
      const onSelectEvent = jest.fn();
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
          onSelectEvent={onSelectEvent}
        />
      );

      const viewButton = screen.getByTestId('action-view');
      fireEvent.click(viewButton);

      expect(onSelectEvent).toHaveBeenCalledWith(mockEvents[0]);
    });

    it('should configure edit action when onEditEvent is provided', () => {
      const onEditEvent = jest.fn();
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
          onEditEvent={onEditEvent}
        />
      );

      const editButton = screen.getByTestId('action-edit');
      fireEvent.click(editButton);

      expect(onEditEvent).toHaveBeenCalledWith(mockEvents[0]);
    });

    it('should configure approval action for pending events', () => {
      const onApprovalAction = jest.fn();
      const pendingEvent = createMockEvent({ status: EVENT_STATUS.PENDING_INTERNAL_APPROVAL });

      render(
        <EventTableContainer
          events={[pendingEvent]}
          isLoading={false}
          viewMode="admin"
          onApprovalAction={onApprovalAction}
        />
      );

      const approveButton = screen.getByTestId('action-approve');
      fireEvent.click(approveButton);

      expect(onApprovalAction).toHaveBeenCalledWith(pendingEvent);
    });

    it('should show approval action for ALL events including draft', () => {
      const onApprovalAction = jest.fn();
      const draftEvent = createMockEvent({ status: EVENT_STATUS.DRAFT });

      render(
        <EventTableContainer
          events={[draftEvent]}
          isLoading={false}
          viewMode="admin"
          onApprovalAction={onApprovalAction}
        />
      );

      // Admin can manage ALL events regardless of status
      expect(screen.getByTestId('action-approve')).toBeInTheDocument();
    });

    it('should configure featured toggle action', () => {
      const onToggleFeatured = jest.fn();
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
          onToggleFeatured={onToggleFeatured}
        />
      );

      const featuredButton = screen.getByTestId('action-featured');
      fireEvent.click(featuredButton);

      expect(onToggleFeatured).toHaveBeenCalledWith(mockEvents[0]);
    });

    it('should configure duplicate action', () => {
      const onDuplicateEvent = jest.fn();
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
          onDuplicateEvent={onDuplicateEvent}
        />
      );

      const duplicateButton = screen.getByTestId('action-duplicate');
      fireEvent.click(duplicateButton);

      expect(onDuplicateEvent).toHaveBeenCalledWith(mockEvents[0]);
    });
  });

  describe('Delete Action with Confirmation', () => {
    it('should show confirmation dialog when delete is clicked', () => {
      const onDeleteEvent = jest.fn();
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
          onDeleteEvent={onDeleteEvent}
        />
      );

      const deleteButton = screen.getByTestId('action-delete');
      fireEvent.click(deleteButton);

      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-title')).toHaveTextContent('Confirmar Eliminación');
      expect(screen.getByTestId('confirm-message')).toHaveTextContent('Test Event');
    });

    it('should call onDeleteEvent when confirmation is confirmed', () => {
      const onDeleteEvent = jest.fn();
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
          onDeleteEvent={onDeleteEvent}
        />
      );

      const deleteButton = screen.getByTestId('action-delete');
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByTestId('confirm-button');
      fireEvent.click(confirmButton);

      expect(onDeleteEvent).toHaveBeenCalledWith(mockEvents[0].id);
    });

    it('should close confirmation dialog when cancel is clicked', () => {
      const onDeleteEvent = jest.fn();
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
          onDeleteEvent={onDeleteEvent}
        />
      );

      const deleteButton = screen.getByTestId('action-delete');
      fireEvent.click(deleteButton);

      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);

      expect(onDeleteEvent).not.toHaveBeenCalled();
    });
  });

  describe('Organizer View Actions', () => {
    it('should show edit action only for editable statuses', () => {
      const onEditEvent = jest.fn();
      const draftEvent = createMockEvent({ status: EVENT_STATUS.DRAFT });

      render(
        <EventTableContainer
          events={[draftEvent]}
          isLoading={false}
          viewMode="organizer"
          onEditEvent={onEditEvent}
        />
      );

      expect(screen.getByTestId('action-edit')).toBeInTheDocument();
    });

    it('should not show edit action for published events in organizer view', () => {
      const onEditEvent = jest.fn();
      const publishedEvent = createMockEvent({ status: EVENT_STATUS.PUBLISHED });

      render(
        <EventTableContainer
          events={[publishedEvent]}
          isLoading={false}
          viewMode="organizer"
          onEditEvent={onEditEvent}
        />
      );

      expect(screen.queryByTestId('action-edit')).not.toBeInTheDocument();
    });

    it('should configure request approval action for draft events', () => {
      const onRequestApproval = jest.fn();
      const draftEvent = createMockEvent({ status: EVENT_STATUS.DRAFT });

      render(
        <EventTableContainer
          events={[draftEvent]}
          isLoading={false}
          viewMode="organizer"
          onRequestApproval={onRequestApproval}
        />
      );

      const requestButton = screen.getByTestId('action-request_approval');
      fireEvent.click(requestButton);

      expect(onRequestApproval).toHaveBeenCalledWith(draftEvent);
    });

    it('should configure view comments action when comments exist', () => {
      const onViewComments = jest.fn();
      const eventWithComments = createMockEvent({ approval_comments: 'Please fix title' });

      render(
        <EventTableContainer
          events={[eventWithComments]}
          isLoading={false}
          viewMode="organizer"
          onViewComments={onViewComments}
        />
      );

      const commentsButton = screen.getByTestId('action-comments');
      fireEvent.click(commentsButton);

      expect(onViewComments).toHaveBeenCalledWith(eventWithComments);
    });

    it('should not show comments action when no comments exist', () => {
      const onViewComments = jest.fn();
      const eventWithoutComments = createMockEvent({ approval_comments: '' });

      render(
        <EventTableContainer
          events={[eventWithoutComments]}
          isLoading={false}
          viewMode="organizer"
          onViewComments={onViewComments}
        />
      );

      expect(screen.queryByTestId('action-comments')).not.toBeInTheDocument();
    });
  });

  describe('Public View Actions', () => {
    it('should configure share action for public view', () => {
      const onShareEvent = jest.fn();
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="public"
          onShareEvent={onShareEvent}
        />
      );

      const shareButton = screen.getByTestId('action-share');
      fireEvent.click(shareButton);

      expect(onShareEvent).toHaveBeenCalledWith(mockEvents[0]);
    });

    it('should configure calendar export action for public view', () => {
      const onExportToCalendar = jest.fn();
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="public"
          onExportToCalendar={onExportToCalendar}
        />
      );

      const calendarButton = screen.getByTestId('action-calendar');
      fireEvent.click(calendarButton);

      expect(onExportToCalendar).toHaveBeenCalledWith(mockEvents[0]);
    });
  });

  describe('Status Handling', () => {
    it('should handle string status codes', () => {
      const eventWithStringStatus = createMockEvent({ status: 'draft' });
      render(
        <EventTableContainer events={[eventWithStringStatus]} isLoading={false} />
      );

      expect(screen.getByTestId('event-table')).toBeInTheDocument();
    });

    it('should handle object status with status_code', () => {
      const eventWithObjectStatus = createMockEvent({
        status: {
          id: 1,
          status_code: EVENT_STATUS.DRAFT,
          status_name: 'Borrador',
          description: 'Draft status',
          workflow_order: 1,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      });
      render(
        <EventTableContainer events={[eventWithObjectStatus]} isLoading={false} />
      );

      expect(screen.getByTestId('event-table')).toBeInTheDocument();
    });
  });

  describe('Type Handling', () => {
    it('should handle string type codes', () => {
      const eventWithStringType = createMockEvent({ type: 'sede_unica' });
      render(
        <EventTableContainer events={[eventWithStringType]} isLoading={false} />
      );

      expect(screen.getByTestId('event-table')).toBeInTheDocument();
    });

    it('should handle object type with type_code', () => {
      const eventWithObjectType = createMockEvent({
        type: {
          id: 1,
          type_code: EVENT_TYPE.SINGLE_LOCATION,
          type_name: 'Sede Única',
          description: 'Single location event',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      });
      render(
        <EventTableContainer events={[eventWithObjectType]} isLoading={false} />
      );

      expect(screen.getByTestId('event-table')).toBeInTheDocument();
    });
  });

  describe('Empty and Loading States', () => {
    it('should handle empty events array', () => {
      render(<EventTableContainer events={[]} isLoading={false} />);

      expect(screen.getByTestId('items-count')).toHaveTextContent('0');
    });

    it('should handle loading state', () => {
      render(<EventTableContainer events={mockEvents} isLoading={true} />);

      expect(screen.getByTestId('loading')).toHaveTextContent('true');
    });
  });

  describe('No Actions Provided', () => {
    it('should render table with no actions when none are provided', () => {
      render(
        <EventTableContainer
          events={mockEvents}
          isLoading={false}
          viewMode="admin"
        />
      );

      const actionsCount = parseInt(screen.getByTestId('actions-count').textContent || '0');
      expect(actionsCount).toBe(0);
    });
  });
});
