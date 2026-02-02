/**
 * Public Calendar Component - Minimalist Design System
 *
 * Main public-facing calendar page with event listing and filters.
 * Uses semantic color tokens and consistent spacing.
 */

import type { ChangeEvent } from 'react'
import { useState } from 'react'

import { EventCard } from '@/features/public-calendar/components/dumb/EventCard'
import { EventSubtype, EventType, Location,PublicEvent } from '@/features/public-calendar/types/public-calendar.types'
import { LoadingSpinner } from '@/shared/components/feedback'

interface PublicCalendarProps {
  events: PublicEvent[]
  eventTypes: EventType[]
  eventSubtypes: EventSubtype[]
  locations: Location[]
  loading: boolean
  error: string | null
  hasActiveFilters?: boolean
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
  onEventTypeFilter,
  onEventSubtypeFilter,
  onLocationFilter,
  onClearFilters,
  onEventClick
}: PublicCalendarProps) => {
  const [filtersOpen, setFiltersOpen] = useState(false)

  const handleEventTypeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value
    onEventTypeFilter(value ? parseInt(value) : null)
  }

  const handleEventSubtypeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value
    onEventSubtypeFilter(value ? parseInt(value) : null)
  }

  const handleLocationChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value
    onLocationFilter(value ? parseInt(value) : null)
  }

  const selectClasses = `
    w-full h-10 px-3 py-2
    bg-white border border-neutral-200 rounded-md
    text-sm text-neutral-900
    transition-all duration-150
    focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10
    hover:border-neutral-300
  `

  return (
    <main className="min-h-screen bg-neutral-50" role="main">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-neutral-900">
            Eventos en Tucumán
          </h1>
          <p className="text-neutral-600 mt-2">
            Descubrí los mejores eventos turísticos y culturales
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-neutral-200 mb-6">
          {/* Mobile: Collapsible header */}
          <button
            className="md:hidden w-full p-4 flex items-center justify-between text-left"
            onClick={() => setFiltersOpen(!filtersOpen)}
            aria-expanded={filtersOpen}
            aria-controls="filters-content"
          >
            <span className="font-medium text-neutral-700 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
              {hasActiveFilters && (
                <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                  Activos
                </span>
              )}
            </span>
            <svg
              className={`w-5 h-5 text-neutral-400 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Filter content - always visible on desktop, collapsible on mobile */}
          <div
            id="filters-content"
            className={`p-4 pt-0 md:pt-4 ${filtersOpen ? 'block' : 'hidden md:block'}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Event Type Filter */}
              <div>
                <label
                  htmlFor="event-type-filter"
                  className="block text-sm font-medium text-neutral-700 mb-1.5"
                >
                  Tipo de Evento
                </label>
                <select
                  id="event-type-filter"
                  className={selectClasses}
                  onChange={handleEventTypeChange}
                  aria-label="Tipo de Evento"
                >
                  <option value="">Todos los tipos</option>
                  {eventTypes.map(eventType => (
                    <option key={eventType.id} value={eventType.id}>
                      {eventType.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Subtype Filter (Cascading) */}
              <div>
                <label
                  htmlFor="event-subtype-filter"
                  className="block text-sm font-medium text-neutral-700 mb-1.5"
                >
                  Subtipo (Opcional)
                </label>
                <select
                  id="event-subtype-filter"
                  className={selectClasses}
                  onChange={handleEventSubtypeChange}
                  disabled={eventSubtypes.length === 0}
                  aria-label="Subtipo de Evento"
                >
                  <option value="">Todos los subtipos</option>
                  {eventSubtypes.map(subtype => (
                    <option key={subtype.id} value={subtype.id}>
                      {subtype.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label
                  htmlFor="location-filter"
                  className="block text-sm font-medium text-neutral-700 mb-1.5"
                >
                  Ubicación
                </label>
                <select
                  id="location-filter"
                  className={selectClasses}
                  onChange={handleLocationChange}
                  aria-label="Ubicación"
                >
                  <option value="">Todas las ubicaciones</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear filters button */}
            {hasActiveFilters && onClearFilters && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <button
                  onClick={onClearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>

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
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-neutral-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-neutral-900">No hay eventos</h3>
            <p className="mt-2 text-neutral-600">
              {hasActiveFilters
                ? 'No encontramos eventos con los filtros seleccionados'
                : 'No hay eventos disponibles en este momento'}
            </p>
            {hasActiveFilters && onClearFilters && (
              <button
                onClick={onClearFilters}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* Event Grid */}
        {!loading && !error && events.length > 0 && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="region"
            aria-label="Event grid"
          >
            {events.map(event => (
              <EventCard key={event.id} event={event} onClick={onEventClick} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
