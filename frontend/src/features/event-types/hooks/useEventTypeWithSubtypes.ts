/**
 * useEventTypeWithSubtypes Hook
 * Manages event types with lazy-loaded subtypes and expandable table state
 * Combines event type management with inline subtype CRUD operations
 *
 * Created: January 2026
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import {
  createEventSubtype,
  deleteEventSubtype,
  getEventSubtypes,
  updateEventSubtype,
} from '@/features/event-types/services/eventSubtype.service';
import {
  deleteEventType,
  getEventTypes,
} from '@/features/event-types/services/eventType.service';
import { PaginationMeta, usePaginatedData } from '@/hooks/usePaginatedData';
import {
  CreateEventSubtypeData,
  EventSubtype,
  EventType,
  EventTypeFilterStatus,
  EventTypeQueryParams,
  UpdateEventSubtypeData,
} from '@/types/eventType.types';

interface EventTypeFilters {
  search?: string;
  page?: number;
  per_page?: number;
  status?: EventTypeFilterStatus;
  [key: string]: string | number | boolean | undefined;
}

interface UseEventTypeWithSubtypesReturn {
  // Event Types data
  eventTypes: EventType[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  // Filter state
  searchTerm: string;
  filterStatus: EventTypeFilterStatus;
  currentPage: number;

  // Event Type handlers
  handleSearchChange: (value: string) => void;
  handleFilterChange: (filter: EventTypeFilterStatus) => void;
  handlePageChange: (page: number) => void;
  handleDeleteEventType: (eventTypeId: number) => Promise<void>;
  refreshData: () => void;

  // Optimistic updates for event types
  addEventType: (eventType: EventType) => void;
  updateEventType: (id: number, eventType: Partial<EventType>) => void;

  // Statistics
  stats: {
    total: number;
    active: number;
    inactive: number;
  };

  // Subtypes by type (lazy loaded)
  subtypesByType: Map<number, EventSubtype[]>;
  loadingSubtypes: Set<number>;

  // Expansion state
  expandedTypeIds: Set<number>;
  toggleExpand: (typeId: number) => Promise<void>;

  // Subtype CRUD
  handleCreateSubtype: (
    typeId: number,
    data: CreateEventSubtypeData
  ) => Promise<EventSubtype>;
  handleUpdateSubtype: (
    subtype: EventSubtype,
    data: UpdateEventSubtypeData
  ) => Promise<EventSubtype>;
  handleDeleteSubtype: (subtype: EventSubtype) => Promise<void>;

  // For URL sync - initial expanded IDs from URL
  setInitialExpandedIds: (ids: number[]) => void;
}

export function useEventTypeWithSubtypes(): UseEventTypeWithSubtypesReturn {
  // Initial filters
  const initialFilters: EventTypeFilters = {
    page: 1,
    per_page: 10,
    status: 'all',
  };

  // Check authentication status
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Expansion state - use Set for O(1) lookups
  const [expandedTypeIds, setExpandedTypeIds] = useState<Set<number>>(
    () => new Set()
  );

  // Subtypes cache by event type ID
  const [subtypesByType, setSubtypesByType] = useState<
    Map<number, EventSubtype[]>
  >(() => new Map());

  // Loading states for subtypes
  const [loadingSubtypes, setLoadingSubtypes] = useState<Set<number>>(
    () => new Set()
  );

  // Track if initial expansion from URL has been applied
  const initialExpandedAppliedRef = useRef(false);

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

    const response = await getEventTypes(params);
    return response;
  }, []);

  // Use the generic paginated data hook
  const {
    data: eventTypes,
    pagination,
    filters,
    isLoading,
    error,
    setFilters,
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

  // Set initial expanded IDs from URL (called once on mount)
  const setInitialExpandedIds = useCallback((ids: number[]) => {
    if (initialExpandedAppliedRef.current) return;
    initialExpandedAppliedRef.current = true;

    if (ids.length > 0) {
      setExpandedTypeIds(new Set(ids));
    }
  }, []);

  // Load subtypes for expanded types when event types data changes
  useEffect(() => {
    if (!eventTypes.length) return;

    // For each expanded type that doesn't have subtypes cached, load them
    const loadMissingSubtypes = async () => {
      const expandedArray = Array.from(expandedTypeIds);
      const missingTypeIds = expandedArray.filter(
        (typeId) =>
          !subtypesByType.has(typeId) &&
          !loadingSubtypes.has(typeId) &&
          eventTypes.some((et) => et.id === typeId)
      );

      if (missingTypeIds.length === 0) return;

      // Load all missing subtypes in parallel
      await Promise.all(
        missingTypeIds.map(async (typeId) => {
          setLoadingSubtypes((prev) => new Set([...prev, typeId]));
          try {
            const response = await getEventSubtypes(typeId, { per_page: 100 });
            setSubtypesByType((prev) => new Map(prev).set(typeId, response.data));
          } finally {
            setLoadingSubtypes((prev) => {
              const next = new Set(prev);
              next.delete(typeId);
              return next;
            });
          }
        })
      );
    };

    loadMissingSubtypes();
  }, [eventTypes, expandedTypeIds, subtypesByType, loadingSubtypes]);

  // Toggle expand with lazy loading (no mutation - create new Sets)
  const toggleExpand = useCallback(
    async (typeId: number) => {
      if (expandedTypeIds.has(typeId)) {
        // Collapse - create new Set without the ID
        setExpandedTypeIds((prev) => {
          const next = new Set(prev);
          next.delete(typeId);
          return next;
        });
      } else {
        // Expand - create new Set with the ID
        setExpandedTypeIds((prev) => new Set([...prev, typeId]));

        // Load subtypes if not cached
        if (!subtypesByType.has(typeId) && !loadingSubtypes.has(typeId)) {
          setLoadingSubtypes((prev) => new Set([...prev, typeId]));
          try {
            const response = await getEventSubtypes(typeId, { per_page: 100 });
            setSubtypesByType((prev) => new Map(prev).set(typeId, response.data));
          } finally {
            setLoadingSubtypes((prev) => {
              const next = new Set(prev);
              next.delete(typeId);
              return next;
            });
          }
        }
      }
    },
    [expandedTypeIds, subtypesByType, loadingSubtypes]
  );

  // Event type handlers
  const handleSearchChange = useCallback(
    (value: string) => {
      setFilters({ search: value, page: 1 });
    },
    [setFilters]
  );

  const handleFilterChange = useCallback(
    (filter: EventTypeFilterStatus) => {
      setFilters({ status: filter, page: 1 });
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

        // Collapse if expanded
        if (expandedTypeIds.has(eventTypeId)) {
          setExpandedTypeIds((prev) => {
            const next = new Set(prev);
            next.delete(eventTypeId);
            return next;
          });
        }

        // Remove from subtypes cache
        setSubtypesByType((prev) => {
          const next = new Map(prev);
          next.delete(eventTypeId);
          return next;
        });

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
    [removeEventType, expandedTypeIds, refreshData]
  );

  // Subtype CRUD operations
  const handleCreateSubtype = useCallback(
    async (
      typeId: number,
      data: CreateEventSubtypeData
    ): Promise<EventSubtype> => {
      const newSubtype = await createEventSubtype(typeId, data);

      // Update cache
      setSubtypesByType((prev) => {
        const next = new Map(prev);
        const existing = next.get(typeId) || [];
        next.set(typeId, [...existing, newSubtype]);
        return next;
      });

      // Update event type's subtypes_count
      updateEventType(typeId, {
        subtypes_count:
          (eventTypes.find((et) => et.id === typeId)?.subtypes_count || 0) + 1,
      });

      return newSubtype;
    },
    [eventTypes, updateEventType]
  );

  const handleUpdateSubtype = useCallback(
    async (
      subtype: EventSubtype,
      data: UpdateEventSubtypeData
    ): Promise<EventSubtype> => {
      const updated = await updateEventSubtype(
        subtype.event_type_id,
        subtype.id,
        data
      );

      // Update cache
      setSubtypesByType((prev) => {
        const next = new Map(prev);
        const existing = next.get(subtype.event_type_id) || [];
        const updatedList = existing.map((st) =>
          st.id === subtype.id ? updated : st
        );
        next.set(subtype.event_type_id, updatedList);
        return next;
      });

      return updated;
    },
    []
  );

  const handleDeleteSubtype = useCallback(
    async (subtype: EventSubtype): Promise<void> => {
      const typeId = subtype.event_type_id;

      // Optimistic update - remove from cache
      setSubtypesByType((prev) => {
        const next = new Map(prev);
        const existing = next.get(typeId) || [];
        next.set(
          typeId,
          existing.filter((st) => st.id !== subtype.id)
        );
        return next;
      });

      // Update event type's subtypes_count
      updateEventType(typeId, {
        subtypes_count: Math.max(
          0,
          (eventTypes.find((et) => et.id === typeId)?.subtypes_count || 1) - 1
        ),
      });

      try {
        await deleteEventSubtype(typeId, subtype.id);
      } catch {
        // Revert by refreshing subtypes
        const response = await getEventSubtypes(typeId, { per_page: 100 });
        setSubtypesByType((prev) => new Map(prev).set(typeId, response.data));
        throw new Error('Error al eliminar el subtipo de evento');
      }
    },
    [eventTypes, updateEventType]
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
    // Event Types data
    eventTypes,
    pagination,
    isLoading,
    error,

    // Filter state
    searchTerm,
    filterStatus,
    currentPage,

    // Event Type handlers
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleDeleteEventType,
    refreshData,

    // Optimistic updates
    addEventType,
    updateEventType,

    // Statistics
    stats,

    // Subtypes
    subtypesByType,
    loadingSubtypes,

    // Expansion
    expandedTypeIds,
    toggleExpand,

    // Subtype CRUD
    handleCreateSubtype,
    handleUpdateSubtype,
    handleDeleteSubtype,

    // URL sync
    setInitialExpandedIds,
  };
}
