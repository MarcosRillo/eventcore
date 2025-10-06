/**
 * Organizer Types
 * Type definitions for organizer-specific data structures
 */

export interface OrganizerDashboardStats {
  total_events: number;
  draft: number;
  pending_approval: number;
  approved_internal: number;
  published: number;
  requires_changes: number;
  rejected: number;
  archived: number;
}

export interface OrganizerEvent {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: {
    id: number;
    name: string;
    status_code: string;
  };
  category: {
    id: number;
    name: string;
  };
  location: {
    id: number;
    name: string;
  };
}

export interface OrganizerEventsResponse {
  data: OrganizerEvent[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface OrganizerEventFilters {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
}
