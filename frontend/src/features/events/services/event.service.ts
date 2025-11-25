/**
 * Event Service - Main Aggregator
 * 
 * Main event service that delegates to specialized services based on user context.
 * This service acts as a facade and maintains backward compatibility while 
 * providing role-based functionality.
 */

import {
  Event,
  EventFormData,
  EventFilters,
  EventPagination,
  EventStatistics,
  ApprovalStatistics,
  EventStatus
} from '@/types/event.types';

// Import specialized services
import { combinedEventAdminService } from '@/features/entity-admin/services/eventAdminService';
import { combinedEventPublicService } from './eventPublicService';
import { combinedEventOrganizerService } from './eventOrganizerService';

// Import the type from types.ts to avoid conflicts
import { EventServiceContext } from './types';
export type { EventServiceContext } from './types';

/**
 * Get the appropriate service based on context/role
 */
export const getEventServiceForContext = (context: EventServiceContext = 'admin') => {
  switch (context) {
    case 'admin':
      return combinedEventAdminService;
    case 'public':
      return combinedEventPublicService;
    case 'organizer':
      return combinedEventOrganizerService;
    case 'auto':
      // This will be handled by useEventManager with user role detection
      return combinedEventAdminService; // Default fallback
    default:
      return combinedEventAdminService;
  }
};

/**
 * Legacy Event Service - Maintains backward compatibility
 * 
 * This service maintains the exact same API as before but now delegates
 * to the admin service to ensure existing components continue working.
 */
export const eventService = {
  /**
   * Get paginated list of events with filters
   * @deprecated Use getEventServiceForContext('admin').getEvents() instead
   */
  async getEvents(filters: EventFilters = {}): Promise<EventPagination> {
    return combinedEventAdminService.getEvents(filters);
  },

  /**
   * Get a single event by ID
   * @deprecated Use getEventServiceForContext('admin').getEvent() instead
   */
  async getEvent(id: number): Promise<Event> {
    return combinedEventAdminService.getEvent(id);
  },

  /**
   * Create a new event
   * @deprecated Use getEventServiceForContext('admin').createEvent() instead
   */
  async createEvent(data: EventFormData): Promise<Event> {
    return combinedEventAdminService.createEvent(data);
  },

  /**
   * Update an existing event
   * @deprecated Use getEventServiceForContext('admin').updateEvent() instead
   */
  async updateEvent(id: number, data: Partial<EventFormData>): Promise<Event> {
    return combinedEventAdminService.updateEvent(id, data);
  },

  /**
   * Delete an event
   * @deprecated Use getEventServiceForContext('admin').deleteEvent() instead
   */
  async deleteEvent(id: number): Promise<void> {
    return combinedEventAdminService.deleteEvent(id);
  },

  /**
   * Duplicate an event
   * @deprecated Use getEventServiceForContext('admin').duplicateEvent() instead
   */
  async duplicateEvent(id: number, overrides: Partial<EventFormData> = {}): Promise<Event> {
    return combinedEventAdminService.duplicateEvent(id, overrides);
  },

  /**
   * Toggle featured status
   * @deprecated Use getEventServiceForContext('admin').toggleFeatured() instead
   */
  async toggleFeatured(id: number): Promise<Event> {
    return combinedEventAdminService.toggleFeatured(id);
  },

  /**
   * Get event statistics
   * @deprecated Use getEventServiceForContext('admin').getStatistics() instead
   */
  async getStatistics(): Promise<EventStatistics> {
    return combinedEventAdminService.getStatistics();
  },
};

/**
 * Legacy Event Approval Service - Maintains backward compatibility
 * 
 * @deprecated Use getEventServiceForContext('admin').approval instead
 */
export const eventApprovalService = {
  /**
   * Get events by approval status
   * @deprecated Use getEventServiceForContext('admin').approval.getEventsByStatus() instead
   */
  async getEventsByStatus(status: EventStatus, filters: EventFilters = {}): Promise<EventPagination> {
    return combinedEventAdminService.approval.getEventsByStatus(status, filters);
  },

  /**
   * Get approval workflow statistics
   * @deprecated Use getEventServiceForContext('admin').approval.getApprovalStatistics() instead
   */
  async getApprovalStatistics(): Promise<ApprovalStatistics> {
    return combinedEventAdminService.approval.getApprovalStatistics();
  },

  /**
   * Approve event for internal use
   * @deprecated Use getEventServiceForContext('admin').approval.approveInternal() instead
   */
  async approveInternal(eventId: number, comment?: string): Promise<Event> {
    return combinedEventAdminService.approval.approveInternal(eventId, comment);
  },

  /**
   * Request public approval for an internally approved event
   * @deprecated Use getEventServiceForContext('admin').approval.requestPublic() instead
   */
  async requestPublic(eventId: number, comment?: string): Promise<Event> {
    return combinedEventAdminService.approval.requestPublic(eventId, comment);
  },

  /**
   * Approve event for public publication
   * @deprecated Use getEventServiceForContext('admin').approval.approvePublic() instead
   */
  async approvePublic(eventId: number, comment?: string): Promise<Event> {
    return combinedEventAdminService.approval.approvePublic(eventId, comment);
  },

  /**
   * Request changes to an event
   * @deprecated Use getEventServiceForContext('admin').approval.requestChanges() instead
   */
  async requestChanges(eventId: number, comment: string): Promise<Event> {
    return combinedEventAdminService.approval.requestChanges(eventId, comment);
  },

  /**
   * Reject an event
   * @deprecated Use getEventServiceForContext('admin').approval.rejectEvent() instead
   */
  async rejectEvent(eventId: number, comment: string): Promise<Event> {
    return combinedEventAdminService.approval.rejectEvent(eventId, comment);
  },
};

/**
 * Combined event service with all operations - Legacy
 * 
 * @deprecated Use getEventServiceForContext() to get the appropriate service for your context
 */
export const combinedEventService = {
  ...eventService,
  approval: eventApprovalService,
};

// Export specialized services for direct use
export { combinedEventAdminService as eventAdminService };
export { combinedEventPublicService as eventPublicService };  
export { combinedEventOrganizerService as eventOrganizerService };

// Types are exported above

// Default export maintains backward compatibility
export default combinedEventService;
