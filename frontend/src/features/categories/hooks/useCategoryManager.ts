/**
 * useCategoryManager Hook - Simplified Architecture
 * Now uses direct service functions without adapter layer
 */

import { useCallback, useMemo } from 'react';
import { usePaginatedData, PaginationMeta } from '@/hooks/usePaginatedData';
import { useAuth } from '@/context/AuthContext';
import { 
  getCategories, 
  deleteCategory 
} from '@/features/categories/services/category.service';
import {
  Category,
  CategoryFilterStatus,
  CategoryQueryParams,
} from '@/types/category.types';

// Define the filters interface for categories
interface CategoryFilters {
  search?: string;
  page?: number;
  per_page?: number;
  status?: CategoryFilterStatus;
  [key: string]: string | number | boolean | undefined;
}

interface UseCategoryManagerReturn {
  // Data state from generic hook
  categories: Category[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  // Filter state
  searchTerm: string;
  filterStatus: CategoryFilterStatus;
  currentPage: number;

  // Actions from generic hook
  setFilters: (filters: Partial<CategoryFilters>) => void;
  resetFilters: () => void;
  changePage: (page: number) => void;
  refreshData: () => void;

  // Category-specific actions
  handleSearchChange: (value: string) => void;
  handleFilterChange: (filter: CategoryFilterStatus) => void;
  handlePageChange: (page: number) => void;
  handleDeleteCategory: (categoryId: number) => Promise<void>;
  
  // Optimistic updates
  addCategory: (category: Category) => void;
  updateCategory: (id: number, category: Partial<Category>) => void;
  removeCategory: (id: number) => void;

  // Statistics
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
}

export function useCategoryManager(): UseCategoryManagerReturn {
  
  // Initial filters
  const initialFilters: CategoryFilters = {
    page: 1,
    per_page: 10,
    status: 'all',
  };

  // Check authentication status
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Service function adapter for Laravel API parameters
  const fetchCategories = useCallback(async (filters: CategoryFilters) => {
    const params: CategoryQueryParams = {
      page: filters.page || 1,
      per_page: filters.per_page || 10,
      search: filters.search,
      active: filters.status === 'active' ? true : filters.status === 'inactive' ? false : undefined,
    };

    // Call service and transform to expected structure
    const response = await getCategories(params);
    
    // CategoryPagination now already has the correct Laravel structure { data, meta, links }
    // So we can return it directly
    return response;
  }, []);

  // Use the generic paginated data hook - only auto-load if authenticated
  const {
    data: categories,
    pagination,
    filters,
    isLoading,
    error,
    setFilters,
    resetFilters,
    changePage,
    refreshData,
    addItem: addCategory,
    updateItem: updateCategory,
    removeItem: removeCategory,
  } = usePaginatedData<Category, CategoryFilters>({
    fetchFn: fetchCategories,
    initialFilters,
    debounceMs: 300,
    autoLoad: isAuthenticated && !authLoading, // Only auto-load when authenticated
  });

  // Derived state
  const searchTerm = filters.search || '';
  const filterStatus = filters.status || 'all';
  const currentPage = filters.page || 1;

  // Category-specific handlers
  const handleSearchChange = useCallback((value: string) => {
    setFilters({ search: value });
  }, [setFilters]);

  const handleFilterChange = useCallback((filter: CategoryFilterStatus) => {
    setFilters({ status: filter });
  }, [setFilters]);

  const handlePageChange = useCallback((page: number) => {
    changePage(page);
  }, [changePage]);

  // Delete category with optimistic update
  const handleDeleteCategory = useCallback(async (categoryId: number) => {
    try {
      // Optimistic update
      removeCategory(categoryId);
      
      // API call
      await deleteCategory(categoryId);
      
      // Refresh to get updated pagination
      refreshData();
    } catch (error) {
      // Revert optimistic update by refreshing
      refreshData();
      throw error;
    }
  }, [removeCategory, refreshData]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = pagination?.total || 0;
    const active = categories.filter(cat => cat.is_active).length;
    const inactive = categories.filter(cat => !cat.is_active).length;

    return {
      total,
      active,
      inactive,
    };
  }, [categories, pagination]);

  return {
    // Data state
    categories,
    pagination,
    isLoading,
    error,

    // Filter state
    searchTerm,
    filterStatus,
    currentPage,

    // Generic actions
    setFilters,
    resetFilters,
    changePage,
    refreshData,

    // Category-specific actions
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleDeleteCategory,

    // Optimistic updates
    addCategory,
    updateCategory,
    removeCategory,

    // Statistics
    stats,
  };
}
