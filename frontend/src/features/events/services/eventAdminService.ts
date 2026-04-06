/**
 * Event Admin Service
 * 
 * Specialized service for entity_admin and entity_staff roles.
 * Provides complete CRUD operations, approval workflow, and administrative features.
 */

import { approvalService } from '@/features/events/services/approvalService';
import type { AdminEventService } from '@/features/events/services/types';
import apiClient from '@/services/apiClient';
import type { PaginatedResponse } from '@/types/api-response.types';
import type {
  Event,
  EventFormData,
  EventStatistics,
  EventStatus,
} from '@/types/event.types';
import type { EventFilters } from '@/types/filter.types';

/**
 * Admin-level event CRUD operations
 */
export const eventAdminService: Omit<AdminEventService, 'approval'> = {
  /**
   * Get paginated list of all events in organization with advanced filters
   * @param filters
   */
  async getEvents(filters: EventFilters = {}): Promise<PaginatedResponse<Event>> {
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
   * @param id
   */
  async getEvent(id: number): Promise<Event> {
    const response = await apiClient.get(`/events/${id}`);
    return response.data.data;
  },

  /**
   * Create a new event
   * @param data
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
   * @param id
   * @param data
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
   * @param id
   */
  async deleteEvent(id: number): Promise<void> {
    await apiClient.delete(`/events/${id}`);
  },

  /**
   * Bulk delete events
   * @param eventIds
   */
  async bulkDeleteEvents(eventIds: number[]): Promise<void> {
    await apiClient.post('/events/bulk-delete', { event_ids: eventIds });
  },

  /**
   * Duplicate an event
   * @param id
   * @param overrides
   */
  async duplicateEvent(id: number, overrides: Partial<EventFormData> = {}): Promise<Event> {
    const response = await apiClient.post(`/events/${id}/duplicate`, overrides);
    return response.data.data;
  },


  /**
   * Toggle featured status
   * @param id
   */
  async toggleFeatured(id: number): Promise<Event> {
    const response = await apiClient.patch(`/events/${id}/toggle-featured`);
    return response.data.data;
  },

  /**
   * Bulk update event status
   * @param eventIds
   * @param status
   * @param comment
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
   * @param filters
   * @param format
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
 * Combined admin event service
 */
export const combinedEventAdminService: AdminEventService = {
  ...eventAdminService,
  approval: approvalService,
};

export default combinedEventAdminService;