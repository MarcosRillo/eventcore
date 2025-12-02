/**
 * Category Table - Dumb Component
 * Pure presentational table component for displaying categories
 */

import React from 'react';
import { Category } from '@/types/category.types';
import { PaginationMeta } from '@/hooks/usePaginatedData';
import { Button, Pagination, ConfirmDialog } from '@/components/ui';
import {
  CategoryColumnConfig,
  CategoryActionConfig,
  CategoryConfirmDialogData
} from '@/features/categories/components/smart/CategoryTableContainer';

interface CategoryTableProps {
  categories: Category[];
  pagination: PaginationMeta | null;
  loading: boolean;
  columns: CategoryColumnConfig[];
  actions: CategoryActionConfig[];
  confirmDialog: CategoryConfirmDialogData;
  onPageChange: (page: number) => void;
  onFormatDate: (dateString: string) => string;
  onCloseConfirmDialog: () => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  pagination,
  loading,
  columns,
  actions,
  confirmDialog,
  onPageChange,
  onFormatDate,
  onCloseConfirmDialog,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8 text-gray-500">
          <p>No hay categorías disponibles</p>
        </div>
      </div>
    );
  }

  // Helper function to render cell content based on column key
  const renderCellContent = (category: Category, column: CategoryColumnConfig) => {
    switch (column.key) {
      case 'category':
        return (
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {category.name}
              </div>
              {category.description && (
                <div className="text-sm text-gray-500">
                  {category.description}
                </div>
              )}
            </div>
          </div>
        );

      case 'color':
        return (
          <div className="flex items-center">
            <div
              className="w-6 h-6 rounded-full mr-2"
              style={{ backgroundColor: category.color || '#gray-300' }}
            ></div>
            <span className="text-sm text-gray-900">{category.color}</span>
          </div>
        );

      case 'status':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              category.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {category.is_active ? 'Activa' : 'Inactiva'}
          </span>
        );

      case 'created':
        return (
          <span className="text-sm text-gray-500">
            {onFormatDate(category.created_at)}
          </span>
        );

      default:
        return <span className="text-sm text-gray-900">—</span>;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.filter(col => col.visible).map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                  >
                    {column.label}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  {columns.filter(col => col.visible).map((column) => (
                    <td
                      key={`${category.id}-${column.key}`}
                      className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
                    >
                      {renderCellContent(category, column)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {actions.map((action) => (
                          <Button
                            key={action.key}
                            variant={action.variant ?? (action.key === 'delete' ? 'danger' : 'secondary')}
                            size="sm"
                            onClick={() => action.onClick(category)}
                            title={action.label}
                          >
                            {action.icon} {action.label}
                          </Button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.last_page}
              onPageChange={onPageChange}
              showInfo={true}
              totalItems={pagination.total}
            />
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={onCloseConfirmDialog}
      />
    </>
  );
};