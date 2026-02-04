/**
 * useEventManager Hook - SWR Architecture
 * Uses direct service functions without adapter layer
 * Uses useGenericModals for modal state management
 */

'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';
import useSWR from 'swr';

import { useAuth } from '@/context/AuthContext';
import {
  type EventServiceContext,
  getEventServiceForContext,
} from '@/features/events/services/event.service';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermissions } from '@/hooks/usePermissions';
import { apiFetcher, eventKeys } from '@/lib/swr';
import { useGenericModals } from '@/shared/hooks/useGenericModals';
import { PaginationMeta } from '@/types/api-response.types';
import {
  ApprovalStatistics,
  Event,
  EventFilters,
  EventFormData,
  EventStatistics,
} from '@/types/event.types';

interface UseEventManagerReturn {
  // Data state from generic hook
  events: Event[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  // Event-specific state
  currentEvent: Event | null;
  statistics: EventStatistics | null;
  approvalStatistics: ApprovalStatistics | null;
  filters: EventFilters;

  // UI state
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Modal state
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isApprovalModalOpen: boolean;
  isDetailsModalOpen: boolean;

  // Actions
  setFilters: (filters: Partial<EventFilters>) => void;
  resetFilters: () => void;
  changePage: (page: number) => void;
  refreshData: () => void;

  // Event-specific actions
  createEvent: (data: EventFormData) => Promise<void>;
  updateEvent: (id: number, data: Partial<EventFormData>) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  duplicateEvent: (id: number, overrides?: Partial<EventFormData>) => Promise<void>;
  toggleFeatured: (id: number) => Promise<void>;

  // Approval actions
  approveInternal: (eventId: number, comment?: string) => Promise<void>;
  requestPublic: (eventId: number, comment?: string) => Promise<void>;
  approvePublic: (eventId: number, comment?: string) => Promise<void>;
  requestChanges: (eventId: number, comment: string) => Promise<void>;
  rejectEvent: (eventId: number, comment: string) => Promise<void>;

  // Filter actions (wrappers for generic actions)
  updateFilters: (newFilters: Partial<EventFilters>) => void;

  // Modal actions
  openCreateModal: () => void;
  openEditModal: (event: Event) => void;
  openDeleteModal: (event: Event) => void;
  openApprovalModal: (event: Event) => void;
  openDetailsModal: (event: Event) => void;
  closeAllModals: () => void;

  // Optimistic updates
  addEvent: (event: Event) => void;
  updateEventInList: (id: number, event: Partial<Event>) => void;
  removeEvent: (id: number) => void;

  // Utility actions
  loadStatistics: () => Promise<void>;
  loadApprovalStatistics: () => Promise<void>;
  clearError: () => void;
}

interface UseEventManagerOptions {
  context?: EventServiceContext;
  autoDetectContext?: boolean;
}

export function useEventManager(options: UseEventManagerOptions = {}): UseEventManagerReturn {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAdmin, isOrganizer, canAccessAdmin } = usePermissions();

  // Determine the appropriate service context
  const serviceContext: EventServiceContext = useMemo(() => {
    if (options.context) return options.context;
    if (options.autoDetectContext !== false) {
      if (!isAuthenticated) return 'public';
      if (isOrganizer()) return 'organizer';
      if (isAdmin() || canAccessAdmin()) return 'admin';
      return 'public';
    }
    return 'admin';
  }, [options.context, options.autoDetectContext, isAuthenticated, isOrganizer, isAdmin, canAccessAdmin]);

  const eventServiceInstance = useMemo(() => getEventServiceForContext(serviceContext), [serviceContext]);

  // Filter state
  const [filterState, setFilterState] = useState<EventFilters>({ page: 1, per_page: 15 });
  const debouncedSearch = useDebounce(filterState.search || '', 300);

  // Build SWR key
  const swrKey = useMemo(() => {
    if (!isAuthenticated || authLoading) return null;
    const params = new URLSearchParams();
    if (filterState.page) params.set('page', String(filterState.page));
    if (filterState.per_page) params.set('per_page', String(filterState.per_page));
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filterState.status) params.set('status', filterState.status as string);
    return eventKeys.list(params.toString());
  }, [isAuthenticated, authLoading, filterState.page, filterState.per_page, debouncedSearch, filterState.status]);

  const { data, error, isLoading, mutate } = useSWR<{ data: Event[]; meta: PaginationMeta }>(
    swrKey,
    apiFetcher,
  );

  const events = data?.data ?? [];
  const pagination = data?.meta ?? null;

  // Event-specific state
  const [statistics, setStatistics] = useState<EventStatistics | null>(null);
  const [approvalStatistics, setApprovalStatistics] = useState<ApprovalStatistics | null>(null);

  // React 19 transitions for non-blocking UI
  const [, startCreateTransition] = useTransition();
  const [, startUpdateTransition] = useTransition();
  const [, startDeleteTransition] = useTransition();

  // UI state
  const [isCreatingState, setIsCreatingState] = useState(false);
  const [isUpdatingState, setIsUpdatingState] = useState(false);
  const [isDeletingState, setIsDeletingState] = useState(false);

  // Modal state management
  const {
    currentItem: currentEvent,
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isDetailsModalOpen,
    isApprovalModalOpen = false,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openDetailsModal,
    openApprovalModal: openApprovalModalFn,
    closeAllModals,
  } = useGenericModals<Event>({ withApprovalModal: true });

  const openApprovalModal = useCallback((event: Event) => {
    openApprovalModalFn?.(event);
  }, [openApprovalModalFn]);

  // Filter actions
  const setFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFilterState(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterState({ page: 1, per_page: 15 });
  }, []);

  const changePage = useCallback((page: number) => {
    setFilterState(prev => ({ ...prev, page }));
  }, []);

  const refreshData = useCallback(() => {
    mutate();
  }, [mutate]);

  const updateFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFilters(newFilters);
  }, [setFilters]);

  // Optimistic update helpers
  const addEvent = useCallback((event: Event) => {
    mutate(
      (current) => {
        if (!current) return current;
        return { ...current, data: [event, ...current.data] };
      },
      { revalidate: false }
    );
  }, [mutate]);

  const updateEventInList = useCallback((id: number, updatedFields: Partial<Event>) => {
    mutate(
      (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((ev) => (ev.id === id ? { ...ev, ...updatedFields } : ev)),
        };
      },
      { revalidate: false }
    );
  }, [mutate]);

  const removeEvent = useCallback((id: number) => {
    mutate(
      (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.filter((ev) => ev.id !== id),
        };
      },
      { revalidate: false }
    );
  }, [mutate]);

  // Event-specific actions
  const createEvent = useCallback(async (formData: EventFormData) => {
    if (!eventServiceInstance.createEvent) {
      throw new Error('Create event not available in current context');
    }
    setIsCreatingState(true);
    startCreateTransition(async () => {
      try {
        const newEvent = await eventServiceInstance.createEvent!(formData);
        addEvent(newEvent);
        closeAllModals();
        mutate();
      } catch (err) {
        throw err;
      } finally {
        setIsCreatingState(false);
      }
    });
  }, [addEvent, mutate, eventServiceInstance, closeAllModals, startCreateTransition]);

  const updateEvent = useCallback(async (id: number, formData: Partial<EventFormData>) => {
    if (!eventServiceInstance.updateEvent) {
      throw new Error('Update event not available in current context');
    }
    setIsUpdatingState(true);
    startUpdateTransition(async () => {
      try {
        const updatedEvent = await eventServiceInstance.updateEvent!(id, formData);
        updateEventInList(id, updatedEvent);
        closeAllModals();
      } catch (err) {
        throw err;
      } finally {
        setIsUpdatingState(false);
      }
    });
  }, [updateEventInList, eventServiceInstance, closeAllModals, startUpdateTransition]);

  const deleteEvent = useCallback(async (id: number) => {
    if (!eventServiceInstance.deleteEvent) {
      throw new Error('Delete event not available in current context');
    }
    setIsDeletingState(true);
    removeEvent(id);
    startDeleteTransition(async () => {
      try {
        await eventServiceInstance.deleteEvent!(id);
        closeAllModals();
        mutate();
      } catch (err) {
        mutate();
        throw err;
      } finally {
        setIsDeletingState(false);
      }
    });
  }, [removeEvent, mutate, eventServiceInstance, closeAllModals, startDeleteTransition]);

  const duplicateEvent = useCallback(async (id: number, overrides?: Partial<EventFormData>) => {
    if (!eventServiceInstance.duplicateEvent) {
      throw new Error('Duplicate event not available in current context');
    }
    const duplicatedEvent = await eventServiceInstance.duplicateEvent(id, overrides);
    addEvent(duplicatedEvent);
    mutate();
  }, [addEvent, mutate, eventServiceInstance]);

  const toggleFeatured = useCallback(async (id: number) => {
    if (!eventServiceInstance.toggleFeatured) {
      throw new Error('Toggle featured not available in current context');
    }
    const updatedEvent = await eventServiceInstance.toggleFeatured(id);
    updateEventInList(id, updatedEvent);
  }, [updateEventInList, eventServiceInstance]);

  // Approval actions
  const approveInternal = useCallback(async (eventId: number, comment?: string) => {
    if ('approval' in eventServiceInstance) {
      const updatedEvent = await eventServiceInstance.approval.approveInternal(eventId, comment);
      updateEventInList(eventId, updatedEvent);
      closeAllModals();
    } else {
      throw new Error('Approval functionality not available in current context');
    }
  }, [updateEventInList, eventServiceInstance, closeAllModals]);

  const requestPublic = useCallback(async (eventId: number, comment?: string) => {
    if ('approval' in eventServiceInstance) {
      const updatedEvent = await eventServiceInstance.approval.requestPublic(eventId, comment);
      updateEventInList(eventId, updatedEvent);
      closeAllModals();
    } else {
      throw new Error('Approval functionality not available in current context');
    }
  }, [updateEventInList, eventServiceInstance, closeAllModals]);

  const approvePublic = useCallback(async (eventId: number, comment?: string) => {
    if ('approval' in eventServiceInstance) {
      const updatedEvent = await eventServiceInstance.approval.approvePublic(eventId, comment);
      updateEventInList(eventId, updatedEvent);
      closeAllModals();
    } else {
      throw new Error('Approval functionality not available in current context');
    }
  }, [updateEventInList, eventServiceInstance, closeAllModals]);

  const requestChanges = useCallback(async (eventId: number, comment: string) => {
    if ('approval' in eventServiceInstance) {
      const updatedEvent = await eventServiceInstance.approval.requestChanges(eventId, comment);
      updateEventInList(eventId, updatedEvent);
      closeAllModals();
    } else {
      throw new Error('Approval functionality not available in current context');
    }
  }, [updateEventInList, eventServiceInstance, closeAllModals]);

  const rejectEvent = useCallback(async (eventId: number, comment: string) => {
    if ('approval' in eventServiceInstance) {
      const updatedEvent = await eventServiceInstance.approval.rejectEvent(eventId, comment);
      updateEventInList(eventId, updatedEvent);
      closeAllModals();
    } else {
      throw new Error('Approval functionality not available in current context');
    }
  }, [updateEventInList, eventServiceInstance, closeAllModals]);

  // Utility actions
  const loadStatistics = useCallback(async () => {
    try {
      if (!eventServiceInstance.getStatistics) return;
      const stats = await eventServiceInstance.getStatistics();
      setStatistics(stats);
    } catch {
      // Handle error silently for statistics
    }
  }, [eventServiceInstance]);

  const loadApprovalStatistics = useCallback(async () => {
    try {
      if ('approval' in eventServiceInstance) {
        const stats = await eventServiceInstance.approval.getApprovalStatistics();
        setApprovalStatistics(stats);
      }
    } catch {
      // Handle error silently for statistics
    }
  }, [eventServiceInstance]);

  const clearError = useCallback(() => {
    // SWR handles error state automatically
  }, []);

  return {
    events,
    pagination,
    isLoading,
    error: error?.message ?? null,
    currentEvent,
    statistics,
    approvalStatistics,
    filters: filterState,
    isCreating: isCreatingState,
    isUpdating: isUpdatingState,
    isDeleting: isDeletingState,
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isApprovalModalOpen,
    isDetailsModalOpen,
    setFilters,
    resetFilters,
    changePage,
    refreshData,
    createEvent,
    updateEvent,
    deleteEvent,
    duplicateEvent,
    toggleFeatured,
    approveInternal,
    requestPublic,
    approvePublic,
    requestChanges,
    rejectEvent,
    updateFilters,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openApprovalModal,
    openDetailsModal,
    closeAllModals,
    addEvent,
    updateEventInList,
    removeEvent,
    loadStatistics,
    loadApprovalStatistics,
    clearError,
  };
}
