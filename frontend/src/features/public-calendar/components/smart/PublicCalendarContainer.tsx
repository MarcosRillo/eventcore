'use client';

/**
 * Public Calendar Container
 *
 * Smart component that connects usePublicEvents hook with PublicCalendar component.
 * Supports server-side initial data to avoid waterfall fetching.
 */

'use client'

import { useRouter } from 'next/navigation'

import { PublicCalendar } from '@/features/public-calendar/components/dumb/PublicCalendar'
import { usePublicEvents } from '@/features/public-calendar/hooks/usePublicEvents'
import {
  EventType,
  Location,
  PublicEvent,
} from '@/features/public-calendar/types/public-calendar.types'

interface PublicCalendarContainerProps {
  initialEvents?: PublicEvent[]
  initialEventTypes?: EventType[]
  initialLocations?: Location[]
}

export const PublicCalendarContainer = ({
  initialEvents,
  initialEventTypes,
  initialLocations,
}: PublicCalendarContainerProps) => {
  const router = useRouter()
  const {
    events,
    eventTypes,
    eventSubtypes,
    locations,
    loading,
    error,
    filters,
    hasActiveFilters,
    handleEventTypeFilter,
    handleEventSubtypeFilter,
    handleLocationFilter,
    clearFilters
  } = usePublicEvents({
    initialEvents,
    initialEventTypes,
    initialLocations,
  })

  const handleEventClick = (eventId: number): void => {
    router.push(`/calendar/${eventId}`)
  }

  return (
    <PublicCalendar
      events={events}
      eventTypes={eventTypes}
      eventSubtypes={eventSubtypes}
      locations={locations}
      loading={loading}
      error={error}
      hasActiveFilters={hasActiveFilters}
      selectedEventTypeId={filters.event_type_id}
      selectedSubtypeId={filters.event_subtype_id}
      selectedLocationId={filters.location_id}
      onEventTypeFilter={handleEventTypeFilter}
      onEventSubtypeFilter={handleEventSubtypeFilter}
      onLocationFilter={handleLocationFilter}
      onClearFilters={clearFilters}
      onEventClick={handleEventClick}
    />
  )
}
