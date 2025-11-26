export interface OrganizerEvent {
  id: number
  title: string
  description?: string
  start_date: string  // Backend uses start_date now
  end_date?: string

  // Status (can be string or object from backend)
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published' | {
    id: number
    status_code: string
    status_name: string
  }

  // Relationships (loaded with eager loading)
  category?: {
    id: number
    name: string
    slug: string
    color?: string
  }

  locations?: Array<{
    id: number
    name: string
    slug?: string
  }>

  // Legacy fields (for backward compatibility)
  category_id?: number
  location_id?: number
  location?: string  // Legacy string field
  event_date?: string  // Legacy date field
  start_time?: string
  end_time?: string
  image_url?: string
  featured_image?: string
  created_at?: string
  updated_at?: string
}

export interface EventListParams {
  page?: number
  per_page?: number
  status?: string | null
}

export interface EventListResponse {
  data: OrganizerEvent[]
  // Laravel Paginator fields (flat structure)
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

export interface CreateEventDto {
  // Campos básicos requeridos
  title: string
  description: string
  start_date: string  // ISO 8601 format: YYYY-MM-DDTHH:MM:SS
  end_date: string    // ISO 8601 format: YYYY-MM-DDTHH:MM:SS
  category_id: number
  location_ids: number[]  // Backend expects array of location IDs

  // Información Básica
  edition_number?: string
  event_type?: string
  event_subtype?: string
  origin?: string
  theme?: string
  frequency?: string
  rotation_type?: string

  // Servicios y Catering
  coffee_break?: boolean
  lunch_catering?: boolean
  dinner_catering?: boolean
  pre_event_package?: boolean
  post_event_package?: boolean

  // Ubicación
  venue?: string
  city?: string
  rooms_used?: string
  maps_url?: string
  previous_venue?: string
  next_venue?: string

  // Fechas Asincrónicas
  asynchronous_dates?: Array<{
    date: string
    start_time: string
    end_time: string
  }>

  // Asistencia
  local_attendance?: number
  national_attendance?: number
  international_attendance?: number
  virtual_transmission?: boolean

  // Información Adicional
  producer?: string
  event_website?: string

  // Imágenes
  logo_url?: string
  featured_image?: string
  responsive_image_url?: string

  // Campos legacy (mantener compatibilidad)
  type_id?: number
  max_attendees?: number
  virtual_link?: string
  cta_link?: string
  cta_text?: string
}

export interface UpdateEventDto extends CreateEventDto {
  id: number
}

// Fecha asincrónica para eventos que ocurren en días no consecutivos
export interface AsynchronousDate {
  id?: string  // ID temporal para el frontend
  date: string
  start_time: string
  end_time: string
}

export interface EventFormData {
  // Información Básica
  title: string
  edition_number: string
  description: string
  event_type: string
  event_subtype: string
  origin: string
  theme: string
  frequency: string
  rotation_type: string

  // Servicios y Catering
  coffee_break: boolean
  lunch_catering: boolean
  dinner_catering: boolean
  pre_event_package: boolean
  post_event_package: boolean

  // Ubicación
  venue: string
  city: string
  rooms_used: string
  maps_url: string
  previous_venue: string
  next_venue: string

  // Fechas y Horarios
  event_date: string  // Fecha desde
  end_date: string    // Fecha hasta
  start_time: string
  end_time: string
  asynchronous_dates: AsynchronousDate[]  // Fechas asincrónicas

  // Asistencia
  local_attendance: string
  national_attendance: string
  international_attendance: string
  virtual_transmission: boolean

  // Información Adicional
  producer: string
  event_website: string

  // Imágenes
  logo_url: string
  image_url: string
  responsive_image_url: string

  // Campos legacy (mantener compatibilidad)
  category_id: number | null
  location_id: number | null
}

export interface EventFormErrors {
  // Información Básica
  title?: string
  edition_number?: string
  description?: string
  event_type?: string
  event_subtype?: string
  origin?: string
  theme?: string
  frequency?: string
  rotation_type?: string

  // Ubicación
  venue?: string
  city?: string
  rooms_used?: string
  maps_url?: string
  previous_venue?: string
  next_venue?: string

  // Fechas y Horarios
  event_date?: string
  end_date?: string
  start_time?: string
  end_time?: string
  asynchronous_dates?: string

  // Asistencia
  local_attendance?: string
  national_attendance?: string
  international_attendance?: string

  // Información Adicional
  producer?: string
  event_website?: string

  // Imágenes
  logo_url?: string
  image_url?: string
  responsive_image_url?: string

  // Campos legacy
  category_id?: string
  location_id?: string

  // Error general
  general?: string
}
