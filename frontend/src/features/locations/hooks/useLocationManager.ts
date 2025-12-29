/**
 * useLocationManager Hook
 * Manages location data with pagination, filtering, and CRUD operations
 * Based on useCategoryManager pattern
 */

import { useCallback, useMemo } from 'react';

import { useAuth } from '@/context/AuthContext';
import {
  getLocations,
  deleteLocation
} from '@/features/locations/services/location.service';
import { usePaginatedData, PaginationMeta } from '@/hooks/usePaginatedData';
import {
  Location,
  LocationFilters,
} from '@/types/location.types';

// Define filter status type for locations
type LocationFilterStatus = 'all' | 'active' | 'inactive';

// Define the filters interface for locations
interface LocationQueryFilters {
  search?: string;
  page?: number;
  per_page?: number;
  status?: LocationFilterStatus;
  [key: string]: string | number | boolean | undefined;
}

interface UseLocationManagerReturn {
  // Data state from generic hook
  locations: Location[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  // Filter state
  searchTerm: string;
  filterStatus: LocationFilterStatus;
  currentPage: number;

  // Actions from generic hook
  setFilters: (filters: Partial<LocationQueryFilters>) => void;
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

/**
 *
 */
export function useLocationManager(): UseLocationManagerReturn {

  // Initial filters
  const initialFilters: LocationQueryFilters = {
    page: 1,
    per_page: 10,
    status: 'all',
    search: '',  // Must be initialized to avoid 422 "search field must be a string"
  };

  // Check authentication status
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Service function adapter for Laravel API parameters
  const fetchLocations = useCallback(async (filters: LocationQueryFilters) => {
    const params: LocationFilters = {
      page: filters.page || 1,
      per_page: filters.per_page || 10,
      search: filters.search,
      is_active: filters.status === 'active' ? true : filters.status === 'inactive' ? false : undefined,
    };

    // Call service and return response
    const response = await getLocations(params);
    return response;
  }, []);

  // Use the generic paginated data hook - only auto-load if authenticated
  const {
    data: locations,
    pagination,
    filters,
    isLoading,
    error,
    setFilters,
    resetFilters,
    changePage,
    refreshData,
    addItem: addLocation,
    updateItem: updateLocation,
    removeItem: removeLocation,
  } = usePaginatedData<Location, LocationQueryFilters>({
    fetchFn: fetchLocations,
    initialFilters,
    debounceMs: 300,
    autoLoad: isAuthenticated && !authLoading,
  });

  // Derived state
  const searchTerm = filters.search || '';
  const filterStatus = (filters.status || 'all') as LocationFilterStatus;
  const currentPage = filters.page || 1;

  // Location-specific handlers
  // Note: Debounce is handled centrally in usePaginatedData via debouncedSearch
  // Do NOT include page: 1 here - it would trigger the effect immediately (bypassing debounce)
  const handleSearchChange = useCallback((value: string) => {
    setFilters({ search: value });
  }, [setFilters]);

  const handleFilterChange = useCallback((filter: LocationFilterStatus) => {
    setFilters({ status: filter });
  }, [setFilters]);

  const handlePageChange = useCallback((page: number) => {
    changePage(page);
  }, [changePage]);

  // Delete location with optimistic update
  const handleDeleteLocation = useCallback(async (locationId: number) => {
    try {
      // Optimistic update
      removeLocation(locationId);

      // API call
      await deleteLocation(locationId);

      // Refresh to get updated pagination
      refreshData();
    } catch {
      // Revert optimistic update by refreshing
      refreshData();
      throw new Error('Error al eliminar ubicación');
    }
  }, [removeLocation, refreshData]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = pagination?.total || 0;
    const active = locations.filter(loc => loc.is_active).length;
    const inactive = locations.filter(loc => !loc.is_active).length;

    return {
      total,
      active,
      inactive,
    };
  }, [locations, pagination]);

  return {
    // Data state
    locations,
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

    // Location-specific actions
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleDeleteLocation,

    // Optimistic updates
    addLocation,
    updateLocation,
    removeLocation,

    // Statistics
    stats,
  };
}
