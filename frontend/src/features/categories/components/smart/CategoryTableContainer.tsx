/**
 * Category Table Container - Smart Component
 * Uses GenericTable with custom column renderers for categories
 * Handles business logic, state management, and configuration
 */

'use client';

import { useMemo, useState, useCallback } from 'react';
import { Category } from '@/types/category.types';
import { PaginationMeta } from '@/types/api-response.types';
import { GenericTable, TableColumnConfig, TableActionConfig, ConfirmDialogData } from '@/shared/components/tables';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

// Re-export types for backward compatibility
export type CategoryColumnConfig = TableColumnConfig<Category>;
export type CategoryActionConfig = TableActionConfig<Category>;
export type CategoryConfirmDialogData = ConfirmDialogData;

interface CategoryTableContainerProps {
  categories: Category[];
  pagination: PaginationMeta | null;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number, categoryName: string) => void;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const BADGE_BASE_CLASSES = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

export const CategoryTableContainer = ({
  categories,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
  loading = false,
}: CategoryTableContainerProps) => {
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Date formatting function
  const formatDate = useCallback((dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }, []);

  // Delete category handler with confirmation
  const handleDeleteCategory = useCallback((category: Category) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`,
      onConfirm: () => {
        onDelete(category.id, category.name);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  }, [onDelete]);

  // Column configuration with custom renderers
  const columns = useMemo((): TableColumnConfig<Category>[] => [
    // Category name and description
    {
      key: 'name',
      label: 'Categoría',
      render: (category) => (
        <div className="flex flex-col">
          <span className="font-medium text-neutral-900">{category.name}</span>
          {category.description && (
            <span className="text-sm text-neutral-500 line-clamp-1">
              {category.description}
            </span>
          )}
        </div>
      ),
    },
    // Color column
    {
      key: 'color',
      label: 'Color',
      render: (category) => (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full border border-neutral-200"
            style={{ backgroundColor: category.color || '#6b7280' }}
          />
          <span className="text-sm text-neutral-600">
            {category.color || 'Sin color'}
          </span>
        </div>
      ),
    },
    // Status column
    {
      key: 'is_active',
      label: 'Estado',
      render: (category) => (
        <span className={`${BADGE_BASE_CLASSES} ${
          category.is_active
            ? 'bg-success-100 text-success-800'
            : 'bg-neutral-100 text-neutral-800'
        }`}>
          {category.is_active ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    // Created date column
    {
      key: 'created_at',
      label: 'Creado',
      render: (category) => (
        <span className="text-sm text-neutral-500">
          {formatDate(category.created_at)}
        </span>
      ),
    },
  ], [formatDate]);

  // Action configuration
  const actions = useMemo((): TableActionConfig<Category>[] => [
    {
      key: 'edit',
      label: 'Editar',
      icon: <PencilIcon className="w-5 h-5" />,
      variant: 'secondary',
      onClick: onEdit,
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: <TrashIcon className="w-5 h-5" />,
      variant: 'danger',
      onClick: handleDeleteCategory,
    },
  ], [onEdit, handleDeleteCategory]);

  // Close confirm dialog handler
  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <GenericTable<Category>
      items={categories}
      columns={columns}
      actions={actions}
      isLoading={loading}
      emptyMessage="No hay categorías disponibles"
      pagination={pagination}
      onPageChange={onPageChange}
      confirmDialog={confirmDialog}
      onCloseConfirmDialog={handleCloseConfirmDialog}
      testId="category-table"
    />
  );
};
