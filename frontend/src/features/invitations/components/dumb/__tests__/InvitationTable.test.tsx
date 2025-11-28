import { render, screen, fireEvent } from '@testing-library/react'
import InvitationTable from '../InvitationTable'
import { Invitation } from '../../../types/invitation.types'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  RefreshCw: ({ className }: { className?: string }) => <span data-testid="refresh-icon" className={className} />,
  Trash2: ({ className }: { className?: string }) => <span data-testid="trash-icon" className={className} />,
  Mail: () => <span data-testid="mail-icon" />,
}))

describe('InvitationTable', () => {
  const mockInvitation: Invitation = {
    id: 1,
    email: 'test@example.com',
    role: 'Entity Administrator',
    invited_by: 'Admin User',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    created_at: new Date().toISOString(),
  }

  const expiredInvitation: Invitation = {
    id: 2,
    email: 'expired@example.com',
    role: 'Entity Staff',
    invited_by: 'Admin User',
    expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    created_at: new Date().toISOString(),
  }

  const mockOnResend = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render table with invitations', () => {
      render(
        <InvitationTable
          invitations={[mockInvitation]}
          onResend={mockOnResend}
          onCancel={mockOnCancel}
          resendingId={null}
          cancellingId={null}
        />
      )

      expect(screen.getByTestId('invitation-table')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
      expect(screen.getByText('Entity Administrator')).toBeInTheDocument()
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })

    it('should render empty state when no invitations', () => {
      render(
        <InvitationTable
          invitations={[]}
          onResend={mockOnResend}
          onCancel={mockOnCancel}
          resendingId={null}
          cancellingId={null}
        />
      )

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.getByText('No hay invitaciones')).toBeInTheDocument()
    })

    it('should render multiple invitations', () => {
      render(
        <InvitationTable
          invitations={[mockInvitation, expiredInvitation]}
          onResend={mockOnResend}
          onCancel={mockOnCancel}
          resendingId={null}
          cancellingId={null}
        />
      )

      expect(screen.getByTestId('invitation-row-1')).toBeInTheDocument()
      expect(screen.getByTestId('invitation-row-2')).toBeInTheDocument()
    })

    it('should show status badges', () => {
      render(
        <InvitationTable
          invitations={[mockInvitation, expiredInvitation]}
          onResend={mockOnResend}
          onCancel={mockOnCancel}
          resendingId={null}
          cancellingId={null}
        />
      )

      const badges = screen.getAllByTestId('invitation-status-badge')
      expect(badges).toHaveLength(2)
    })
  })

  describe('actions', () => {
    it('should call onResend when clicking resend button', () => {
      render(
        <InvitationTable
          invitations={[mockInvitation]}
          onResend={mockOnResend}
          onCancel={mockOnCancel}
          resendingId={null}
          cancellingId={null}
        />
      )

      const resendButton = screen.getByTestId('resend-button-1')
      fireEvent.click(resendButton)

      expect(mockOnResend).toHaveBeenCalledWith(1)
      expect(mockOnResend).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when clicking cancel button', () => {
      render(
        <InvitationTable
          invitations={[mockInvitation]}
          onResend={mockOnResend}
          onCancel={mockOnCancel}
          resendingId={null}
          cancellingId={null}
        />
      )

      const cancelButton = screen.getByTestId('cancel-button-1')
      fireEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledWith(1)
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('loading states', () => {
    it('should disable buttons when resending', () => {
      render(
        <InvitationTable
          invitations={[mockInvitation]}
          onResend={mockOnResend}
          onCancel={mockOnCancel}
          resendingId={1}
          cancellingId={null}
        />
      )

      const resendButton = screen.getByTestId('resend-button-1')
      const cancelButton = screen.getByTestId('cancel-button-1')

      expect(resendButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
      expect(screen.getByText('Reenviando...')).toBeInTheDocument()
    })

    it('should disable buttons when cancelling', () => {
      render(
        <InvitationTable
          invitations={[mockInvitation]}
          onResend={mockOnResend}
          onCancel={mockOnCancel}
          resendingId={null}
          cancellingId={1}
        />
      )

      const resendButton = screen.getByTestId('resend-button-1')
      const cancelButton = screen.getByTestId('cancel-button-1')

      expect(resendButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
      expect(screen.getByText('Revocando...')).toBeInTheDocument()
    })

    it('should not disable other rows when one is loading', () => {
      render(
        <InvitationTable
          invitations={[mockInvitation, expiredInvitation]}
          onResend={mockOnResend}
          onCancel={mockOnCancel}
          resendingId={1}
          cancellingId={null}
        />
      )

      const resendButton2 = screen.getByTestId('resend-button-2')
      const cancelButton2 = screen.getByTestId('cancel-button-2')

      expect(resendButton2).not.toBeDisabled()
      expect(cancelButton2).not.toBeDisabled()
    })
  })

  describe('expired invitations', () => {
    it('should highlight resend button for expired invitations', () => {
      render(
        <InvitationTable
          invitations={[expiredInvitation]}
          onResend={mockOnResend}
          onCancel={mockOnCancel}
          resendingId={null}
          cancellingId={null}
        />
      )

      const resendButton = screen.getByTestId('resend-button-2')
      // Expired invitation should have the prominent blue button
      expect(resendButton).toHaveClass('bg-blue-600')
    })

    it('should show pending status for non-expired invitations', () => {
      render(
        <InvitationTable
          invitations={[mockInvitation]}
          onResend={mockOnResend}
          onCancel={mockOnCancel}
          resendingId={null}
          cancellingId={null}
        />
      )

      expect(screen.getByText('Pendiente')).toBeInTheDocument()
    })

    it('should show expired status for expired invitations', () => {
      render(
        <InvitationTable
          invitations={[expiredInvitation]}
          onResend={mockOnResend}
          onCancel={mockOnCancel}
          resendingId={null}
          cancellingId={null}
        />
      )

      expect(screen.getByText('Expirada')).toBeInTheDocument()
    })
  })

  describe('table structure', () => {
    it('should have correct column headers', () => {
      render(
        <InvitationTable
          invitations={[mockInvitation]}
          onResend={mockOnResend}
          onCancel={mockOnCancel}
          resendingId={null}
          cancellingId={null}
        />
      )

      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Rol')).toBeInTheDocument()
      expect(screen.getByText('Invitado por')).toBeInTheDocument()
      expect(screen.getByText('Estado')).toBeInTheDocument()
      expect(screen.getByText('Expira')).toBeInTheDocument()
      expect(screen.getByText('Acciones')).toBeInTheDocument()
    })
  })
})
