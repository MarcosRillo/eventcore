/**
 * Calendar View Component
 * Dumb component that renders react-big-calendar with events
 */

import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '@/features/public-calendar/styles/calendar.css'
import { CalendarEvent, CalendarView as CalendarViewType } from '@/features/public-calendar/types/public-calendar.types'

// Setup date-fns localizer with Spanish locale
const locales = {
  es: es,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// Spanish messages for calendar
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

interface CalendarViewProps {
  events: CalendarEvent[]
  onSelectEvent: (event: CalendarEvent) => void
  onNavigate: (date: Date) => void
  onView: (view: CalendarViewType) => void
  currentDate: Date
  currentView: CalendarViewType
  loading?: boolean
}

export const CalendarView = ({
  events,
  onSelectEvent,
  onNavigate,
  onView,
  currentDate,
  currentView,
  loading = false,
}: CalendarViewProps) => {
  // Default color for events without category color (primary-600 equivalent)
  const DEFAULT_EVENT_COLOR = '#0284C7'

  // Event style getter - color by event type
  const eventStyleGetter = (event: CalendarEvent) => {
    // Use event type color from backend, fallback to primary color
    const backgroundColor = event.resource.event_type?.color || DEFAULT_EVENT_COLOR

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 500,
      },
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      )}

      <div className="calendar-container" style={{ height: '700px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          messages={messages}
          culture="es"
          onSelectEvent={onSelectEvent}
          onNavigate={onNavigate}
          onView={(view: View) => onView(view as CalendarViewType)}
          date={currentDate}
          view={currentView}
          eventPropGetter={eventStyleGetter}
          popup
          selectable={false}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          toolbar={true}
          style={{ height: '100%' }}
        />
      </div>
    </div>
  )
}
