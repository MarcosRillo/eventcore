import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreateInvitationModal from '../CreateInvitationModal'
import { AssignableRole } from '../../../types/invitation.types'

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

  const mockOnClose = jest.fn()
  const mockOnSubmit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should not render when closed', () => {
      render(
        <CreateInvitationModal
          isOpen={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={false}
        />
      )

      expect(screen.queryByTestId('create-invitation-modal')).not.toBeInTheDocument()
    })

    it('should render modal when open', () => {
      render(
        <CreateInvitationModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={false}
        />
      )

      expect(screen.getByTestId('create-invitation-modal')).toBeInTheDocument()
      expect(screen.getByText('Nueva Invitación')).toBeInTheDocument()
    })

    it('should render email input', () => {
      render(
        <CreateInvitationModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={false}
        />
      )

      const emailInput = screen.getByTestId('email-input')
      expect(emailInput).toBeInTheDocument()
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should render role select with options', () => {
      render(
        <CreateInvitationModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={false}
        />
      )

      const roleSelect = screen.getByTestId('role-select')
      expect(roleSelect).toBeInTheDocument()
      expect(screen.getByText('Entity Administrator')).toBeInTheDocument()
      expect(screen.getByText('Entity Staff')).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('should show error when email is empty', async () => {
      render(
        <CreateInvitationModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={false}
        />
      )

      fireEvent.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument()
      })
      expect(screen.getByText('El email es requerido')).toBeInTheDocument()
    })

    it('should show error when email format is invalid', async () => {
      render(
        <CreateInvitationModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={false}
        />
      )

      const emailInput = screen.getByTestId('email-input')
      const roleSelect = screen.getByTestId('role-select')

      // Enter invalid email (missing @ and domain)
      fireEvent.change(emailInput, { target: { value: 'notanemail' } })
      fireEvent.change(roleSelect, { target: { value: '1' } })

      // Submit the form
      const form = emailInput.closest('form')!
      fireEvent.submit(form)

      // Validation is synchronous, error should appear immediately
      expect(screen.getByText('Ingrese un email válido')).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should show error when role is not selected', async () => {
      render(
        <CreateInvitationModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={false}
        />
      )

      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } })
      fireEvent.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(screen.getByTestId('role-error')).toBeInTheDocument()
      })
      expect(screen.getByText('Debe seleccionar un rol')).toBeInTheDocument()
    })

    it('should clear email error when user types', async () => {
      render(
        <CreateInvitationModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={false}
        />
      )

      // Trigger validation error
      fireEvent.click(screen.getByTestId('submit-button'))
      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument()
      })

      // Type to clear error
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 't' } })

      expect(screen.queryByTestId('email-error')).not.toBeInTheDocument()
    })
  })

  describe('submission', () => {
    it('should call onSubmit with correct data', async () => {
      mockOnSubmit.mockResolvedValueOnce(true)

      render(
        <CreateInvitationModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={false}
        />
      )

      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByTestId('role-select'), { target: { value: '1' } })
      fireEvent.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          role_id: 1,
        })
      })
    })

    it('should close modal on successful submit', async () => {
      mockOnSubmit.mockResolvedValueOnce(true)

      render(
        <CreateInvitationModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={false}
        />
      )

      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByTestId('role-select'), { target: { value: '1' } })
      fireEvent.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should not close modal on failed submit', async () => {
      mockOnSubmit.mockResolvedValueOnce(false)

      render(
        <CreateInvitationModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={false}
        />
      )

      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByTestId('role-select'), { target: { value: '1' } })
      fireEvent.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('should show loading state when submitting', () => {
      render(
        <CreateInvitationModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={true}
        />
      )

      expect(screen.getByText('Enviando...')).toBeInTheDocument()
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
    })

    it('should disable submit button while loading', () => {
      render(
        <CreateInvitationModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={true}
        />
      )

      expect(screen.getByTestId('submit-button')).toBeDisabled()
    })

    it('should disable inputs while loading', () => {
      render(
        <CreateInvitationModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={true}
        />
      )

      expect(screen.getByTestId('email-input')).toBeDisabled()
      expect(screen.getByTestId('role-select')).toBeDisabled()
    })
  })

  describe('closing', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(
        <CreateInvitationModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={false}
        />
      )

      fireEvent.click(screen.getByTestId('cancel-button'))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when close icon is clicked', () => {
      render(
        <CreateInvitationModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={false}
        />
      )

      fireEvent.click(screen.getByTestId('close-modal-button'))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should not close when loading', () => {
      render(
        <CreateInvitationModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          roles={mockRoles}
          isLoading={true}
        />
      )

      fireEvent.click(screen.getByTestId('cancel-button'))

      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })
})
