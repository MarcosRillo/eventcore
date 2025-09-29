/**
 * Category Types
 * Type definitions for category-related data structures
 */

import type { PaginatedResponse } from './api-response.types';
import type { TableProps, ModalProps, EntityFilters } from './generic-infrastructure.types';

// Re-export only essential types for backward compatibility
export type { User, LoginCredentials, LoginResponse } from './auth.types';
export type { ThemeSettings, AppearanceFormData, DEFAULT_THEME } from './appearance.types';

// Base category interface
export interface Category {
  id: number;
  name: string;
  slug: string;
  entity_id: number;
  color?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Form data type
export type CategoryFormData = Partial<Pick<Category, 'name' | 'description' | 'color' | 'is_active'>>;

// Use generic patterns
export type CategoryFilters = EntityFilters<{ active?: boolean; status?: 'all' | 'active' | 'inactive' }>;
export type CategoryPagination = PaginatedResponse<Category>;
export type CategoryTableProps = TableProps<Category, {
  onEdit: (category: Category) => void;
  onDelete: (id: number, name: string) => void;
}>;
export type CreateCategoryModalProps = ModalProps<void>;
export type EditCategoryModalProps = ModalProps<Category>;
export type CategoryFilterStatus = 'all' | 'active' | 'inactive';

// Backward compatibility aliases
export type CreateCategoryData = CategoryFormData;
export type UpdateCategoryData = CategoryFormData;
export type CategoryQueryParams = CategoryFilters;