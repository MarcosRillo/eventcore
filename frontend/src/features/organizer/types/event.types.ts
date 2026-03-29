/**
 * Organizer Event Types
 *
 * Updated for 3NF normalized schema (Nov 30, 2025).
 * All string fields have been replaced with FK IDs to lookup tables.
 */

// ==========================================
// LOOKUP TABLE TYPES (3NF Normalized)
// ==========================================

export interface EventSubtype {
  id: number
  code: string
  name: string
  is_active: boolean
  display_order: number
}

/**
 * EventType - Hierarchical event categorization (Dec 2, 2025)
 * This is different from the old "type" concept (sede_unica/multi_sede)
 */
export interface EventTypeHierarchical {
  id: number
  name: string
  slug: string
  description?: string
  is_active: boolean
  subtypes_count?: number
  created_at?: string
  updated_at?: string
}

/**
 * EventSubtype - Child of EventTypeHierarchical (Dec 2, 2025)
 */
export interface EventSubtypeHierarchical {
  id: number
  event_type_id: number
  name: string
  slug: string
  description?: string
  is_active: boolean
  event_type?: EventTypeHierarchical
  created_at?: string
  updated_at?: string
}

export interface EventRoom {
  id: number
  location_id: number
  code: string
  name: string
  capacity?: number
  description?: string
  is_active: boolean
}

export interface EventAsyncDate {
  id?: number
  date_value: string
  notes?: string
}

export interface EventProducer {
  id: number
  name: string
}

// ==========================================
// ORGANIZER EVENT INTERFACES
// ==========================================

export interface OrganizerEvent {
  id: number
  title: string
  description?: string
  start_date: string
  end_date?: string

  // Status (can be string or object from backend)
  status: 'draft' | 'pending_internal_approval' | 'approved_internal' | 'pending_public_approval' | 'published' | 'requires_changes' | 'rejected' | 'cancelled' | {
    id: number
    status_code: string
    status_name: string
  }

  // Type
  type?: {
    id: number
    type_code: string
    type_name: string
  }

  // Relationships (loaded with eager loading)
  locations?: Array<{
    id: number
    name: string
    slug?: string
    city?: string
  }>

  // Normalized FK fields (3NF)
  type_id?: number
  edition_number?: string
  subtype_id?: number
  producer_id?: number

  // Event Type/Subtype (hierarchical categorization - Dec 2, 2025)
  event_type_id?: number
  event_subtype_id?: number

  // Loaded relations
  subtype?: EventSubtype
  producer?: EventProducer

  // Event Type/Subtype relations (Dec 2, 2025)
  event_type?: EventTypeHierarchical
  event_subtype?: EventSubtypeHierarchical

  // Rooms (many-to-many)
  rooms?: EventRoom[]

  // Location info (kept in events)
  custom_location_name?: string
  maps_url?: string
  previous_venue?: string
  next_venue?: string

  // Async dates (normalized table)
  async_dates?: EventAsyncDate[]

  // Attendance
  local_attendance?: number
  national_attendance?: number
  international_attendance?: number
  virtual_transmission?: boolean

  // Additional info
  event_website?: string

  // Images
  logo_url?: string
  featured_image?: string
  responsive_image_url?: string
  is_featured?: boolean

  created_at?: string
  updated_at?: string
}

export interface EventListParams {
  page?: number
  per_page?: number
  status?: string | null
  search?: string
  show_past?: '0' | '1'  // Filter for past events ('1' = show past, undefined = show upcoming)
}

export interface EventListResponse {
  data: OrganizerEvent[]
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number | null
  to: number | null
  path?: string
  first_page_url?: string
  last_page_url?: string
  next_page_url?: string | null
  prev_page_url?: string | null
}

/**
 * DTO for creating events (3NF schema)
 */
export interface CreateEventDto {
  // Required fields
  title: string
  description: string
  start_date: string  // ISO 8601 format: YYYY-MM-DDTHH:MM:SS
  end_date?: string   // ISO 8601 format: YYYY-MM-DDTHH:MM:SS
  location_ids: number[]  // Required: at least one location
  type_id?: number

  // Event Type/Subtype (hierarchical categorization - Dec 2, 2025) - REQUIRED
  event_type_id: number
  event_subtype_id: number

  // Basic information (string field for edition)
  edition_number?: string

  // Normalized FK fields (optional, nullable in DB)
  subtype_id?: number
  producer_id?: number

  // Rooms (many-to-many via pivot table)
  room_ids?: number[]

  // Location info (kept in events)
  custom_location_name?: string     // Custom location name (when "Otro" is selected)
  maps_url?: string
  previous_venue?: string
  next_venue?: string

  // Async dates (normalized table)
  async_dates?: Array<{
    date: string
    notes?: string
  }>

  // Attendance
  local_attendance?: number
  national_attendance?: number
  international_attendance?: number
  virtual_transmission?: boolean

  // Additional info
  event_website?: string

  // Images
  logo_url?: string
  featured_image?: string
  responsive_image_url?: string
  is_featured?: boolean
}

export interface UpdateEventDto extends CreateEventDto {
  id: number
}

/**
 * Async date for events with non-consecutive dates
 */
export interface AsynchronousDate {
  id?: number
  date: string
  notes?: string
}

/**
 * Form data interface for event forms (3NF schema)
 */
export interface EventFormData {
  // Basic information
  title: string
  description: string
  edition_number: string

  // Event Type/Subtype (hierarchical categorization - Dec 2, 2025) - REQUIRED
  event_type_id: number | null
  event_subtype_id: number | null

  // FK references (IDs)
  type_id: number | null
  subtype_id: number | null
  producer_id: number | null

  // Rooms (array of IDs)
  room_ids: number[]

  // Location info
  location_ids: number[]
  has_custom_location: boolean      // Toggle for "Otro" custom location
  custom_location_name: string      // Name of custom location (when "Otro" is checked)
  maps_url: string                  // Google Maps URL (only shown when has_custom_location)
  previous_venue: string
  next_venue: string

  // Dates
  start_date: string
  end_date: string
  async_dates: AsynchronousDate[]

  // Attendance
  local_attendance: string  // String for form input, converted to number on submit
  national_attendance: string
  international_attendance: string
  virtual_transmission: boolean

  // Additional info
  event_website: string

  // Images
  featured_image: string
  featured_image_file: File | null
}

/**
 * Form validation errors interface (3NF schema)
 */
export interface EventFormErrors {
  // Basic info
  title?: string
  description?: string
  edition_number?: string

  // Event Type/Subtype (hierarchical categorization - Dec 2, 2025)
  event_type_id?: string
  event_subtype_id?: string

  // FK references
  type_id?: string
  subtype_id?: string
  producer_id?: string

  // Location
  location_ids?: string
  custom_location_name?: string     // Error for custom location name
  maps_url?: string
  previous_venue?: string
  next_venue?: string
  location?: string  // Submit validation error

  // Dates
  start_date?: string
  end_date?: string
  async_dates?: string

  // Attendance
  local_attendance?: string
  national_attendance?: string
  international_attendance?: string

  // Additional info
  event_website?: string

  // Images
  featured_image?: string
  featured_image_file?: string

  // General error
  general?: string
}

/**
 * Response from submit endpoint
 */
export interface SubmitEventResponse {
  message: string
  status: string
  event: OrganizerEvent
}

/**
 * Error response from submit endpoint (validation errors)
 */
export interface SubmitEventError {
  error: string
  errors: Record<string, string>
}

/**
 * Lookup tables data for forms
 */
export interface EventLookupTables {
  subtypes: EventSubtype[]
  rooms: EventRoom[]
}
