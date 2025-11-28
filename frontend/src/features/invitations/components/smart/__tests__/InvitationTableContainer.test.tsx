import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import InvitationTableContainer from '../InvitationTableContainer'
import invitationService from '../../../services/invitation.service'
import { Invitation } from '../../../types/invitation.types'

jest.mock('../../../services/invitation.service')

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Loader2: ({ className }: { className?: string }) => <span data-testid="loader-icon" className={className} />,
  AlertCircle: () => <span data-testid="alert-icon" />,
  RefreshCw: ({ className }: { className?: string }) => <span data-testid="refresh-icon" className={className} />,
  Trash2: ({ className }: { className?: string }) => <span data-testid="trash-icon" className={className} />,
  Mail: () => <span data-testid="mail-icon" />,
}))

const mockInvitationService = invitationService as jest.Mocked<typeof invitationService>

describe('InvitationTableContainer', () => {
  const mockInvitation: Invitation = {
    id: 1,
    email: 'test@example.com',
    role: 'Entity Administrator',
    invited_by: 'Admin User',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('loading state', () => {
    it('should show loading state initially', () => {
      mockInvitationService.getInvitations.mockReturnValue(new Promise(() => {}))

      render(<InvitationTableContainer />)

      expect(screen.getByTestId('loading-state')).toBeInTheDocument()
      expect(screen.getByText('Cargando invitaciones...')).toBeInTheDocument()
    })
  })

  describe('data display', () => {
    it('should render invitations after loading', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation])

      render(<InvitationTableContainer />)

      await waitFor(() => {
        expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument()
      })

      expect(screen.getByText('test@example.com')).toBeInTheDocument()
      expect(screen.getByText('Entity Administrator')).toBeInTheDocument()
    })

    it('should show empty state when no invitations', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([])

      render(<InvitationTableContainer />)

      await waitFor(() => {
        expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument()
      })

      expect(screen.getByText('No hay invitaciones')).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('should show error state on fetch failure', async () => {
      mockInvitationService.getInvitations.mockRejectedValueOnce(new Error('Network error'))

      render(<InvitationTableContainer />)

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
      })

      expect(screen.getByText('Error al cargar las invitaciones')).toBeInTheDocument()
    })

    it('should allow dismissing error', async () => {
      mockInvitationService.getInvitations.mockRejectedValueOnce(new Error('Network error'))

      render(<InvitationTableContainer />)

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument()
      })

      const closeButton = screen.getByText('Cerrar')
      fireEvent.click(closeButton)

      expect(screen.queryByTestId('error-state')).not.toBeInTheDocument()
    })
  })

  describe('refresh functionality', () => {
    it('should have a refresh button', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation])

      render(<InvitationTableContainer />)

      await waitFor(() => {
        expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument()
      })

      expect(screen.getByTestId('refresh-button')).toBeInTheDocument()
      expect(screen.getByText('Actualizar')).toBeInTheDocument()
    })

    it('should refresh data when clicking refresh button', async () => {
      mockInvitationService.getInvitations
        .mockResolvedValueOnce([mockInvitation])
        .mockResolvedValueOnce([mockInvitation, { ...mockInvitation, id: 2, email: 'new@example.com' }])

      render(<InvitationTableContainer />)

      await waitFor(() => {
        expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument()
      })

      const refreshButton = screen.getByTestId('refresh-button')
      fireEvent.click(refreshButton)

      await waitFor(() => {
        expect(mockInvitationService.getInvitations).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('resend action', () => {
    it('should call resend service when clicking resend button', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation])
      mockInvitationService.resendInvitation.mockResolvedValueOnce(mockInvitation)

      render(<InvitationTableContainer />)

      await waitFor(() => {
        expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument()
      })

      const resendButton = screen.getByTestId('resend-button-1')
      fireEvent.click(resendButton)

      await waitFor(() => {
        expect(mockInvitationService.resendInvitation).toHaveBeenCalledWith(1)
      })
    })
  })

  describe('cancel action', () => {
    it('should call cancel service when clicking cancel button', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation])
      mockInvitationService.cancelInvitation.mockResolvedValueOnce(undefined)

      render(<InvitationTableContainer />)

      await waitFor(() => {
        expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument()
      })

      const cancelButton = screen.getByTestId('cancel-button-1')
      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(mockInvitationService.cancelInvitation).toHaveBeenCalledWith(1)
      })
    })

    it('should remove invitation from list after cancel', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation])
      mockInvitationService.cancelInvitation.mockResolvedValueOnce(undefined)

      render(<InvitationTableContainer />)

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
      })

      const cancelButton = screen.getByTestId('cancel-button-1')
      fireEvent.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByText('test@example.com')).not.toBeInTheDocument()
      })
    })
  })
})
