/**
 * InternalCalendarFilterBar - Dumb Component
 *
 * Filter bar for internal calendar with event type, status, and date filters.
 * Pure UI component - receives all data and callbacks as props.
 */

'use client';

import { ExportCalendarButton } from '@/features/internal-calendar/components/dumb/ExportCalendarButton';
import type {
  EventType,
  InternalCalendarEvent,
  InternalCalendarFilters,
  InternalCalendarStatusCode,
} from '@/features/internal-calendar/types/internal-calendar.types';

export interface InternalCalendarFilterBarProps {
  /** Current active filters */
  filters: InternalCalendarFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: InternalCalendarFilters) => void;
  /** Available event types for dropdown */
  eventTypes: EventType[];
  /** Loading state for event types */
  eventTypesLoading?: boolean;
  /** Available status codes from API */
  statuses: InternalCalendarStatusCode[];
  /** Loading state for statuses */
  statusesLoading?: boolean;
  /** Events for export (optional) */
  events?: InternalCalendarEvent[];
}

const STATUS_LABELS: Record<InternalCalendarStatusCode, string> = {
  approved_internal: 'Aprobado Interno',
  pending_public_approval: 'Pendiente Aprobación Pública',
  published: 'Publicado',
};

const selectClasses = `w-full px-3 py-2 pr-10 border border-neutral-300 rounded-md
  bg-white text-neutral-900 appearance-none
  bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg+xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22+fill%3D%22none%22+viewBox%3D%220+0+20+20%22%3E%3Cpath+stroke%3D%22%236b7280%22+stroke-linecap%3D%22round%22+stroke-linejoin%3D%22round%22+stroke-width%3D%221.5%22+d%3D%22m6+8+4+4+4-4%22%2F%3E%3C%2Fsvg%3E')]
  bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.25rem_1.25rem]
  focus:ring-2 focus:ring-primary-500 focus:border-primary-500
  disabled:bg-neutral-100 disabled:cursor-not-allowed`;

const inputClasses = `w-full px-3 py-2 border border-neutral-300 rounded-md
  bg-white text-neutral-900
  focus:ring-2 focus:ring-primary-500 focus:border-primary-500`;

/**
 *
 * @param root0
 * @param root0.filters
 * @param root0.onFiltersChange
 * @param root0.eventTypes
 * @param root0.eventTypesLoading
 * @param root0.statuses
 * @param root0.statusesLoading
 * @param root0.events
 */
export function InternalCalendarFilterBar({
  filters,
  onFiltersChange,
  eventTypes,
  eventTypesLoading = false,
  statuses,
  statusesLoading = false,
  events = [],
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
      aria-label="Filtros de eventos"
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
            className={`${selectClasses} ${!filters.event_type_id ? 'text-neutral-500' : ''}`}
          >
            <option value="">Todos los tipos</option>
            {eventTypes.map((type) => (
              <option key={type.id} value={type.id} className="text-neutral-900">
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
            disabled={statusesLoading}
            className={`${selectClasses} ${!filters.status ? 'text-neutral-500' : ''}`}
          >
            <option value="">Todos los estados</option>
            {statuses.map((statusCode) => (
              <option key={statusCode} value={statusCode} className="text-neutral-900">
                {STATUS_LABELS[statusCode] || statusCode}
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
            className={inputClasses}
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
            className={inputClasses}
          />
        </div>
      </div>

      {/* Actions Row */}
      <div className="mt-4 flex justify-between items-center">
        {/* Export Button */}
        <ExportCalendarButton events={events} />

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
