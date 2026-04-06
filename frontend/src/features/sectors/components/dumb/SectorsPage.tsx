'use client';

/**
 * SectorsPage - Dumb presentational component
 * Renders the full sectors admin page UI (no modals, no state).
 */

import {
  CheckCircle,
  Plus,
  Search,
  Tag,
  XCircle,
} from 'lucide-react';

import { SectorTableContainer } from '@/features/sectors/components/smart/SectorTableContainer';
import type { Sector } from '@/features/sectors/types/sector.types';
import {
  ErrorBanner,
  LoadingSpinner,
  StatCards,
} from '@/shared/components/feedback';
import { Button, Input, Select } from '@/shared/components/form';
import { AdminPageHeader } from '@/shared/components/layout';
import type { PaginationMeta } from '@/types/api-response.types';

type SectorFilterStatus = 'all' | 'active' | 'inactive';

interface SectorsPageProps {
  sectors: Sector[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
  searchTerm: string;
  filterStatus: SectorFilterStatus;
  stats: { total: number; active: number; inactive: number };
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: SectorFilterStatus) => void;
  onPageChange: (page: number) => void;
  onCreateClick: () => void;
  onEdit: (sector: Sector) => void;
  onDelete: (id: number) => Promise<void>;
  onRetry: () => void;
}

export function SectorsPage({
  sectors,
  pagination,
  isLoading,
  isValidating,
  error,
  searchTerm,
  filterStatus,
  stats,
  onSearchChange,
  onFilterChange,
  onPageChange,
  onCreateClick,
  onEdit,
  onDelete,
  onRetry,
}: SectorsPageProps) {
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
          <AdminPageHeader
            title="Gestión de Sectores"
            description="Administra los sectores disponibles para las organizaciones"
            createLabel="Nuevo Sector"
            onCreateClick={onCreateClick}
            createIcon={<Plus className="w-5 h-5" />}
          />

          {/* Statistics Cards */}
          <StatCards
            items={[
              {
                label: 'Total',
                value: stats.total,
                icon: <Tag className="w-6 h-6 text-primary-600" />,
                iconBgClassName: 'bg-primary-100',
              },
              {
                label: 'Activos',
                value: stats.active,
                icon: <CheckCircle className="w-6 h-6 text-success-600" />,
                valueClassName: 'text-success-600',
                iconBgClassName: 'bg-success-100',
              },
              {
                label: 'Inactivos',
                value: stats.inactive,
                icon: <XCircle className="w-6 h-6 text-error-600" />,
                valueClassName: 'text-error-600',
                iconBgClassName: 'bg-error-100',
              },
            ]}
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Buscar sectores"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
                fullWidth
              />
            </div>

            <div className="sm:w-48">
              <Select
                label="Estado"
                value={filterStatus}
                onChange={(value) => onFilterChange(value as SectorFilterStatus)}
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
          <ErrorBanner message={error} onDismiss={onRetry} />
        )}

        {/* Sectors Table */}
        <SectorTableContainer
          sectors={sectors}
          pagination={pagination}
          loading={isLoading}
          onEdit={onEdit}
          onDelete={onDelete}
          onPageChange={onPageChange}
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
            <Button onClick={onCreateClick}>Crear Primer Sector</Button>
          </div>
        )}
      </div>
    </div>
  );
}
