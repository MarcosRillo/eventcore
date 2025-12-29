/**
 * useEventSubtypeManager Hook
 * Manages event subtypes data fetching, filtering, pagination, and CRUD operations
 * for a specific parent EventType
 *
 * Created: December 2, 2025
 */

import { useCallback, useMemo, useState, useEffect } from 'react';

import { useAuth } from '@/context/AuthContext';
import {
  getEventSubtypes,
  deleteEventSubtype,
} from '@/features/event-types/services/eventSubtype.service';
import { getEventType } from '@/features/event-types/services/eventType.service';
import { usePaginatedData, PaginationMeta } from '@/hooks/usePaginatedData';
import {
  EventType,
  EventSubtype,
  EventTypeFilterStatus,
  EventSubtypeQueryParams,
} from '@/types/eventType.types';

// Define the filters interface for event subtypes
interface EventSubtypeFilters {
  search?: string;
  page?: number;
  per_page?: number;
  status?: EventTypeFilterStatus;
  [key: string]: string | number | boolean | undefined;
}

interface UseEventSubtypeManagerReturn {
  // Parent event type
  parentEventType: EventType | null;
  parentLoading: boolean;

  // Data state from generic hook
  eventSubtypes: EventSubtype[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  // Filter state
  searchTerm: string;
  filterStatus: EventTypeFilterStatus;
  currentPage: number;

  // Actions from generic hook
  setFilters: (filters: Partial<EventSubtypeFilters>) => void;
  resetFilters: () => void;
  changePage: (page: number) => void;
  refreshData: () => void;

  // EventSubtype-specific actions
  handleSearchChange: (value: string) => void;
  handleFilterChange: (filter: EventTypeFilterStatus) => void;
  handlePageChange: (page: number) => void;
  handleDeleteEventSubtype: (subtypeId: number) => Promise<void>;

  // Optimistic updates
  addEventSubtype: (subtype: EventSubtype) => void;
  updateEventSubtype: (id: number, subtype: Partial<EventSubtype>) => void;
  removeEventSubtype: (id: number) => void;

  // Statistics
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
}

/**
 *
 * @param eventTypeId
 */
export function useEventSubtypeManager(
  eventTypeId: number
): UseEventSubtypeManagerReturn {
  // Parent event type state
  const [parentEventType, setParentEventType] = useState<EventType | null>(null);
  const [parentLoading, setParentLoading] = useState(true);

  // Initial filters
  const initialFilters: EventSubtypeFilters = {
    page: 1,
    per_page: 10,
    status: 'all',
  };

  // Check authentication status
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch parent event type
  useEffect(() => {
    const fetchParent = async () => {
      if (!eventTypeId || !isAuthenticated || authLoading) return;

      setParentLoading(true);
      try {
        const eventType = await getEventType(eventTypeId);
        setParentEventType(eventType);
      } catch {
        setParentEventType(null);
      } finally {
        setParentLoading(false);
      }
    };

    fetchParent();
  }, [eventTypeId, isAuthenticated, authLoading]);

  // Service function adapter for Laravel API parameters
  const fetchEventSubtypes = useCallback(
    async (filters: EventSubtypeFilters) => {
      const params: EventSubtypeQueryParams = {
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
      const response = await getEventSubtypes(eventTypeId, params);
      return response;
    },
    [eventTypeId]
  );

  // Use the generic paginated data hook - only auto-load if authenticated and have eventTypeId
  const {
    data: eventSubtypes,
    pagination,
    filters,
    isLoading,
    error,
    setFilters,
    resetFilters,
    changePage,
    refreshData,
    addItem: addEventSubtype,
    updateItem: updateEventSubtype,
    removeItem: removeEventSubtype,
  } = usePaginatedData<EventSubtype, EventSubtypeFilters>({
    fetchFn: fetchEventSubtypes,
    initialFilters,
    debounceMs: 300,
    autoLoad: isAuthenticated && !authLoading && eventTypeId > 0,
  });

  // Derived state
  const searchTerm = filters.search || '';
  const filterStatus = filters.status || 'all';
  const currentPage = filters.page || 1;

  // EventSubtype-specific handlers
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

  // Delete event subtype with optimistic update
  const handleDeleteEventSubtype = useCallback(
    async (subtypeId: number) => {
      try {
        // Optimistic update
        removeEventSubtype(subtypeId);

        // API call
        await deleteEventSubtype(eventTypeId, subtypeId);

        // Refresh to get updated pagination
        refreshData();
      } catch {
        // Revert optimistic update by refreshing
        refreshData();
        throw new Error('Error al eliminar el subtipo de evento');
      }
    },
    [eventTypeId, removeEventSubtype, refreshData]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const total = pagination?.total || 0;
    const active = eventSubtypes.filter((st) => st.is_active).length;
    const inactive = eventSubtypes.filter((st) => !st.is_active).length;

    return {
      total,
      active,
      inactive,
    };
  }, [eventSubtypes, pagination]);

  return {
    // Parent event type
    parentEventType,
    parentLoading,

    // Data state
    eventSubtypes,
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

    // EventSubtype-specific actions
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleDeleteEventSubtype,

    // Optimistic updates
    addEventSubtype,
    updateEventSubtype,
    removeEventSubtype,

    // Statistics
    stats,
  };
}
