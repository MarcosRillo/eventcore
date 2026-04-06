/**
 * useAdminCrudManager
 * Generic hook for admin CRUD pages: auth gating, search/filter/pagination,
 * SWR data fetching with keepPreviousData, and optimistic update helpers.
 *
 * Used by useSectorManager and useLocationManager.
 */

import { useCallback, useMemo, useState } from 'react';
import useSWR, { KeyedMutator } from 'swr';

import { useAuth } from '@/context/AuthContext';
import { apiFetcher } from '@/lib/swr';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { PaginationMeta } from '@/types/api-response.types';

export type FilterStatus = 'all' | 'active' | 'inactive';

export interface AdminCrudManagerConfig {
  /** SWR key builder — receives URLSearchParams.toString() */
  buildKey: (params: string) => string;
  /** Query param name for the active/inactive filter. Default: 'active' */
  activeParamName?: string;
  /** Items per page. Default: 10 */
  perPage?: number;
}

export interface AdminCrudManagerReturn<T extends { id: number; is_active: boolean }> {
  // Data
  items: T[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;

  // Filter state
  searchTerm: string;
  filterStatus: FilterStatus;
  currentPage: number;

  // Named filter actions (reset page on change)
  handleSearchChange: (value: string) => void;
  handleFilterChange: (filter: FilterStatus) => void;
  handlePageChange: (page: number) => void;

  // Bulk filter setters
  setFilters: (filters: Partial<{ search: string; page: number; per_page: number; status: FilterStatus }>) => void;
  resetFilters: () => void;
  changePage: (page: number) => void;

  // Data lifecycle
  refreshData: () => void;
  mutate: KeyedMutator<{ data: T[]; meta: PaginationMeta }>;

  // Optimistic helpers
  addItem: (item: T) => void;
  updateItem: (id: number, fields: Partial<T>) => void;
  removeItem: (id: number) => void;

  // Stats — total from pagination, active/inactive from current page items
  stats: { total: number; active: number; inactive: number };
}

export function useAdminCrudManager<T extends { id: number; is_active: boolean }>(
  config: AdminCrudManagerConfig
): AdminCrudManagerReturn<T> {
  const { buildKey, activeParamName = 'active', perPage = 10 } = config;

  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const swrKey = useMemo(() => {
    if (!isAuthenticated || authLoading) return null;
    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    params.set('per_page', String(perPage));
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filterStatus === 'active') params.set(activeParamName, 'true');
    else if (filterStatus === 'inactive') params.set(activeParamName, 'false');
    return buildKey(params.toString());
  }, [isAuthenticated, authLoading, currentPage, perPage, debouncedSearch, filterStatus, activeParamName, buildKey]);

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: T[]; meta: PaginationMeta }>(
    swrKey,
    apiFetcher,
    { keepPreviousData: true }
  );

  const items = useMemo(() => data?.data ?? [], [data]);
  const pagination = data?.meta ?? null;

  // Named handlers — reset page when search/filter changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((filter: FilterStatus) => {
    setFilterStatus(filter);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Bulk setters
  const setFilters = useCallback(
    (newFilters: Partial<{ search: string; page: number; per_page: number; status: FilterStatus }>) => {
      if (newFilters.search !== undefined) setSearchTerm(newFilters.search);
      if (newFilters.status !== undefined) setFilterStatus(newFilters.status);
      if (newFilters.page !== undefined) setCurrentPage(newFilters.page);
      if (
        newFilters.page === undefined &&
        (newFilters.search !== undefined || newFilters.status !== undefined)
      ) {
        setCurrentPage(1);
      }
    },
    []
  );

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('all');
    setCurrentPage(1);
  }, []);

  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const refreshData = useCallback(() => {
    mutate();
  }, [mutate]);

  // Optimistic helpers
  const addItem = useCallback(
    (item: T) => {
      mutate(
        (current) => {
          if (!current) return current;
          return { ...current, data: [item, ...current.data] };
        },
        { revalidate: false }
      );
    },
    [mutate]
  );

  const updateItem = useCallback(
    (id: number, fields: Partial<T>) => {
      mutate(
        (current) => {
          if (!current) return current;
          return {
            ...current,
            data: current.data.map((item) => (item.id === id ? { ...item, ...fields } : item)),
          };
        },
        { revalidate: false }
      );
    },
    [mutate]
  );

  const removeItem = useCallback(
    (id: number) => {
      mutate(
        (current) => {
          if (!current) return current;
          return { ...current, data: current.data.filter((item) => item.id !== id) };
        },
        { revalidate: false }
      );
    },
    [mutate]
  );

  const stats = useMemo(() => {
    const total = pagination?.total || 0;
    const active = items.filter((item) => item.is_active).length;
    const inactive = items.filter((item) => !item.is_active).length;
    return { total, active, inactive };
  }, [items, pagination]);

  return {
    items,
    pagination,
    isLoading,
    isValidating,
    error: error?.message ?? null,
    searchTerm,
    filterStatus,
    currentPage,
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    setFilters,
    resetFilters,
    changePage,
    refreshData,
    mutate,
    addItem,
    updateItem,
    removeItem,
    stats,
  };
}
