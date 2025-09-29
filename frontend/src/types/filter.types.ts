/**
 * Filter Types - Ultra-Aggressive Consolidation
 *
 * Generic filter system reducing 11 interfaces to 1 universal pattern
 */

import { EventStatusCode, EventTypeCode } from '@/types/event.types';

/**
 * Universal filter interface using Record pattern
 * Replaces ALL specific filter interfaces
 */
export interface UniversalFilters extends Record<string, unknown> {
  // Base pagination
  page?: number;
  per_page?: number;
  limit?: number;

  // Universal search
  search?: string;

  // Date ranges (all variations)
  start_date?: string;
  end_date?: string;
  date_from?: string;
  date_to?: string;
  month?: string;
  year?: string;

  // Entity relationships
  category_id?: number;
  location_id?: number;
  event_id?: number;
  user_id?: number;
  created_by?: number;
  approved_by?: number;
  organizer_id?: number;
  from_user?: number;
  to_user?: number;

  // Status and type
  status?: EventStatusCode;
  type?: EventTypeCode;
  is_featured?: boolean;
  is_active?: boolean;

  // Boolean flags (all variations)
  featured_only?: boolean;
  my_events_only?: boolean;
  draft_only?: boolean;
  submitted_only?: boolean;
  approved_only?: boolean;
  requires_changes_only?: boolean;
  upcoming_only?: boolean;
  past_events?: boolean;
  this_week?: boolean;
  this_month?: boolean;
  recently_used?: boolean;
  unread_only?: boolean;
  active?: boolean;

  // Location-specific
  near_location?: string;
  within_radius?: number;
  city?: string;

  // Sorting
  sort_by?: 'date' | 'popularity' | 'featured' | 'name' | string;
  sort_order?: 'asc' | 'desc';

  // Export specific
  format?: 'csv' | 'xlsx' | 'pdf' | 'rss' | 'ical';
  include_fields?: string[];
  date_format?: 'iso' | 'local' | 'timestamp';
}

// Type aliases for backward compatibility - ALL use the same universal type
export type PublicEventFilters = UniversalFilters;
export type OrganizerEventFilters = UniversalFilters;
export type AdminEventFilters = UniversalFilters;
export type EventFilters = UniversalFilters;
export type EventExportFilters = UniversalFilters;
export type FeedFilters = UniversalFilters;
export type EventTemplateFilters = UniversalFilters;
export type EventMessageFilters = UniversalFilters;
export type CategoryFilters = UniversalFilters;
export type LocationFilters = UniversalFilters;