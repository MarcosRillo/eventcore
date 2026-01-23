/**
 * useEventManager Hook - Simplified Architecture
 * Now uses direct service functions without adapter layer
 * Uses useGenericModals for modal state management
 */

'use client';

import { useCallback, useMemo, useState, useTransition } from 'react';

import { useAuth } from '@/context/AuthContext';
import {
  type EventServiceContext,
  getEventServiceForContext} from '@/features/events/services/event.service';
import { PaginationMeta,usePaginatedData } from '@/hooks/usePaginatedData';
import { usePermissions } from '@/hooks/usePermissions';
import { useGenericModals } from '@/shared/hooks/useGenericModals';
import {
  ApprovalStatistics,
  Event,
  EventFilters,
  EventFormData,
  EventStatistics} from '@/types/event.types';

// Extend base filters for events
interface EventFiltersExtended extends EventFilters {
  [key: string]: string | number | boolean | undefined;
}

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
  
  // Actions from generic hook
  setFilters: (filters: Partial<EventFiltersExtended>) => void;
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

/**
 * Hook configuration options
 */
interface UseEventManagerOptions {
  context?: EventServiceContext;
  autoDetectContext?: boolean;
}

/**
 *
 * @param options
 */
export function useEventManager(options: UseEventManagerOptions = {}): UseEventManagerReturn {
  
  // Initial filters
  const initialFilters: EventFiltersExtended = {
    page: 1,
    per_page: 15,
  };

  // Check authentication status and permissions
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    isAdmin, 
    isOrganizer, 
    canAccessAdmin
  } = usePermissions();

  // Determine the appropriate service context
  const serviceContext: EventServiceContext = useMemo(() => {
    if (options.context) {
      return options.context;
    }

    if (options.autoDetectContext !== false) {
      // Auto-detect context based on user role
      if (!isAuthenticated) {
        return 'public';
      }
      
      if (isOrganizer()) {
        return 'organizer';
      }
      
      if (isAdmin() || canAccessAdmin()) {
        return 'admin';
      }
      
      // Default to public for other roles
      return 'public';
    }

    // Default fallback
    return 'admin';
  }, [
    options.context, 
    options.autoDetectContext, 
    isAuthenticated, 
    isOrganizer, 
    isAdmin, 
    canAccessAdmin
  ]);

  // Get the appropriate service
  const eventServiceInstance = useMemo(() => {
    return getEventServiceForContext(serviceContext);
  }, [serviceContext]);

  // Service function adapter for Laravel API structure
  const fetchEvents = useCallback(async (filters: EventFiltersExtended) => {
    // Use the appropriate service based on context
    const response = await eventServiceInstance.getEvents(filters);
    
    // EventPagination now already has the correct Laravel structure { data, meta, links }
    // So we can return it directly
    return response;
  }, [eventServiceInstance]);

  // Use the generic paginated data hook - only auto-load if authenticated
  const {
    data: events,
    pagination,
    filters,
    isLoading,
    error,
    setFilters,
    resetFilters,
    changePage,
    refreshData,
    addItem: addEvent,
    updateItem: updateEventInList,
    removeItem: removeEvent,
  } = usePaginatedData<Event, EventFiltersExtended>({
    fetchFn: fetchEvents,
    initialFilters,
    debounceMs: 300,
    autoLoad: isAuthenticated && !authLoading, // Only auto-load when authenticated
  });

  // Event-specific state
  const [statistics, setStatistics] = useState<EventStatistics | null>(null);
  const [approvalStatistics, setApprovalStatistics] = useState<ApprovalStatistics | null>(null);

  // React 19 transitions for non-blocking UI
  const [, startCreateTransition] = useTransition();
  const [, startUpdateTransition] = useTransition();
  const [, startDeleteTransition] = useTransition();

  // UI state (manual for reliable test behavior)
  const [isCreatingState, setIsCreatingState] = useState(false);
  const [isUpdatingState, setIsUpdatingState] = useState(false);
  const [isDeletingState, setIsDeletingState] = useState(false);

  // Modal state management via useGenericModals
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

  // Wrapper for approval modal to ensure it's always callable
  const openApprovalModal = useCallback((event: Event) => {
    openApprovalModalFn?.(event);
  }, [openApprovalModalFn]);

  // Event-specific actions
  const createEvent = useCallback(async (data: EventFormData) => {
    if (!eventServiceInstance.createEvent) {
      throw new Error('Create event not available in current context');
    }

    setIsCreatingState(true);

    startCreateTransition(async () => {
      try {
        const newEvent = await eventServiceInstance.createEvent!(data);
        addEvent(newEvent);
        closeAllModals();
        refreshData(); // Refresh to get updated pagination
      } catch (error) {
        throw error;
      } finally {
        setIsCreatingState(false);
      }
    });
  }, [addEvent, refreshData, eventServiceInstance, closeAllModals, startCreateTransition]);

  const updateEvent = useCallback(async (id: number, data: Partial<EventFormData>) => {
    if (!eventServiceInstance.updateEvent) {
      throw new Error('Update event not available in current context');
    }

    setIsUpdatingState(true);

    startUpdateTransition(async () => {
      try {
        const updatedEvent = await eventServiceInstance.updateEvent!(id, data);
        updateEventInList(id, updatedEvent);
        closeAllModals();
      } catch (error) {
        throw error;
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
    // Optimistic update
    removeEvent(id);

    startDeleteTransition(async () => {
      try {
        await eventServiceInstance.deleteEvent!(id);
        closeAllModals();
        refreshData(); // Refresh to get updated pagination
      } catch (error) {
        // Revert optimistic update
        refreshData();
        throw error;
      } finally {
        setIsDeletingState(false);
      }
    });
  }, [removeEvent, refreshData, eventServiceInstance, closeAllModals, startDeleteTransition]);

  const duplicateEvent = useCallback(async (id: number, overrides?: Partial<EventFormData>) => {
    try {
      if (!eventServiceInstance.duplicateEvent) {
        throw new Error('Duplicate event not available in current context');
      }
      const duplicatedEvent = await eventServiceInstance.duplicateEvent(id, overrides);
      addEvent(duplicatedEvent);
      refreshData();
    } catch (error) {
      throw error;
    }
  }, [addEvent, refreshData, eventServiceInstance]);

  const toggleFeatured = useCallback(async (id: number) => {
    try {
      if (!eventServiceInstance.toggleFeatured) {
        throw new Error('Toggle featured not available in current context');
      }
      const updatedEvent = await eventServiceInstance.toggleFeatured(id);
      updateEventInList(id, updatedEvent);
    } catch (error) {
      throw error;
    }
  }, [updateEventInList, eventServiceInstance]);

  // Approval actions - only available for admin services
  const approveInternal = useCallback(async (eventId: number, comment?: string) => {
    try {
      // Only admin services have approval functionality
      if ('approval' in eventServiceInstance) {
        const updatedEvent = await eventServiceInstance.approval.approveInternal(eventId, comment);
        updateEventInList(eventId, updatedEvent);
        closeAllModals();
      } else {
        throw new Error('Approval functionality not available in current context');
      }
    } catch (error) {
      throw error;
    }
  }, [updateEventInList, eventServiceInstance, closeAllModals]);

  const requestPublic = useCallback(async (eventId: number, comment?: string) => {
    try {
      if ('approval' in eventServiceInstance) {
        const updatedEvent = await eventServiceInstance.approval.requestPublic(eventId, comment);
        updateEventInList(eventId, updatedEvent);
        closeAllModals();
      } else {
        throw new Error('Approval functionality not available in current context');
      }
    } catch (error) {
      throw error;
    }
  }, [updateEventInList, eventServiceInstance, closeAllModals]);

  const approvePublic = useCallback(async (eventId: number, comment?: string) => {
    try {
      if ('approval' in eventServiceInstance) {
        const updatedEvent = await eventServiceInstance.approval.approvePublic(eventId, comment);
        updateEventInList(eventId, updatedEvent);
        closeAllModals();
      } else {
        throw new Error('Approval functionality not available in current context');
      }
    } catch (error) {
      throw error;
    }
  }, [updateEventInList, eventServiceInstance, closeAllModals]);

  const requestChanges = useCallback(async (eventId: number, comment: string) => {
    try {
      if ('approval' in eventServiceInstance) {
        const updatedEvent = await eventServiceInstance.approval.requestChanges(eventId, comment);
        updateEventInList(eventId, updatedEvent);
        closeAllModals();
      } else {
        throw new Error('Approval functionality not available in current context');
      }
    } catch (error) {
      throw error;
    }
  }, [updateEventInList, eventServiceInstance, closeAllModals]);

  const rejectEvent = useCallback(async (eventId: number, comment: string) => {
    try {
      if ('approval' in eventServiceInstance) {
        const updatedEvent = await eventServiceInstance.approval.rejectEvent(eventId, comment);
        updateEventInList(eventId, updatedEvent);
        closeAllModals();
      } else {
        throw new Error('Approval functionality not available in current context');
      }
    } catch (error) {
      throw error;
    }
  }, [updateEventInList, eventServiceInstance, closeAllModals]);

  // Filter actions (wrappers)
  const updateFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFilters(newFilters);
  }, [setFilters]);

  // Modal actions are now provided by useGenericModals:
  // openCreateModal, openEditModal, openDeleteModal, openApprovalModal, openDetailsModal, closeAllModals

  // Utility actions
  const loadStatistics = useCallback(async () => {
    try {
      if (!eventServiceInstance.getStatistics) {
        return; // Statistics not available in current context
      }
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
    // This would be handled by the generic hook if needed
  }, []);

  // Backward compatibility
  const isCreating = isCreatingState;
  const isUpdating = isUpdatingState;
  const isDeleting = isDeletingState;

  return {
    // Data state
    events,
    pagination,
    isLoading,
    error,

    // Event-specific state
    currentEvent,
    statistics,
    approvalStatistics,
    filters: filters as EventFilters,

    // UI state
    isCreating,
    isUpdating,
    isDeleting,
    
    // Modal state
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isApprovalModalOpen,
    isDetailsModalOpen,
    
    // Actions from generic hook
    setFilters,
    resetFilters,
    changePage,
    refreshData,
    
    // Event-specific actions
    createEvent,
    updateEvent,
    deleteEvent,
    duplicateEvent,
    toggleFeatured,
    
    // Approval actions
    approveInternal,
    requestPublic,
    approvePublic,
    requestChanges,
    rejectEvent,
    
    // Filter actions
    updateFilters,
    
    // Modal actions
    openCreateModal,
    openEditModal,
    openDeleteModal,
    openApprovalModal,
    openDetailsModal,
    closeAllModals,
    
    // Optimistic updates
    addEvent,
    updateEventInList,
    removeEvent,
    
    // Utility actions
    loadStatistics,
    loadApprovalStatistics,
    clearError,
  };
}
