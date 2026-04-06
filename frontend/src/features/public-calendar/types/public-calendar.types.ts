/**
 * TypeScript interfaces for public calendar
 */

import type { EventSubtype as CanonicalEventSubtype, EventType as CanonicalEventType } from '@/types/eventType.types'
import type { Location as CanonicalLocation } from '@/types/location.types'

export type EventType = Pick<CanonicalEventType, 'id' | 'name' | 'is_active'> & {
  slug?: string
  color?: string
  icon?: string | null
}

export type EventSubtype = Pick<CanonicalEventSubtype, 'id' | 'name' | 'event_type_id' | 'is_active'> & {
  slug?: string
}

export interface PublicEvent {
  id: number
  title: string
  description: string
  start_date: string
  end_date: string
  start_time?: string
  end_time?: string
  event_type: {
    id: number
    name: string
    color?: string
    icon?: string | null
  }
  event_subtype?: {
    id: number
    name: string
    event_type_id: number
  }
  locations: Array<{
    id: number
    name: string
    city: string
    address?: string
  }>
  is_featured: boolean
  featured_image?: string
}

export interface EventsResponse {
  data: PublicEvent[]
  meta: {
    current_page: number
    total: number
    per_page: number
  }
}

export type Location = Pick<CanonicalLocation, 'id' | 'name' | 'city'>

export interface PublicCalendarFilters {
  event_type_id?: number | null
  event_subtype_id?: number | null
  location_id?: number | null
  start_date?: string | null
  end_date?: string | null
  search?: string | null
}

// Backward compatibility alias
export type EventFilters = PublicCalendarFilters

/**
 * Calendar Event for react-big-calendar
 * Transforms PublicEvent to format expected by calendar library
 */
export interface CalendarEvent {
  id: number
  title: string
  start: Date
  end: Date
  resource: PublicEvent
}

export type CalendarView = 'month' | 'week' | 'day' | 'agenda'

/**
 * Public stats response from API
 */
export interface PublicStats {
  total_events: number
  total_event_types: number
  events_this_month: number
}
