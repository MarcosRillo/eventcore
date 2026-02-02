/**
 * ExpandableTable Component
 * Reusable table component with expandable rows for hierarchical data display
 * Extends GenericTable patterns with accordion-style expansion
 */

'use client';

import { ChevronRight } from 'lucide-react';
import { Fragment, memo, ReactNode, useCallback } from 'react';

import { Button } from '@/shared/components/form';
import { ConfirmDialog } from '@/shared/components/modals';
import { Pagination } from '@/shared/components/tables';
import type {
  ConfirmDialogData,
  TableActionConfig,
  TableColumnConfig,
} from '@/shared/components/tables/types';
import { PaginationMeta } from '@/types/api-response.types';

export interface ExpandableTableProps<T extends { id: number | string }> {
  /** Array of items to display in the table */
  items: T[];
  /** Column configuration array */
  columns: TableColumnConfig<T>[];
  /** Action buttons configuration array */
  actions: TableActionConfig<T>[];
  /** Loading state indicator */
  isLoading: boolean;
  /** Message to display when table is empty */
  emptyMessage?: string;
  /** Pagination metadata (optional) */
  pagination?: PaginationMeta | null;
  /** Page change handler (required if pagination is provided) */
  onPageChange?: (page: number) => void;
  /** Confirm dialog state (optional) */
  confirmDialog?: ConfirmDialogData;
  /** Handler to close confirm dialog */
  onCloseConfirmDialog?: () => void;
  /** Number of skeleton rows to show during loading */
  skeletonRows?: number;
  /** Additional CSS classes for the table container */
  className?: string;
  /** Test ID for testing purposes */
  testId?: string;

  // Expansion props
  /** Function to get unique ID from item */
  getItemId: (item: T) => string | number;
  /** Function to render expanded content for an item */
  renderExpandedContent: (item: T) => ReactNode;
  /** Set of currently expanded item IDs */
  expandedIds: Set<string | number>;
  /** Handler for toggling expansion state */
  onToggleExpand: (id: string | number) => void;
  /** Set of items currently loading their expanded content */
  loadingExpandedIds?: Set<string | number>;
}

/**
 * Loading skeleton component for table rows
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
 * Render cell content based on column configuration
 */
function renderCell<T>(item: T, column: TableColumnConfig<T>): ReactNode {
  if (column.render) {
    return column.render(item);
  }

  const key = column.key as keyof T;
  const value = item[key];

  if (value === null || value === undefined) {
    return <span className="text-neutral-400">—</span>;
  }

  return String(value);
}

/**
 * Render action buttons for a row
 */
function renderActions<T extends { id: number | string }>(
  item: T,
  actions: TableActionConfig<T>[]
): ReactNode {
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
        onClick={(e) => {
          e.stopPropagation();
          action.onClick(item);
        }}
        title={action.label}
        aria-label={action.label}
      >
        {action.icon}
      </Button>
    );
  });
}

/**
 * Expandable row component - memoized for performance
 */
const ExpandableRowComponent = memo(function ExpandableRow<T extends { id: number | string }>({
  item,
  itemId,
  columns,
  actions,
  isExpanded,
  isLoadingExpanded,
  onToggleExpand,
  renderExpandedContent,
}: {
  item: T;
  itemId: string | number;
  columns: TableColumnConfig<T>[];
  actions: TableActionConfig<T>[];
  isExpanded: boolean;
  isLoadingExpanded: boolean;
  onToggleExpand: (id: string | number) => void;
  renderExpandedContent: (item: T) => ReactNode;
}) {
  const handleRowClick = useCallback(() => {
    onToggleExpand(itemId);
  }, [itemId, onToggleExpand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleExpand(itemId);
    }
  }, [itemId, onToggleExpand]);

  return (
    <Fragment>
      {/* Main row */}
      <tr
        className="hover:bg-neutral-50 transition-colors cursor-pointer"
        onClick={handleRowClick}
        onKeyDown={handleKeyDown}
        data-testid={`table-row-${itemId}`}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
      >
        {/* Expand/collapse indicator column */}
        <td className="px-3 py-4 w-10">
          <div className="flex items-center justify-center">
            {isLoadingExpanded ? (
              <div className="w-5 h-5 border-2 border-neutral-300 border-t-primary-600 rounded-full animate-spin" />
            ) : (
              <ChevronRight
                className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            )}
          </div>
        </td>

        {/* Data columns */}
        {columns.map((column) => (
          <td
            key={`${itemId}-${String(column.key)}`}
            className={`px-6 py-4 whitespace-nowrap text-sm text-neutral-900 ${column.className || ''}`}
          >
            {renderCell(item, column)}
          </td>
        ))}

        {/* Actions column */}
        {actions.length > 0 && (
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex justify-end items-center gap-2">
              {renderActions(item, actions)}
            </div>
          </td>
        )}
      </tr>

      {/* Expanded content row */}
      {isExpanded && (
        <tr data-testid={`table-row-${itemId}-expanded`}>
          <td
            colSpan={columns.length + (actions.length > 0 ? 2 : 1)}
            className="px-0 py-0 bg-neutral-50"
          >
            <div className="transition-all duration-200 ease-in-out">
              {renderExpandedContent(item)}
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}) as <T extends { id: number | string }>(props: {
  item: T;
  itemId: string | number;
  columns: TableColumnConfig<T>[];
  actions: TableActionConfig<T>[];
  isExpanded: boolean;
  isLoadingExpanded: boolean;
  onToggleExpand: (id: string | number) => void;
  renderExpandedContent: (item: T) => ReactNode;
}) => React.ReactElement;

/**
 * ExpandableTable - Reusable typed table component with expandable rows
 */
export function ExpandableTable<T extends { id: number | string }>({
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
  testId = 'expandable-table',
  getItemId,
  renderExpandedContent,
  expandedIds,
  onToggleExpand,
  loadingExpandedIds = new Set(),
}: ExpandableTableProps<T>) {
  // Filter visible columns
  const visibleColumns = columns.filter((col) => col.visible !== false);

  // Show loading skeleton
  if (isLoading) {
    return (
      <TableSkeleton
        rows={skeletonRows}
        columns={visibleColumns.length + (actions.length > 0 ? 2 : 1)}
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
                {/* Expand column header */}
                <th className="px-3 py-3 w-10" aria-label="Expandir">
                  <span className="sr-only">Expandir</span>
                </th>

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
              {items.map((item) => {
                const itemId = getItemId(item);
                return (
                  <ExpandableRowComponent
                    key={itemId}
                    item={item}
                    itemId={itemId}
                    columns={visibleColumns}
                    actions={actions}
                    isExpanded={expandedIds.has(itemId)}
                    isLoadingExpanded={loadingExpandedIds.has(itemId)}
                    onToggleExpand={onToggleExpand}
                    renderExpandedContent={renderExpandedContent}
                  />
                );
              })}
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
