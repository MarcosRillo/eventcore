/**
 * Event Service Types
 *
 * Common interfaces and types for event services
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
import {
  PublicEventFilters,
  OrganizerEventFilters,
  AdminEventFilters,
  FeedFilters,
  EventTemplateFilters,
  EventMessageFilters
} from '@/types/filter.types';
import { EventTemplate, EventMessage } from '@/types/event.types';

/**
 * Service Context Type for role-based delegation
 */
export type EventServiceContext = 'admin' | 'public' | 'organizer' | 'auto';

/**
 * Base Event Service Interface
 * Defines the minimum required methods for all event services
 */
export interface BaseEventService {
  // Core CRUD operations (required)
  getEvents(filters?: EventFilters): Promise<EventPagination>;
  getEvent?(id: number): Promise<Event>;
  
  // Optional CRUD operations (may not be available in all services)
  createEvent?(data: EventFormData): Promise<Event>;
  updateEvent?(id: number, data: Partial<EventFormData>): Promise<Event>;
  deleteEvent?(id: number): Promise<void>;
  duplicateEvent?(id: number, overrides?: Partial<EventFormData>): Promise<Event>;
  
  // Optional utility methods
  toggleFeatured?(id: number): Promise<Event>;
  getStatistics?(): Promise<EventStatistics>;
}

/**
 * Approval Service Interface
 * For services that support approval workflows
 */
export interface EventApprovalService {
  getEventsByStatus(status: EventStatus, filters?: EventFilters): Promise<EventPagination>;
  getApprovalStatistics(): Promise<ApprovalStatistics>;
  approveInternal(eventId: number, comment?: string): Promise<Event>;
  requestPublic(eventId: number, comment?: string): Promise<Event>;
  approvePublic(eventId: number, comment?: string): Promise<Event>;
  requestChanges(eventId: number, comment: string): Promise<Event>;
  rejectEvent(eventId: number, comment: string): Promise<Event>;
}

/**
 * Admin Event Service Interface
 * Full CRUD + approval capabilities
 */
export interface AdminEventService extends BaseEventService {
  // All base methods are required for admin service
  getEvent(id: number): Promise<Event>;
  createEvent(data: EventFormData): Promise<Event>;
  updateEvent(id: number, data: Partial<EventFormData>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
  duplicateEvent(id: number, overrides?: Partial<EventFormData>): Promise<Event>;
  toggleFeatured(id: number): Promise<Event>;
  getStatistics(): Promise<EventStatistics>;
  
  // Admin-specific methods
  bulkDeleteEvents?(eventIds: number[]): Promise<void>;
  bulkUpdateStatus?(eventIds: number[], status: EventStatus, comment?: string): Promise<Event[]>;
  exportEvents?(filters?: AdminEventFilters, format?: 'csv' | 'xlsx' | 'pdf'): Promise<Blob>;
  
  // Approval service
  approval: EventApprovalService;
}

/**
 * Public Event Service Interface  
 * Read-only access to published events
 */
export interface PublicEventService extends BaseEventService {
  // Override base method with public-specific filters
  getEvents(filters?: PublicEventFilters): Promise<EventPagination>;
  getEvent(id: number): Promise<Event>;

  // Public-specific methods
  getPublicEvents?(filters?: PublicEventFilters): Promise<EventPagination>;
  getPublicEvent?(identifier: number | string): Promise<Event>;
  searchEvents?(query: string, filters?: PublicEventFilters): Promise<EventPagination>;
  getFeaturedEvents?(limit?: number): Promise<Event[]>;
  getUpcomingEvents?(limit?: number): Promise<Event[]>;
  
  // Export functionality
  export?: {
    getRSSFeedUrl(filters?: FeedFilters): string;
    getICalUrl(filters?: FeedFilters): string;
    getEventICalUrl(eventId: number): string;
    getGoogleCalendarUrl(event: Event): string;
    getOutlookCalendarUrl(event: Event): string;
  };
}

/**
 * Organizer Event Service Interface
 * Limited CRUD for organizer's own events
 */
export interface OrganizerEventService extends BaseEventService {
  // Base methods for organizer's events
  getEvent(id: number): Promise<Event>;
  createEvent(data: EventFormData): Promise<Event>;
  updateEvent(id: number, data: Partial<EventFormData>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
  duplicateEvent(id: number, overrides?: Partial<EventFormData>): Promise<Event>;
  
  // Override to use organizer-specific filters
  getEvents(filters?: OrganizerEventFilters): Promise<EventPagination>;

  // Organizer-specific methods
  getMyEvents?(filters?: OrganizerEventFilters): Promise<EventPagination>;
  getMyEvent?(id: number): Promise<Event>;
  submitForApproval?(id: number, comment?: string): Promise<Event>;
  getMyTemplates?(filters?: EventTemplateFilters): Promise<EventTemplate[]>;
  saveAsTemplate?(id: number, templateName: string): Promise<EventTemplate>;
  
  // Communication service
  communication?: {
    sendMessageToAdmin(eventId: number, subject: string, message: string): Promise<void>;
    getEventMessages(filters?: EventMessageFilters): Promise<EventMessage[]>;
    getUnreadMessagesCount(): Promise<number>;
  };
}

/**
 * Combined Service Types
 * Union type for services that can be used interchangeably
 */
export type CombinedEventService = AdminEventService | PublicEventService | OrganizerEventService;