'use client'

/**
 * Locations Page Container
 * Admin page for location management with full CRUD operations
 * Simplified for Tucumán Tourism - all locations are active by default
 */

import { MapPin, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';

import { Button, Input, LoadingSpinner } from '@/components/ui';
import { CreateLocationModal } from '@/features/locations/components/CreateLocationModal';
import { EditLocationModal } from '@/features/locations/components/EditLocationModal';
import { LocationTableContainer } from '@/features/locations/components/smart/LocationTableContainer';
import { useLocationManager } from '@/features/locations/hooks/useLocationManager';
import { Location } from '@/types/location.types';

export function LocationsPageContainer() {
  const {
    locations,
    pagination,
    isLoading,
    error,
    searchTerm,
    handleSearchChange,
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

  // Show loading spinner ONLY on initial load (when there's no data yet)
  // After initial load, keep UI mounted to preserve input focus during search
  const isInitialLoading = isLoading && locations.length === 0 && !searchTerm;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Cargando ubicaciones..." />
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
              <h1 className="text-3xl font-bold text-neutral-900">Gestión de Ubicaciones</h1>
              <p className="mt-2 text-neutral-600">
                Administra los lugares disponibles para tus eventos
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Nueva Ubicación
            </Button>
          </div>

          {/* Statistics Card - Simplified to just total */}
          <div className="mt-6" role="region" aria-label="Estadísticas de ubicaciones">
            <div className="bg-white rounded-lg shadow px-5 py-4 inline-flex items-center gap-4" aria-label={`Total: ${stats.total} ubicaciones`}>
              <div className="p-3 bg-primary-100 rounded-full">
                <MapPin className="w-6 h-6 text-primary-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Total de ubicaciones</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <Input
            label="Buscar ubicaciones"
            placeholder="Buscar por nombre o ciudad..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
            fullWidth
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error-50 border border-error-200 rounded-md p-4 mb-6" role="alert">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-error-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-error-800 mb-1">Error en la operación</h3>
                <p className="text-sm text-error-600">{error}</p>
              </div>
              <Button
                onClick={refreshData}
                variant="ghost"
                size="sm"
                className="ml-3 text-error-400 hover:text-error-600"
                aria-label="Reintentar carga de datos"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        {/* Locations Table - Always rendered to preserve search input focus */}
        <LocationTableContainer
          locations={locations}
          pagination={pagination}
          loading={isLoading}
          onEdit={handleEditLocation}
          onDelete={handleDeleteLocation}
          onPageChange={handlePageChange}
        />

        {/* Empty State */}
        {!isLoading && locations.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <MapPin className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No hay ubicaciones</h3>
            <p className="text-neutral-500 mb-6">Crea tu primera ubicación para comenzar a organizar tus eventos</p>
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
