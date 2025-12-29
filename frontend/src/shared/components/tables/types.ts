/**
 * GenericTable Types
 * Interfaces for the reusable table component
 */

import { ReactNode } from 'react';

import { PaginationMeta } from '@/types/api-response.types';

/**
 * Column configuration for GenericTable
 * Defines how each column should be rendered
 */
export interface TableColumnConfig<T> {
  /** Unique key identifier for the column */
  key: keyof T | string;
  /** Display label for the column header */
  label: string;
  /** Whether the column should be visible (default: true) */
  visible?: boolean;
  /** Additional CSS classes for the column */
  className?: string;
  /** Custom render function for the cell content */
  render?: (item: T) => ReactNode;
}

/**
 * Action button configuration for GenericTable
 * Defines actions available for each row
 */
export interface TableActionConfig<T> {
  /** Unique key identifier for the action */
  key: string;
  /** Display label for the action (used for accessibility) */
  label: string;
  /** Icon to display in the action button */
  icon: ReactNode;
  /** Visual variant for the action button */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Condition function to determine if action should be shown */
  condition?: (item: T) => boolean;
  /** Click handler for the action */
  onClick: (item: T) => void;
}

/**
 * Confirm dialog data structure
 * Used for delete/destructive action confirmations
 */
export interface ConfirmDialogData {
  /** Whether the dialog is currently open */
  isOpen: boolean;
  /** Dialog title */
  title: string;
  /** Dialog message/description */
  message: string;
  /** Handler called when user confirms the action */
  onConfirm: () => void;
}

/**
 * Props for the GenericTable component
 * @template T - The type of items in the table
 */
export interface GenericTableProps<T extends { id: number | string }> {
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
}
