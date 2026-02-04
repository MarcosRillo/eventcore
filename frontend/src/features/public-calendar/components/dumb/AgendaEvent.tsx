import type { EventProps } from 'react-big-calendar'

import type { CalendarEvent } from '@/features/public-calendar/types/public-calendar.types'

const DEFAULT_EVENT_COLOR = '#0284C7'

export function AgendaEvent({ event, title }: EventProps<CalendarEvent>) {
  const color = event.resource.event_type?.color || DEFAULT_EVENT_COLOR

  return (
    <span className="flex items-center gap-2 min-w-0">
      <span
        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="truncate">{title}</span>
    </span>
  )
}
