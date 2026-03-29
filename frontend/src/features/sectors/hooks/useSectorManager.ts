/**
 * useSectorManager Hook
 * Manages sector data fetching, filtering, pagination, and CRUD operations
 */

import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';

import { useAuth } from '@/context/AuthContext';
import { deleteSector } from '@/features/sectors/services/sector.service';
import { Sector } from '@/features/sectors/types/sector.types';
import { useDebounce } from '@/hooks/useDebounce';
import { apiFetcher, sectorKeys } from '@/lib/swr';
import { PaginationMeta } from '@/types/api-response.types';

type SectorFilterStatus = 'all' | 'active' | 'inactive';

interface UseSectorManagerReturn {
  // Data state
  sectors: Sector[];
  pagination: PaginationMeta | null;
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
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
}

export function useSectorManager(): UseSectorManagerReturn {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<SectorFilterStatus>('all');
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
    if (filterStatus === 'active') params.set('active', 'true');
    else if (filterStatus === 'inactive') params.set('active', 'false');
    return sectorKeys.list(params.toString());
  }, [isAuthenticated, authLoading, currentPage, debouncedSearch, filterStatus]);

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: Sector[]; meta: PaginationMeta }>(
    swrKey,
    apiFetcher,
    { keepPreviousData: true },
  );

  const sectors = useMemo(() => data?.data ?? [], [data]);
  const pagination = data?.meta ?? null;

  // Setters
  const setFilters = useCallback((newFilters: Partial<{ search: string; page: number; per_page: number; status: SectorFilterStatus }>) => {
    if (newFilters.search !== undefined) setSearchTerm(newFilters.search);
    if (newFilters.status !== undefined) setFilterStatus(newFilters.status);
    if (newFilters.page !== undefined) setCurrentPage(newFilters.page);
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

  // Sector-specific handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((filter: SectorFilterStatus) => {
    setFilterStatus(filter);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Delete sector with optimistic update
  const handleDeleteSector = useCallback(async (sectorId: number) => {
    await mutate(
      (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.filter((s) => s.id !== sectorId),
        };
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
  }, [mutate]);

  // Optimistic update helpers
  const addSector = useCallback((sector: Sector) => {
    mutate(
      (current) => {
        if (!current) return current;
        return { ...current, data: [sector, ...current.data] };
      },
      { revalidate: false }
    );
  }, [mutate]);

  const updateSector = useCallback((id: number, updatedFields: Partial<Sector>) => {
    mutate(
      (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((s) => (s.id === id ? { ...s, ...updatedFields } : s)),
        };
      },
      { revalidate: false }
    );
  }, [mutate]);

  const removeSector = useCallback((id: number) => {
    mutate(
      (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.filter((s) => s.id !== id),
        };
      },
      { revalidate: false }
    );
  }, [mutate]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = pagination?.total || 0;
    const active = sectors.filter((s) => s.is_active).length;
    const inactive = sectors.filter((s) => !s.is_active).length;
    return { total, active, inactive };
  }, [sectors, pagination]);

  return {
    sectors,
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
    handleDeleteSector,
    addSector,
    updateSector,
    removeSector,
    stats,
  };
}
