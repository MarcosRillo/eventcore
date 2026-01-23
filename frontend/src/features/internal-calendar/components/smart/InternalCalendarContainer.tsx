/**
 * InternalCalendarContainer Component (Smart)
 *
 * Smart container that fetches internal calendar events and manages state.
 * Integrates BigCalendarView with EventDetailModal for interactive calendar experience.
 * Updated for react-big-calendar integration (Dec 4, 2025).
 */

'use client'

import { useState } from 'react'

import { BigCalendarView } from '@/features/internal-calendar/components/dumb/BigCalendarView'
import { EventDetailModal } from '@/features/internal-calendar/components/dumb/EventDetailModal'
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents'
import type {
  BigCalendarEvent,
  InternalCalendarFilters,
} from '@/features/internal-calendar/types/internal-calendar.types'
import { transformToBigCalendarEvents } from '@/features/internal-calendar/utils/calendarEventTransform'

/**
 * InternalCalendarContainer Props
 */
interface InternalCalendarContainerProps {
  /** Optional filters for events */
  filters?: InternalCalendarFilters
}

/**
 * InternalCalendarContainer Component
 *
 * Smart container for internal calendar with BigCalendar view and event detail modal.
 *
 * @param root0
 * @param root0.filters
 * @example
 * ```tsx
 * <InternalCalendarContainer filters={{ status: 'approved_internal' }} />
 * ```
 */
export function InternalCalendarContainer({
  filters,
}: InternalCalendarContainerProps) {
  const { events, loading, error } = useInternalCalendarEvents(filters)
  const [selectedEvent, setSelectedEvent] = useState<BigCalendarEvent | null>(
    null
  )

  // Transform events for BigCalendar
  const bigCalendarEvents = transformToBigCalendarEvents(events)

  // Event handlers
  const handleSelectEvent = (event: BigCalendarEvent) => {
    setSelectedEvent(event)
  }

  const handleCloseModal = () => {
    setSelectedEvent(null)
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Render BigCalendar view with modal
  return (
    <>
      <BigCalendarView
        events={bigCalendarEvents}
        loading={loading}
        onSelectEvent={handleSelectEvent}
      />
      <EventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={handleCloseModal}
      />
    </>
  )
}
