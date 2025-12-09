/**
 * Internal Calendar Types
 *
 * Type definitions for the internal calendar feature.
 * Used by entity_admin, entity_staff, and organizer_admin roles.
 */

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
export interface EventStatus {
  id: number;
  status_code: string;
  name: string;
}

/**
 * Organization object
 */
export interface Organization {
  id: number;
  name: string;
}

/**
 * Event type object
 */
export interface EventType {
  id: number;
  name: string;
  color: string; // Hex color code (e.g., "#FF5733")
}

/**
 * Event subtype object
 */
export interface EventSubtype {
  id: number;
  name: string;
}

/**
 * Location object
 */
export interface Location {
  id: number;
  name: string;
  city: string;
}

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
  eventType?: EventType;
  eventSubtype?: EventSubtype;
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
