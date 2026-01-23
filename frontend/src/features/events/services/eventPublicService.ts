/**
 * Event Public Service
 * 
 * Specialized service for public calendar views.
 * Provides read-only access to published events with public-focused features.
 */

import { PublicEventService } from '@/features/events/services/types';
import publicApiClient from '@/services/publicApiClient';
import {
  Event,
  EventPagination,
} from '@/types/event.types';
import { PublicEventFilters } from '@/types/filter.types';

// ExtendedPublicEventFilters eliminated - consolidated into PublicEventFilters in filter.types.ts

/**
 * Public event service operations
 */
export const eventPublicService: Omit<PublicEventService, 'export'> = {
  /**
   * Get paginated list of events (alias for public events)
   * @param filters
   */
  async getEvents(filters: PublicEventFilters = {}): Promise<EventPagination> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await publicApiClient.get(`/public/events?${params.toString()}`);
    return response.data;
  },

  /**
   * Get single event (alias for public event)
   * @param id
   */
  async getEvent(id: number): Promise<Event> {
    const response = await publicApiClient.get(`/public/events/${id}`);
    return response.data.data;
  },

  /**
   * Get paginated list of published events for public view
   * Uses new public events endpoint without authentication
   * @param filters
   */
  async getPublicEvents(filters: PublicEventFilters = {}): Promise<EventPagination> {
    const params = new URLSearchParams();
    
    // Map public filters to public API parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await publicApiClient.get(`/public/events?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single published event by ID or slug
   * @param identifier
   */
  async getPublicEvent(identifier: number | string): Promise<Event> {
    const response = await publicApiClient.get(`/public/events/${identifier}`);
    return response.data.data;
  },

  /**
   * Search events with full-text search
   * @param query
   * @param filters
   */
  async searchEvents(query: string, filters: PublicEventFilters = {}): Promise<EventPagination> {
    const params = new URLSearchParams();
    params.append('q', query);
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await publicApiClient.get(`/public/events/search?${params.toString()}`);
    return response.data;
  },

  /**
   * Get featured events
   * @param limit
   */
  async getFeaturedEvents(limit: number = 6): Promise<Event[]> {
    const response = await publicApiClient.get(`/public/events/featured?limit=${limit}`);
    return response.data.data;
  },

  /**
   * Get popular events based on views/attendance
   * Note: No public popular events endpoint available - method removed
   */

  /**
   * Get upcoming events
   * @param limit
   */
  async getUpcomingEvents(limit: number = 10): Promise<Event[]> {
    const response = await publicApiClient.get(`/public/events/upcoming?limit=${limit}`);
    return response.data.data;
  },

  // Only interface-defined methods remain
};

/**
 * RSS and Calendar Export service
 */
export const eventPublicExportService = {
  /**
   * Get RSS feed URL for public events
   * @param filters
   */
  getRSSFeedUrl(filters: PublicEventFilters = {}): string {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${baseUrl}/api/public/events/rss?${params.toString()}`;
  },

  /**
   * Get iCal URL for public events
   * @param filters
   */
  getICalUrl(filters: PublicEventFilters = {}): string {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${baseUrl}/api/public/events/ical?${params.toString()}`;
  },

  /**
   * Get iCal URL for a specific event
   * @param eventId
   */
  getEventICalUrl(eventId: number): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${baseUrl}/api/public/events/${eventId}/ical`;
  },

  /**
   * Download events as iCal file
   * @param filters
   */
  async downloadICalFile(filters: PublicEventFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await publicApiClient.get(`/public/events/ical?${params.toString()}`, {
      responseType: 'blob',
    });

    return response.data;
  },

  /**
   * Get Google Calendar add URL for an event
   * @param event
   */
  getGoogleCalendarUrl(event: Event): string {
    const startDate = new Date(event.start_date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(event.end_date || event.start_date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDate}/${endDate}`,
      details: event.description || '',
      location: event.location?.address || event.location_text || '',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  },

  /**
   * Get Outlook Calendar add URL for an event
   * @param event
   */
  getOutlookCalendarUrl(event: Event): string {
    const startDate = new Date(event.start_date).toISOString();
    const endDate = new Date(event.end_date || event.start_date).toISOString();
    
    const params = new URLSearchParams({
      subject: event.title,
      startdt: startDate,
      enddt: endDate,
      body: event.description || '',
      location: event.location?.address || event.location_text || '',
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  },
};

/**
 * Combined public event service
 */
export const combinedEventPublicService: PublicEventService = {
  ...eventPublicService,
  export: eventPublicExportService,
};


export default combinedEventPublicService;