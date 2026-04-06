'use client';

/**
 * EventTypesPage - Dumb presentational component
 * Renders the full event types admin page UI (no modals, no state).
 * Supports expandable rows for inline subtype management.
 */

import {
  CheckCircle,
  Plus,
  Search,
  Tag,
  XCircle,
} from 'lucide-react';

import { EventTypeTableContainer } from '@/features/event-types/components/smart/EventTypeTableContainer';
import {
  ErrorBanner,
  LoadingSpinner,
  StatCards,
} from '@/shared/components/feedback';
import { Button, Input, Select } from '@/shared/components/form';
import { AdminPageHeader } from '@/shared/components/layout';
import type { PaginationMeta } from '@/types/api-response.types';
import type {
  EventSubtype,
  EventType,
  EventTypeFilterStatus,
} from '@/types/eventType.types';

interface EventTypesPageProps {
  // Data
  eventTypes: EventType[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
  searchTerm: string;
  filterStatus: EventTypeFilterStatus;
  stats: { total: number; active: number; inactive: number };
  // Expansion
  expandedTypeIds: Set<number>;
  subtypesByType: Map<number, EventSubtype[]>;
  loadingSubtypes: Set<number>;
  // Handlers — data
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: EventTypeFilterStatus) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  // Handlers — event types
  onCreateClick: () => void;
  onEdit: (eventType: EventType) => void;
  onDelete: (id: number, name?: string) => void;
  // Handlers — expansion & subtypes
  onToggleExpand: (id: number) => void;
  onCreateSubtype: (eventType: EventType) => void;
  onEditSubtype: (subtype: EventSubtype) => void;
  onDeleteSubtype: (subtype: EventSubtype) => void;
}

export function EventTypesPage({
  eventTypes,
  pagination,
  isLoading,
  isValidating,
  error,
  searchTerm,
  filterStatus,
  stats,
  expandedTypeIds,
  subtypesByType,
  loadingSubtypes,
  onSearchChange,
  onFilterChange,
  onPageChange,
  onRetry,
  onCreateClick,
  onEdit,
  onDelete,
  onToggleExpand,
  onCreateSubtype,
  onEditSubtype,
  onDeleteSubtype,
}: EventTypesPageProps) {
  const isInitialLoad = isLoading && eventTypes.length === 0;

  if (isInitialLoad) {
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
          <AdminPageHeader
            title="Gestión de Tipos de Evento"
            description="Organiza y administra los tipos de evento. Haz clic en una fila para ver y gestionar sus subtipos."
            createLabel="Nuevo Tipo"
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
                label="Buscar tipos de evento"
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
                onChange={(value) => onFilterChange(value as EventTypeFilterStatus)}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'active', label: 'Solo activos' },
                  { value: 'inactive', label: 'Solo inactivos' },
                ]}
              />
            </div>
          </div>
          {/* Inline loading indicator during search/filter (when data already exists) */}
          {isValidating && eventTypes.length > 0 && (
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

        {/* Event Types Table with Expandable Subtypes */}
        {!isLoading && (
          <EventTypeTableContainer
            eventTypes={eventTypes}
            pagination={pagination}
            onEdit={onEdit}
            onDelete={onDelete}
            onPageChange={onPageChange}
            loading={false}
            expandedTypeIds={expandedTypeIds}
            onToggleExpand={onToggleExpand}
            loadingSubtypes={loadingSubtypes}
            subtypesByType={subtypesByType}
            onEditSubtype={onEditSubtype}
            onDeleteSubtype={onDeleteSubtype}
            onCreateSubtype={onCreateSubtype}
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
              Crea tu primer tipo de evento para comenzar a organizar tu calendario
            </p>
            <Button onClick={onCreateClick}>Crear Primer Tipo de Evento</Button>
          </div>
        )}
      </div>
    </div>
  );
}
