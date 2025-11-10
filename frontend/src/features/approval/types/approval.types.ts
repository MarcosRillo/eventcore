/**
 * TypeScript interfaces for approval feature
 */

export interface AdminStats {
  pending: number
  approved: number
  published: number
  rejected: number
  total: number
}

export interface Event {
  id: number
  title: string
  description?: string
  status: EventStatus
  organizer: string
  category_id: number
  location_id: number
  start_date: string
  end_date?: string
  created_at?: string
}

export type EventStatus =
  | 'draft'
  | 'pending_internal'
  | 'approved_internal'
  | 'published'
  | 'rejected'
  | 'requires_changes'

export interface EventsResponse {
  data: Event[]
  meta: {
    current_page: number
    total: number
    per_page?: number
  }
}
