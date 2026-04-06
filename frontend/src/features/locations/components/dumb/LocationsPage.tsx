'use client';

/**
 * LocationsPage - Dumb presentational component
 * Renders the full locations admin page UI (no modals, no state).
 */

import { MapPin, Plus, Search } from 'lucide-react';

import { LocationTableContainer } from '@/features/locations/components/smart/LocationTableContainer';
import { ErrorBanner, LoadingSpinner } from '@/shared/components/feedback';
import { Button, Input } from '@/shared/components/form';
import { AdminPageHeader } from '@/shared/components/layout';
import type { PaginationMeta } from '@/types/api-response.types';
import type { Location } from '@/types/location.types';

interface LocationsPageProps {
  locations: Location[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  totalLocations: number;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onCreateClick: () => void;
  onEdit: (location: Location) => void;
  onDelete: (id: number) => Promise<void>;
  onRetry: () => void;
}

export function LocationsPage({
  locations,
  pagination,
  isLoading,
  error,
  searchTerm,
  totalLocations,
  onSearchChange,
  onPageChange,
  onCreateClick,
  onEdit,
  onDelete,
  onRetry,
}: LocationsPageProps) {
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
          <AdminPageHeader
            title="Gestión de Ubicaciones"
            description="Administra los lugares disponibles para tus eventos"
            createLabel="Nueva Ubicación"
            onCreateClick={onCreateClick}
            createIcon={<Plus className="w-5 h-5" />}
          />

          {/* Statistics Card - Simplified to just total */}
          <div className="mt-6" role="region" aria-label="Estadísticas de ubicaciones">
            <div
              className="bg-white rounded-lg shadow px-5 py-4 inline-flex items-center gap-4"
              aria-label={`Total: ${totalLocations} ubicaciones`}
            >
              <div className="p-3 bg-primary-100 rounded-full">
                <MapPin className="w-6 h-6 text-primary-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Total de ubicaciones</p>
                <p className="text-2xl font-bold text-neutral-900">{totalLocations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <Input
            name="search-locations"
            autoComplete="off"
            label="Buscar ubicaciones"
            placeholder="Buscar por nombre o ciudad…"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
            fullWidth
          />
        </div>

        {/* Error Message */}
        {error && <ErrorBanner message={error} onDismiss={onRetry} />}

        {/* Locations Table - Always rendered to preserve search input focus */}
        <LocationTableContainer
          locations={locations}
          pagination={pagination}
          loading={isLoading}
          onEdit={onEdit}
          onDelete={onDelete}
          onPageChange={onPageChange}
        />

        {/* Empty State */}
        {!isLoading && locations.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <MapPin className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No hay ubicaciones</h3>
            <p className="text-neutral-500 mb-6">
              Crea tu primera ubicación para comenzar a organizar tus eventos
            </p>
            <Button onClick={onCreateClick}>Crear Primera Ubicación</Button>
          </div>
        )}
      </div>
    </div>
  );
}
