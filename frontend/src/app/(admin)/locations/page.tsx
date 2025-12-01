/**
 * Locations Page
 * Admin page for location management with full CRUD operations
 */

'use client';

import { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MapPinIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useLocationManager } from '@/features/locations/hooks/useLocationManager';
import { LocationTableContainer } from '@/features/locations/components/smart/LocationTableContainer';
import { CreateLocationModal } from '@/features/locations/components/CreateLocationModal';
import { EditLocationModal } from '@/features/locations/components/EditLocationModal';
import { Button, Input, LoadingSpinner, Select } from '@/components/ui';
import { Location } from '@/types/location.types';

type LocationFilterStatus = 'all' | 'active' | 'inactive';

export default function LocationsPage() {
  const {
    locations,
    pagination,
    isLoading,
    error,
    searchTerm,
    filterStatus,
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleDeleteLocation,
    refreshData,
    stats,
  } = useLocationManager();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Handle location creation success
  const handleCreateSuccess = () => {
    refreshData();
  };

  // Handle location edit
  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsEditModalOpen(true);
  };

  // Handle edit success
  const handleEditSuccess = () => {
    refreshData();
    setSelectedLocation(null);
  };

  // Handle modal close
  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedLocation(null);
  };

  // Show loading spinner while data is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Cargando ubicaciones..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Ubicaciones</h1>
              <p className="mt-2 text-gray-600">
                Administra los lugares disponibles para tus eventos
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<PlusIcon className="w-5 h-5" />}
            >
              Nueva Ubicación
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <MapPinIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Activas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inactivas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircleIcon className="w-6 h-6 text-red-600" />
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
                label="Buscar ubicaciones"
                placeholder="Buscar por nombre o ciudad..."
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
                onChange={(value) => handleFilterChange(value as LocationFilterStatus)}
                options={[
                  { value: 'all', label: 'Todas' },
                  { value: 'active', label: 'Solo activas' },
                  { value: 'inactive', label: 'Solo inactivas' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-1">Error en la operación</h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <Button
                onClick={refreshData}
                variant="ghost"
                size="sm"
                className="ml-3 text-red-400 hover:text-red-600"
                title="Cerrar mensaje de error"
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Locations Table */}
        {!isLoading && (
          <LocationTableContainer
            locations={locations}
            pagination={pagination}
            loading={false}
            onEdit={handleEditLocation}
            onDelete={handleDeleteLocation}
            onPageChange={handlePageChange}
          />
        )}

        {/* Empty State */}
        {!isLoading && locations.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ubicaciones</h3>
            <p className="text-gray-500 mb-6">Crea tu primera ubicación para comenzar a organizar tus eventos</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Crear Primera Ubicación
            </Button>
          </div>
        )}

        {/* Modals */}
        <CreateLocationModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModals}
          onSuccess={handleCreateSuccess}
          onLocationCreated={refreshData}
        />

        <EditLocationModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModals}
          onSuccess={handleEditSuccess}
          location={selectedLocation}
          onLocationUpdated={refreshData}
        />
      </div>
    </div>
  );
}
