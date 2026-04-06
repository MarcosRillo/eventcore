'use client';

/**
 * Event Types Page Container
 * Main admin page for unified event type and subtype management
 * Uses expandable table for inline subtype display and CRUD
 *
 * Updated: January 2026 - Unified types + subtypes view
 */

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import CreateEventSubtypeModal from '@/features/event-types/components/dumb/CreateEventSubtypeModal';
import CreateEventTypeModal from '@/features/event-types/components/dumb/CreateEventTypeModal';
import { EventTypesPage } from '@/features/event-types/components/dumb/EventTypesPage';
import EditEventSubtypeModal from '@/features/event-types/components/smart/EditEventSubtypeModal';
import EditEventTypeModal from '@/features/event-types/components/smart/EditEventTypeModal';
import { useEventTypeWithSubtypes } from '@/features/event-types/hooks/useEventTypeWithSubtypes';
import { ConfirmDialog } from '@/shared/components/modals';
import type { EventSubtype, EventType } from '@/types/eventType.types';

export function EventTypesPageContainer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Use the combined hook for types + subtypes
  const {
    eventTypes,
    pagination,
    isLoading,
    isValidating,
    error,
    searchTerm,
    filterStatus,
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleDeleteEventType,
    refreshData,
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
  } = useEventTypeWithSubtypes();

  // Event Type Modal states
  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false);
  const [isEditTypeModalOpen, setIsEditTypeModalOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);

  // Subtype Modal states
  const [isCreateSubtypeModalOpen, setIsCreateSubtypeModalOpen] = useState(false);
  const [isEditSubtypeModalOpen, setIsEditSubtypeModalOpen] = useState(false);
  const [selectedSubtype, setSelectedSubtype] = useState<EventSubtype | null>(null);
  const [parentTypeForSubtype, setParentTypeForSubtype] = useState<EventType | null>(null);

  // Subtype delete confirmation
  const [subtypeToDelete, setSubtypeToDelete] = useState<EventSubtype | null>(null);

  // Parse expanded IDs from URL on mount
  useEffect(() => {
    const expandedParam = searchParams.get('expanded');
    if (expandedParam) {
      const ids = expandedParam
        .split(',')
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0);
      setInitialExpandedIds(ids);
    }
  }, [searchParams, setInitialExpandedIds]);

  // Sync expanded IDs to URL (shallow routing)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (expandedTypeIds.size > 0) {
      params.set('expanded', Array.from(expandedTypeIds).join(','));
    } else {
      params.delete('expanded');
    }

    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    // Use pushState for shallow routing (no full page reload)
    window.history.replaceState(null, '', newUrl);
  }, [expandedTypeIds, pathname, searchParams]);

  // Event Type handlers
  const handleCreateTypeSuccess = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const handleEditEventType = useCallback((eventType: EventType) => {
    setSelectedEventType(eventType);
    setIsEditTypeModalOpen(true);
  }, []);

  const handleEditTypeSuccess = useCallback(() => {
    refreshData();
    setSelectedEventType(null);
  }, [refreshData]);

  const handleCloseTypeModals = useCallback(() => {
    setIsCreateTypeModalOpen(false);
    setIsEditTypeModalOpen(false);
    setSelectedEventType(null);
  }, []);

  const handleDelete = useCallback(
    async (eventTypeId: number) => {
      try {
        await handleDeleteEventType(eventTypeId);
      } catch {
        // Error handled by hook
      }
    },
    [handleDeleteEventType]
  );

  // Subtype handlers
  const handleOpenCreateSubtypeModal = useCallback((eventType: EventType) => {
    setParentTypeForSubtype(eventType);
    setIsCreateSubtypeModalOpen(true);
  }, []);

  const handleCreateSubtypeSuccess = useCallback(() => {
    setIsCreateSubtypeModalOpen(false);
    setParentTypeForSubtype(null);
  }, []);

  const handleEditSubtype = useCallback((subtype: EventSubtype) => {
    setSelectedSubtype(subtype);
    setIsEditSubtypeModalOpen(true);
  }, []);

  const handleEditSubtypeSuccess = useCallback(() => {
    if (selectedSubtype) {
      handleUpdateSubtype(selectedSubtype, {
        name: selectedSubtype.name,
        is_active: selectedSubtype.is_active,
      }).catch(() => {
        // Error handled silently, modal will close
      });
    }
    refreshData();
    setIsEditSubtypeModalOpen(false);
    setSelectedSubtype(null);
  }, [selectedSubtype, handleUpdateSubtype, refreshData]);

  const handleCloseSubtypeModals = useCallback(() => {
    setIsCreateSubtypeModalOpen(false);
    setIsEditSubtypeModalOpen(false);
    setSelectedSubtype(null);
    setParentTypeForSubtype(null);
  }, []);

  const handleRequestDeleteSubtype = useCallback((subtype: EventSubtype) => {
    setSubtypeToDelete(subtype);
  }, []);

  const handleConfirmDeleteSubtype = useCallback(async () => {
    if (subtypeToDelete) {
      try {
        await handleDeleteSubtype(subtypeToDelete);
      } catch {
        // Error handled by hook
      }
      setSubtypeToDelete(null);
    }
  }, [subtypeToDelete, handleDeleteSubtype]);

  const handleCancelDeleteSubtype = useCallback(() => {
    setSubtypeToDelete(null);
  }, []);

  return (
    <>
      <EventTypesPage
        eventTypes={eventTypes}
        pagination={pagination}
        isLoading={isLoading}
        isValidating={isValidating}
        error={error}
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        stats={stats}
        expandedTypeIds={expandedTypeIds}
        subtypesByType={subtypesByType}
        loadingSubtypes={loadingSubtypes}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onRetry={refreshData}
        onCreateClick={() => setIsCreateTypeModalOpen(true)}
        onEdit={handleEditEventType}
        onDelete={handleDelete}
        onToggleExpand={toggleExpand}
        onCreateSubtype={handleOpenCreateSubtypeModal}
        onEditSubtype={handleEditSubtype}
        onDeleteSubtype={handleRequestDeleteSubtype}
      />

      {/* Event Type Modals */}
      <CreateEventTypeModal
        isOpen={isCreateTypeModalOpen}
        onClose={handleCloseTypeModals}
        onSuccess={handleCreateTypeSuccess}
        onEventTypeCreated={refreshData}
      />

      <EditEventTypeModal
        isOpen={isEditTypeModalOpen}
        onClose={handleCloseTypeModals}
        onSuccess={handleEditTypeSuccess}
        eventType={selectedEventType}
        onEventTypeUpdated={refreshData}
      />

      {/* Subtype Modals */}
      {parentTypeForSubtype && (
        <CreateEventSubtypeModal
          isOpen={isCreateSubtypeModalOpen}
          onClose={handleCloseSubtypeModals}
          onSuccess={handleCreateSubtypeSuccess}
          eventTypeId={parentTypeForSubtype.id}
          eventTypeName={parentTypeForSubtype.name}
          onCreateSubtype={handleCreateSubtype}
        />
      )}

      <EditEventSubtypeModal
        isOpen={isEditSubtypeModalOpen}
        onClose={handleCloseSubtypeModals}
        onSuccess={handleEditSubtypeSuccess}
        eventSubtype={selectedSubtype}
        onSubtypeUpdated={refreshData}
      />

      {/* Subtype Delete Confirmation */}
      <ConfirmDialog
        isOpen={subtypeToDelete !== null}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar el subtipo "${subtypeToDelete?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDeleteSubtype}
        onCancel={handleCancelDeleteSubtype}
      />
    </>
  );
}
