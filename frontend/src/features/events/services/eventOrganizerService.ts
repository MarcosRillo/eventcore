/**
 * Event Organizer Service
 * 
 * Specialized service for organizer_admin role.
 * Provides limited CRUD operations for organizers to manage only their own events.
 */

import { OrganizerEventService } from '@/features/events/services/types';
import apiClient from '@/services/apiClient';
import {
  Event,
  EventFormData,
  EventMessage,
  EventPagination,
  EventTemplate} from '@/types/event.types';
import { OrganizerEventFilters } from '@/types/filter.types';

// ExtendedOrganizerEventFilters eliminated - consolidated into OrganizerEventFilters

/**
 * Organizer event statistics
 */
export interface OrganizerStatistics {
  total_events: number;
  draft_events: number;
  submitted_events: number;
  approved_events: number;
  published_events: number;
  rejected_events: number;
  total_views: number;
  upcoming_events: number;
  past_events: number;
  
  // Monthly breakdown
  monthly_stats: {
    month: string;
    events_created: number;
    events_published: number;
    total_views: number;
  }[];

  // Event type breakdown
  event_type_breakdown: {
    event_type: string;
    event_subtype?: string;
    count: number;
  }[];
}

/**
 * Organizer event service operations
 */
export const eventOrganizerService: Omit<OrganizerEventService, 'communication' | 'getEvents' | 'getEvent'> & {
  getMyEvents: (filters?: OrganizerEventFilters) => Promise<EventPagination>;
  getMyEvent: (id: number) => Promise<Event>;
} = {
  /**
   * Get organizer's own events
   * @param filters
   */
  async getMyEvents(filters: OrganizerEventFilters = {}): Promise<EventPagination> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get(`/organizer/events?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single event owned by the organizer
   * @param id
   */
  async getMyEvent(id: number): Promise<Event> {
    const response = await apiClient.get(`/organizer/events/${id}`);
    return response.data.data;
  },

  /**
   * Create a new event as organizer
   * @param data
   */
  async createEvent(data: EventFormData): Promise<Event> {
    const payload = {
      ...data,
      status: 'draft', // Organizers always start with draft
      end_date: data.end_date || data.start_date,
    };

    const response = await apiClient.post('/organizer/events', payload);
    return response.data.data;
  },

  /**
   * Update organizer's own event (only if not published)
   * @param id
   * @param data
   */
  async updateEvent(id: number, data: Partial<EventFormData>): Promise<Event> {
    const payload = {
      ...data,
      ...(data.start_date && !data.end_date && { end_date: data.start_date }),
    };

    const response = await apiClient.put(`/organizer/events/${id}`, payload);
    return response.data.data;
  },

  /**
   * Delete organizer's own event (only if draft or rejected)
   * @param id
   */
  async deleteEvent(id: number): Promise<void> {
    await apiClient.delete(`/organizer/events/${id}`);
  },

  /**
   * Duplicate organizer's own event
   * @param id
   * @param overrides
   */
  async duplicateEvent(id: number, overrides: Partial<EventFormData> = {}): Promise<Event> {
    const response = await apiClient.post(`/organizer/events/${id}/duplicate`, overrides);
    return response.data.data;
  },

  /**
   * Submit event for approval
   * @param id
   * @param comment
   */
  async submitForApproval(id: number, comment?: string): Promise<Event> {
    const response = await apiClient.post(`/organizer/events/${id}/submit`, { comment });
    return response.data.data;
  },




  /**
   * Save event as template
   * @param id
   * @param templateName
   */
  async saveAsTemplate(id: number, templateName: string): Promise<EventTemplate> {
    const response = await apiClient.post(`/organizer/events/${id}/save-template`, {
      name: templateName,
    });
    return response.data.data;
  },

  /**
   * Get organizer's event templates
   */
  async getMyTemplates(): Promise<EventTemplate[]> {
    const response = await apiClient.get('/organizer/templates');
    return response.data.data;
  },

};

/**
 * Organizer communication service
 */
export const eventOrganizerCommunicationService = {
  /**
   * Send message to admin about an event
   * @param eventId
   * @param subject
   * @param message
   */
  async sendMessageToAdmin(eventId: number, subject: string, message: string): Promise<void> {
    await apiClient.post(`/organizer/events/${eventId}/message`, {
      subject,
      message,
    });
  },

  /**
   * Get messages/communications about events
   * @param filters
   * @param filters.event_id
   */
  async getEventMessages(filters?: { event_id?: number }): Promise<EventMessage[]> {
    const eventId = filters?.event_id;
    const endpoint = eventId
      ? `/organizer/events/${eventId}/messages`
      : '/organizer/messages';
    const response = await apiClient.get(endpoint);
    return response.data.data;
  },

  /**
   * Mark message as read
   * @param messageId
   */
  async markMessageAsRead(messageId: number): Promise<void> {
    await apiClient.post(`/organizer/messages/${messageId}/read`);
  },

  /**
   * Get unread messages count
   */
  async getUnreadMessagesCount(): Promise<number> {
    const response = await apiClient.get('/organizer/messages/unread-count');
    return response.data.count;
  },
};

/**
 * Combined organizer event service with interface compatibility
 */
export const combinedEventOrganizerService: OrganizerEventService = {
  ...eventOrganizerService,

  // Required base interface methods (delegate to organizer-specific methods)
  getEvents: async (filters?: OrganizerEventFilters) => {
    return eventOrganizerService.getMyEvents(filters); // No casting needed
  },
  getEvent: async (id: number) => {
    return eventOrganizerService.getMyEvent(id);
  },

  communication: eventOrganizerCommunicationService,
};

export default combinedEventOrganizerService;