/**
 * useLocationManager Hook
 * Thin wrapper around useAdminCrudManager for location-specific CRUD.
 */

import { useCallback } from 'react';

import { deleteLocation } from '@/features/locations/services/location.service';
import { locationKeys } from '@/lib/swr';
import { useAdminCrudManager } from '@/shared/hooks/useAdminCrudManager';
import { Location } from '@/types/location.types';

// Define filter status type for locations
type LocationFilterStatus = 'all' | 'active' | 'inactive';

interface UseLocationManagerReturn {
  // Data state
  locations: Location[];
  pagination: ReturnType<typeof useAdminCrudManager<Location>>['pagination'];
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
  stats: { total: number; active: number; inactive: number };
}

export function useLocationManager(): UseLocationManagerReturn {
  const crud = useAdminCrudManager<Location>({
    buildKey: locationKeys.list,
    activeParamName: 'is_active',
  });

  const { mutate } = crud;

  const handleDeleteLocation = useCallback(
    async (locationId: number) => {
      // Optimistic update
      await mutate(
        (current) => {
          if (!current) return current;
          return { ...current, data: current.data.filter((loc) => loc.id !== locationId) };
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
    },
    [mutate]
  );

  return {
    ...crud,
    locations: crud.items,
    addLocation: crud.addItem,
    updateLocation: crud.updateItem,
    removeLocation: crud.removeItem,
    handleDeleteLocation,
  };
}
