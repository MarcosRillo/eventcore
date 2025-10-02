/**
 * Category Table Container - Smart Component
 * Handles business logic, state management, and configuration for CategoryTable
 */

'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Category } from '@/types/category.types';
import { PaginationMeta } from '@/hooks/usePaginatedData';
import { CategoryTable } from '@/features/categories/components/dumb/CategoryTable';

// Column configuration interface
export interface CategoryColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  className?: string;
}

// Action configuration interface
export interface CategoryActionConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  className: string;
  onClick: (category: Category) => void;
}

// Confirm dialog data interface
export interface CategoryConfirmDialogData {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

interface CategoryTableContainerProps {
  categories: Category[];
  pagination: PaginationMeta | null;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number, categoryName: string) => void;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export const CategoryTableContainer: React.FC<CategoryTableContainerProps> = ({
  categories,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
  loading = false,
}) => {
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<CategoryConfirmDialogData>({
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
        hour: '2-digit',
        minute: '2-digit',
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

  // Column configuration
  const columns = useMemo((): CategoryColumnConfig[] => [
    { key: 'category', label: 'Categoría', visible: true },
    { key: 'color', label: 'Color', visible: true },
    { key: 'status', label: 'Estado', visible: true },
    { key: 'created', label: 'Creado', visible: true },
  ], []);

  // Action configuration
  const actions = useMemo((): CategoryActionConfig[] => [
    {
      key: 'edit',
      label: 'Editar',
      icon: '✏️',
      className: 'text-indigo-600 hover:text-indigo-800',
      onClick: onEdit,
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: '🗑️',
      className: 'text-red-600 hover:text-red-800',
      onClick: handleDeleteCategory,
    },
  ], [onEdit, handleDeleteCategory]);

  // Close confirm dialog handler
  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <CategoryTable
      categories={categories}
      pagination={pagination}
      loading={loading}
      columns={columns}
      actions={actions}
      confirmDialog={confirmDialog}
      onPageChange={onPageChange}
      onFormatDate={formatDate}
      onCloseConfirmDialog={handleCloseConfirmDialog}
    />
  );
};