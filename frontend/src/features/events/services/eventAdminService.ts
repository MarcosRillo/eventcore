/**
 * Event Admin Service
 * 
 * Specialized service for entity_admin and entity_staff roles.
 * Provides complete CRUD operations, approval workflow, and administrative features.
 */

import apiClient from '@/services/apiClient';
import {
  Event,
  EventFormData,
  EventFilters,
  EventPagination,
  EventStatistics,
  ApprovalStatistics,
  EventStatus
} from '@/types/event.types';
import { AdminEventService } from './types';

/**
 * Admin-level event CRUD operations
 */
export const eventAdminService: Omit<AdminEventService, 'approval'> = {
  /**
   * Get paginated list of all events in organization with advanced filters
   */
  async getEvents(filters: EventFilters = {}): Promise<EventPagination> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/events?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single event by ID
   */
  async getEvent(id: number): Promise<Event> {
    const response = await apiClient.get(`/events/${id}`);
    return response.data.data;
  },

  /**
   * Create a new event
   */
  async createEvent(data: EventFormData): Promise<Event> {
    const payload = {
      ...data,
      status: 'draft', // Default status for new events
      end_date: data.end_date || data.start_date,
    };

    const response = await apiClient.post('/events', payload);
    return response.data.data;
  },

  /**
   * Update an existing event
   */
  async updateEvent(id: number, data: Partial<EventFormData>): Promise<Event> {
    const payload = {
      ...data,
      ...(data.start_date && !data.end_date && { end_date: data.start_date }),
    };

    const response = await apiClient.put(`/events/${id}`, payload);
    return response.data.data;
  },

  /**
   * Delete an event
   */
  async deleteEvent(id: number): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },

  /**
   * Bulk delete events
   */
  async bulkDeleteEvents(eventIds: number[]): Promise<void> {
    await apiClient.post('/events/bulk-delete', { event_ids: eventIds });
  },

  /**
   * Duplicate an event
   */
  async duplicateEvent(id: number, overrides: Partial<EventFormData> = {}): Promise<Event> {
    const response = await apiClient.post(`/events/${id}/duplicate`, overrides);
    return response.data.data;
  },


  /**
   * Toggle featured status
   */
  async toggleFeatured(id: number): Promise<Event> {
    const response = await apiClient.patch(`/events/${id}/toggle-featured`);
    return response.data.data;
  },

  /**
   * Bulk update event status
   */
  async bulkUpdateStatus(eventIds: number[], status: EventStatus, comment?: string): Promise<Event[]> {
    const response = await apiClient.post('/events/bulk-update-status', {
      event_ids: eventIds,
      status,
      comment,
    });
    return response.data.data;
  },

  /**
   * Export events to various formats
   */
  async exportEvents(filters: EventFilters = {}, format: 'csv' | 'xlsx' | 'pdf' = 'csv'): Promise<Blob> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/events/export/${format}?${params.toString()}`, {
      responseType: 'blob',
    });
    
    return response.data;
  },

  /**
   * Get event statistics
   */
  async getStatistics(): Promise<EventStatistics> {
    const response = await apiClient.get('/events/statistics');
    return response.data;
  },

};

/**
 * Admin-level approval workflow operations
 */
export const eventAdminApprovalService = {
  /**
   * Get events by approval status with admin filters
   */
  async getEventsByStatus(status: EventStatus, filters: EventFilters = {}): Promise<EventPagination> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/events/approval-status/${status}?${params.toString()}`);
    return response.data;
  },

  /**
   * Get approval workflow statistics
   */
  async getApprovalStatistics(): Promise<ApprovalStatistics> {
    const response = await apiClient.get('/events/approval/statistics');
    return response.data;
  },

  /**
   * Approve event for internal use
   */
  async approveInternal(eventId: number, comment?: string): Promise<Event> {
    const response = await apiClient.post(`/events/${eventId}/approve-internal`, comment ? { comment } : {});
    return response.data.data;
  },

  /**
   * Request public approval for an internally approved event
   */
  async requestPublic(eventId: number, comment?: string): Promise<Event> {
    const response = await apiClient.post(`/events/${eventId}/request-public`, comment ? { comment } : {});
    return response.data.data;
  },

  /**
   * Approve event for public publication
   */
  async approvePublic(eventId: number, comment?: string): Promise<Event> {
    const response = await apiClient.post(`/events/${eventId}/approve-public`, comment ? { comment } : {});
    return response.data.data;
  },

  /**
   * Request changes to an event
   */
  async requestChanges(eventId: number, comment: string): Promise<Event> {
    const response = await apiClient.post(`/events/${eventId}/request-changes`, { comment });
    return response.data.data;
  },

  /**
   * Reject an event
   */
  async rejectEvent(eventId: number, comment: string): Promise<Event> {
    const response = await apiClient.post(`/events/${eventId}/reject`, { comment });
    return response.data.data;
  },

  /**
   * Bulk approve events
   */
  async bulkApproveInternal(eventIds: number[], comment?: string): Promise<Event[]> {
    const response = await apiClient.post('/events/bulk-approve-internal', {
      event_ids: eventIds,
      comment,
    });
    return response.data.data;
  },

  /**
   * Bulk approve for public
   */
  async bulkApprovePublic(eventIds: number[], comment?: string): Promise<Event[]> {
    const response = await apiClient.post('/events/bulk-approve-public', {
      event_ids: eventIds,
      comment,
    });
    return response.data.data;
  },

  /**
   * Bulk reject events
   */
  async bulkReject(eventIds: number[], comment: string): Promise<Event[]> {
    const response = await apiClient.post('/events/bulk-reject', {
      event_ids: eventIds,
      comment,
    });
    return response.data.data;
  },

  /**
   * Get approval history for an event
   */
  async getApprovalHistory(eventId: number): Promise<{
    id: number;
    event_id: number;
    action: string;
    status_from: EventStatus;
    status_to: EventStatus;
    comment?: string;
    user: { id: number; name: string };
    created_at: string;
  }[]> {
    const response = await apiClient.get(`/events/${eventId}/approval-history`);
    return response.data.data;
  },

  /**
   * Get events pending admin approval
   */
  async getPendingApprovals(filters: EventFilters = {}): Promise<EventPagination> {
    return this.getEventsByStatus('pending_internal_approval', filters);
  },

  /**
   * Get events pending public approval
   */
  async getPendingPublicApprovals(filters: EventFilters = {}): Promise<EventPagination> {
    return this.getEventsByStatus('pending_public_approval', filters);
  },

  /**
   * Auto-approve events based on criteria
   */
  async autoApprove(criteria: {
    category_ids?: number[];
    organizer_ids?: number[];
    location_ids?: number[];
    max_days_old?: number;
  }): Promise<{ approved: number; skipped: number }> {
    const response = await apiClient.post('/events/auto-approve', criteria);
    return response.data;
  },
};

/**
 * Combined admin event service
 */
export const combinedEventAdminService: AdminEventService = {
  ...eventAdminService,
  approval: eventAdminApprovalService,
};

export default combinedEventAdminService;