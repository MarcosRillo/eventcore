'use client';

/**
 * Sectors Page Container
 * Admin page for sector management with full CRUD operations
 * Simpler than EventTypes — no subtypes, no expandable rows, no colors
 */

import { useCallback, useState } from 'react';

import CreateSectorModal from '@/features/sectors/components/dumb/CreateSectorModal';
import { SectorsPage } from '@/features/sectors/components/dumb/SectorsPage';
import EditSectorModal from '@/features/sectors/components/smart/EditSectorModal';
import { useSectorManager } from '@/features/sectors/hooks/useSectorManager';
import type { Sector } from '@/features/sectors/types/sector.types';

export function SectorsPageContainer() {
  const {
    sectors,
    pagination,
    isLoading,
    isValidating,
    error,
    searchTerm,
    filterStatus,
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleDeleteSector,
    refreshData,
    stats,
  } = useSectorManager();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  // Handle creation success
  const handleCreateSuccess = useCallback(() => {
    refreshData();
  }, [refreshData]);

  // Handle edit
  const handleEditSector = useCallback((sector: Sector) => {
    setSelectedSector(sector);
    setIsEditModalOpen(true);
  }, []);

  // Handle edit success
  const handleEditSuccess = useCallback(() => {
    refreshData();
    setSelectedSector(null);
  }, [refreshData]);

  // Handle modal close
  const handleCloseModals = useCallback(() => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedSector(null);
  }, []);

  const handleDelete = useCallback(
    async (sectorId: number) => {
      try {
        await handleDeleteSector(sectorId);
      } catch {
        // Error handled by hook
      }
    },
    [handleDeleteSector]
  );

  return (
    <>
      <SectorsPage
        sectors={sectors}
        pagination={pagination}
        isLoading={isLoading}
        isValidating={isValidating}
        error={error}
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        stats={stats}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onCreateClick={() => setIsCreateModalOpen(true)}
        onEdit={handleEditSector}
        onDelete={handleDelete}
        onRetry={refreshData}
      />

      {/* Modals */}
      <CreateSectorModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleCreateSuccess}
        onSectorCreated={refreshData}
      />

      <EditSectorModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleEditSuccess}
        sector={selectedSector}
        onSectorUpdated={refreshData}
      />
    </>
  );
}
