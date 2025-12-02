import { render, screen, fireEvent } from '@testing-library/react';
import InvitationTable from '../InvitationTable';
import { Invitation } from '../../../types/invitation.types';

// Mock GenericTable to test InvitationTable behavior
jest.mock('@/shared/components/tables', () => ({
  GenericTable: jest.fn(({ items, columns, actions, isLoading, emptyMessage, testId }) => {
    if (isLoading) {
      return <div data-testid={testId} className="animate-pulse">Loading...</div>;
    }

    if (items.length === 0) {
      return <div data-testid="table-empty">{emptyMessage}</div>;
    }

    return (
      <div data-testid={testId}>
        <table>
          <thead>
            <tr>
              {columns.map((col: { key: string; label: string }) => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: Invitation) => (
              <tr key={item.id} data-testid={`table-row-${item.id}`}>
                {columns.map((col: { key: string; render?: (item: Invitation) => React.ReactNode }) => (
                  <td key={col.key}>
                    {col.render ? col.render(item) : String(item[col.key as keyof Invitation])}
                  </td>
                ))}
                <td>
                  {actions.map((action: { key: string; label: string; onClick: (item: Invitation) => void }) => (
                    <button
                      key={action.key}
                      onClick={() => action.onClick(item)}
                      aria-label={action.label}
                    >
                      {action.label}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }),
  TableColumnConfig: {},
  TableActionConfig: {},
  ConfirmDialogData: {},
}));

// Mock InvitationStatusBadge
jest.mock('../InvitationStatusBadge', () => ({
  __esModule: true,
  default: ({ invitation }: { invitation: Invitation }) => {
    const isExpired = new Date(invitation.expires_at) < new Date();
    return (
      <span data-testid="invitation-status-badge">
        {isExpired ? 'Expirada' : 'Pendiente'}
      </span>
    );
  },
}));

describe('InvitationTable', () => {
  const mockInvitation: Invitation = {
    id: 1,
    email: 'test@example.com',
    role: 'Entity Administrator',
    invited_by: 'Admin User',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    created_at: new Date().toISOString(),
  };

  const expiredInvitation: Invitation = {
    id: 2,
    email: 'expired@example.com',
    role: 'Entity Staff',
    invited_by: 'Admin User',
    expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    created_at: new Date().toISOString(),
  };

  const mockOnResend = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    invitations: [mockInvitation],
    loading: false,
    onResend: mockOnResend,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render table with invitations', () => {
      render(<InvitationTable {...defaultProps} />);

      expect(screen.getByTestId('invitation-table')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Entity Administrator')).toBeInTheDocument();
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    it('should render empty state when no invitations', () => {
      render(<InvitationTable {...defaultProps} invitations={[]} />);

      expect(screen.getByText(/No hay invitaciones/)).toBeInTheDocument();
    });

    it('should render multiple invitations', () => {
      render(
        <InvitationTable
          {...defaultProps}
          invitations={[mockInvitation, expiredInvitation]}
        />
      );

      expect(screen.getByTestId('table-row-1')).toBeInTheDocument();
      expect(screen.getByTestId('table-row-2')).toBeInTheDocument();
    });

    it('should show status badges', () => {
      render(
        <InvitationTable
          {...defaultProps}
          invitations={[mockInvitation, expiredInvitation]}
        />
      );

      const badges = screen.getAllByTestId('invitation-status-badge');
      expect(badges).toHaveLength(2);
    });
  });

  describe('loading state', () => {
    it('should render loading state', () => {
      render(<InvitationTable {...defaultProps} loading={true} />);

      const table = screen.getByTestId('invitation-table');
      expect(table).toHaveClass('animate-pulse');
    });

    it('should not render invitations when loading', () => {
      render(<InvitationTable {...defaultProps} loading={true} />);

      expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('should call onResend with invitation when clicking resend button', () => {
      render(<InvitationTable {...defaultProps} />);

      const resendButton = screen.getByRole('button', { name: 'Reenviar' });
      fireEvent.click(resendButton);

      expect(mockOnResend).toHaveBeenCalledWith(mockInvitation);
      expect(mockOnResend).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel with invitation when clicking cancel button', () => {
      render(<InvitationTable {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'Revocar' });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledWith(mockInvitation);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should render both action buttons', () => {
      render(<InvitationTable {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Reenviar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Revocar' })).toBeInTheDocument();
    });
  });

  describe('invitation status', () => {
    it('should show pending status for non-expired invitations', () => {
      render(<InvitationTable {...defaultProps} />);

      expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });

    it('should show expired status for expired invitations', () => {
      render(
        <InvitationTable
          {...defaultProps}
          invitations={[expiredInvitation]}
        />
      );

      expect(screen.getByText('Expirada')).toBeInTheDocument();
    });
  });

  describe('column configuration', () => {
    it('should have correct column headers', () => {
      render(<InvitationTable {...defaultProps} />);

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Rol')).toBeInTheDocument();
      expect(screen.getByText('Invitado por')).toBeInTheDocument();
      expect(screen.getByText('Estado')).toBeInTheDocument();
      expect(screen.getByText('Expira')).toBeInTheDocument();
      expect(screen.getByText('Acciones')).toBeInTheDocument();
    });
  });

  describe('GenericTable props', () => {
    it('should pass testId to GenericTable', () => {
      render(<InvitationTable {...defaultProps} />);

      expect(screen.getByTestId('invitation-table')).toBeInTheDocument();
    });

    it('should pass correct empty message', () => {
      render(<InvitationTable {...defaultProps} invitations={[]} />);

      expect(screen.getByText(/No hay invitaciones/)).toBeInTheDocument();
    });
  });
});
