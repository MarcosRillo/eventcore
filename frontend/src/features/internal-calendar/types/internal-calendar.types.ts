/**
 * Internal Calendar Types
 *
 * Type definitions for the internal calendar feature.
 * Used by entity_admin, entity_staff, and organizer_admin roles.
 */

import type { Organization as CanonicalOrganization } from '@/types/auth.types'
import type { EventStatusInfo } from '@/types/event.types'
import type { EventSubtype as CanonicalEventSubtype, EventType as CanonicalEventType } from '@/types/eventType.types'
import type { Location as CanonicalLocation } from '@/types/location.types'

/**
 * Event status codes visible in internal calendar
 */
export type InternalCalendarStatusCode =
  | 'approved_internal'
  | 'pending_public_approval'
  | 'published';

/**
 * Event status object
 */
export type EventStatus = Pick<EventStatusInfo, 'id' | 'status_code' | 'status_name' | 'description'>

/**
 * Organization object
 */
export type Organization = Pick<CanonicalOrganization, 'id' | 'name'>

/**
 * Event type object
 */
export type EventType = Pick<CanonicalEventType, 'id' | 'name' | 'color'>

/**
 * Event subtype object
 */
export type EventSubtype = Pick<CanonicalEventSubtype, 'id' | 'name'>

/**
 * Location object
 */
export type Location = Pick<CanonicalLocation, 'id' | 'name' | 'city'>

/**
 * Internal calendar event
 *
 * Represents an event visible in the internal calendar.
 * Includes minimal required fields for calendar display.
 */
export interface InternalCalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: EventStatus;
  organization: Organization;
  event_type?: EventType;
  event_subtype?: EventSubtype;
  locations?: Location[];
  featured_image?: string;
}

/**
 * Filters for internal calendar events
 *
 * All filters are optional. If no filters are provided,
 * all events visible to the user will be returned.
 */
export interface InternalCalendarFilters {
  /** Filter by specific status code */
  status?: InternalCalendarStatusCode;
  /** Filter events starting from this date (YYYY-MM-DD) */
  start_date?: string;
  /** Filter events ending before this date (YYYY-MM-DD) */
  end_date?: string;
  /** Filter by event type ID */
  event_type_id?: number;
}

/**
 * BigCalendar Event
 *
 * react-big-calendar compatible event format.
 * Extends RBC Event interface with our custom properties.
 */
export interface BigCalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: InternalCalendarEvent; // Store original event for modal
  color: string; // Hex color from event_type
  allDay?: boolean;
}

/**
 * View mode type for calendar/grid toggle
 */
export type ViewMode = 'grid' | 'calendar';

/**
 * Calendar view type for react-big-calendar
 */
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

/**
 * Internal calendar statistics
 *
 * Statistics for events with approved_internal or published status.
 * Used in StatsBar component.
 */
export interface InternalStats {
  /** Total number of approved_internal + published events */
  total_events: number;
  /** Total number of active event types with events */
  total_event_types: number;
  /** Number of events starting this month */
  events_this_month: number;
}
