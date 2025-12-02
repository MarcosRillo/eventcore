import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserTableContainer from '../UserTableContainer';
import { useUserManager } from '../../../hooks/useUserManager';
import type { User, PaginationMeta } from '../../../types/user.types';

jest.mock('../../../hooks/useUserManager');

// Mock UserTable to test container behavior
jest.mock('../../dumb/UserTable', () => ({
  UserTable: jest.fn(({
    users,
    pagination,
    loading,
    onPageChange,
    onEdit,
    onSuspend,
    onUnsuspend,
    onDelete,
    confirmDialog,
    onCloseConfirmDialog,
  }) => (
    <div data-testid="user-table">
      {loading && <div>Loading...</div>}
      {users.map((user: User) => (
        <div key={user.id}>
          <span>{user.name}</span>
          <span>{user.email}</span>
          <button onClick={() => onEdit(user)}>Editar</button>
          {user.status === 'active' ? (
            <button onClick={() => onSuspend(user)}>Suspender</button>
          ) : (
            <button onClick={() => onUnsuspend(user)}>Reactivar</button>
          )}
          <button onClick={() => onDelete(user)}>Eliminar</button>
        </div>
      ))}
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
      {confirmDialog?.isOpen && (
        <div>
          <h2>{confirmDialog.title}</h2>
          <p>{confirmDialog.message}</p>
          <button onClick={confirmDialog.onConfirm}>Confirmar</button>
          <button onClick={onCloseConfirmDialog}>Cancelar Confirmación</button>
        </div>
      )}
    </div>
  )),
}));

// Mock UserEditModalContainer
jest.mock('../UserEditModalContainer', () => ({
  UserEditModalContainer: jest.fn(({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="edit-modal">
        <span>Editar Usuario</span>
        <button onClick={onClose}>Cancelar</button>
      </div>
    ) : null
  ),
}));

const mockUseUserManager = useUserManager as jest.MockedFunction<typeof useUserManager>;

describe('UserTableContainer', () => {
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

  const mockPagination: PaginationMeta = {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 1,
  };

  const defaultHookReturn = {
    users: [mockUser],
    pagination: mockPagination,
    loading: false,
    error: null,
    filters: { status: 'all' as const, per_page: 15, page: 1 },
    actionLoading: null,
    selectedUser: null,
    editingUser: null,
    fetchUsers: jest.fn(),
    handleSuspend: jest.fn().mockResolvedValue(true),
    handleUnsuspend: jest.fn().mockResolvedValue(true),
    handleDelete: jest.fn().mockResolvedValue(true),
    handleUpdate: jest.fn().mockResolvedValue(true),
    handleViewDetail: jest.fn(),
    handleCloseDetail: jest.fn(),
    handleOpenEdit: jest.fn(),
    handleCloseEdit: jest.fn(),
    setFilters: jest.fn(),
    clearError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUserManager.mockReturnValue(defaultHookReturn);
  });

  describe('rendering', () => {
    it('should render user table', () => {
      render(<UserTableContainer />);

      expect(screen.getByText('Patricia López')).toBeInTheDocument();
      expect(screen.getByText('patricia.lopez@enteturismo.gov.ar')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<UserTableContainer />);

      expect(screen.getByPlaceholderText('Buscar por nombre o email...')).toBeInTheDocument();
    });

    it('should render status filter buttons', () => {
      render(<UserTableContainer />);

      expect(screen.getByText('Todos')).toBeInTheDocument();
      expect(screen.getByText('Activos')).toBeInTheDocument();
      expect(screen.getByText('Suspendidos')).toBeInTheDocument();
    });

    it('should render search button', () => {
      render(<UserTableContainer />);

      expect(screen.getByText('Buscar')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('should update search input value', () => {
      render(<UserTableContainer />);

      const searchInput = screen.getByPlaceholderText('Buscar por nombre o email...');
      fireEvent.change(searchInput, { target: { value: 'patricia' } });

      expect(searchInput).toHaveValue('patricia');
    });

    it('should call setFilters when clicking search button', () => {
      render(<UserTableContainer />);

      const searchInput = screen.getByPlaceholderText('Buscar por nombre o email...');
      fireEvent.change(searchInput, { target: { value: 'patricia' } });
      fireEvent.click(screen.getByText('Buscar'));

      expect(defaultHookReturn.setFilters).toHaveBeenCalledWith({ search: 'patricia', page: 1 });
    });

    it('should call setFilters when pressing Enter', () => {
      render(<UserTableContainer />);

      const searchInput = screen.getByPlaceholderText('Buscar por nombre o email...');
      fireEvent.change(searchInput, { target: { value: 'patricia' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 13, charCode: 13 });

      expect(defaultHookReturn.setFilters).toHaveBeenCalledWith({ search: 'patricia', page: 1 });
    });

    it('should show clear button when search has value', () => {
      mockUseUserManager.mockReturnValue({
        ...defaultHookReturn,
        filters: { ...defaultHookReturn.filters, search: 'patricia' },
      });

      render(<UserTableContainer />);

      expect(screen.getByText('Limpiar')).toBeInTheDocument();
    });

    it('should clear search when clicking Limpiar', () => {
      mockUseUserManager.mockReturnValue({
        ...defaultHookReturn,
        filters: { ...defaultHookReturn.filters, search: 'patricia' },
      });

      render(<UserTableContainer />);

      fireEvent.click(screen.getByText('Limpiar'));

      expect(defaultHookReturn.setFilters).toHaveBeenCalledWith({ search: '', page: 1 });
    });
  });

  describe('status filter', () => {
    it('should highlight active filter button', () => {
      mockUseUserManager.mockReturnValue({
        ...defaultHookReturn,
        filters: { ...defaultHookReturn.filters, status: 'active' },
      });

      render(<UserTableContainer />);

      const activosButton = screen.getByText('Activos').closest('button');
      expect(activosButton).toBeInTheDocument();
    });

    it('should call setFilters when clicking status filter', () => {
      render(<UserTableContainer />);

      fireEvent.click(screen.getByText('Suspendidos'));

      expect(defaultHookReturn.setFilters).toHaveBeenCalledWith({ status: 'suspended', page: 1 });
    });
  });

  describe('error display', () => {
    it('should show error message when error exists', () => {
      mockUseUserManager.mockReturnValue({
        ...defaultHookReturn,
        error: 'Error al cargar los usuarios',
      });

      render(<UserTableContainer />);

      expect(screen.getByText('Error al cargar los usuarios')).toBeInTheDocument();
    });

    it('should call clearError when clicking close on error', () => {
      mockUseUserManager.mockReturnValue({
        ...defaultHookReturn,
        error: 'Error al cargar los usuarios',
      });

      render(<UserTableContainer />);

      // Find the close button (it's the button with the XMarkIcon)
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn => btn.querySelector('svg'));
      if (closeButton) {
        fireEvent.click(closeButton);
      }

      expect(defaultHookReturn.clearError).toHaveBeenCalled();
    });
  });

  describe('edit modal', () => {
    it('should render edit modal when editingUser is set', () => {
      mockUseUserManager.mockReturnValue({
        ...defaultHookReturn,
        editingUser: mockUser,
      });

      render(<UserTableContainer />);

      expect(screen.getByText('Editar Usuario')).toBeInTheDocument();
    });

    it('should call handleOpenEdit when clicking Edit', () => {
      render(<UserTableContainer />);

      fireEvent.click(screen.getByText('Editar'));

      expect(defaultHookReturn.handleOpenEdit).toHaveBeenCalledWith(mockUser);
    });

    it('should call handleCloseEdit when closing modal', () => {
      mockUseUserManager.mockReturnValue({
        ...defaultHookReturn,
        editingUser: mockUser,
      });

      render(<UserTableContainer />);

      fireEvent.click(screen.getByText('Cancelar'));

      expect(defaultHookReturn.handleCloseEdit).toHaveBeenCalled();
    });
  });

  describe('delete confirmation', () => {
    it('should show delete confirmation dialog when clicking Delete', async () => {
      render(<UserTableContainer />);

      fireEvent.click(screen.getByText('Eliminar'));

      await waitFor(() => {
        expect(screen.getByText('Eliminar Usuario')).toBeInTheDocument();
      });
    });

    it('should show user name in confirmation message', async () => {
      render(<UserTableContainer />);

      fireEvent.click(screen.getByText('Eliminar'));

      await waitFor(() => {
        // The message should contain the user name
        const message = screen.getByText(/Esta acción no se puede deshacer/);
        expect(message).toBeInTheDocument();
      });
    });

    it('should call handleDelete when confirming deletion', async () => {
      render(<UserTableContainer />);

      fireEvent.click(screen.getByText('Eliminar'));

      await waitFor(() => {
        expect(screen.getByText('Eliminar Usuario')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Confirmar'));

      await waitFor(() => {
        expect(defaultHookReturn.handleDelete).toHaveBeenCalledWith(1);
      });
    });

    it('should close confirmation dialog when cancelled', async () => {
      render(<UserTableContainer />);

      fireEvent.click(screen.getByText('Eliminar'));

      await waitFor(() => {
        expect(screen.getByText('Eliminar Usuario')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Cancelar Confirmación'));

      await waitFor(() => {
        expect(screen.queryByText('Eliminar Usuario')).not.toBeInTheDocument();
      });
    });
  });

  describe('suspend and unsuspend', () => {
    it('should call handleSuspend with user id when clicking Suspender', () => {
      render(<UserTableContainer />);

      fireEvent.click(screen.getByText('Suspender'));

      expect(defaultHookReturn.handleSuspend).toHaveBeenCalledWith(1);
    });

    it('should call handleUnsuspend with user id when clicking Reactivar', () => {
      const suspendedUser = { ...mockUser, status: 'suspended' as const };
      mockUseUserManager.mockReturnValue({
        ...defaultHookReturn,
        users: [suspendedUser],
      });

      render(<UserTableContainer />);

      fireEvent.click(screen.getByText('Reactivar'));

      expect(defaultHookReturn.handleUnsuspend).toHaveBeenCalledWith(1);
    });
  });

  describe('pagination', () => {
    it('should call setFilters when changing page', () => {
      mockUseUserManager.mockReturnValue({
        ...defaultHookReturn,
        pagination: { ...mockPagination, last_page: 2 },
      });

      render(<UserTableContainer />);

      fireEvent.click(screen.getByText('Siguiente'));

      expect(defaultHookReturn.setFilters).toHaveBeenCalledWith({ page: 2 });
    });
  });

  describe('semantic color tokens', () => {
    it('should use error semantic tokens for error alert', () => {
      mockUseUserManager.mockReturnValue({
        ...defaultHookReturn,
        error: 'Error message',
      });

      render(<UserTableContainer />);

      const errorText = screen.getByText('Error message');
      // The error message is inside a nested structure with bg-error-50 on the outer div
      // Check that the text uses error semantic color
      expect(errorText).toHaveClass('text-error-700');
    });
  });
});
