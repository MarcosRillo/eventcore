/**
 * UserTable - Dumb Component using GenericTable
 * Uses GenericTable with custom column renderers for users
 */

'use client';

import {
  PencilIcon,
  TrashIcon,
  NoSymbolIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useMemo, useCallback } from 'react';

import type { User, PaginationMeta } from '@/features/users/types/user.types';
import { getUserStatusLabel } from '@/features/users/types/user.types';
import { GenericTable, TableColumnConfig, TableActionConfig, ConfirmDialogData } from '@/shared/components/tables';
import type { PaginationMeta as GenericPaginationMeta } from '@/types/api-response.types';

interface UserTableProps {
  users: User[];
  pagination: PaginationMeta | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onEdit: (user: User) => void;
  onSuspend: (user: User) => void;
  onUnsuspend: (user: User) => void;
  onDelete: (user: User) => void;
  confirmDialog?: ConfirmDialogData;
  onCloseConfirmDialog?: () => void;
}

const BADGE_BASE_CLASSES = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

/**
 * Get user initials from name
 * @param name
 */
function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 *
 * @param root0
 * @param root0.users
 * @param root0.pagination
 * @param root0.loading
 * @param root0.onPageChange
 * @param root0.onEdit
 * @param root0.onSuspend
 * @param root0.onUnsuspend
 * @param root0.onDelete
 * @param root0.confirmDialog
 * @param root0.onCloseConfirmDialog
 */
export function UserTable({
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
}: UserTableProps) {
  // Date formatting function
  const formatDate = useCallback((dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  }, []);

  // Column configuration with custom renderers
  const columns = useMemo((): TableColumnConfig<User>[] => [
    // User avatar and name
    {
      key: 'name',
      label: 'Usuario',
      render: (user) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center">
              <span className="text-neutral-500 font-medium text-sm">
                {getUserInitials(user.name)}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-neutral-900">
              {user.name}
            </div>
          </div>
        </div>
      ),
    },
    // Email column
    {
      key: 'email',
      label: 'Email',
      render: (user) => (
        <span className="text-sm text-neutral-500">{user.email}</span>
      ),
    },
    // Role column
    {
      key: 'role',
      label: 'Rol',
      render: (user) => (
        <span className="text-sm text-neutral-500">
          {user.role?.role_name || 'Sin rol'}
        </span>
      ),
    },
    // Status column
    {
      key: 'status',
      label: 'Estado',
      render: (user) => (
        <span className={`${BADGE_BASE_CLASSES} ${
          user.status === 'active'
            ? 'bg-success-100 text-success-800'
            : 'bg-error-100 text-error-800'
        }`}>
          {getUserStatusLabel(user.status)}
        </span>
      ),
    },
    // Created date column
    {
      key: 'created_at',
      label: 'Fecha Alta',
      render: (user) => (
        <span className="text-sm text-neutral-500">
          {formatDate(user.created_at)}
        </span>
      ),
    },
  ], [formatDate]);

  // Action configuration
  const actions = useMemo((): TableActionConfig<User>[] => [
    {
      key: 'edit',
      label: 'Editar',
      icon: <PencilIcon className="w-5 h-5" />,
      variant: 'secondary',
      onClick: onEdit,
    },
    {
      key: 'suspend',
      label: 'Suspender',
      icon: <NoSymbolIcon className="w-5 h-5" />,
      variant: 'danger',
      condition: (user) => user.status === 'active',
      onClick: onSuspend,
    },
    {
      key: 'reactivate',
      label: 'Reactivar',
      icon: <ArrowPathIcon className="w-5 h-5" />,
      variant: 'primary',
      condition: (user) => user.status === 'suspended',
      onClick: onUnsuspend,
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: <TrashIcon className="w-5 h-5" />,
      variant: 'danger',
      onClick: onDelete,
    },
  ], [onEdit, onSuspend, onUnsuspend, onDelete]);

  // Convert simplified pagination to GenericTable format
  const genericPagination: GenericPaginationMeta | null = pagination ? {
    ...pagination,
    from: null,
    to: null,
    path: '',
    links: [],
  } : null;

  return (
    <GenericTable<User>
      items={users}
      columns={columns}
      actions={actions}
      isLoading={loading}
      emptyMessage="No hay usuarios del equipo"
      pagination={genericPagination}
      onPageChange={onPageChange}
      confirmDialog={confirmDialog}
      onCloseConfirmDialog={onCloseConfirmDialog}
      testId="user-table"
    />
  );
}

export default UserTable;
