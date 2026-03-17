/**
 * useEventTypeWithSubtypes Hook
 * Manages event types with lazy-loaded subtypes and expandable table state
 * Combines event type management with inline subtype CRUD operations
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';

import { useAuth } from '@/context/AuthContext';
import {
  createEventSubtype,
  deleteEventSubtype,
  getEventSubtypes,
  updateEventSubtype,
} from '@/features/event-types/services/eventSubtype.service';
import { deleteEventType } from '@/features/event-types/services/eventType.service';
import { useDebounce } from '@/hooks/useDebounce';
import { apiFetcher, eventTypeKeys } from '@/lib/swr';
import { PaginationMeta } from '@/types/api-response.types';
import {
  CreateEventSubtypeData,
  EventSubtype,
  EventType,
  EventTypeFilterStatus,
  UpdateEventSubtypeData,
} from '@/types/eventType.types';

interface UseEventTypeWithSubtypesReturn {
  // Event Types data
  eventTypes: EventType[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isValidating: boolean;
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
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<EventTypeFilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Expansion state
  const [expandedTypeIds, setExpandedTypeIds] = useState<Set<number>>(() => new Set());

  // Subtypes cache by event type ID
  const [subtypesByType, setSubtypesByType] = useState<Map<number, EventSubtype[]>>(() => new Map());

  // Loading states for subtypes
  const [loadingSubtypes, setLoadingSubtypes] = useState<Set<number>>(() => new Set());

  // Track if initial expansion from URL has been applied
  const initialExpandedAppliedRef = useRef(false);

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

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: EventType[]; meta: PaginationMeta }>(
    swrKey,
    apiFetcher,
    { keepPreviousData: true },
  );

  const eventTypes = useMemo(() => data?.data ?? [], [data]);
  const pagination = data?.meta ?? null;

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

    const loadMissingSubtypes = async () => {
      const expandedArray = Array.from(expandedTypeIds);
      const missingTypeIds = expandedArray.filter(
        (typeId) =>
          !subtypesByType.has(typeId) &&
          !loadingSubtypes.has(typeId) &&
          eventTypes.some((et) => et.id === typeId)
      );

      if (missingTypeIds.length === 0) return;

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

  // Toggle expand with lazy loading
  const toggleExpand = useCallback(
    async (typeId: number) => {
      if (expandedTypeIds.has(typeId)) {
        setExpandedTypeIds((prev) => {
          const next = new Set(prev);
          next.delete(typeId);
          return next;
        });
      } else {
        setExpandedTypeIds((prev) => new Set([...prev, typeId]));

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

  const refreshData = useCallback(() => {
    mutate();
  }, [mutate]);

  // Delete event type with optimistic update
  const handleDeleteEventType = useCallback(
    async (eventTypeId: number) => {
      // Optimistic update
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

      try {
        await deleteEventType(eventTypeId);
        mutate();
      } catch {
        mutate();
        throw new Error('Error al eliminar el tipo de evento');
      }
    },
    [mutate, expandedTypeIds]
  );

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

  // Subtype CRUD operations
  const handleCreateSubtype = useCallback(
    async (typeId: number, subData: CreateEventSubtypeData): Promise<EventSubtype> => {
      const newSubtype = await createEventSubtype(typeId, subData);

      // Update cache
      setSubtypesByType((prev) => {
        const next = new Map(prev);
        const existing = next.get(typeId) || [];
        next.set(typeId, [...existing, newSubtype]);
        return next;
      });

      // Update event type's subtypes_count
      mutate(
        (current) => {
          if (!current) return current;
          return {
            ...current,
            data: current.data.map((et) =>
              et.id === typeId
                ? { ...et, subtypes_count: (et.subtypes_count || 0) + 1 }
                : et
            ),
          };
        },
        { revalidate: false }
      );

      return newSubtype;
    },
    [mutate]
  );

  const handleUpdateSubtype = useCallback(
    async (subtype: EventSubtype, subData: UpdateEventSubtypeData): Promise<EventSubtype> => {
      const updated = await updateEventSubtype(subtype.event_type_id, subtype.id, subData);

      setSubtypesByType((prev) => {
        const next = new Map(prev);
        const existing = next.get(subtype.event_type_id) || [];
        const updatedList = existing.map((st) => (st.id === subtype.id ? updated : st));
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
        next.set(typeId, existing.filter((st) => st.id !== subtype.id));
        return next;
      });

      // Update event type's subtypes_count
      mutate(
        (current) => {
          if (!current) return current;
          return {
            ...current,
            data: current.data.map((et) =>
              et.id === typeId
                ? { ...et, subtypes_count: Math.max(0, (et.subtypes_count || 1) - 1) }
                : et
            ),
          };
        },
        { revalidate: false }
      );

      try {
        await deleteEventSubtype(typeId, subtype.id);
      } catch {
        // Revert by refreshing subtypes
        const response = await getEventSubtypes(typeId, { per_page: 100 });
        setSubtypesByType((prev) => new Map(prev).set(typeId, response.data));
        throw new Error('Error al eliminar el subtipo de evento');
      }
    },
    [mutate]
  );

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
    isValidating,
    error: error?.message ?? null,
    searchTerm,
    filterStatus,
    currentPage,
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleDeleteEventType,
    refreshData,
    addEventType,
    updateEventType,
    stats,
    subtypesByType,
    loadingSubtypes,
    expandedTypeIds,
    toggleExpand,
    handleCreateSubtype,
    handleUpdateSubtype,
    handleDeleteSubtype,
    setInitialExpandedIds,
  };
}
