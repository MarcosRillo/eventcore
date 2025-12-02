import { useState, useCallback, useEffect, useMemo } from "react";
import { useDebounce } from "./useDebounce";
import { PaginatedResponse, PaginationMeta } from "@/types/api-response.types";
import axios from "axios";

// Re-export for backward compatibility
export type LaravelPaginatedResponse<T> = PaginatedResponse<T>;
export type { PaginationMeta } from "@/types/api-response.types";

export interface BaseFilters {
  search?: string;
  page?: number;
  per_page?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface PaginatedDataConfig<T, F extends BaseFilters> {
  fetchFn: (filters: F) => Promise<LaravelPaginatedResponse<T>>;
  initialFilters: F;
  debounceMs?: number;
  autoLoad?: boolean;
}

export interface UsePaginatedDataReturn<T, F extends BaseFilters> {
  data: T[];
  pagination: PaginationMeta | null;
  filters: F;
  isLoading: boolean;
  error: string | null;
  setFilters: (newFilters: Partial<F>) => void;
  resetFilters: () => void;
  changePage: (page: number) => void;
  refreshData: () => void;
  addItem: (item: T) => void;
  updateItem: (id: number | string, updatedItem: Partial<T>) => void;
  removeItem: (id: number | string) => void;
}

export function usePaginatedData<T extends { id: number | string }, F extends BaseFilters>({
  fetchFn,
  initialFilters,
  debounceMs = 300,
  autoLoad = true,
}: PaginatedDataConfig<T, F>): UsePaginatedDataReturn<T, F> {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFiltersState] = useState<F>(initialFilters);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(filters.search || "", debounceMs);

  // Filters without search - used in dependency array to avoid bypassing debounce
  // When search changes, only debouncedSearch should trigger the effect (after delay)
  // Other filters (page, status, etc.) trigger immediately
  const filtersWithoutSearch = useMemo(() => {
    const { search, ...rest } = filters;
    return rest;
  }, [filters]);

  const setFilters = useCallback((newFilters: Partial<F>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters);
  }, [initialFilters]);

  const changePage = useCallback((page: number) => {
    setFilters({ page } as Partial<F>);
  }, [setFilters]);

  // REFACTORED: AbortController pattern compatible with React Strict Mode
  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      if (!autoLoad) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);

      try {
        const apiFilters = {
          ...filters,
          search: debouncedSearch || undefined,
        };
        
        // The service returns Laravel pagination structure { data, meta, links }
        const response = await fetchFn(apiFilters);
        
        // Extract data array from response.data
        setData(response.data || []);

        // Extract pagination meta from response.meta
        setPagination(response.meta || null);
        
      } catch (err: unknown) {
        // Check if the request was aborted
        if (axios.isCancel(err)) {
          return; // Don't update state if request was canceled
        }
        
        const message = err instanceof Error ? err.message : "Error loading data";
        setError(message);
        setData([]);
        setPagination(null);
      } finally {
        // Only set loading to false if request wasn't aborted
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    // Cleanup function: abort the request when effect cleanup runs
    return () => {
      controller.abort();
    };
  
  // filtersWithoutSearch excludes 'search' to let debouncedSearch control search timing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filtersWithoutSearch), debouncedSearch, autoLoad, fetchFn]);

  const refreshData = useCallback(() => {
    // Force a refresh by adding a timestamp to filters
    setFiltersState(prev => ({...prev, _refresh: Date.now()}));
  }, []);

  const addItem = useCallback((item: T) => { 
    setData((prev) => [item, ...prev]); 
  }, []);
  
  const updateItem = useCallback((id: number | string, updatedItem: Partial<T>) => {
    setData(prev => prev.map(item => (item.id === id ? { ...item, ...updatedItem } : item)));
  }, []);
  
  const removeItem = useCallback((id: number | string) => {
    setData(prev => prev.filter(item => item.id !== id));
  }, []);

  return {
    data, pagination, filters, isLoading, error,
    setFilters, resetFilters, changePage, refreshData,
    addItem, updateItem, removeItem,
  };
}
