/**
 * Calendar View Container
 * Smart component that connects useCalendarEvents hook with CalendarView component
 * Supports server-side initial data to avoid waterfall fetching
 */

'use client'

import { useRouter } from 'next/navigation'

import { CalendarView } from '@/features/public-calendar/components/dumb/CalendarView'
import { useCalendarEvents } from '@/features/public-calendar/hooks/useCalendarEvents'
import {
  CalendarEvent,
  PublicEvent,
  EventType,
  Location,
} from '@/features/public-calendar/types/public-calendar.types'

interface CalendarViewContainerProps {
  initialEvents?: PublicEvent[]
  initialEventTypes?: EventType[]
  initialLocations?: Location[]
}

export const CalendarViewContainer = ({
  initialEvents,
  initialEventTypes,
  initialLocations,
}: CalendarViewContainerProps) => {
  const router = useRouter()
  const {
    calendarEvents,
    loading,
    error,
    currentDate,
    currentView,
    handleNavigate,
    handleViewChange,
  } = useCalendarEvents({
    initialEvents,
    initialEventTypes,
    initialLocations,
  })

  // Handle event click - navigate to event detail page
  const handleSelectEvent = (event: CalendarEvent): void => {
    router.push(`/calendar/${event.id}`)
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <CalendarView
      events={calendarEvents}
      onSelectEvent={handleSelectEvent}
      onNavigate={handleNavigate}
      onView={handleViewChange}
      currentDate={currentDate}
      currentView={currentView}
      loading={loading}
    />
  )
}
