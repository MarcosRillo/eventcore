/**
 * Calendar View Component
 * Dumb component that renders react-big-calendar with events
 */

import 'react-big-calendar/lib/css/react-big-calendar.css'
import '@/features/public-calendar/styles/calendar.css'

import { endOfMonth, endOfWeek, format, getDay, parse, startOfMonth, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { useMemo } from 'react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'

import { AgendaEvent } from '@/features/public-calendar/components/dumb/AgendaEvent'
import { CalendarEvent, CalendarView as CalendarViewType, EventSubtype, EventType, Location } from '@/features/public-calendar/types/public-calendar.types'
import { cn } from '@/lib/utils'
import Select from '@/shared/components/form/Select'
import { FilterBar } from '@/shared/components/layout/FilterBar'

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

// Month view height calculation
// Each row needs 140px for 4 event slots: 3 visible events + "+more" link
// With line-height: 1.2 → eventHeight=24px, headingHeight=37px
// eventSpace = 140 - 37 = 103, floor(103/24) = 4 slots
const MONTH_ROW_HEIGHT = 140
// Generous overhead for toolbar (~56px) + day-of-week header (~38px) + padding
const MONTH_VIEW_OVERHEAD = 130

interface CalendarViewProps {
  events: CalendarEvent[]
  onSelectEvent: (event: CalendarEvent) => void
  onNavigate: (date: Date) => void
  onView: (view: CalendarViewType) => void
  currentDate: Date
  currentView: CalendarViewType
  loading?: boolean
  eventTypes?: EventType[]
  eventSubtypes?: EventSubtype[]
  locations?: Location[]
  selectedEventType?: number | null
  selectedEventSubtype?: number | null
  selectedLocation?: number | null
  onEventTypeFilter?: (id: number | null) => void
  onEventSubtypeFilter?: (id: number | null) => void
  onLocationFilter?: (id: number | null) => void
  onClearFilters?: () => void
  hasActiveFilters?: boolean
}

export const CalendarView = ({
  events,
  onSelectEvent,
  onNavigate,
  onView,
  currentDate,
  currentView,
  loading = false,
  eventTypes,
  eventSubtypes,
  locations,
  selectedEventType,
  selectedEventSubtype,
  selectedLocation,
  onEventTypeFilter,
  onEventSubtypeFilter,
  onLocationFilter,
  onClearFilters,
  hasActiveFilters,
}: CalendarViewProps) => {
  // Default color for events without category color (primary-600 equivalent)
  const DEFAULT_EVENT_COLOR = '#0284C7'
  const isMonthView = currentView === 'month'

  // Compute exact container height for month view based on weeks shown
  const monthContainerHeight = useMemo(() => {
    if (!isMonthView) return undefined
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    // Use es locale (weekStartsOn: 1 = Monday) to match calendar grid
    const calStart = startOfWeek(monthStart, { locale: es })
    const calEnd = endOfWeek(monthEnd, { locale: es })
    const weeks = Math.round(
      (calEnd.getTime() - calStart.getTime()) / (7 * 86400000)
    )
    return weeks * MONTH_ROW_HEIGHT + MONTH_VIEW_OVERHEAD
  }, [currentDate, isMonthView])

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

      {eventTypes && eventTypes.length > 0 && (
        <FilterBar
          collapsible
          columns={3}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearFilters}
          className="mb-4"
        >
          <Select
            label="Tipo de evento"
            value={selectedEventType ?? ''}
            onChange={(val) => onEventTypeFilter?.(val ? Number(val) : null)}
            options={[
              { value: '', label: 'Todos los tipos' },
              ...eventTypes.map(t => ({ value: t.id, label: t.name }))
            ]}
            size="sm"
            fullWidth
          />
          <Select
            label="Subtipo"
            value={selectedEventSubtype ?? ''}
            onChange={(val) => onEventSubtypeFilter?.(val ? Number(val) : null)}
            options={[
              { value: '', label: 'Todos los subtipos' },
              ...(eventSubtypes ?? []).map(s => ({ value: s.id, label: s.name }))
            ]}
            disabled={!selectedEventType}
            size="sm"
            fullWidth
          />
          <Select
            label="Ubicación"
            value={selectedLocation ?? ''}
            onChange={(val) => onLocationFilter?.(val ? Number(val) : null)}
            options={[
              { value: '', label: 'Todas las ubicaciones' },
              ...(locations ?? []).map(l => ({ value: l.id, label: `${l.name} - ${l.city}` }))
            ]}
            size="sm"
            fullWidth
          />
        </FilterBar>
      )}

      <div
        className={cn(
          'calendar-container',
          !isMonthView && 'h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px]'
        )}
        style={isMonthView ? { height: monthContainerHeight } : undefined}
      >
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
          components={{
            agenda: {
              event: AgendaEvent,
            },
          }}
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
