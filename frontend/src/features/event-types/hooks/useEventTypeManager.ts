/**
 * useEventTypeManager Hook
 * Manages event types data fetching, filtering, pagination, and CRUD operations
 *
 * Created: December 2, 2025
 */

import { useCallback, useMemo } from 'react';

import { useAuth } from '@/context/AuthContext';
import {
  deleteEventType,
  getEventTypes,
} from '@/features/event-types/services/eventType.service';
import { PaginationMeta,usePaginatedData } from '@/hooks/usePaginatedData';
import {
  EventType,
  EventTypeFilterStatus,
  EventTypeQueryParams,
} from '@/types/eventType.types';

// Define the filters interface for event types
interface EventTypeFilters {
  search?: string;
  page?: number;
  per_page?: number;
  status?: EventTypeFilterStatus;
  [key: string]: string | number | boolean | undefined;
}

interface UseEventTypeManagerReturn {
  // Data state from generic hook
  eventTypes: EventType[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  // Filter state
  searchTerm: string;
  filterStatus: EventTypeFilterStatus;
  currentPage: number;

  // Actions from generic hook
  setFilters: (filters: Partial<EventTypeFilters>) => void;
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

/**
 *
 */
export function useEventTypeManager(): UseEventTypeManagerReturn {
  // Initial filters
  const initialFilters: EventTypeFilters = {
    page: 1,
    per_page: 10,
    status: 'all',
  };

  // Check authentication status
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Service function adapter for Laravel API parameters
  const fetchEventTypes = useCallback(async (filters: EventTypeFilters) => {
    const params: EventTypeQueryParams = {
      page: filters.page || 1,
      per_page: filters.per_page || 10,
      search: filters.search,
      active:
        filters.status === 'active'
          ? true
          : filters.status === 'inactive'
            ? false
            : undefined,
    };

    // Call service and return response
    const response = await getEventTypes(params);
    return response;
  }, []);

  // Use the generic paginated data hook - only auto-load if authenticated
  const {
    data: eventTypes,
    pagination,
    filters,
    isLoading,
    error,
    setFilters,
    resetFilters,
    changePage,
    refreshData,
    addItem: addEventType,
    updateItem: updateEventType,
    removeItem: removeEventType,
  } = usePaginatedData<EventType, EventTypeFilters>({
    fetchFn: fetchEventTypes,
    initialFilters,
    debounceMs: 300,
    autoLoad: isAuthenticated && !authLoading,
  });

  // Derived state
  const searchTerm = filters.search || '';
  const filterStatus = filters.status || 'all';
  const currentPage = filters.page || 1;

  // EventType-specific handlers
  const handleSearchChange = useCallback(
    (value: string) => {
      setFilters({ search: value });
    },
    [setFilters]
  );

  const handleFilterChange = useCallback(
    (filter: EventTypeFilterStatus) => {
      setFilters({ status: filter });
    },
    [setFilters]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      changePage(page);
    },
    [changePage]
  );

  // Delete event type with optimistic update
  const handleDeleteEventType = useCallback(
    async (eventTypeId: number) => {
      try {
        // Optimistic update
        removeEventType(eventTypeId);

        // API call
        await deleteEventType(eventTypeId);

        // Refresh to get updated pagination
        refreshData();
      } catch {
        // Revert optimistic update by refreshing
        refreshData();
        throw new Error('Error al eliminar el tipo de evento');
      }
    },
    [removeEventType, refreshData]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const total = pagination?.total || 0;
    const active = eventTypes.filter((et) => et.is_active).length;
    const inactive = eventTypes.filter((et) => !et.is_active).length;

    return {
      total,
      active,
      inactive,
    };
  }, [eventTypes, pagination]);

  return {
    // Data state
    eventTypes,
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

    // EventType-specific actions
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleDeleteEventType,

    // Optimistic updates
    addEventType,
    updateEventType,
    removeEventType,

    // Statistics
    stats,
  };
}
