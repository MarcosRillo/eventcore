/**
 * Table Component - Base reutilizable
 * Unified table component that supports both simple and complex table patterns
 * Provides loading states, empty states, pagination, and flexible column configuration
 */

'use client';

import { ReactNode } from 'react';
import { Pagination, Button } from '@/components/ui';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Permission } from '@/types/auth.types';
import { Event } from '@/types/event.types';
import { User } from '@/types/auth.types';
import { Category } from '@/types/category.types';
import { TablePaginationProps } from '@/types/pagination.types';

// Supported table data types based on business domain
type TableDataType = Event | User | Category;

// Base column configuration
export interface TableColumn<T extends TableDataType = TableDataType> {
  key: string;
  label: string;
  className?: string;
  render?: (item: T, index: number) => ReactNode;
  sortable?: boolean;
  visible?: boolean;
}

// Base action configuration
export interface TableAction<T extends TableDataType = TableDataType> {
  key: string;
  label: string;
  icon?: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  condition?: (item: T, index: number) => boolean;
  permission?: Permission;
  onClick: (item: T, index: number) => void;
}


// Main table props
export interface TableProps<T extends TableDataType = TableDataType> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: TablePaginationProps;
  actions?: TableAction<T>[];
  onRowClick?: (item: T, index: number) => void;
  emptyStateMessage?: string;
  emptyStateIcon?: ReactNode;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  // Advanced features
  selectable?: boolean;
  selectedItems?: T[];
  onSelectionChange?: (items: T[]) => void;
  getItemId?: (item: T) => string | number;
}

// Default empty state icon
const DefaultEmptyIcon = () => (
  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
  </svg>
);

// Loading skeleton component
const TableSkeleton = ({ columns }: { columns: TableColumn<TableDataType>[] }) => (
  <div className="animate-pulse">
    <div className="bg-gray-50 px-6 py-3">
      <div className="flex space-x-4">
        {columns.filter(col => col.visible !== false).map((col, index) => (
          <div key={col.key} className={`h-4 bg-gray-200 rounded ${index === 0 ? 'w-1/4' : 'w-1/6'}`} />
        ))}
      </div>
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="flex space-x-4">
            {columns.filter(col => col.visible !== false).map((col, colIndex) => (
              <div key={col.key} className={`h-4 bg-gray-100 rounded ${colIndex === 0 ? 'w-1/4' : 'w-1/6'}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Empty state component
const EmptyState = ({
  message = "No hay datos disponibles",
  icon
}: {
  message: string;
  icon?: ReactNode;
}) => (
  <div className="text-center py-12">
    <div className="flex flex-col items-center">
      {icon || <DefaultEmptyIcon />}
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        {message}
      </h3>
    </div>
  </div>
);

export const Table = <T extends TableDataType>({
  columns,
  data,
  loading = false,
  pagination,
  actions = [],
  onRowClick,
  emptyStateMessage = "No hay datos disponibles",
  emptyStateIcon,
  className = "",
  tableClassName = "",
  headerClassName = "",
  bodyClassName = "",
  rowClassName = "",
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  getItemId,
}: TableProps<T>) => {
  // Get visible columns
  const visibleColumns = columns.filter(col => col.visible !== false);

  // Add selection column if selectable
  const finalColumns = selectable
    ? [{ key: '__selection', label: '', className: 'w-8' }, ...visibleColumns]
    : visibleColumns;

  // Add actions column if actions exist
  if (actions.length > 0) {
    finalColumns.push({
      key: '__actions',
      label: 'Acciones',
      className: 'text-right w-32'
    });
  }

  // Handle selection
  const isSelected = (item: T): boolean => {
    if (!selectable || !getItemId) return false;
    const itemId = getItemId(item);
    return selectedItems.some(selected => getItemId(selected) === itemId);
  };

  const toggleSelection = (item: T) => {
    if (!selectable || !getItemId || !onSelectionChange) return;

    const itemId = getItemId(item);
    const currentlySelected = isSelected(item);

    if (currentlySelected) {
      onSelectionChange(selectedItems.filter(selected => getItemId(selected) !== itemId));
    } else {
      onSelectionChange([...selectedItems, item]);
    }
  };

  const toggleSelectAll = () => {
    if (!selectable || !getItemId || !onSelectionChange) return;

    if (selectedItems.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...data]);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
        <TableSkeleton columns={finalColumns as TableColumn<TableDataType>[]} />
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <EmptyState message={emptyStateMessage} icon={emptyStateIcon} />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-200 ${tableClassName}`}>
          <thead className={`bg-gray-50 ${headerClassName}`}>
            <tr>
              {finalColumns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.key === '__selection' && selectable ? (
                    <input
                      type="checkbox"
                      checked={data.length > 0 && selectedItems.length === data.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  ) : column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`bg-white divide-y divide-gray-200 ${bodyClassName}`}>
            {data.map((item, index) => {
              const computedRowClassName = typeof rowClassName === 'function'
                ? rowClassName(item, index)
                : rowClassName;

              const defaultRowClassName = onRowClick
                ? 'hover:bg-gray-50 cursor-pointer'
                : 'hover:bg-gray-50';

              return (
                <tr
                  key={getItemId ? getItemId(item) : index}
                  className={`${defaultRowClassName} ${computedRowClassName}`}
                  onClick={() => onRowClick?.(item, index)}
                >
                  {finalColumns.map((column) => (
                    <td
                      key={`${column.key}-${index}`}
                      className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
                    >
                      {column.key === '__selection' && selectable ? (
                        <input
                          type="checkbox"
                          checked={isSelected(item)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelection(item);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      ) : column.key === '__actions' ? (
                        <div className="flex items-center justify-end space-x-1">
                          {actions
                            .filter(action => !action.condition || action.condition(item, index))
                            .map((action) => {
                              const ActionButton = (
                                <Button
                                  key={action.key}
                                  variant={action.variant || 'ghost'}
                                  size={(action.size === 'xs' ? 'sm' : action.size) || 'sm'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(item, index);
                                  }}
                                  className={action.className}
                                  title={action.label}
                                  leftIcon={action.icon}
                                >
                                  {action.size === 'xs' || action.size === 'sm' ? null : action.label}
                                </Button>
                              );

                              // Wrap in PermissionGate if permission is specified
                              if (action.permission) {
                                return (
                                  <PermissionGate key={action.key} permission={action.permission}>
                                    {ActionButton}
                                  </PermissionGate>
                                );
                              }

                              return ActionButton;
                            })}
                        </div>
                      ) : column.render ? (
                        column.render(item, index)
                      ) : (
                        // Fallback - try to access the property by key
                        <span className="text-sm text-gray-900">
                          {String(item[column.key as keyof T] || '—')}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="border-t border-gray-200">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
};

export default Table;