'use client';

/**
 * Event Types Page Container
 * Main admin page for unified event type and subtype management
 * Uses expandable table for inline subtype display and CRUD
 *
 * Updated: January 2026 - Unified types + subtypes view
 */

import {
  CheckCircle,
  Plus,
  Search,
  Tag,
  X,
  XCircle,
} from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Button, ConfirmDialog, Input, LoadingSpinner, Select } from '@/components/ui';
import CreateEventSubtypeModal from '@/features/event-types/components/CreateEventSubtypeModal';
import CreateEventTypeModal from '@/features/event-types/components/CreateEventTypeModal';
import EditEventSubtypeModal from '@/features/event-types/components/EditEventSubtypeModal';
import EditEventTypeModal from '@/features/event-types/components/EditEventTypeModal';
import { EventTypeTableContainer } from '@/features/event-types/components/smart/EventTypeTableContainer';
import { useEventTypeWithSubtypes } from '@/features/event-types/hooks/useEventTypeWithSubtypes';
import { EventSubtype, EventType, EventTypeFilterStatus } from '@/types/eventType.types';

export function EventTypesPageContainer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Use the combined hook for types + subtypes
  const {
    eventTypes,
    pagination,
    isLoading,
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

  const handleCreateSubtypeSuccess = useCallback(async () => {
    if (parentTypeForSubtype) {
      // Refresh subtypes for this type
      refreshData();
    }
    setIsCreateSubtypeModalOpen(false);
    setParentTypeForSubtype(null);
  }, [parentTypeForSubtype, refreshData]);

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

  // Show loading spinner while data is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Cargando tipos de evento..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Gestión de Tipos de Evento
              </h1>
              <p className="mt-2 text-neutral-600">
                Organiza y administra los tipos de evento. Haz clic en una fila
                para ver y gestionar sus subtipos.
              </p>
            </div>
            <Button
              onClick={() => setIsCreateTypeModalOpen(true)}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Nuevo Tipo
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-primary-100 rounded-full">
                  <Tag className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Activos</p>
                  <p className="text-2xl font-bold text-success-600">
                    {stats.active}
                  </p>
                </div>
                <div className="p-3 bg-success-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-success-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">
                    Inactivos
                  </p>
                  <p className="text-2xl font-bold text-error-600">
                    {stats.inactive}
                  </p>
                </div>
                <div className="p-3 bg-error-100 rounded-full">
                  <XCircle className="w-6 h-6 text-error-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Buscar tipos de evento"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                fullWidth
              />
            </div>

            <div className="sm:w-48">
              <Select
                label="Estado"
                value={filterStatus}
                onChange={(value) =>
                  handleFilterChange(value as EventTypeFilterStatus)
                }
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'active', label: 'Solo activos' },
                  { value: 'inactive', label: 'Solo inactivos' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error-50 border border-error-200 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-error-400 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-error-800 mb-1">
                  Error en la operación
                </h3>
                <p className="text-sm text-error-600">{error}</p>
              </div>
              <Button
                onClick={refreshData}
                variant="ghost"
                size="sm"
                className="ml-3 text-error-400 hover:text-error-600"
                title="Cerrar mensaje de error"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Event Types Table with Expandable Subtypes */}
        {!isLoading && (
          <EventTypeTableContainer
            eventTypes={eventTypes}
            pagination={pagination}
            onEdit={handleEditEventType}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
            loading={false}
            // Expansion props
            expandedTypeIds={expandedTypeIds}
            onToggleExpand={toggleExpand}
            loadingSubtypes={loadingSubtypes}
            subtypesByType={subtypesByType}
            // Subtype handlers
            onEditSubtype={handleEditSubtype}
            onDeleteSubtype={handleRequestDeleteSubtype}
            onCreateSubtype={handleOpenCreateSubtypeModal}
          />
        )}

        {/* Empty State */}
        {!isLoading && eventTypes.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Tag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No hay tipos de evento
            </h3>
            <p className="text-neutral-500 mb-6">
              Crea tu primer tipo de evento para comenzar a organizar tu
              calendario
            </p>
            <Button onClick={() => setIsCreateTypeModalOpen(true)}>
              Crear Primer Tipo de Evento
            </Button>
          </div>
        )}

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
            onSubtypeCreated={refreshData}
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
      </div>
    </div>
  );
}
