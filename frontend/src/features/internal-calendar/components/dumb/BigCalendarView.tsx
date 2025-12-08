/**
 * BigCalendarView Component (Dumb)
 *
 * Main calendar view using react-big-calendar.
 * Displays events in Month, Week, Day, and Agenda views.
 * Created following TDD methodology (tests written first).
 */

'use client'

import { Calendar, momentLocalizer, Views, type ToolbarProps } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { CalendarToolbar } from './CalendarToolbar'
import { getContrastTextColor } from '@/features/internal-calendar/utils/eventTypeColorMapping'
import type { BigCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types'

// Configure moment localizer
const localizer = momentLocalizer(moment)

/**
 * BigCalendarView Props
 */
export interface BigCalendarViewProps {
  events: BigCalendarEvent[]
  loading: boolean
  onSelectEvent: (event: BigCalendarEvent) => void
}

/**
 * BigCalendarView Component
 *
 * Renders a fully-featured calendar with event display and interaction.
 *
 * @param props - BigCalendarView props
 * @returns React component
 */
export function BigCalendarView({
  events,
  loading,
  onSelectEvent,
}: BigCalendarViewProps) {
  // Show loading state
  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-[600px]"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-2 text-gray-600">Loading events...</p>
        </div>
      </div>
    )
  }

  // Custom event style getter
  const eventStyleGetter = (event: BigCalendarEvent) => {
    const backgroundColor = event.color
    const textColor = getContrastTextColor(backgroundColor)

    return {
      style: {
        backgroundColor,
        color: textColor,
        borderRadius: '4px',
        border: 'none',
        display: 'block',
      },
    }
  }

  return (
    <div className="calendar-container h-[600px] bg-white rounded-lg shadow p-4">
      {events.length === 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            No events found for the selected filters.
          </p>
        </div>
      )}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventStyleGetter}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        defaultView={Views.MONTH}
        components={{
          toolbar: CalendarToolbar as React.ComponentType<ToolbarProps<BigCalendarEvent, object>>,
        }}
      />
    </div>
  )
}
