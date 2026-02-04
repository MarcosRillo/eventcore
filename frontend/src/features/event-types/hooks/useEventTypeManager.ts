/**
 * useEventTypeManager Hook
 * Manages event types data fetching, filtering, pagination, and CRUD operations
 */

import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';

import { useAuth } from '@/context/AuthContext';
import { deleteEventType } from '@/features/event-types/services/eventType.service';
import { useDebounce } from '@/hooks/useDebounce';
import { apiFetcher, eventTypeKeys } from '@/lib/swr';
import { PaginationMeta } from '@/types/api-response.types';
import {
  EventType,
  EventTypeFilterStatus,
} from '@/types/eventType.types';

interface UseEventTypeManagerReturn {
  // Data state
  eventTypes: EventType[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  // Filter state
  searchTerm: string;
  filterStatus: EventTypeFilterStatus;
  currentPage: number;

  // Actions
  setFilters: (filters: Partial<{ search: string; page: number; per_page: number; status: EventTypeFilterStatus }>) => void;
  resetFilters: () => void;
  changePage: (page: number) => void;
  refreshData: () => void;

  // EventType-specific actions
  handleSearchChange: (value: string) => void;
  handleFilterChange: (filter: EventTypeFilterStatus) => void;
  handlePageChange: (page: number) => void;
  handleDeleteEventType: (eventTypeId: number) => Promise<void>;

  // Optimistic updates
  addEventType: (eventType: EventType) => void;
  updateEventType: (id: number, eventType: Partial<EventType>) => void;
  removeEventType: (id: number) => void;

  // Statistics
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
}

export function useEventTypeManager(): UseEventTypeManagerReturn {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<EventTypeFilterStatus>('all');
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
    return eventTypeKeys.list(params.toString());
  }, [isAuthenticated, authLoading, currentPage, debouncedSearch, filterStatus]);

  const { data, error, isLoading, mutate } = useSWR<{ data: EventType[]; meta: PaginationMeta }>(
    swrKey,
    apiFetcher,
  );

  const eventTypes = useMemo(() => data?.data ?? [], [data]);
  const pagination = data?.meta ?? null;

  // Setters
  const setFilters = useCallback((newFilters: Partial<{ search: string; page: number; per_page: number; status: EventTypeFilterStatus }>) => {
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

  // EventType-specific handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((filter: EventTypeFilterStatus) => {
    setFilterStatus(filter);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Delete event type with optimistic update
  const handleDeleteEventType = useCallback(async (eventTypeId: number) => {
    await mutate(
      (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.filter((et) => et.id !== eventTypeId),
        };
      },
      { revalidate: false }
    );

    try {
      await deleteEventType(eventTypeId);
      mutate();
    } catch {
      mutate();
      throw new Error('Error al eliminar el tipo de evento');
    }
  }, [mutate]);

  // Optimistic update helpers
  const addEventType = useCallback((eventType: EventType) => {
    mutate(
      (current) => {
        if (!current) return current;
        return { ...current, data: [eventType, ...current.data] };
      },
      { revalidate: false }
    );
  }, [mutate]);

  const updateEventType = useCallback((id: number, updatedFields: Partial<EventType>) => {
    mutate(
      (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((et) => (et.id === id ? { ...et, ...updatedFields } : et)),
        };
      },
      { revalidate: false }
    );
  }, [mutate]);

  const removeEventType = useCallback((id: number) => {
    mutate(
      (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.filter((et) => et.id !== id),
        };
      },
      { revalidate: false }
    );
  }, [mutate]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = pagination?.total || 0;
    const active = eventTypes.filter((et) => et.is_active).length;
    const inactive = eventTypes.filter((et) => !et.is_active).length;
    return { total, active, inactive };
  }, [eventTypes, pagination]);

  return {
    eventTypes,
    pagination,
    isLoading,
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
    handleDeleteEventType,
    addEventType,
    updateEventType,
    removeEventType,
    stats,
  };
}
