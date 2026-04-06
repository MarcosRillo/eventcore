/**
 * useSectorManager Hook
 * Thin wrapper around useAdminCrudManager for sector-specific CRUD.
 */

import { useCallback } from 'react';

import { deleteSector } from '@/features/sectors/services/sector.service';
import { Sector } from '@/features/sectors/types/sector.types';
import { sectorKeys } from '@/lib/swr';
import { useAdminCrudManager } from '@/shared/hooks/useAdminCrudManager';

type SectorFilterStatus = 'all' | 'active' | 'inactive';

interface UseSectorManagerReturn {
  // Data state
  sectors: Sector[];
  pagination: ReturnType<typeof useAdminCrudManager<Sector>>['pagination'];
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;

  // Filter state
  searchTerm: string;
  filterStatus: SectorFilterStatus;
  currentPage: number;

  // Actions
  setFilters: (filters: Partial<{ search: string; page: number; per_page: number; status: SectorFilterStatus }>) => void;
  resetFilters: () => void;
  changePage: (page: number) => void;
  refreshData: () => void;

  // Sector-specific actions
  handleSearchChange: (value: string) => void;
  handleFilterChange: (filter: SectorFilterStatus) => void;
  handlePageChange: (page: number) => void;
  handleDeleteSector: (sectorId: number) => Promise<void>;

  // Optimistic updates
  addSector: (sector: Sector) => void;
  updateSector: (id: number, sector: Partial<Sector>) => void;
  removeSector: (id: number) => void;

  // Statistics
  stats: { total: number; active: number; inactive: number };
}

export function useSectorManager(): UseSectorManagerReturn {
  const crud = useAdminCrudManager<Sector>({
    buildKey: sectorKeys.list,
    activeParamName: 'active',
  });

  const { mutate } = crud;

  const handleDeleteSector = useCallback(
    async (sectorId: number) => {
      await mutate(
        (current) => {
          if (!current) return current;
          return { ...current, data: current.data.filter((s) => s.id !== sectorId) };
        },
        { revalidate: false }
      );

      try {
        await deleteSector(sectorId);
        mutate();
      } catch {
        mutate();
        throw new Error('Error al eliminar el sector');
      }
    },
    [mutate]
  );

  return {
    ...crud,
    sectors: crud.items,
    addSector: crud.addItem,
    updateSector: crud.updateItem,
    removeSector: crud.removeItem,
    handleDeleteSector,
  };
}
