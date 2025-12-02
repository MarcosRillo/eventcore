import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import InvitationTableContainer from '../InvitationTableContainer';
import invitationService from '../../../services/invitation.service';
import type { Invitation } from '../../../types/invitation.types';

jest.mock('../../../services/invitation.service');

// Mock InvitationTable to simplify testing
jest.mock('../../dumb/InvitationTable', () => {
  interface MockProps {
    invitations: { id: number; email: string; role: string }[];
    loading: boolean;
    onResend: (inv: { id: number; email: string; role: string }) => void;
    onCancel: (inv: { id: number; email: string; role: string }) => void;
    confirmDialog?: { isOpen: boolean; title: string; message: string; onConfirm: () => void };
    onCloseConfirmDialog?: () => void;
  }

  const MockComponent = ({
    invitations,
    loading,
    onResend,
    onCancel,
    confirmDialog,
    onCloseConfirmDialog,
  }: MockProps) => (
    <div data-testid="invitation-table">
      {loading && <div data-testid="table-loading">Loading...</div>}
      {!loading && invitations.length === 0 && (
        <div data-testid="table-empty">No hay invitaciones</div>
      )}
      {!loading && invitations.map((inv) => (
        <div key={inv.id} data-testid={`invitation-row-${inv.id}`}>
          <span>{inv.email}</span>
          <span>{inv.role}</span>
          <button
            onClick={() => onResend(inv)}
            data-testid={`resend-button-${inv.id}`}
          >
            Reenviar
          </button>
          <button
            onClick={() => onCancel(inv)}
            data-testid={`cancel-button-${inv.id}`}
          >
            Revocar
          </button>
        </div>
      ))}
      {confirmDialog?.isOpen && (
        <div data-testid="confirm-dialog">
          <h2>{confirmDialog.title}</h2>
          <p>{confirmDialog.message}</p>
          <button onClick={confirmDialog.onConfirm} data-testid="confirm-button">
            Confirmar
          </button>
          <button onClick={onCloseConfirmDialog} data-testid="cancel-dialog-button">
            Cancelar
          </button>
        </div>
      )}
    </div>
  );

  return {
    __esModule: true,
    InvitationTable: MockComponent,
    default: MockComponent,
  };
});

// Mock CreateInvitationModalContainer
jest.mock('../CreateInvitationModalContainer', () => {
  const MockModal = ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="create-invitation-modal">Modal</div> : null;

  return {
    __esModule: true,
    CreateInvitationModalContainer: MockModal,
    default: MockModal,
  };
});

const mockInvitationService = invitationService as jest.Mocked<typeof invitationService>;

describe('InvitationTableContainer', () => {
  const mockInvitation: Invitation = {
    id: 1,
    email: 'test@example.com',
    role: 'Entity Administrator',
    invited_by: 'Admin User',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock getAssignableRoles by default (called on mount)
    mockInvitationService.getAssignableRoles.mockResolvedValue([
      { id: 1, role_code: 'entity_staff', role_name: 'Entity Staff' }
    ]);
  });

  describe('loading state', () => {
    it('should show loading state through InvitationTable', async () => {
      mockInvitationService.getInvitations.mockReturnValue(new Promise(() => {}));
      mockInvitationService.getAssignableRoles.mockReturnValue(new Promise(() => {}));

      render(<InvitationTableContainer />);

      expect(screen.getByTestId('table-loading')).toBeInTheDocument();
    });
  });

  describe('data display', () => {
    it('should render invitations after loading', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation]);

      render(<InvitationTableContainer />);

      await waitFor(() => {
        expect(screen.queryByTestId('table-loading')).not.toBeInTheDocument();
      });

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Entity Administrator')).toBeInTheDocument();
    });

    it('should show empty state when no invitations', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([]);

      render(<InvitationTableContainer />);

      await waitFor(() => {
        expect(screen.queryByTestId('table-loading')).not.toBeInTheDocument();
      });

      expect(screen.getByText('No hay invitaciones')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should show error state on fetch failure', async () => {
      mockInvitationService.getInvitations.mockRejectedValueOnce(new Error('Network error'));

      render(<InvitationTableContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
      });

      expect(screen.getByText('Error al cargar las invitaciones')).toBeInTheDocument();
    });

    it('should allow dismissing error', async () => {
      mockInvitationService.getInvitations.mockRejectedValueOnce(new Error('Network error'));

      render(<InvitationTableContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
      });

      // Find and click the close button (the XMarkIcon button)
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn => btn.querySelector('svg'));
      if (closeButton) {
        fireEvent.click(closeButton);
      }

      await waitFor(() => {
        expect(screen.queryByTestId('error-state')).not.toBeInTheDocument();
      });
    });
  });

  describe('refresh functionality', () => {
    it('should have a refresh button', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation]);

      render(<InvitationTableContainer />);

      await waitFor(() => {
        expect(screen.queryByTestId('table-loading')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
      expect(screen.getByText('Actualizar')).toBeInTheDocument();
    });

    it('should refresh data when clicking refresh button', async () => {
      mockInvitationService.getInvitations
        .mockResolvedValueOnce([mockInvitation])
        .mockResolvedValueOnce([mockInvitation, { ...mockInvitation, id: 2, email: 'new@example.com' }]);

      render(<InvitationTableContainer />);

      await waitFor(() => {
        expect(screen.queryByTestId('table-loading')).not.toBeInTheDocument();
      });

      const refreshButton = screen.getByTestId('refresh-button');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockInvitationService.getInvitations).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('resend action', () => {
    it('should call resend service when clicking resend button', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation]);
      mockInvitationService.resendInvitation.mockResolvedValueOnce(mockInvitation);

      render(<InvitationTableContainer />);

      await waitFor(() => {
        expect(screen.queryByTestId('table-loading')).not.toBeInTheDocument();
      });

      const resendButton = screen.getByTestId('resend-button-1');
      fireEvent.click(resendButton);

      await waitFor(() => {
        expect(mockInvitationService.resendInvitation).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('cancel action', () => {
    it('should show confirm dialog when clicking cancel button', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation]);

      render(<InvitationTableContainer />);

      await waitFor(() => {
        expect(screen.queryByTestId('table-loading')).not.toBeInTheDocument();
      });

      const cancelButton = screen.getByTestId('cancel-button-1');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });

      expect(screen.getByText('Revocar Invitación')).toBeInTheDocument();
    });

    it('should call cancel service after confirming', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation]);
      mockInvitationService.cancelInvitation.mockResolvedValueOnce(undefined);

      render(<InvitationTableContainer />);

      await waitFor(() => {
        expect(screen.queryByTestId('table-loading')).not.toBeInTheDocument();
      });

      const cancelButton = screen.getByTestId('cancel-button-1');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId('confirm-button');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockInvitationService.cancelInvitation).toHaveBeenCalledWith(1);
      });
    });

    it('should close dialog when clicking cancel on confirm dialog', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation]);

      render(<InvitationTableContainer />);

      await waitFor(() => {
        expect(screen.queryByTestId('table-loading')).not.toBeInTheDocument();
      });

      const cancelButton = screen.getByTestId('cancel-button-1');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });

      const cancelDialogButton = screen.getByTestId('cancel-dialog-button');
      fireEvent.click(cancelDialogButton);

      await waitFor(() => {
        expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('create invitation', () => {
    it('should have create invitation button', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation]);

      render(<InvitationTableContainer />);

      await waitFor(() => {
        expect(screen.queryByTestId('table-loading')).not.toBeInTheDocument();
      });

      expect(screen.getByTestId('create-invitation-button')).toBeInTheDocument();
      expect(screen.getByText('Nueva invitación')).toBeInTheDocument();
    });

    it('should open modal when clicking create button', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation]);

      render(<InvitationTableContainer />);

      await waitFor(() => {
        expect(screen.queryByTestId('table-loading')).not.toBeInTheDocument();
      });

      // Modal should not be visible initially
      expect(screen.queryByTestId('create-invitation-modal')).not.toBeInTheDocument();

      // Click create button
      const createButton = screen.getByTestId('create-invitation-button');
      fireEvent.click(createButton);

      // Modal should be visible
      expect(screen.getByTestId('create-invitation-modal')).toBeInTheDocument();
    });
  });

  describe('semantic color tokens', () => {
    it('should use error semantic tokens for error alert', async () => {
      mockInvitationService.getInvitations.mockRejectedValueOnce(new Error('Network error'));

      render(<InvitationTableContainer />);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toBeInTheDocument();
      });

      const errorState = screen.getByTestId('error-state');
      expect(errorState).toHaveClass('bg-error-50');
    });
  });
});
