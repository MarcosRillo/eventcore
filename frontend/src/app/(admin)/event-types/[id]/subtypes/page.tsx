/**
 * Event Subtypes Page
 * Admin page for managing subtypes of a specific event type
 * This page is "dumb" - it only renders data from the useEventSubtypeManager hook
 *
 * Created: December 2, 2025
 */

'use client';

import {
  PlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import {
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button, Input, LoadingSpinner, Select } from '@/components/ui';
import {
  EventSubtypeTableContainer,
  CreateEventSubtypeModal,
  EditEventSubtypeModal,
  useEventSubtypeManager,
} from '@/features/event-types';
import { EventSubtype, EventTypeFilterStatus } from '@/types/eventType.types';

const EventSubtypesPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const eventTypeId = Number(params.id);

  // Use the custom hook - all values are guaranteed to be safe
  const {
    parentEventType,
    parentLoading,
    eventSubtypes,
    pagination,
    isLoading,
    error,
    searchTerm,
    filterStatus,
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleDeleteEventSubtype,
    refreshData,
    stats,
  } = useEventSubtypeManager(eventTypeId);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedSubtype, setSelectedSubtype] = useState<EventSubtype | null>(
    null
  );

  // Handle subtype creation success
  const handleCreateSuccess = (): void => {
    refreshData();
  };

  // Handle subtype edit
  const handleEditSubtype = (subtype: EventSubtype): void => {
    setSelectedSubtype(subtype);
    setIsEditModalOpen(true);
  };

  // Handle edit success
  const handleEditSuccess = (): void => {
    refreshData();
    setSelectedSubtype(null);
  };

  // Handle modal close
  const handleCloseModals = (): void => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedSubtype(null);
  };

  // Handle delete
  const handleDelete = async (
    subtypeId: number
  ): Promise<void> => {
    try {
      await handleDeleteEventSubtype(subtypeId);
    } catch {
      // Error is handled by the hook
    }
  };

  // Navigate back to event types
  const handleGoBack = (): void => {
    router.push('/event-types');
  };

  // Show loading spinner while data is loading
  if (isLoading || parentLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Cargando subtipos..." />
      </div>
    );
  }

  // Show error if parent event type not found
  if (!parentEventType && !parentLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-12 text-center max-w-md">
          <TagIcon className="w-16 h-16 text-error-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            Tipo de evento no encontrado
          </h3>
          <p className="text-neutral-500 mb-6">
            El tipo de evento solicitado no existe o ha sido eliminado.
          </p>
          <Button onClick={handleGoBack}>Volver a Tipos de Evento</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-4 pt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Volver a Tipos de Evento
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Subtipos de &quot;{parentEventType?.name}&quot;
              </h1>
              <p className="mt-2 text-neutral-600">
                Administra los subtipos para este tipo de evento
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<PlusIcon className="w-5 h-5" />}
            >
              Nuevo Subtipo
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
                  <TagIcon className="w-6 h-6 text-primary-600" />
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
                  <CheckCircleIcon className="w-6 h-6 text-success-600" />
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
                  <XCircleIcon className="w-6 h-6 text-error-600" />
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
                label="Buscar subtipos"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
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
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Subtypes Table */}
        {!isLoading && (
          <EventSubtypeTableContainer
            eventSubtypes={eventSubtypes}
            pagination={pagination}
            onEdit={handleEditSubtype}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
            loading={false}
          />
        )}

        {/* Empty State */}
        {!isLoading && eventSubtypes.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <TagIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No hay subtipos
            </h3>
            <p className="text-neutral-500 mb-6">
              Crea tu primer subtipo para &quot;{parentEventType?.name}&quot;
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Crear Primer Subtipo
            </Button>
          </div>
        )}

        {/* Modals */}
        {parentEventType && (
          <>
            <CreateEventSubtypeModal
              isOpen={isCreateModalOpen}
              onClose={handleCloseModals}
              onSuccess={handleCreateSuccess}
              eventTypeId={eventTypeId}
              eventTypeName={parentEventType.name}
              onSubtypeCreated={refreshData}
            />

            <EditEventSubtypeModal
              isOpen={isEditModalOpen}
              onClose={handleCloseModals}
              onSuccess={handleEditSuccess}
              eventSubtype={selectedSubtype}
              onSubtypeUpdated={refreshData}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default EventSubtypesPage;
