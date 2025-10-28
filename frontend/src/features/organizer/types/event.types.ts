export interface OrganizerEvent {
  id: number
  title: string
  event_date: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published'
  location: string
  category?: string
  description?: string
  start_time?: string
  end_time?: string
  category_id?: number
  location_id?: number
  image_url?: string
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
  pagination: {
    total: number
    per_page: number
    current_page: number
    last_page?: number
  }
}

export interface CreateEventDto {
  title: string
  description: string
  event_date: string
  start_time: string
  end_time: string
  category_id: number
  location_id: number
  image_url?: string
}

export interface UpdateEventDto extends CreateEventDto {
  id: number
}

export interface EventFormData {
  title: string
  description: string
  event_date: string
  start_time: string
  end_time: string
  category_id: number | null
  location_id: number | null
  image_url: string
}

export interface EventFormErrors {
  title?: string
  description?: string
  event_date?: string
  start_time?: string
  end_time?: string
  category_id?: string
  location_id?: string
  image_url?: string
  general?: string
}
