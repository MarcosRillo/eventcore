/**
 * Event Types
 * Type definitions for event-related data structures
 */

import type { Category } from '@/types/category.types';
import type { Location } from '@/types/location.types';
import type { User } from '@/types/auth.types';
import type { EntityStats } from '@/types/generic-infrastructure.types';
import type { EventOperation } from '@/types/operations.types';

/**
 * Event status constants - matching backend Event model
 */
export const EVENT_STATUS = {
  DRAFT: 'draft',
  PENDING_INTERNAL_APPROVAL: 'pending_internal_approval',
  APPROVED_INTERNAL: 'approved_internal',
  PENDING_PUBLIC_APPROVAL: 'pending_public_approval',
  PUBLISHED: 'published',
  REQUIRES_CHANGES: 'requires_changes',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export type EventStatusCode = typeof EVENT_STATUS[keyof typeof EVENT_STATUS];

/**
 * Event status 3NF object structure
 */
export interface EventStatusObject {
  id: number;
  status_code: EventStatusCode;
  status_name: string;
  description: string;
  workflow_order: number;
  created_at: string;
  updated_at: string;
}

export type EventStatus = EventStatusCode | EventStatusObject;

/**
 * Event type constants - matching backend Event model
 */
export const EVENT_TYPE = {
  SINGLE_LOCATION: 'sede_unica',
  MULTI_LOCATION: 'multi_sede',
} as const;

export type EventTypeCode = typeof EVENT_TYPE[keyof typeof EVENT_TYPE];

/**
 * Event type 3NF object structure
 */
export interface EventTypeObject {
  id: number;
  type_code: EventTypeCode;
  type_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export type EventType = EventTypeCode | EventTypeObject;

/**
 * Approval history entry interface
 */
export interface ApprovalHistoryEntry {
  action: string;
  user_id: number;
  comment?: string;
  timestamp: string;
}

/**
 * Base Event interface - matches EventResource from backend
 */
export interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  type: EventType;
  status: EventStatus;
  
  // Location fields (aligned with backend flexible location system)
  location_text?: string;      // Free text location
  virtual_link?: string;
  
  // Relationships
  category_id: number;
  category: Category;
  location_id?: number;        // Legacy single location support
  location?: Location;         // Legacy single location support  
  locations: Location[];       // Array of structured locations
  
  // Capacity field (aligned with backend)
  max_attendees?: number;
  registration_required?: boolean;
  registration_deadline?: string;
  
  // Contact information
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  
  // Media (aligned with backend)
  featured_image?: string;
  
  // Call to action (aligned with backend)
  cta_text?: string;
  cta_link?: string;
  
  // Meta (aligned with backend)
  is_featured: boolean;
  metadata?: Record<string, unknown>;
  
  // Computed properties from backend
  duration_minutes?: number;
  duration_hours?: number;
  is_happening?: boolean;
  has_ended?: boolean;
  is_upcoming?: boolean;
  is_virtual?: boolean;
  has_multiple_locations?: boolean;
  has_cta?: boolean;
  
  // Approval workflow fields
  created_by?: number;
  approved_by?: number;
  approved_at?: string;
  approval_comments?: string;
  approval_history: ApprovalHistoryEntry[];
  
  // Relationships for approval workflow
  creator?: User;
  approver?: User;
  organizer?: {
    name: string;
    organization?: string;
    id?: number;
  };
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Event creation/update form data that matches backend expectations
 */
export interface EventFormData {
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  type: EventTypeCode;
  status?: EventStatusCode;     // Added to match backend requirements
  category_id?: number;
  
  // Flexible location system - only one should be used
  location_text?: string;      // Free text location
  location_ids?: number[];     // Structured locations
  
  virtual_link?: string;
  
  // Optional fields
  max_attendees?: number;
  registration_required?: boolean;
  registration_deadline?: string;
  
  // Contact information
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  
  // Media
  featured_image?: string;
  
  // Call to action
  cta_text?: string;
  cta_link?: string;
  
  // Meta
  is_featured?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Event filters for API queries
 */
export interface EventFilters {
  search?: string;
  status?: EventStatusCode;
  type?: EventTypeCode;
  category_id?: number;
  location_id?: number;
  start_date?: string;
  end_date?: string;
  is_featured?: boolean;
  created_by?: number;
  page?: number;
  per_page?: number;
}

/**
 * Event pagination - DEPRECATED: Use PaginatedResponse<Event> directly
 */
import type { PaginatedResponse } from './api-response.types';
export type EventPagination = PaginatedResponse<Event>;

/**
 * Event statistics - matches backend EventService statistics
 */
export interface EventStatistics {
  total: number;
  published: number;
  draft: number;
  cancelled: number;
  upcoming: number;
  featured: number;
}

/**
 * Approval statistics - Use generic stats pattern
 */
export type ApprovalStatistics = EntityStats<{
  pending_internal_approval: number;
  approved_internal: number;
  pending_public_approval: number;
  published: number;
  requires_changes: number;
  rejected: number;
  draft: number;
  cancelled: number;
}>;

// Use EventOperation from operations.types.ts
export type ApprovalActionData = Extract<EventOperation, { action: 'approve' | 'reject' }>;

// EventApiResponse removed - use ApiResponse<Event> from api-response.types.ts

/**
 * Event status display helpers
 */
export const EVENT_STATUS_LABELS: Record<EventStatusCode, string> = {
  [EVENT_STATUS.DRAFT]: 'Borrador',
  [EVENT_STATUS.PENDING_INTERNAL_APPROVAL]: 'Pendiente Aprobación Interna',
  [EVENT_STATUS.APPROVED_INTERNAL]: 'Aprobado Internamente',
  [EVENT_STATUS.PENDING_PUBLIC_APPROVAL]: 'Pendiente Aprobación Pública',
  [EVENT_STATUS.PUBLISHED]: 'Publicado',
  [EVENT_STATUS.REQUIRES_CHANGES]: 'Requiere Cambios',
  [EVENT_STATUS.REJECTED]: 'Rechazado',
  [EVENT_STATUS.CANCELLED]: 'Cancelado',
};

export const EVENT_TYPE_LABELS: Record<EventTypeCode, string> = {
  [EVENT_TYPE.SINGLE_LOCATION]: 'Sede Única',
  [EVENT_TYPE.MULTI_LOCATION]: 'Multi-Sede',
};

/**
 * Status color mapping for UI
 */
export const EVENT_STATUS_COLORS: Record<EventStatusCode, string> = {
  [EVENT_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
  [EVENT_STATUS.PENDING_INTERNAL_APPROVAL]: 'bg-yellow-100 text-yellow-800',
  [EVENT_STATUS.APPROVED_INTERNAL]: 'bg-blue-100 text-blue-800',
  [EVENT_STATUS.PENDING_PUBLIC_APPROVAL]: 'bg-orange-100 text-orange-800',
  [EVENT_STATUS.PUBLISHED]: 'bg-green-100 text-green-800',
  [EVENT_STATUS.REQUIRES_CHANGES]: 'bg-red-100 text-red-800',
  [EVENT_STATUS.REJECTED]: 'bg-red-100 text-red-800',
  [EVENT_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800',
};

/**
 * Event template for reusable event data
 */
export type EventTemplate = {
  id: number;
  name: string;
  template_data: Record<string, unknown>;
  created_at: string;
  last_used?: string;
};

/**
 * Event message for communication
 */
export type EventMessage = {
  id: number;
  subject: string;
  message: string;
  from: { id: number; name: string; role: string };
  to: { id: number; name: string; role: string };
  event_id: number;
  read_at?: string;
  created_at: string;
};
