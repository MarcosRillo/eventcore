'use client'

/**
 * Event Types Page Container
 * Main admin page for event type management with full CRUD operations
 * This component is "dumb" - it only renders data from the useEventTypeManager hook
 */

import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import {
  CheckCircleIcon,
  TagIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid'
import { useState } from 'react'

import { Button, Input, LoadingSpinner, Select } from '@/components/ui'
import {
  CreateEventTypeModal,
  EditEventTypeModal,
  EventTypeTableContainer,
  useEventTypeManager,
} from '@/features/event-types'
import { EventType, EventTypeFilterStatus } from '@/types/eventType.types'

export function EventTypesPageContainer() {
  // Use the custom hook - all values are guaranteed to be safe
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
  } = useEventTypeManager()

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(
    null
  )

  // Handle event type creation success
  const handleCreateSuccess = (): void => {
    refreshData()
  }

  // Handle event type edit
  const handleEditEventType = (eventType: EventType): void => {
    setSelectedEventType(eventType)
    setIsEditModalOpen(true)
  }

  // Handle edit success
  const handleEditSuccess = (): void => {
    refreshData()
    setSelectedEventType(null)
  }

  // Handle modal close
  const handleCloseModals = (): void => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setSelectedEventType(null)
  }

  // Handle delete
  const handleDelete = async (
    eventTypeId: number
  ): Promise<void> => {
    try {
      await handleDeleteEventType(eventTypeId)
    } catch {
      // Error is handled by the hook
    }
  }

  // Show loading spinner while data is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Cargando tipos de evento..." />
      </div>
    )
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
                Organiza y administra los tipos de evento. Cada tipo puede tener
                múltiples subtipos.
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<PlusIcon className="w-5 h-5" />}
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
                label="Buscar tipos de evento"
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

        {/* Event Types Table */}
        {!isLoading && (
          <EventTypeTableContainer
            eventTypes={eventTypes}
            pagination={pagination}
            onEdit={handleEditEventType}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
            loading={false}
          />
        )}

        {/* Empty State */}
        {!isLoading && eventTypes.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <TagIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No hay tipos de evento
            </h3>
            <p className="text-neutral-500 mb-6">
              Crea tu primer tipo de evento para comenzar a organizar tu
              calendario
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Crear Primer Tipo de Evento
            </Button>
          </div>
        )}

        {/* Modals */}
        <CreateEventTypeModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModals}
          onSuccess={handleCreateSuccess}
          onEventTypeCreated={refreshData}
        />

        <EditEventTypeModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModals}
          onSuccess={handleEditSuccess}
          eventType={selectedEventType}
          onEventTypeUpdated={refreshData}
        />
      </div>
    </div>
  )
}
