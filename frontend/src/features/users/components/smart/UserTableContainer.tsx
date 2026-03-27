'use client';

/**
 * User Table Container - Smart Component
 * Connects the hook with the presentational components
 */

import { X, XCircle } from 'lucide-react';
import { useCallback,useState } from 'react';

import { UserTable } from '@/features/users/components/dumb/UserTable';
import { UserEditModalContainer } from '@/features/users/components/smart/UserEditModalContainer';
import { useUserManager } from '@/features/users/hooks/useUserManager';
import type { User } from '@/features/users/types/user.types';
import { Button, Input } from '@/shared/components/form';
import { ConfirmDialogData } from '@/shared/components/tables';

/**
 *
 */
export function UserTableContainer() {
  const {
    users,
    pagination,
    loading,
    error,
    filters,
    actionLoading,
    editingUser,
    handleSuspend,
    handleUnsuspend,
    handleDelete,
    handleUpdate,
    handleOpenEdit,
    handleCloseEdit,
    setFilters,
    clearError,
  } = useUserManager();

  const [searchInput, setSearchInput] = useState('');

  // Confirm dialog state for delete
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleSearch = useCallback(() => {
    setFilters({ search: searchInput, page: 1 });
  }, [searchInput, setFilters]);

  const handleSearchKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setFilters({ search: '', page: 1 });
  }, [setFilters]);

  const handleStatusFilter = useCallback(
    (status: 'all' | 'active' | 'suspended') => {
      setFilters({ status, page: 1 });
    },
    [setFilters]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setFilters({ page });
    },
    [setFilters]
  );

  // Handle suspend with User object
  const handleSuspendUser = useCallback((user: User) => {
    handleSuspend(user.id);
  }, [handleSuspend]);

  // Handle unsuspend with User object
  const handleUnsuspendUser = useCallback((user: User) => {
    handleUnsuspend(user.id);
  }, [handleUnsuspend]);

  // Delete user handler with confirmation
  const handleDeleteClick = useCallback((user: User) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de que deseas eliminar a "${user.name}"? Esta acción no se puede deshacer. El usuario perderá acceso al sistema.`,
      onConfirm: async () => {
        await handleDelete(user.id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  }, [handleDelete]);

  // Close confirm dialog handler
  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-error-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-error-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={clearError}
                className="text-error-500 hover:text-error-600"
                type="button"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <Input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              fullWidth
            />
            <Button variant="primary" onClick={handleSearch}>
              Buscar
            </Button>
            {filters.search && (
              <Button variant="outline" onClick={handleClearSearch}>
                Limpiar
              </Button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <Button
              variant={filters.status === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={filters.status === 'active' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('active')}
            >
              Activos
            </Button>
            <Button
              variant={filters.status === 'suspended' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('suspended')}
            >
              Suspendidos
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <UserTable
        users={users}
        pagination={pagination}
        loading={loading}
        onPageChange={handlePageChange}
        onEdit={handleOpenEdit}
        onSuspend={handleSuspendUser}
        onUnsuspend={handleUnsuspendUser}
        onDelete={handleDeleteClick}
        confirmDialog={confirmDialog}
        onCloseConfirmDialog={handleCloseConfirmDialog}
      />

      {/* Edit Modal */}
      <UserEditModalContainer
        user={editingUser}
        isOpen={!!editingUser}
        loading={actionLoading === editingUser?.id}
        onClose={handleCloseEdit}
        onSave={handleUpdate}
      />
    </div>
  );
}

export default UserTableContainer;
