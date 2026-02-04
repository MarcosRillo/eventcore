'use client'

import type { EventProps } from 'react-big-calendar'

import type { BigCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types'

export function AgendaEvent({ event, title }: EventProps<BigCalendarEvent>) {
  return (
    <span className="flex items-center gap-2 min-w-0">
      <span
        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: event.color }}
        aria-hidden="true"
      />
      <span className="truncate">{title}</span>
    </span>
  )
}
