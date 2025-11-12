/**
 * TypeScript interfaces for public calendar
 */

export interface PublicEvent {
  id: number
  title: string
  description: string
  start_date: string
  end_date: string
  start_time?: string
  end_time?: string
  category: {
    id: number
    name: string
  }
  locations: Array<{
    id: number
    name: string
    city: string
    address?: string
  }>
  is_featured: boolean
  image_url?: string
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

export interface Category {
  id: number
  name: string
}

export interface Location {
  id: number
  name: string
  city: string
}

export interface EventFilters {
  category_id?: number | null
  location_id?: number | null
  start_date?: string | null
  end_date?: string | null
  search?: string | null
}
