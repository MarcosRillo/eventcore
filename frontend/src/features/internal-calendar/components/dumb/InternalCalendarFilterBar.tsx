/**
 * InternalCalendarFilterBar - Dumb Component
 *
 * Filter bar for internal calendar with event type, status, and date filters.
 * Pure UI component - receives all data and callbacks as props.
 */

'use client';

import type {
  InternalCalendarFilters,
  InternalCalendarStatusCode,
} from '@/features/internal-calendar/types/internal-calendar.types';
import type { EventType } from '@/types/eventType.types';

export interface InternalCalendarFilterBarProps {
  /** Current active filters */
  filters: InternalCalendarFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: InternalCalendarFilters) => void;
  /** Available event types for dropdown */
  eventTypes: EventType[];
  /** Loading state for event types */
  eventTypesLoading?: boolean;
}

const STATUS_OPTIONS: { value: InternalCalendarStatusCode; label: string }[] = [
  { value: 'approved_internal', label: 'Aprobado Interno' },
  { value: 'pending_public_approval', label: 'Pendiente Aprobación Pública' },
  { value: 'published', label: 'Publicado' },
];

/**
 *
 * @param root0
 * @param root0.filters
 * @param root0.onFiltersChange
 * @param root0.eventTypes
 * @param root0.eventTypesLoading
 */
export function InternalCalendarFilterBar({
  filters,
  onFiltersChange,
  eventTypes,
  eventTypesLoading = false,
}: InternalCalendarFilterBarProps) {
  const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      event_type_id: value ? Number(value) : undefined,
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as InternalCalendarStatusCode | '';
    onFiltersChange({
      ...filters,
      status: value || undefined,
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      start_date: e.target.value || undefined,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      end_date: e.target.value || undefined,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.event_type_id ||
    filters.status ||
    filters.start_date ||
    filters.end_date;

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-6"
      role="region"
      aria-label="Event filters"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Event Type Filter */}
        <div>
          <label
            htmlFor="event-type-filter"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Tipo de Evento
          </label>
          <select
            id="event-type-filter"
            value={filters.event_type_id || ''}
            onChange={handleEventTypeChange}
            disabled={eventTypesLoading}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            <option value="">Todos los tipos</option>
            {eventTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Estado
          </label>
          <select
            id="status-filter"
            value={filters.status || ''}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date Filter */}
        <div>
          <label
            htmlFor="start-date-filter"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Desde
          </label>
          <input
            id="start-date-filter"
            type="date"
            value={filters.start_date || ''}
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* End Date Filter */}
        <div>
          <label
            htmlFor="end-date-filter"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Hasta
          </label>
          <input
            id="end-date-filter"
            type="date"
            value={filters.end_date || ''}
            onChange={handleEndDateChange}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
