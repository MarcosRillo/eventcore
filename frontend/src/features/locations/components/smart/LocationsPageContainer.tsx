'use client'

/**
 * Locations Page Container
 * Admin page for location management with full CRUD operations
 * Simplified for Tucumán Tourism - all locations are active by default
 */

import { useState } from 'react';

import { CreateLocationModal } from '@/features/locations/components/dumb/CreateLocationModal';
import { EditLocationModal } from '@/features/locations/components/dumb/EditLocationModal';
import { LocationsPage } from '@/features/locations/components/dumb/LocationsPage';
import { useLocationManager } from '@/features/locations/hooks/useLocationManager';
import type { Location } from '@/types/location.types';

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

  return (
    <>
      <LocationsPage
        locations={locations}
        pagination={pagination}
        isLoading={isLoading}
        error={error}
        searchTerm={searchTerm}
        totalLocations={stats.total}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        onCreateClick={() => setIsCreateModalOpen(true)}
        onEdit={handleEditLocation}
        onDelete={handleDeleteLocation}
        onRetry={refreshData}
      />

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
    </>
  );
}
