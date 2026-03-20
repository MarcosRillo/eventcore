/**
 * useLocationManager Hook
 * Manages location data with pagination, filtering, and CRUD operations
 */

import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';

import { useAuth } from '@/context/AuthContext';
import { deleteLocation } from '@/features/locations/services/location.service';
import { useDebounce } from '@/hooks/useDebounce';
import { apiFetcher, locationKeys } from '@/lib/swr';
import { PaginationMeta } from '@/types/api-response.types';
import { Location } from '@/types/location.types';

// Define filter status type for locations
type LocationFilterStatus = 'all' | 'active' | 'inactive';

interface UseLocationManagerReturn {
  // Data state
  locations: Location[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;

  // Filter state
  searchTerm: string;
  filterStatus: LocationFilterStatus;
  currentPage: number;

  // Actions
  setFilters: (filters: Partial<{ search: string; page: number; per_page: number; status: LocationFilterStatus }>) => void;
  resetFilters: () => void;
  changePage: (page: number) => void;
  refreshData: () => void;

  // Location-specific actions
  handleSearchChange: (value: string) => void;
  handleFilterChange: (filter: LocationFilterStatus) => void;
  handlePageChange: (page: number) => void;
  handleDeleteLocation: (locationId: number) => Promise<void>;

  // Optimistic updates
  addLocation: (location: Location) => void;
  updateLocation: (id: number, location: Partial<Location>) => void;
  removeLocation: (id: number) => void;

  // Statistics
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
}

export function useLocationManager(): UseLocationManagerReturn {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<LocationFilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Build SWR key from filters
  const swrKey = useMemo(() => {
    if (!isAuthenticated || authLoading) return null;
    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    params.set('per_page', String(perPage));
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filterStatus === 'active') params.set('is_active', 'true');
    else if (filterStatus === 'inactive') params.set('is_active', 'false');
    return locationKeys.list(params.toString());
  }, [isAuthenticated, authLoading, currentPage, debouncedSearch, filterStatus]);

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: Location[]; meta: PaginationMeta }>(
    swrKey,
    apiFetcher,
    { keepPreviousData: true },
  );

  const locations = useMemo(() => data?.data ?? [], [data]);
  const pagination = data?.meta ?? null;

  // Setters
  const setFilters = useCallback((newFilters: Partial<{ search: string; page: number; per_page: number; status: LocationFilterStatus }>) => {
    if (newFilters.search !== undefined) setSearchTerm(newFilters.search);
    if (newFilters.status !== undefined) setFilterStatus(newFilters.status);
    if (newFilters.page !== undefined) setCurrentPage(newFilters.page);
    // Reset to page 1 when non-page filters change
    if (newFilters.page === undefined && (newFilters.search !== undefined || newFilters.status !== undefined)) {
      setCurrentPage(1);
    }
  }, []);

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

  // Location-specific handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((filter: LocationFilterStatus) => {
    setFilterStatus(filter);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Delete location with optimistic update
  const handleDeleteLocation = useCallback(async (locationId: number) => {
    // Optimistic update
    await mutate(
      (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.filter((loc) => loc.id !== locationId),
        };
      },
      { revalidate: false }
    );

    try {
      await deleteLocation(locationId);
      // Revalidate to get updated pagination
      mutate();
    } catch {
      // Revert by revalidating
      mutate();
      throw new Error('Error al eliminar ubicación');
    }
  }, [mutate]);

  // Optimistic update helpers
  const addLocation = useCallback((location: Location) => {
    mutate(
      (current) => {
        if (!current) return current;
        return { ...current, data: [location, ...current.data] };
      },
      { revalidate: false }
    );
  }, [mutate]);

  const updateLocation = useCallback((id: number, updatedFields: Partial<Location>) => {
    mutate(
      (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((loc) => (loc.id === id ? { ...loc, ...updatedFields } : loc)),
        };
      },
      { revalidate: false }
    );
  }, [mutate]);

  const removeLocation = useCallback((id: number) => {
    mutate(
      (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.filter((loc) => loc.id !== id),
        };
      },
      { revalidate: false }
    );
  }, [mutate]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = pagination?.total || 0;
    const active = locations.filter(loc => loc.is_active).length;
    const inactive = locations.filter(loc => !loc.is_active).length;
    return { total, active, inactive };
  }, [locations, pagination]);

  return {
    locations,
    pagination,
    isLoading,
    isValidating,
    error: error?.message ?? null,
    searchTerm,
    filterStatus,
    currentPage,
    setFilters,
    resetFilters,
    changePage,
    refreshData,
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleDeleteLocation,
    addLocation,
    updateLocation,
    removeLocation,
    stats,
  };
}
