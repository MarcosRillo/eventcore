'use client';

/**
 * Sectors Page Container
 * Admin page for sector management with full CRUD operations
 * Simpler than EventTypes — no subtypes, no expandable rows, no colors
 */

import {
  CheckCircle,
  Plus,
  Search,
  Tag,
  X,
  XCircle,
} from 'lucide-react';
import { useCallback, useState } from 'react';

import CreateSectorModal from '@/features/sectors/components/dumb/CreateSectorModal';
import EditSectorModal from '@/features/sectors/components/smart/EditSectorModal';
import { SectorTableContainer } from '@/features/sectors/components/smart/SectorTableContainer';
import { useSectorManager } from '@/features/sectors/hooks/useSectorManager';
import { Sector } from '@/features/sectors/types/sector.types';
import { LoadingSpinner } from '@/shared/components/feedback';
import { Button, Input, Select } from '@/shared/components/form';

type SectorFilterStatus = 'all' | 'active' | 'inactive';

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

  // Show full-page loading spinner ONLY on initial load (no data yet)
  const isInitialLoad = isLoading && sectors.length === 0;

  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Cargando sectores..." />
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
                Gestión de Sectores
              </h1>
              <p className="mt-2 text-neutral-600">
                Administra los sectores disponibles para las organizaciones
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-5 h-5" />}
            >
              Nuevo Sector
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
                label="Buscar sectores"
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
                  handleFilterChange(value as SectorFilterStatus)
                }
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'active', label: 'Solo activos' },
                  { value: 'inactive', label: 'Solo inactivos' },
                ]}
              />
            </div>
          </div>
          {/* Inline loading indicator during search/filter */}
          {isValidating && sectors.length > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
              <LoadingSpinner size="sm" />
              <span>Buscando...</span>
            </div>
          )}
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
                title="Reintentar"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Sectors Table */}
        <SectorTableContainer
          sectors={sectors}
          pagination={pagination}
          loading={isLoading}
          onEdit={handleEditSector}
          onDelete={handleDelete}
          onPageChange={handlePageChange}
        />

        {/* Empty State */}
        {!isLoading && sectors.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Tag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No hay sectores
            </h3>
            <p className="text-neutral-500 mb-6">
              Crea tu primer sector para comenzar a clasificar las organizaciones
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Crear Primer Sector
            </Button>
          </div>
        )}

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
      </div>
    </div>
  );
}
