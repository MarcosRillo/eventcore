/**
 * Public Calendar Container
 *
 * Smart component that connects usePublicEvents hook with PublicCalendar component.
 */

'use client'

import { useRouter } from 'next/navigation'
import { usePublicEvents } from '../../hooks/usePublicEvents'
import { PublicCalendar } from '../dumb/PublicCalendar'

export const PublicCalendarContainer = () => {
  const router = useRouter()
  const {
    events,
    categories,
    locations,
    loading,
    error,
    handleCategoryFilter,
    handleLocationFilter
  } = usePublicEvents()

  const handleEventClick = (eventId: number): void => {
    router.push(`/calendar/${eventId}`)
  }

  return (
    <PublicCalendar
      events={events}
      categories={categories}
      locations={locations}
      loading={loading}
      error={error}
      onCategoryFilter={handleCategoryFilter}
      onLocationFilter={handleLocationFilter}
      onEventClick={handleEventClick}
    />
  )
}
