import { fireEvent,render, screen } from '@testing-library/react'

import CreateInvitationModal from '@/features/invitations/components/dumb/CreateInvitationModal'
import { AssignableRole } from '@/features/invitations/types/invitation.types'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Mail: () => <span data-testid="mail-icon" />,
  UserPlus: () => <span data-testid="user-plus-icon" />,
  Loader2: ({ className }: { className?: string }) => <span data-testid="loader-icon" className={className} />,
}))

describe('CreateInvitationModal', () => {
  const mockRoles: AssignableRole[] = [
    { id: 1, role_code: 'entity_admin', role_name: 'Entity Administrator' },
    { id: 2, role_code: 'entity_staff', role_name: 'Entity Staff' },
  ]

  const defaultProps = {
    isOpen: true,
    isLoading: false,
    roles: mockRoles,
    email: '',
    roleId: '' as number | '',
    errors: {},
    onEmailChange: jest.fn(),
    onRoleChange: jest.fn(),
    onEmailBlur: jest.fn(),
    onRoleBlur: jest.fn(),
    onSubmit: jest.fn(),
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should not render when closed', () => {
      render(<CreateInvitationModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByTestId('create-invitation-modal')).not.toBeInTheDocument()
    })

    it('should render modal when open', () => {
      render(<CreateInvitationModal {...defaultProps} />)

      expect(screen.getByTestId('create-invitation-modal')).toBeInTheDocument()
      expect(screen.getByText('Nueva Invitación')).toBeInTheDocument()
    })

    it('should render email input', () => {
      render(<CreateInvitationModal {...defaultProps} />)

      const emailInput = screen.getByTestId('email-input')
      expect(emailInput).toBeInTheDocument()
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should render role select with options', () => {
      render(<CreateInvitationModal {...defaultProps} />)

      const roleSelect = screen.getByTestId('role-select')
      expect(roleSelect).toBeInTheDocument()
      expect(screen.getByText('Entity Administrator')).toBeInTheDocument()
      expect(screen.getByText('Entity Staff')).toBeInTheDocument()
    })

    it('should display email value from props', () => {
      render(<CreateInvitationModal {...defaultProps} email="test@example.com" />)

      const emailInput = screen.getByTestId('email-input')
      expect(emailInput).toHaveValue('test@example.com')
    })

    it('should display roleId value from props', () => {
      render(<CreateInvitationModal {...defaultProps} roleId={1} />)

      const roleSelect = screen.getByTestId('role-select')
      expect(roleSelect).toHaveValue('1')
    })
  })

  describe('interactions', () => {
    it('should call onEmailChange when email is typed', () => {
      render(<CreateInvitationModal {...defaultProps} />)

      const emailInput = screen.getByTestId('email-input')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      expect(defaultProps.onEmailChange).toHaveBeenCalledWith('test@example.com')
    })

    it('should call onEmailBlur when email is changed', () => {
      render(<CreateInvitationModal {...defaultProps} />)

      const emailInput = screen.getByTestId('email-input')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

      expect(defaultProps.onEmailBlur).toHaveBeenCalled()
    })

    it('should call onRoleChange when role is selected', () => {
      render(<CreateInvitationModal {...defaultProps} />)

      const roleSelect = screen.getByTestId('role-select')
      fireEvent.change(roleSelect, { target: { value: '1' } })

      expect(defaultProps.onRoleChange).toHaveBeenCalledWith(1)
    })

    it('should call onRoleBlur when role is changed', () => {
      render(<CreateInvitationModal {...defaultProps} />)

      const roleSelect = screen.getByTestId('role-select')
      fireEvent.change(roleSelect, { target: { value: '1' } })

      expect(defaultProps.onRoleBlur).toHaveBeenCalled()
    })

    it('should call onSubmit when form is submitted', () => {
      render(<CreateInvitationModal {...defaultProps} />)

      fireEvent.click(screen.getByTestId('submit-button'))

      expect(defaultProps.onSubmit).toHaveBeenCalled()
    })
  })

  describe('error display', () => {
    it('should show email error when provided', () => {
      render(
        <CreateInvitationModal {...defaultProps} errors={{ email: 'El email es requerido' }} />
      )

      expect(screen.getByTestId('email-error')).toBeInTheDocument()
      expect(screen.getByText('El email es requerido')).toBeInTheDocument()
    })

    it('should show invalid email error when provided', () => {
      render(
        <CreateInvitationModal {...defaultProps} errors={{ email: 'Ingrese un email válido' }} />
      )

      expect(screen.getByText('Ingrese un email válido')).toBeInTheDocument()
    })

    it('should show role error when provided', () => {
      render(
        <CreateInvitationModal {...defaultProps} errors={{ role_id: 'Debe seleccionar un rol' }} />
      )

      expect(screen.getByTestId('role-error')).toBeInTheDocument()
      expect(screen.getByText('Debe seleccionar un rol')).toBeInTheDocument()
    })

    it('should apply red border to email input when error exists', () => {
      render(
        <CreateInvitationModal {...defaultProps} errors={{ email: 'El email es requerido' }} />
      )

      const emailInput = screen.getByTestId('email-input')
      expect(emailInput).toHaveClass('border-red-500')
    })

    it('should apply red border to role select when error exists', () => {
      render(
        <CreateInvitationModal {...defaultProps} errors={{ role_id: 'Debe seleccionar un rol' }} />
      )

      const roleSelect = screen.getByTestId('role-select')
      expect(roleSelect).toHaveClass('border-red-500')
    })
  })

  describe('loading state', () => {
    it('should show loading state when submitting', () => {
      render(<CreateInvitationModal {...defaultProps} isLoading={true} />)

      expect(screen.getByText('Enviando...')).toBeInTheDocument()
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
    })

    it('should disable submit button while loading', () => {
      render(<CreateInvitationModal {...defaultProps} isLoading={true} />)

      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })

    it('should disable inputs while loading', () => {
      render(<CreateInvitationModal {...defaultProps} isLoading={true} />)

      expect(screen.getByTestId('email-input')).toBeDisabled()
      expect(screen.getByTestId('role-select')).toBeDisabled()
    })
  })

  describe('closing', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(<CreateInvitationModal {...defaultProps} />)

      fireEvent.click(screen.getByTestId('cancel-button'))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should call onClose when close icon is clicked', () => {
      render(<CreateInvitationModal {...defaultProps} />)

      fireEvent.click(screen.getByTestId('close-modal-button'))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('should not call onClose when loading and close is clicked', () => {
      render(<CreateInvitationModal {...defaultProps} isLoading={true} />)

      fireEvent.click(screen.getByTestId('cancel-button'))

      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })
  })
})
