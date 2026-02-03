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
import { Button, type FormSelectOption,Input, Select } from '@/shared/components/form';

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
  const handleEventTypeChange = (value: string | number) => {
    onFiltersChange({
      ...filters,
      event_type_id: value ? Number(value) : undefined,
    });
  };

  const handleStatusChange = (value: string | number) => {
    onFiltersChange({
      ...filters,
      status: (value || undefined) as InternalCalendarStatusCode | undefined,
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

  const eventTypeOptions: FormSelectOption[] = eventTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }));

  const statusOptions: FormSelectOption[] = statuses.map((code) => ({
    value: code,
    label: STATUS_LABELS[code] || code,
  }));

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-6"
      role="region"
      aria-label="Filtros de eventos"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Event Type Filter */}
        <div>
          <Select
            label="Tipo de Evento"
            value={filters.event_type_id ?? ''}
            onChange={handleEventTypeChange}
            options={eventTypeOptions}
            placeholder="Todos los tipos"
            disabled={eventTypesLoading}
            fullWidth
          />
        </div>

        {/* Status Filter */}
        <div>
          <Select
            label="Estado"
            value={filters.status ?? ''}
            onChange={handleStatusChange}
            options={statusOptions}
            placeholder="Todos los estados"
            disabled={statusesLoading}
            fullWidth
          />
        </div>

        {/* Start Date Filter */}
        <div>
          <Input
            label="Desde"
            type="date"
            value={filters.start_date || ''}
            onChange={handleStartDateChange}
            fullWidth
          />
        </div>

        {/* End Date Filter */}
        <div>
          <Input
            label="Hasta"
            type="date"
            value={filters.end_date || ''}
            onChange={handleEndDateChange}
            fullWidth
          />
        </div>
      </div>

      {/* Actions Row */}
      <div className="mt-4 flex justify-between items-center">
        {/* Export Button */}
        <ExportCalendarButton events={events} />

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
