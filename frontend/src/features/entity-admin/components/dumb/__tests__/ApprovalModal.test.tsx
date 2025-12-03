import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ApprovalModal, ApprovalFormData, ApprovalActionOption } from '../ApprovalModal'
import { Event, EventStatus, EventStatusObject, EVENT_STATUS } from '@/types/event.types'

interface MockModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer: React.ReactNode
}

interface MockTextareaProps {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  name: string
}

interface MockRadioOption {
  value: string
  label: string
}

interface MockRadioGroupProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: MockRadioOption[]
  error?: string
}

interface MockButtonProps {
  children: React.ReactNode
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  variant?: string
}

// Mock UI components
jest.mock('@/components/ui', () => ({
  Modal: ({ isOpen, onClose, title, children, footer }: MockModalProps) =>
    isOpen ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-body">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
        <button data-testid="close-modal" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
  Textarea: ({ label, value, onChange, placeholder, disabled, error, name }: MockTextareaProps) => (
    <div>
      <label>{label}</label>
      <textarea
        data-testid={`textarea-${name}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      {error && <div data-testid="textarea-error">{error}</div>}
    </div>
  ),
  RadioGroup: ({ label, value, onChange, options, error }: MockRadioGroupProps) => (
    <div>
      <label>{label}</label>
      <div data-testid="radio-group">
        {options.map((option: MockRadioOption) => (
          <label key={option.value}>
            <input
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && <div data-testid="radio-error">{error}</div>}
    </div>
  ),
  Button: ({ children, onClick, loading, disabled, variant }: MockButtonProps) => (
    <button
      data-testid={`button-${variant || 'primary'}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
}))

const createMockEvent = (status: EventStatus): Event => ({
  id: 1,
  title: 'Test Event',
  description: 'Test Description',
  type: 'sede_unica',
  start_date: '2025-12-15T10:00:00Z',
  end_date: '2025-12-15T18:00:00Z',
  status,
  event_type_id: 1,
  event_subtype_id: 1,
  event_type: { id: 1, name: 'Cultural', entity_id: 1, is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  event_subtype: { id: 1, name: 'Music Festival', event_type_id: 1, entity_id: 1, is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  locations: [],
  location: { id: 1, name: 'Teatro', address: 'Av. Test 123', city: 'CABA', country: 'Argentina', features: [], is_active: true, entity_id: 1, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  organizer: { id: 1, name: 'Test Organizer', organization: 'Test Org' },
  is_featured: false,
  approval_history: [],
  created_at: '2025-11-01T00:00:00Z',
  updated_at: '2025-11-01T00:00:00Z',
})

describe('ApprovalModal', () => {
  const mockFormData: ApprovalFormData = {
    action: '',
    comment: '',
  }

  const mockAvailableActions: ApprovalActionOption[] = [
    { value: 'approve_internal', label: 'Aprobar Internamente' },
    { value: 'request_changes', label: 'Solicitar Cambios' },
    { value: 'reject', label: 'Rechazar' },
  ]

  const mockHandlers = {
    onClose: jest.fn(),
    onFieldChange: jest.fn(),
    onSubmit: jest.fn(),
    requiresComment: jest.fn((action: string) => action === 'request_changes' || action === 'reject'),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <ApprovalModal
          isOpen={false}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={mockFormData}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true and event exists', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={mockFormData}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Acciones de Aprobación')
    })

    it('should not render when event is null', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={null}
          formData={mockFormData}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })
  })

  describe('Event Information Display', () => {
    it('should display event title and description', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)

      render(
        <ApprovalModal
          isOpen={true}
          event={event}
          formData={mockFormData}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Test Event')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('should display current event status as string', () => {
      const event = createMockEvent(EVENT_STATUS.DRAFT)

      render(
        <ApprovalModal
          isOpen={true}
          event={event}
          formData={mockFormData}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/Estado actual:/)).toBeInTheDocument()
      expect(screen.getByText(EVENT_STATUS.DRAFT)).toBeInTheDocument()
    })

    it('should display current event status as object', () => {
      const event = {
        ...createMockEvent(EVENT_STATUS.DRAFT),
        status: {
          status_code: EVENT_STATUS.DRAFT,
          status_name: 'Borrador',
        } as EventStatusObject,
      }

      render(
        <ApprovalModal
          isOpen={true}
          event={event}
          formData={mockFormData}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Borrador')).toBeInTheDocument()
    })
  })

  describe('Action Selection', () => {
    it('should render radio group with available actions', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={mockFormData}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('radio-group')).toBeInTheDocument()
      expect(screen.getByText('Aprobar Internamente')).toBeInTheDocument()
      expect(screen.getByText('Solicitar Cambios')).toBeInTheDocument()
      expect(screen.getByText('Rechazar')).toBeInTheDocument()
    })

    it('should call onFieldChange when action is selected', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={mockFormData}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      const radioButton = screen.getByLabelText('Aprobar Internamente')
      fireEvent.click(radioButton)

      expect(mockHandlers.onFieldChange).toHaveBeenCalledWith('action', 'approve_internal')
    })

    it('should display action error when present', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={mockFormData}
          errors={{ action: 'Debes seleccionar una acción' }}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('radio-error')).toHaveTextContent('Debes seleccionar una acción')
    })
  })

  describe('Comment Field', () => {
    it('should show comment field only when action is selected', () => {
      const { rerender } = render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={mockFormData}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      // No action selected - comment field should not be visible
      expect(screen.queryByTestId('textarea-comment')).not.toBeInTheDocument()

      // Action selected - comment field should be visible
      rerender(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={{ action: 'approve_internal', comment: '' }}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('textarea-comment')).toBeInTheDocument()
    })

    it('should indicate required comment with asterisk', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={{ action: 'request_changes', comment: '' }}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/Comentario \*/)).toBeInTheDocument()
    })

    it('should show required placeholder when comment is required', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={{ action: 'request_changes', comment: '' }}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-comment')
      expect(textarea).toHaveAttribute(
        'placeholder',
        'Proporciona detalles sobre los cambios requeridos o la razón del rechazo'
      )
    })

    it('should show optional placeholder when comment is not required', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={{ action: 'approve_internal', comment: '' }}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-comment')
      expect(textarea).toHaveAttribute('placeholder', 'Comentario opcional')
    })

    it('should call onFieldChange when comment changes', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={{ action: 'approve_internal', comment: '' }}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-comment')
      fireEvent.change(textarea, { target: { value: 'Test comment' } })

      expect(mockHandlers.onFieldChange).toHaveBeenCalledWith('comment', 'Test comment')
    })

    it('should disable comment field when loading', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={{ action: 'approve_internal', comment: '' }}
          errors={{}}
          isLoading={true}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      const textarea = screen.getByTestId('textarea-comment')
      expect(textarea).toBeDisabled()
    })

    it('should display comment error when present', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={{ action: 'request_changes', comment: '' }}
          errors={{ comment: 'Es necesario proporcionar un comentario' }}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('textarea-error')).toHaveTextContent(
        'Es necesario proporcionar un comentario'
      )
    })
  })

  describe('Submit Button', () => {
    it('should display custom submit button text', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={{ action: 'approve_internal', comment: '' }}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar Acción"
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Confirmar Acción')).toBeInTheDocument()
    })

    it('should call onSubmit when clicked', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={{ action: 'approve_internal', comment: '' }}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      const submitButton = screen.getByTestId('button-primary')
      fireEvent.click(submitButton)

      expect(mockHandlers.onSubmit).toHaveBeenCalled()
    })

    it('should be disabled when no action is selected', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={{ action: '', comment: '' }}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      const submitButton = screen.getByTestId('button-primary')
      expect(submitButton).toBeDisabled()
    })

    it('should be disabled when required comment is missing', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={{ action: 'request_changes', comment: '' }}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      const submitButton = screen.getByTestId('button-primary')
      expect(submitButton).toBeDisabled()
    })

    it('should be enabled when action is selected and required comment is provided', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={{ action: 'request_changes', comment: 'Fix the title' }}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      const submitButton = screen.getByTestId('button-primary')
      expect(submitButton).not.toBeDisabled()
    })

    it('should show loading state when isLoading is true', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={{ action: 'approve_internal', comment: '' }}
          errors={{}}
          isLoading={true}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Cancel Button', () => {
    it('should render cancel button', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={mockFormData}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('button-secondary')).toHaveTextContent('Cancelar')
    })

    it('should call onClose when cancel button is clicked', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={mockFormData}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      const cancelButton = screen.getByTestId('button-secondary')
      fireEvent.click(cancelButton)

      expect(mockHandlers.onClose).toHaveBeenCalled()
    })
  })

  describe('Modal Close', () => {
    it('should call onClose when modal close is triggered', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={mockFormData}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      const closeButton = screen.getByTestId('close-modal')
      fireEvent.click(closeButton)

      expect(mockHandlers.onClose).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty available actions array', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={mockFormData}
          errors={{}}
          isLoading={false}
          availableActions={[]}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      const radioGroup = screen.getByTestId('radio-group')
      expect(radioGroup).toBeEmptyDOMElement()
    })

    it('should handle whitespace-only comments for required fields', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={{ action: 'request_changes', comment: '   ' }}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      const submitButton = screen.getByTestId('button-primary')
      expect(submitButton).toBeDisabled()
    })

    it('should trim whitespace when checking for required comment', () => {
      render(
        <ApprovalModal
          isOpen={true}
          event={createMockEvent(EVENT_STATUS.DRAFT)}
          formData={{ action: 'request_changes', comment: '  valid comment  ' }}
          errors={{}}
          isLoading={false}
          availableActions={mockAvailableActions}
          submitButtonText="Confirmar"
          {...mockHandlers}
        />
      )

      const submitButton = screen.getByTestId('button-primary')
      expect(submitButton).not.toBeDisabled()
    })
  })
})
