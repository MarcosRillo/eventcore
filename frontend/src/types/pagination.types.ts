/**
 * Pagination Types - Ultra-Aggressive Consolidation
 *
 * Reduced from 4 interfaces to 1 universal pagination pattern
 */

// Re-export core pagination types from api-response.types.ts
export type { PaginationLinks,PaginationMeta } from '@/types/api-response.types';

/**
 * Simple pagination props for basic pagination without per-page selector
 */
export interface SimplePaginationProps {
  // Core required props
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  // Optional display props
  showInfo?: boolean;
  className?: string;
  totalItems?: number;
  itemsFrom?: number;
  itemsTo?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

/**
 * Advanced pagination props with per-page selector
 */
export interface AdvancedPaginationProps {
  // Core required props
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;

  // Optional display props
  showInfo?: boolean;
  className?: string;
}

// Universal type that accepts either simple or advanced
export type UniversalPaginationProps = SimplePaginationProps | AdvancedPaginationProps;

// Backward compatibility alias
export type TablePaginationProps = UniversalPaginationProps;