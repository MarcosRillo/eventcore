import { fireEvent,render, screen } from '@testing-library/react';

import UserTable from '@/features/users/components/dumb/UserTable';
import type { User } from '@/features/users/types/user.types';
import { createMockPaginationMeta } from '@/test-utils/factories';

// Mock GenericTable to test UserTable behavior
jest.mock('@/shared/components/tables', () => ({
  GenericTable: jest.fn(({ items, columns, actions, isLoading, emptyMessage, pagination, onPageChange, testId }) => {
    if (isLoading) {
      return <div data-testid={testId} className="animate-pulse">Loading...</div>;
    }

    if (items.length === 0) {
      return <div data-testid={testId}>{emptyMessage}</div>;
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
            {items.map((item: User) => (
              <tr key={item.id}>
                {columns.map((col: { key: string; render?: (item: User) => React.ReactNode }) => (
                  <td key={col.key}>
                    {col.render ? col.render(item) : String(item[col.key as keyof User])}
                  </td>
                ))}
                <td>
                  {actions.map((action: { key: string; label: string; condition?: (item: User) => boolean; onClick: (item: User) => void }) => {
                    if (action.condition && !action.condition(item)) return null;
                    return (
                      <button key={action.key} onClick={() => action.onClick(item)}>
                        {action.label}
                      </button>
                    );
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pagination && pagination.last_page > 1 && (
          <div>
            <button
              disabled={pagination.current_page === 1}
              onClick={() => onPageChange(pagination.current_page - 1)}
            >
              Anterior
            </button>
            <button
              disabled={pagination.current_page === pagination.last_page}
              onClick={() => onPageChange(pagination.current_page + 1)}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    );
  }),
  TableColumnConfig: {},
  TableActionConfig: {},
  ConfirmDialogData: {},
}));

describe('UserTable', () => {
  const mockUser: User = {
    id: 1,
    name: 'Patricia López',
    email: 'patricia.lopez@enteturismo.gov.ar',
    status: 'active',
    role: {
      id: 4,
      role_code: 'entity_staff',
      role_name: 'Entity Staff',
      description: 'Staff member',
      permissions: [],
    },
    created_at: '2025-11-28T00:00:00Z',
    updated_at: '2025-11-28T00:00:00Z',
  };

  const suspendedUser: User = {
    id: 2,
    name: 'Miguel Sánchez',
    email: 'miguel.sanchez@enteturismo.gov.ar',
    status: 'suspended',
    role: {
      id: 4,
      role_code: 'entity_staff',
      role_name: 'Entity Staff',
      description: 'Staff member',
      permissions: [],
    },
    created_at: '2025-11-28T00:00:00Z',
    updated_at: '2025-11-28T00:00:00Z',
  };

  const mockPagination = createMockPaginationMeta({
    current_page: 1,
    last_page: 2,
    per_page: 10,
    total: 15,
  });

  const defaultProps = {
    users: [mockUser],
    pagination: mockPagination,
    loading: false,
    onPageChange: jest.fn(),
    onEdit: jest.fn(),
    onSuspend: jest.fn(),
    onUnsuspend: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render table with users', () => {
      render(<UserTable {...defaultProps} />);

      expect(screen.getByText('Patricia López')).toBeInTheDocument();
      expect(screen.getByText('patricia.lopez@enteturismo.gov.ar')).toBeInTheDocument();
      expect(screen.getByText('Entity Staff')).toBeInTheDocument();
    });

    it('should render empty state when no users', () => {
      render(<UserTable {...defaultProps} users={[]} />);

      expect(screen.getByText('No hay usuarios del equipo')).toBeInTheDocument();
    });

    it('should render multiple users', () => {
      render(<UserTable {...defaultProps} users={[mockUser, suspendedUser]} />);

      expect(screen.getByText('Patricia López')).toBeInTheDocument();
      expect(screen.getByText('Miguel Sánchez')).toBeInTheDocument();
    });

    it('should show user initials avatar', () => {
      render(<UserTable {...defaultProps} />);

      expect(screen.getByText('PL')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should render loading state', () => {
      render(<UserTable {...defaultProps} loading={true} />);

      const table = screen.getByTestId('user-table');
      expect(table).toHaveClass('animate-pulse');
    });

    it('should not render users when loading', () => {
      render(<UserTable {...defaultProps} loading={true} />);

      expect(screen.queryByText('Patricia López')).not.toBeInTheDocument();
    });
  });

  describe('status display', () => {
    it('should show "Activo" badge for active users', () => {
      render(<UserTable {...defaultProps} users={[mockUser]} />);

      expect(screen.getByText('Activo')).toBeInTheDocument();
    });

    it('should show "Suspendido" badge for suspended users', () => {
      render(<UserTable {...defaultProps} users={[suspendedUser]} />);

      expect(screen.getByText('Suspendido')).toBeInTheDocument();
    });

    it('should use success semantic tokens for active users', () => {
      render(<UserTable {...defaultProps} users={[mockUser]} />);

      const badge = screen.getByText('Activo');
      expect(badge).toHaveClass('bg-success-100');
      expect(badge).toHaveClass('text-success-800');
    });

    it('should use error semantic tokens for suspended users', () => {
      render(<UserTable {...defaultProps} users={[suspendedUser]} />);

      const badge = screen.getByText('Suspendido');
      expect(badge).toHaveClass('bg-error-100');
      expect(badge).toHaveClass('text-error-800');
    });
  });

  describe('action buttons', () => {
    it('should render Edit button', () => {
      render(<UserTable {...defaultProps} />);

      expect(screen.getByText('Editar')).toBeInTheDocument();
    });

    it('should render Suspend button for active users', () => {
      render(<UserTable {...defaultProps} users={[mockUser]} />);

      expect(screen.getByText('Suspender')).toBeInTheDocument();
      expect(screen.queryByText('Reactivar')).not.toBeInTheDocument();
    });

    it('should render Reactivate button for suspended users', () => {
      render(<UserTable {...defaultProps} users={[suspendedUser]} />);

      expect(screen.getByText('Reactivar')).toBeInTheDocument();
      expect(screen.queryByText('Suspender')).not.toBeInTheDocument();
    });

    it('should render Delete button', () => {
      render(<UserTable {...defaultProps} />);

      expect(screen.getByText('Eliminar')).toBeInTheDocument();
    });

    it('should call onEdit with user when clicking Edit button', () => {
      render(<UserTable {...defaultProps} />);

      fireEvent.click(screen.getByText('Editar'));

      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockUser);
      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    });

    it('should call onSuspend with user when clicking Suspend button', () => {
      render(<UserTable {...defaultProps} users={[mockUser]} />);

      fireEvent.click(screen.getByText('Suspender'));

      expect(defaultProps.onSuspend).toHaveBeenCalledWith(mockUser);
      expect(defaultProps.onSuspend).toHaveBeenCalledTimes(1);
    });

    it('should call onUnsuspend with user when clicking Reactivate button', () => {
      render(<UserTable {...defaultProps} users={[suspendedUser]} />);

      fireEvent.click(screen.getByText('Reactivar'));

      expect(defaultProps.onUnsuspend).toHaveBeenCalledWith(suspendedUser);
      expect(defaultProps.onUnsuspend).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete with user when clicking Delete button', () => {
      render(<UserTable {...defaultProps} />);

      fireEvent.click(screen.getByText('Eliminar'));

      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockUser);
      expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('conditional actions', () => {
    it('should show suspend for active and reactivate for suspended users', () => {
      render(<UserTable {...defaultProps} users={[mockUser, suspendedUser]} />);

      // Should have one suspend button (for active user)
      expect(screen.getAllByText('Suspender')).toHaveLength(1);
      // Should have one reactivate button (for suspended user)
      expect(screen.getAllByText('Reactivar')).toHaveLength(1);
    });
  });

  describe('pagination', () => {
    it('should render pagination when multiple pages', () => {
      render(<UserTable {...defaultProps} />);

      expect(screen.getByText('Anterior')).toBeInTheDocument();
      expect(screen.getByText('Siguiente')).toBeInTheDocument();
    });

    it('should not render pagination when single page', () => {
      render(
        <UserTable
          {...defaultProps}
          pagination={{ ...mockPagination, last_page: 1 }}
        />
      );

      expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
      expect(screen.queryByText('Siguiente')).not.toBeInTheDocument();
    });

    it('should disable Anterior button on first page', () => {
      render(<UserTable {...defaultProps} />);

      const anteriorButton = screen.getByText('Anterior');
      expect(anteriorButton).toBeDisabled();
    });

    it('should disable Siguiente button on last page', () => {
      render(
        <UserTable
          {...defaultProps}
          pagination={{ ...mockPagination, current_page: 2 }}
        />
      );

      const siguienteButton = screen.getByText('Siguiente');
      expect(siguienteButton).toBeDisabled();
    });

    it('should call onPageChange when clicking Siguiente', () => {
      render(<UserTable {...defaultProps} />);

      fireEvent.click(screen.getByText('Siguiente'));

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when clicking Anterior', () => {
      render(
        <UserTable
          {...defaultProps}
          pagination={{ ...mockPagination, current_page: 2 }}
        />
      );

      fireEvent.click(screen.getByText('Anterior'));

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
    });
  });

  describe('column configuration', () => {
    it('should have correct column headers', () => {
      render(<UserTable {...defaultProps} />);

      expect(screen.getByText('Usuario')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Rol')).toBeInTheDocument();
      expect(screen.getByText('Estado')).toBeInTheDocument();
      expect(screen.getByText('Fecha Alta')).toBeInTheDocument();
      expect(screen.getByText('Acciones')).toBeInTheDocument();
    });
  });

  describe('role display', () => {
    it('should show role name', () => {
      render(<UserTable {...defaultProps} />);

      expect(screen.getByText('Entity Staff')).toBeInTheDocument();
    });

    it('should show "Sin rol" when role is null', () => {
      const userWithoutRole = { ...mockUser, role: null };
      render(<UserTable {...defaultProps} users={[userWithoutRole]} />);

      expect(screen.getByText('Sin rol')).toBeInTheDocument();
    });
  });

  describe('date formatting', () => {
    it('should display formatted created date', () => {
      render(<UserTable {...defaultProps} />);

      // The date column should render a formatted date (format depends on locale)
      // Check for any part of the date that would be present
      expect(screen.getByText(/2025/)).toBeInTheDocument();
    });
  });

  describe('GenericTable props', () => {
    it('should pass testId to GenericTable', () => {
      render(<UserTable {...defaultProps} />);

      expect(screen.getByTestId('user-table')).toBeInTheDocument();
    });

    it('should pass correct empty message', () => {
      render(<UserTable {...defaultProps} users={[]} />);

      expect(screen.getByText('No hay usuarios del equipo')).toBeInTheDocument();
    });
  });
});
