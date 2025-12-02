/**
 * Event Type Types
 * Type definitions for event types and subtypes data structures
 * Replaces the flat Categories system with hierarchical Type/Subtype structure
 *
 * Created: December 2, 2025
 */

import type { PaginatedResponse } from './api-response.types';
import type { TableProps, ModalProps, EntityFilters } from './generic-infrastructure.types';

// ==========================================
// BASE INTERFACES
// ==========================================

/**
 * EventType - Top-level event classification
 */
export interface EventType {
  id: number;
  name: string;
  entity_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subtypes_count?: number;
}

/**
 * EventSubtype - Second-level event classification
 * Must belong to an EventType
 */
export interface EventSubtype {
  id: number;
  name: string;
  event_type_id: number;
  entity_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  event_type?: EventType;
}

// ==========================================
// FORM DATA TYPES
// ==========================================

/**
 * Form data for creating/editing an EventType
 */
export type EventTypeFormData = Partial<Pick<EventType, 'name' | 'is_active'>>;

/**
 * Form data for creating/editing an EventSubtype
 */
export type EventSubtypeFormData = Partial<Pick<EventSubtype, 'name' | 'is_active'>>;

// ==========================================
// FILTER TYPES
// ==========================================

/**
 * Status filter type for event types/subtypes
 */
export type EventTypeFilterStatus = 'all' | 'active' | 'inactive';

/**
 * Filters for querying EventTypes
 */
export type EventTypeFilters = EntityFilters<{
  active?: boolean;
  status?: EventTypeFilterStatus;
}>;

/**
 * Filters for querying EventSubtypes
 */
export type EventSubtypeFilters = EntityFilters<{
  active?: boolean;
  status?: EventTypeFilterStatus;
  event_type_id?: number;
}>;

// ==========================================
// API RESPONSE TYPES
// ==========================================

/**
 * Paginated response for EventTypes
 */
export type EventTypePagination = PaginatedResponse<EventType>;

/**
 * Paginated response for EventSubtypes
 */
export type EventSubtypePagination = PaginatedResponse<EventSubtype>;

// ==========================================
// COMPONENT PROP TYPES
// ==========================================

/**
 * Props for EventType table component
 */
export type EventTypeTableProps = TableProps<EventType, {
  onEdit: (eventType: EventType) => void;
  onDelete: (id: number, name: string) => void;
  onViewSubtypes: (eventType: EventType) => void;
}>;

/**
 * Props for EventSubtype table component
 */
export type EventSubtypeTableProps = TableProps<EventSubtype, {
  onEdit: (eventSubtype: EventSubtype) => void;
  onDelete: (id: number, name: string) => void;
}>;

/**
 * Modal props for creating EventType
 */
export type CreateEventTypeModalProps = ModalProps<void>;

/**
 * Modal props for editing EventType
 */
export type EditEventTypeModalProps = ModalProps<EventType>;

/**
 * Modal props for creating EventSubtype
 */
export type CreateEventSubtypeModalProps = ModalProps<{ eventTypeId: number }>;

/**
 * Modal props for editing EventSubtype
 */
export type EditEventSubtypeModalProps = ModalProps<EventSubtype>;

// ==========================================
// BACKWARD COMPATIBILITY ALIASES
// ==========================================

export type CreateEventTypeData = EventTypeFormData;
export type UpdateEventTypeData = EventTypeFormData;
export type EventTypeQueryParams = EventTypeFilters;

export type CreateEventSubtypeData = EventSubtypeFormData;
export type UpdateEventSubtypeData = EventSubtypeFormData;
export type EventSubtypeQueryParams = EventSubtypeFilters;
