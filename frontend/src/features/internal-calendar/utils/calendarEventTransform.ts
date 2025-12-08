/**
 * Calendar Event Transform Utilities
 *
 * Transforms InternalCalendarEvent to react-big-calendar compatible format.
 * Created following TDD methodology (tests written first).
 */

import type {
  InternalCalendarEvent,
  BigCalendarEvent,
} from '@/features/internal-calendar/types/internal-calendar.types'

/**
 * Default fallback color for events without eventType or color
 */
const DEFAULT_EVENT_COLOR = '#3B82F6' // Blue-500 from Tailwind

/**
 * Transforms a single InternalCalendarEvent to BigCalendarEvent format.
 *
 * @param event - The internal calendar event to transform
 * @returns BigCalendarEvent compatible with react-big-calendar
 *
 * @example
 * ```typescript
 * const bigCalendarEvent = transformToBigCalendarEvent(internalEvent)
 * // { id: 1, title: "Event", start: Date, end: Date, color: "#FF5733", resource: {...} }
 * ```
 */
export function transformToBigCalendarEvent(
  event: InternalCalendarEvent
): BigCalendarEvent {
  return {
    id: event.id,
    title: event.title,
    start: new Date(event.start_date),
    end: new Date(event.end_date),
    resource: event,
    color: event.eventType?.color || DEFAULT_EVENT_COLOR,
  }
}

/**
 * Transforms an array of InternalCalendarEvents to BigCalendarEvent format.
 *
 * @param events - Array of internal calendar events to transform
 * @returns Array of BigCalendarEvents compatible with react-big-calendar
 *
 * @example
 * ```typescript
 * const bigCalendarEvents = transformToBigCalendarEvents(internalEvents)
 * // [{ id: 1, ... }, { id: 2, ... }]
 * ```
 */
export function transformToBigCalendarEvents(
  events: InternalCalendarEvent[]
): BigCalendarEvent[] {
  return events.map(transformToBigCalendarEvent)
}
