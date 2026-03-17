/**
 * Admin Panel Types
 *
 * Type definitions for the Entity Admin approval panel feature.
 * Extends event types with admin-specific functionality.
 */

import type { EventStatusCode } from '@/types/event.types';

/**
 * Approval actions that can be performed by entity_admin/entity_staff
 */
export type ApprovalAction =
  | 'approve_internal'   // Approve for internal calendar
  | 'request_public'     // Request public calendar approval
  | 'publish'            // Publish to public calendar
  | 'publish_directly'   // Approve internally + publish in one step
  | 'request_changes'    // Request changes (requires comment)
  | 'reject';            // Reject event (requires comment)

/**
 * Configuration for approval action buttons
 */
export interface ActionButtonConfig {
  label: string;
  description: string;
  variant: 'primary' | 'success' | 'warning' | 'danger' | 'outline';
  requiresComment: boolean;
  icon?: string;
}

/**
 * Admin approval statistics from backend
 */
export interface AdminApprovalStats {
  total: number;
  pending_internal_approval: number;
  pending_public_approval: number;
  approved_internal: number;
  published: number;
  requires_changes: number;
  rejected: number;
  draft: number;
  cancelled: number;
}

/**
 * Stat card data for dashboard display
 */
export interface AdminStatCardData {
  key: string;
  label: string;
  value: number;
  color: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
  statusFilter?: EventStatusCode;
}

/**
 * Quick filter option for the event table
 */
export interface QuickFilterOption {
  key: string;
  label: string;
  status: EventStatusCode | null;
  count?: number;
}

/**
 * Mapping of event status to available approval actions
 * Updated to allow admin to manage events in all states with logical transitions
 */
export const STATUS_ACTIONS_MAP: Record<EventStatusCode, ApprovalAction[]> = {
  draft: ['approve_internal'],  // Admin can approve draft directly
  pending_internal_approval: ['approve_internal', 'publish_directly', 'request_changes', 'reject'],
  approved_internal: ['request_public'],
  pending_public_approval: ['publish', 'request_changes', 'reject'],
  published: ['request_changes'],  // Admin can revert published event if issue detected
  requires_changes: ['approve_internal', 'request_changes', 'reject'],
  rejected: ['approve_internal'],  // Admin can reactivate rejected event
  cancelled: [],  // Cancelled is final state
};

/**
 * Configuration for each approval action button
 */
export const ACTION_CONFIG: Record<ApprovalAction, ActionButtonConfig> = {
  approve_internal: {
    label: 'Aprobar para Calendario Interno',
    description: 'El evento estará disponible en el calendario interno de la entidad',
    variant: 'primary',
    requiresComment: false,
  },
  request_public: {
    label: 'Aprobar para Calendario Público',
    description: 'El evento pasará a revisión para el calendario público',
    variant: 'success',
    requiresComment: false,
  },
  publish: {
    label: 'Publicar',
    description: 'El evento será visible en el calendario público',
    variant: 'success',
    requiresComment: false,
  },
  publish_directly: {
    label: 'Aprobar y Publicar',
    description: 'Aprueba internamente y publica directamente en el calendario público',
    variant: 'success',
    requiresComment: false,
  },
  request_changes: {
    label: 'Solicitar Correcciones',
    description: 'El organizador deberá realizar cambios antes de continuar',
    variant: 'warning',
    requiresComment: true,
  },
  reject: {
    label: 'Rechazar',
    description: 'El evento no será publicado',
    variant: 'danger',
    requiresComment: true,
  },
};

/**
 * Quick filter presets for the event table
 */
export const QUICK_FILTERS: QuickFilterOption[] = [
  { key: 'all', label: 'Todos', status: null },
  { key: 'pending_internal', label: 'Pend. Interno', status: 'pending_internal_approval' },
  { key: 'pending_public', label: 'Pend. Público', status: 'pending_public_approval' },
  { key: 'published', label: 'Publicados', status: 'published' },
  { key: 'requires_changes', label: 'Req. Cambios', status: 'requires_changes' },
  { key: 'rejected', label: 'Rechazados', status: 'rejected' },
];

/**
 * Map EventStatusCode to Badge variant for consistent status display
 */
export function getStatusBadgeVariant(
  status: EventStatusCode,
): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'published':
      return 'success';
    case 'pending_internal_approval':
    case 'pending_public_approval':
      return 'warning';
    case 'approved_internal':
      return 'info';
    case 'requires_changes':
    case 'rejected':
      return 'danger';
    default:
      return 'default';
  }
}

/**
 * Map ApprovalAction to Badge variant for timeline/history display
 */
export function getActionBadgeVariant(
  action: string,
): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (action) {
    case 'approve_internal':
      return 'info';
    case 'request_public':
    case 'publish':
    case 'publish_directly':
      return 'success';
    case 'request_changes':
      return 'warning';
    case 'reject':
      return 'danger';
    default:
      return 'default';
  }
}

/**
 * Map ApprovalAction to confirm Button variant
 */
export function getActionButtonVariant(
  action: ApprovalAction,
): 'primary' | 'success' | 'warning' | 'danger' {
  switch (action) {
    case 'approve_internal':
      return 'primary';
    case 'request_public':
    case 'publish':
    case 'publish_directly':
      return 'success';
    case 'request_changes':
      return 'warning';
    case 'reject':
      return 'danger';
  }
}

/**
 * Minimum character count for comments (backend validation)
 */
export const MIN_COMMENT_LENGTH = 10;

/**
 * Maximum character count for comments
 */
export const MAX_COMMENT_LENGTH = 1000;
