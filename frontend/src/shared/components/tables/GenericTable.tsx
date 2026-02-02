/**
 * GenericTable Component
 * Reusable table component with loading, empty, pagination, and confirm dialog states
 * Uses semantic tokens following public pages design system
 */

'use client';

import { Fragment } from 'react';

import { Button } from '@/shared/components/form';
import { ConfirmDialog } from '@/shared/components/modals';
import { Pagination } from '@/shared/components/tables';
import type {
  GenericTableProps,
  TableActionConfig,
  TableColumnConfig,
} from '@/shared/components/tables/types';

/**
 * Loading skeleton component for table rows
 * @param root0
 * @param root0.rows
 * @param root0.columns
 */
function TableSkeleton({ rows, columns }: { rows: number; columns: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden" data-testid="table-skeleton">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-3">
          <div className="h-4 bg-neutral-200 rounded w-1/4" />
        </div>
        {/* Row skeletons */}
        <div className="divide-y divide-neutral-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-6 py-4 flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-4 bg-neutral-100 rounded flex-1"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state component
 * @param root0
 * @param root0.message
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden" data-testid="table-empty">
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="mt-4 text-sm text-neutral-500">{message}</p>
      </div>
    </div>
  );
}

/**
 * Action button variant styles
 */
const actionVariantStyles = {
  primary: 'text-primary-600 hover:text-primary-800 hover:bg-primary-50',
  secondary: 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50',
  danger: 'text-error-600 hover:text-error-800 hover:bg-error-50',
};

/**
 * GenericTable - Reusable typed table component
 * @param root0
 * @param root0.items
 * @param root0.columns
 * @param root0.actions
 * @param root0.isLoading
 * @param root0.emptyMessage
 * @param root0.pagination
 * @param root0.onPageChange
 * @param root0.confirmDialog
 * @param root0.onCloseConfirmDialog
 * @param root0.skeletonRows
 * @param root0.className
 * @param root0.testId
 * @template T - The type of items in the table (must have an id property)
 */
export function GenericTable<T extends { id: number | string }>({
  items,
  columns,
  actions,
  isLoading,
  emptyMessage = 'No hay elementos disponibles',
  pagination,
  onPageChange,
  confirmDialog,
  onCloseConfirmDialog,
  skeletonRows = 5,
  className = '',
  testId = 'generic-table',
}: GenericTableProps<T>) {
  // Filter visible columns
  const visibleColumns = columns.filter((col) => col.visible !== false);

  // Show loading skeleton
  if (isLoading) {
    return (
      <TableSkeleton
        rows={skeletonRows}
        columns={visibleColumns.length + (actions.length > 0 ? 1 : 0)}
      />
    );
  }

  // Show empty state
  if (items.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <Fragment>
      <div
        className={`bg-white rounded-lg shadow overflow-hidden ${className}`}
        data-testid={testId}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            {/* Table Header */}
            <thead className="bg-neutral-50">
              <tr>
                {visibleColumns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider ${column.className || ''}`}
                  >
                    {column.label}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-neutral-200">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-neutral-50 transition-colors"
                  data-testid={`table-row-${item.id}`}
                >
                  {visibleColumns.map((column) => (
                    <td
                      key={`${item.id}-${String(column.key)}`}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-neutral-900 ${column.className || ''}`}
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        {renderActions(item, actions)}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total > 0 && onPageChange && (
          <div className="border-t border-neutral-200">
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.last_page}
              totalItems={pagination.total}
              onPageChange={onPageChange}
              showInfo={true}
            />
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      {confirmDialog && onCloseConfirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={onCloseConfirmDialog}
        />
      )}
    </Fragment>
  );
}

/**
 * Render cell content based on column configuration
 * @param item
 * @param column
 */
function renderCell<T>(item: T, column: TableColumnConfig<T>): React.ReactNode {
  // Use custom render function if provided
  if (column.render) {
    return column.render(item);
  }

  // Default: render the value directly
  const key = column.key as keyof T;
  const value = item[key];

  if (value === null || value === undefined) {
    return <span className="text-neutral-400">—</span>;
  }

  return String(value);
}

/**
 * Render action buttons for a row
 * @param item
 * @param actions
 */
function renderActions<T extends { id: number | string }>(
  item: T,
  actions: TableActionConfig<T>[]
): React.ReactNode {
  // Filter actions based on condition
  const availableActions = actions.filter(
    (action) => !action.condition || action.condition(item)
  );

  return availableActions.map((action) => {
    const variantStyle = actionVariantStyles[action.variant || 'secondary'];

    return (
      <Button
        key={action.key}
        variant="ghost"
        size="sm"
        className={`p-1.5 rounded ${variantStyle}`}
        onClick={() => action.onClick(item)}
        title={action.label}
        aria-label={action.label}
      >
        {action.icon}
      </Button>
    );
  });
}
