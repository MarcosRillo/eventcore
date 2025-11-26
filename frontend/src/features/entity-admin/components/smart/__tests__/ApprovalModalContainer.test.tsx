import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ApprovalModalContainer } from '../ApprovalModalContainer'
import { Event, EVENT_STATUS } from '@/types/event.types'

// Mock child component
jest.mock('@/features/entity-admin/components/dumb/ApprovalModal', () => ({
  ApprovalModal: jest.fn(({
    isOpen,
    event,
    formData,
    errors,
    isLoading,
    availableActions,
    submitButtonText,
    onClose,
    onFieldChange,
    onSubmit,
    requiresComment
  }) => {
    if (!isOpen) return null

    return (
      <div data-testid="approval-modal-mock">
        <div data-testid="modal-title">Approval Modal</div>
        <div data-testid="event-title">{event?.title}</div>
        <div data-testid="submit-button-text">{submitButtonText}</div>
        <div data-testid="loading">{isLoading.toString()}</div>
        <div data-testid="available-actions-count">{availableActions.length}</div>

        {/* Simulate action selection */}
        <select
          data-testid="action-select"
          value={formData.action}
          onChange={(e) => onFieldChange('action', e.target.value)}
        >
          <option value="">Select action</option>
          {availableActions.map((action: any) => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>

        {/* Simulate comment input */}
        <textarea
          data-testid="comment-input"
          value={formData.comment}
          onChange={(e) => onFieldChange('comment', e.target.value)}
          placeholder={requiresComment(formData.action) ? 'Required' : 'Optional'}
        />

        {/* Show errors */}
        {errors.action && <div data-testid="action-error">{errors.action}</div>}
        {errors.comment && <div data-testid="comment-error">{errors.comment}</div>}

        {/* Submit button */}
        <button data-testid="submit-button" onClick={onSubmit}>
          Submit
        </button>

        {/* Close button */}
        <button data-testid="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    )
  }),
}))

const createMockEvent = (status: string): Event => ({
  id: 1,
  title: 'Test Event',
  description: 'Test Description',
  start_date: '2025-12-15T10:00:00Z',
  end_date: '2025-12-15T18:00:00Z',
  status,
  category_id: 1,
  location_id: 1,
  organizer_id: 1,
  is_featured: false,
  created_at: '2025-11-01T00:00:00Z',
  updated_at: '2025-11-01T00:00:00Z',
})

describe('ApprovalModalContainer', () => {
  const mockHandlers = {
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    onApproveInternal: jest.fn(),
    onRequestPublic: jest.fn(),
    onApprovePublic: jest.fn(),
    onRequestChanges: jest.fn(),
    onReject: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <ApprovalModalContainer
          isOpen={false}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('approval-modal-mock')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true and event exists', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer
          isOpen={true}
          event={event}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('approval-modal-mock')).toBeInTheDocument()
      expect(screen.getByTestId('event-title')).toHaveTextContent('Test Event')
    })

    it('should render with empty actions when event is null', () => {
      render(
        <ApprovalModalContainer
          isOpen={true}
          event={null}
          {...mockHandlers}
        />
      )

      // Modal still renders but with 0 available actions
      expect(screen.getByTestId('approval-modal-mock')).toBeInTheDocument()
      expect(screen.getByTestId('available-actions-count')).toHaveTextContent('0')
    })
  })

  describe('Available Actions by Status', () => {
    it('should provide correct actions for DRAFT status', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const select = screen.getByTestId('action-select')
      const options = Array.from(select.querySelectorAll('option'))
        .map(opt => opt.textContent)
        .filter(text => text !== 'Select action')

      expect(options).toEqual([
        'Aprobar Internamente',
        'Solicitar Cambios',
        'Rechazar',
      ])
    })

    it('should provide correct actions for APPROVED_INTERNAL status', () => {
      const event = createMockEvent(EVENT_STATUS.APPROVED_INTERNAL)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const select = screen.getByTestId('action-select')
      const options = Array.from(select.querySelectorAll('option'))
        .map(opt => opt.textContent)
        .filter(text => text !== 'Select action')

      expect(options).toEqual(['Solicitar Aprobación Pública'])
    })

    it('should provide correct actions for PENDING_PUBLIC_APPROVAL status', () => {
      const event = createMockEvent(EVENT_STATUS.PENDING_PUBLIC_APPROVAL)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const select = screen.getByTestId('action-select')
      const options = Array.from(select.querySelectorAll('option'))
        .map(opt => opt.textContent)
        .filter(text => text !== 'Select action')

      expect(options).toEqual([
        'Aprobar para Publicación',
        'Solicitar Cambios',
        'Rechazar',
      ])
    })

    it('should provide correct actions for REQUIRES_CHANGES status', () => {
      const event = createMockEvent(EVENT_STATUS.REQUIRES_CHANGES)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const select = screen.getByTestId('action-select')
      const options = Array.from(select.querySelectorAll('option'))
        .map(opt => opt.textContent)
        .filter(text => text !== 'Select action')

      expect(options).toEqual([
        'Aprobar Internamente',
        'Solicitar Más Cambios',
        'Rechazar',
      ])
    })

    it('should provide correct actions for PENDING_INTERNAL_APPROVAL status', () => {
      const event = createMockEvent(EVENT_STATUS.PENDING_INTERNAL_APPROVAL)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const select = screen.getByTestId('action-select')
      const options = Array.from(select.querySelectorAll('option'))
        .map(opt => opt.textContent)
        .filter(text => text !== 'Select action')

      expect(options).toEqual([
        'Aprobar Internamente',
        'Solicitar Cambios',
        'Rechazar',
      ])
    })
  })

  describe('Form Interactions', () => {
    it('should update action when selection changes', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const select = screen.getByTestId('action-select')
      fireEvent.change(select, { target: { value: 'approve_internal' } })

      expect(select).toHaveValue('approve_internal')
    })

    it('should update comment when textarea changes', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const textarea = screen.getByTestId('comment-input')
      fireEvent.change(textarea, { target: { value: 'Test comment' } })

      expect(textarea).toHaveValue('Test comment')
    })

    it('should clear field error when user starts typing', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      // Submit without action to trigger error
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      expect(screen.getByTestId('action-error')).toBeInTheDocument()

      // Select an action
      const select = screen.getByTestId('action-select')
      fireEvent.change(select, { target: { value: 'approve_internal' } })

      // Error should be cleared
      expect(screen.queryByTestId('action-error')).not.toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show error when submitting without action', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      expect(screen.getByTestId('action-error')).toHaveTextContent('Debes seleccionar una acción')
    })

    it('should show error when request_changes action has no comment', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      // Select request_changes action
      const select = screen.getByTestId('action-select')
      fireEvent.change(select, { target: { value: 'request_changes' } })

      // Submit without comment
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      expect(screen.getByTestId('comment-error')).toHaveTextContent(
        'Es necesario proporcionar un comentario para esta acción'
      )
    })

    it('should show error when reject action has no comment', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      // Select reject action
      const select = screen.getByTestId('action-select')
      fireEvent.change(select, { target: { value: 'reject' } })

      // Submit without comment
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      expect(screen.getByTestId('comment-error')).toHaveTextContent(
        'Es necesario proporcionar un comentario para esta acción'
      )
    })

    it('should not require comment for approve_internal action', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      // Select approve_internal action
      const select = screen.getByTestId('action-select')
      fireEvent.change(select, { target: { value: 'approve_internal' } })

      // Submit without comment should work
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      expect(screen.queryByTestId('comment-error')).not.toBeInTheDocument()
      expect(mockHandlers.onApproveInternal).toHaveBeenCalledWith(1)
    })
  })

  describe('Action Submission', () => {
    it('should call onApproveInternal when approve_internal action is submitted', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const select = screen.getByTestId('action-select')
      fireEvent.change(select, { target: { value: 'approve_internal' } })

      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      expect(mockHandlers.onApproveInternal).toHaveBeenCalledWith(event.id)
      expect(mockHandlers.onSuccess).toHaveBeenCalled()
      expect(mockHandlers.onClose).toHaveBeenCalled()
    })

    it('should call onRequestPublic when request_public action is submitted', () => {
      const event = createMockEvent(EVENT_STATUS.APPROVED_INTERNAL)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const select = screen.getByTestId('action-select')
      fireEvent.change(select, { target: { value: 'request_public' } })

      const textarea = screen.getByTestId('comment-input')
      fireEvent.change(textarea, { target: { value: 'Optional comment' } })

      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      expect(mockHandlers.onRequestPublic).toHaveBeenCalledWith(event.id, 'Optional comment')
      expect(mockHandlers.onSuccess).toHaveBeenCalled()
      expect(mockHandlers.onClose).toHaveBeenCalled()
    })

    it('should call onApprovePublic when approve_public action is submitted', () => {
      const event = createMockEvent(EVENT_STATUS.PENDING_PUBLIC_APPROVAL)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const select = screen.getByTestId('action-select')
      fireEvent.change(select, { target: { value: 'approve_public' } })

      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      expect(mockHandlers.onApprovePublic).toHaveBeenCalledWith(event.id, undefined)
      expect(mockHandlers.onSuccess).toHaveBeenCalled()
      expect(mockHandlers.onClose).toHaveBeenCalled()
    })

    it('should call onRequestChanges when request_changes action is submitted', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const select = screen.getByTestId('action-select')
      fireEvent.change(select, { target: { value: 'request_changes' } })

      const textarea = screen.getByTestId('comment-input')
      fireEvent.change(textarea, { target: { value: 'Please fix the title' } })

      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      expect(mockHandlers.onRequestChanges).toHaveBeenCalledWith(event.id, 'Please fix the title')
      expect(mockHandlers.onSuccess).toHaveBeenCalled()
      expect(mockHandlers.onClose).toHaveBeenCalled()
    })

    it('should call onReject when reject action is submitted', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const select = screen.getByTestId('action-select')
      fireEvent.change(select, { target: { value: 'reject' } })

      const textarea = screen.getByTestId('comment-input')
      fireEvent.change(textarea, { target: { value: 'Event does not meet criteria' } })

      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      expect(mockHandlers.onReject).toHaveBeenCalledWith(event.id, 'Event does not meet criteria')
      expect(mockHandlers.onSuccess).toHaveBeenCalled()
      expect(mockHandlers.onClose).toHaveBeenCalled()
    })

    it('should validate action selection before processing', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      // Submit without selecting an action
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      // Should show validation error
      expect(screen.getByTestId('action-error')).toHaveTextContent(
        'Debes seleccionar una acción'
      )
    })
  })

  describe('Modal Close', () => {
    it('should reset form and close modal when onClose is called', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      // Select action and enter comment
      const select = screen.getByTestId('action-select')
      fireEvent.change(select, { target: { value: 'approve_internal' } })

      const textarea = screen.getByTestId('comment-input')
      fireEvent.change(textarea, { target: { value: 'Test comment' } })

      // Close modal
      const closeButton = screen.getByTestId('close-button')
      fireEvent.click(closeButton)

      expect(mockHandlers.onClose).toHaveBeenCalled()
    })

    it('should reset form after successful submission', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      // Select action and add comment
      const select = screen.getByTestId('action-select')
      fireEvent.change(select, { target: { value: 'approve_internal' } })

      const textarea = screen.getByTestId('comment-input')
      fireEvent.change(textarea, { target: { value: 'Test comment' } })

      // Submit
      const submitButton = screen.getByTestId('submit-button')
      fireEvent.click(submitButton)

      // Form should be reset (onSuccess and onClose should be called)
      expect(mockHandlers.onSuccess).toHaveBeenCalled()
      expect(mockHandlers.onClose).toHaveBeenCalled()
    })
  })

  describe('Comment Requirements', () => {
    it('should indicate comment is required for request_changes', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const select = screen.getByTestId('action-select')
      fireEvent.change(select, { target: { value: 'request_changes' } })

      const textarea = screen.getByTestId('comment-input')
      expect(textarea).toHaveAttribute('placeholder', 'Required')
    })

    it('should indicate comment is required for reject', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const select = screen.getByTestId('action-select')
      fireEvent.change(select, { target: { value: 'reject' } })

      const textarea = screen.getByTestId('comment-input')
      expect(textarea).toHaveAttribute('placeholder', 'Required')
    })

    it('should indicate comment is optional for approve_internal', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)
      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const select = screen.getByTestId('action-select')
      fireEvent.change(select, { target: { value: 'approve_internal' } })

      const textarea = screen.getByTestId('comment-input')
      expect(textarea).toHaveAttribute('placeholder', 'Optional')
    })
  })

  describe('Event Status Object Handling', () => {
    it('should handle status as object', () => {
      const event = {
        ...createMockEvent(EVENT_STATUS.DRAFT),
        status: {
          status_code: EVENT_STATUS.DRAFT,
          status_name: 'Borrador',
        },
      }

      render(
        <ApprovalModalContainer isOpen={true} event={event} {...mockHandlers} />
      )

      const select = screen.getByTestId('action-select')
      const options = Array.from(select.querySelectorAll('option'))
        .map(opt => opt.textContent)
        .filter(text => text !== 'Select action')

      expect(options).toEqual([
        'Aprobar Internamente',
        'Solicitar Cambios',
        'Rechazar',
      ])
    })
  })
})
