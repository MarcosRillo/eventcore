export interface OrganizerEvent {
  id: number
  title: string
  event_date: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'published'
  location: string
  category?: string
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
