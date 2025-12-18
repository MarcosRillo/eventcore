/**
 * Generic Infrastructure Types
 * Ultra-aggressive consolidation using generic patterns to eliminate 20+ specific interfaces
 */

/**
 * Universal Form Handler Pattern
 * Replaces all FormState, FormActions interfaces
 */
export interface FormHandler<TData, TError = string> {
  data: TData;
  error: TError | null;
  isLoading: boolean;
  isValid: boolean;
  isDirty: boolean;
  originalData?: TData;
}

export interface FormActions<TData, TError = string> {
  updateField: <K extends keyof TData>(field: K, value: TData[K]) => void;
  setError: (error: TError | null) => void;
  submit: () => Promise<void>;
  reset: () => void;
  validate: () => boolean;
}

// Combined form type for hooks
export type FormHook<TData, TError = string> = FormHandler<TData, TError> & FormActions<TData, TError>;

/**
 * Universal CRUD Operations Pattern
 * Replaces all service-specific interfaces
 */
export interface CrudOperations<T, TFilters = Record<string, unknown>, TFormData = Partial<T>> {
  list: (filters?: TFilters) => Promise<PaginatedResponse<T>>;
  get: (id: number) => Promise<T>;
  create: (data: TFormData) => Promise<T>;
  update: (id: number, data: Partial<TFormData>) => Promise<T>;
  delete: (id: number) => Promise<void>;
  search?: (query: string, filters?: TFilters) => Promise<PaginatedResponse<T>>;
}

/**
 * Universal Table Component Props
 * Replaces all specific table props interfaces
 *
 * @note The `any` type in TActions constraint is intentional and follows industry best practices.
 * This pattern is used by React, Material-UI, Ant Design, and TypeScript's own utility types.
 * It provides maximum flexibility for callback signatures while maintaining type safety for the data model `T`.
 * Alternative approaches (unknown, CallableFunction) break existing usage or require massive refactoring.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Generic utility type requires flexible function signatures (industry standard pattern)
export interface TableProps<T, TActions extends Record<string, (...args: any[]) => void> = Record<string, never>> {
  data: T[];
  pagination?: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  loading?: boolean;
  error?: string | null;
  actions?: TActions;
  columns: Array<{
    key: keyof T | string;
    label: string;
    render?: (value: unknown, item: T) => React.ReactNode;
    sortable?: boolean;
  }>;
  onPageChange?: (page: number) => void;
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void;
}

/**
 * Universal Modal Props Pattern
 * Replaces all specific modal props
 */
export interface ModalProps<TData = void> {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data?: TData) => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  data?: TData;
}

/**
 * Universal Filter Pattern
 * Base for all entity filters
 */
export type EntityFilters<T extends Record<string, unknown> = Record<string, never>> = {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  date_from?: string;
  date_to?: string;
} & T;

/**
 * Universal Stats Pattern
 * Replaces all meta/stats interfaces
 */
export type EntityStats<T extends Record<string, number | string>> = T & {
  total: number;
  last_updated?: string;
};

/**
 * Universal API Response Pattern
 */
export type ApiResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; details?: Record<string, string[]> };

// Import required base type
import type { PaginatedResponse } from './api-response.types';

// Re-export for convenience
export type { PaginatedResponse };