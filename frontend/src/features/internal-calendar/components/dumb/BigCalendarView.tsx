/**
 * BigCalendarView Component (Dumb)
 *
 * Main calendar view using react-big-calendar with date-fns.
 * Displays events in Month, Week, Day, and Agenda views.
 * Created following TDD methodology (tests written first).
 */

'use client'

import 'react-big-calendar/lib/css/react-big-calendar.css'
import '@/features/internal-calendar/styles/calendar.css'

import { format, getDay,parse, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, dateFnsLocalizer, type ToolbarProps, type View, Views } from 'react-big-calendar'

import { CalendarToolbar } from '@/features/internal-calendar/components/dumb/CalendarToolbar'
import type { BigCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types'
import { getContrastTextColor } from '@/features/internal-calendar/utils/eventTypeColorMapping'

// Configure date-fns localizer with Spanish locale
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { es },
})

// Spanish messages for react-big-calendar
const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay eventos en este rango',
  showMore: (total: number) => `+ Ver más (${total})`,
}

/**
 * BigCalendarView Props
 */
export interface BigCalendarViewProps {
  events: BigCalendarEvent[]
  loading: boolean
  onSelectEvent: (event: BigCalendarEvent) => void
  currentDate: Date
  currentView: View
  onNavigate: (date: Date) => void
  onView: (view: View) => void
}

/**
 * BigCalendarView Component
 *
 * Renders a fully-featured calendar with event display and interaction.
 *
 * @param props - BigCalendarView props
 * @param props.events
 * @param props.loading
 * @param props.onSelectEvent
 * @returns React component
 */
export function BigCalendarView({
  events,
  loading,
  onSelectEvent,
  currentDate,
  currentView,
  onNavigate,
  onView,
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
          <p className="mt-2 text-gray-600">Cargando eventos...</p>
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
            No se encontraron eventos para los filtros seleccionados.
          </p>
        </div>
      )}
      <Calendar
        localizer={localizer}
        events={events}
        messages={messages}
        culture="es"
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventStyleGetter}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        date={currentDate}
        view={currentView}
        onNavigate={onNavigate}
        onView={onView}
        components={{
          toolbar: CalendarToolbar as React.ComponentType<ToolbarProps<BigCalendarEvent, object>>,
        }}
      />
    </div>
  )
}
