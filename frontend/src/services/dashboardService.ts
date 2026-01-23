/**
 * Dashboard Service
 * API service for entity admin/staff dashboard functionality
 */

import apiClient from '@/services/apiClient';

// Event metadata specific to dashboard functionality
interface EventMetadata {
  source?: string;
  tags?: string[];
  custom_fields?: Record<string, string | number | boolean>;
  external_id?: string;
}

// Approval history entry for event workflow tracking
interface ApprovalHistoryEntry {
  id: number;
  action: string;
  comment?: string;
  user_id: number;
  user_name: string;
  timestamp: string;
  previous_status?: string;
  new_status?: string;
}

export interface DashboardSummary {
  requiere_accion: number;
  pendientes: number;
  publicados: number;
  historico: number;
}

export interface EventStatus {
  id: number;
  status_code: string;
  status_name: string;
  description?: string;
}

export interface EventType {
  id: number;
  type_code: string;
  type_name: string;
}

export interface EventEntity {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface EventCategory {
  id: number;
  name: string;
  color: string;
}

export interface EventLocation {
  id: number;
  name: string;
  address: string;
  city: string;
  location_specific_notes?: string;
  max_attendees_for_location?: number;
}

export interface EventUser {
  id: number;
  name: string;
  email: string;
}

export interface CurrentStateDuration {
  value: number;
  unit: string;
  formatted: string;
}

export interface DashboardEvent {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  status: EventStatus;
  type: EventType;
  entity: EventEntity;
  category: EventCategory | null;
  is_featured: boolean;
  featured_image?: string;
  current_state_duration: CurrentStateDuration;
  is_happening: boolean;
  has_ended: boolean;
  is_upcoming: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventDetail extends DashboardEvent {
  description: string;
  locations: EventLocation[];
  virtual_link?: string;
  cta_link?: string;
  cta_text?: string;
  max_attendees?: number;
  metadata?: EventMetadata;
  approval_comments?: string;
  approval_history?: ApprovalHistoryEntry[];
  creator?: EventUser;
  approver?: EventUser;
  approved_at?: string;
  is_virtual: boolean;
  has_multiple_locations: boolean;
  has_cta: boolean;
  is_in_approval_workflow: boolean;
}

export interface DashboardEventsResponse {
  data: DashboardEvent[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface DashboardEventsParams {
  tab?: 'requires-action' | 'pending' | 'published' | 'historic';
  page?: number;
  search?: string;
}

class DashboardService {
  /**
   * Get dashboard summary with event counters
   */
  async getSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get<{
      success: boolean;
      data: DashboardSummary;
      message: string;
    }>('/dashboard/events/summary');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch dashboard summary');
    }

    return response.data.data;
  }

  /**
   * Get filtered and paginated events for dashboard
   * @param params
   */
  async getEvents(params: DashboardEventsParams = {}): Promise<DashboardEventsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.tab) searchParams.set('tab', params.tab);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.search) searchParams.set('search', params.search);

    const response = await apiClient.get<{
      success: boolean;
      data: DashboardEvent[];
      pagination: DashboardEventsResponse['pagination'];
      message: string;
    }>(`/dashboard/events?${searchParams.toString()}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch events');
    }

    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  }

  /**
   * Get detailed event information
   * @param eventId
   */
  async getEventDetail(eventId: number): Promise<EventDetail> {
    const response = await apiClient.get<{
      success: boolean;
      data: EventDetail;
      message: string;
    }>(`/events/${eventId}/detail`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch event detail');
    }

    return response.data.data;
  }
}

export const dashboardService = new DashboardService();