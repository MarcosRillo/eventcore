/**
 * Public Calendar Component - Minimalist Design System
 *
 * Main public-facing calendar page with event listing and filters.
 * Uses semantic color tokens and consistent spacing.
 */

import { EventCard } from '@/features/public-calendar/components/dumb/EventCard'
import { EventSubtype, EventType, Location, PublicEvent } from '@/features/public-calendar/types/public-calendar.types'
import { LoadingSpinner } from '@/shared/components/feedback'
import EmptyState, { EmptyStateIcons } from '@/shared/components/feedback/EmptyState'
import { Select } from '@/shared/components/form'
import type { SelectOption } from '@/shared/components/form/Select'
import { EventGrid, FilterBar, PageHeader } from '@/shared/components/layout'

interface PublicCalendarProps {
  events: PublicEvent[]
  eventTypes: EventType[]
  eventSubtypes: EventSubtype[]
  locations: Location[]
  loading: boolean
  error: string | null
  hasActiveFilters?: boolean
  selectedEventTypeId?: number | null
  selectedSubtypeId?: number | null
  selectedLocationId?: number | null
  onEventTypeFilter: (eventTypeId: number | null) => void
  onEventSubtypeFilter: (eventSubtypeId: number | null) => void
  onLocationFilter: (locationId: number | null) => void
  onClearFilters?: () => void
  onEventClick: (eventId: number) => void
}

export const PublicCalendar = ({
  events,
  eventTypes,
  eventSubtypes,
  locations,
  loading,
  error,
  hasActiveFilters = false,
  selectedEventTypeId,
  selectedSubtypeId,
  selectedLocationId,
  onEventTypeFilter,
  onEventSubtypeFilter,
  onLocationFilter,
  onClearFilters,
  onEventClick
}: PublicCalendarProps) => {
  const handleEventTypeChange = (value: string | number): void => {
    onEventTypeFilter(value ? Number(value) : null)
  }

  const handleSubtypeChange = (value: string | number): void => {
    onEventSubtypeFilter(value ? Number(value) : null)
  }

  const handleLocationChange = (value: string | number): void => {
    onLocationFilter(value ? Number(value) : null)
  }

  const eventTypeOptions: SelectOption[] = eventTypes.map(t => ({ value: t.id, label: t.name }))
  const subtypeOptions: SelectOption[] = eventSubtypes.map(s => ({ value: s.id, label: s.name }))
  const locationOptions: SelectOption[] = locations.map(l => ({ value: l.id, label: l.name }))

  return (
    <div className="bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="py-6">
          <PageHeader
            title="Eventos en Tucumán"
            subtitle="Descubrí los mejores eventos turísticos y culturales"
          />
        </div>
      </div>

      {/* Filters + Content */}
      <div className="py-6">
        <FilterBar
          columns={3}
          collapsible
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
          className="mb-6"
        >
          <Select
            label="Tipo de Evento"
            value={selectedEventTypeId ?? ''}
            onChange={handleEventTypeChange}
            options={eventTypeOptions}
            placeholder="Todos los tipos"
            fullWidth
          />
          <Select
            label="Subtipo (Opcional)"
            value={selectedSubtypeId ?? ''}
            onChange={handleSubtypeChange}
            options={subtypeOptions}
            placeholder="Todos los subtipos"
            disabled={eventSubtypes.length === 0}
            fullWidth
          />
          <Select
            label="Ubicación"
            value={selectedLocationId ?? ''}
            onChange={handleLocationChange}
            options={locationOptions}
            placeholder="Todas las ubicaciones"
            fullWidth
          />
        </FilterBar>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12" role="status" aria-label="Loading events">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-error-600">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <EmptyState
            icon={EmptyStateIcons.calendar}
            title="No hay eventos"
            description={hasActiveFilters
              ? 'No encontramos eventos con los filtros seleccionados'
              : 'No hay eventos disponibles en este momento'}
            action={hasActiveFilters && onClearFilters ? (
              <button
                onClick={onClearFilters}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Limpiar filtros
              </button>
            ) : undefined}
            size="md"
          />
        )}

        {/* Event Grid */}
        {!loading && !error && events.length > 0 && (
          <EventGrid>
            {events.map(event => (
              <EventCard key={event.id} event={event} onClick={onEventClick} />
            ))}
          </EventGrid>
        )}
      </div>
    </div>
  )
}
