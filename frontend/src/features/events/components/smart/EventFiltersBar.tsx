'use client';

import { useState } from 'react';

import { Button, Input, Select } from '@/shared/components/form';
import { EVENT_STATUS, EVENT_TYPE } from '@/types/event.types';
import type { EventFilters } from '@/types/filter.types';

// Define Section interface for type safety
interface Section {
  id: number;
  name: string;
  // Add other section properties as needed
}

interface EventFiltersBarProps {
  sections: Section[];
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  onClearFilters: () => void;
}

export const EventFiltersBar = ({
  filters,
  onFiltersChange,
  onClearFilters,
}: EventFiltersBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = <K extends keyof EventFilters>(
    key: K,
    value: EventFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 }); // Reset page when filters change
  };

  const hasActiveFilters = () => {
    return filters.search ||
           filters.status ||
           filters.type ||
           filters.start_date ||
           filters.end_date;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
            >
              Limpiar filtros
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Ocultar' : 'Mostrar'} filtros avanzados
            <svg
              className={`ml-1 w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Filtros básicos - siempre visibles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Búsqueda */}
        <div>
          <Input
            label="Buscar"
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
            placeholder="Buscar eventos..."
            fullWidth
          />
        </div>

        {/* Estado */}
        <div>
          <Select
            label="Estado"
            value={filters.status || ''}
            onChange={(value) => handleFilterChange('status', (value || undefined) as EventFilters['status'])}
            placeholder="Todos los estados"
            options={[
              { value: EVENT_STATUS.DRAFT, label: 'Borrador' },
              { value: EVENT_STATUS.PENDING_INTERNAL_APPROVAL, label: 'Pendiente Aprobación Interna' },
              { value: EVENT_STATUS.APPROVED_INTERNAL, label: 'Aprobado Internamente' },
              { value: EVENT_STATUS.PENDING_PUBLIC_APPROVAL, label: 'Pendiente Aprobación Pública' },
              { value: EVENT_STATUS.PUBLISHED, label: 'Publicado' },
              { value: EVENT_STATUS.REQUIRES_CHANGES, label: 'Requiere Cambios' },
              { value: EVENT_STATUS.REJECTED, label: 'Rechazado' },
              { value: EVENT_STATUS.CANCELLED, label: 'Cancelado' }
            ]}
            fullWidth
          />
        </div>

        {/* Tipo */}
        <div>
          <Select
            label="Tipo"
            value={filters.type || ''}
            onChange={(value) => handleFilterChange('type', (value || undefined) as EventFilters['type'])}
            placeholder="Todos los tipos"
            options={[
              { value: EVENT_TYPE.SINGLE_LOCATION, label: 'Sede Única' },
              { value: EVENT_TYPE.MULTI_LOCATION, label: 'Multi-Sede' }
            ]}
            fullWidth
          />
        </div>
      </div>

      {/* Filtros avanzados - expandibles */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          {/* Ubicación - Temporarily disabled since locations are now free text
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <select
              value={filters.location_id || ''}
              onChange={(e) => handleFilterChange('location_id', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Todas las ubicaciones</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          */}

          {/* Fecha de inicio */}
          <div>
            <Input
              label="Fecha desde"
              type="date"
              value={filters.start_date || ''}
              onChange={(e) => handleFilterChange('start_date', e.target.value || undefined)}
              fullWidth
            />
          </div>

          {/* Fecha de fin */}
          <div>
            <Input
              label="Fecha hasta"
              type="date"
              value={filters.end_date || ''}
              onChange={(e) => handleFilterChange('end_date', e.target.value || undefined)}
              fullWidth
            />
          </div>
        </div>
      )}

      {/* Indicador de filtros activos */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Filtros activos: {Object.values(filters).filter(v => v !== undefined && v !== '' && v !== 1).length} aplicados
          </div>
        </div>
      )}
    </div>
  );
};
