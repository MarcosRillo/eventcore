/**
 * Public Calendar Container
 *
 * Smart component that connects usePublicEvents hook with PublicCalendar component.
 */

'use client'

import { useRouter } from 'next/navigation'
import { usePublicEvents } from '@/features/public-calendar/hooks/usePublicEvents'
import { PublicCalendar } from '@/features/public-calendar/components/dumb/PublicCalendar'

export const PublicCalendarContainer = () => {
  const router = useRouter()
  const {
    events,
    eventTypes,
    eventSubtypes,
    locations,
    loading,
    error,
    hasActiveFilters,
    handleEventTypeFilter,
    handleEventSubtypeFilter,
    handleLocationFilter,
    clearFilters
  } = usePublicEvents()

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
      onEventTypeFilter={handleEventTypeFilter}
      onEventSubtypeFilter={handleEventSubtypeFilter}
      onLocationFilter={handleLocationFilter}
      onClearFilters={clearFilters}
      onEventClick={handleEventClick}
    />
  )
}
