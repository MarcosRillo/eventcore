/**
 * Event Configuration
 * Centralized configuration for event status and type labels with semantic tokens
 * Used by GenericTable and other components for consistent UI rendering
 */

import { EVENT_STATUS, EVENT_TYPE, EventStatusCode, EventTypeCode } from '@/types/event.types';

/**
 * Status display configuration with semantic color tokens
 */
export interface StatusConfig {
  label: string;
  className: string;
}

/**
 * Type display configuration with semantic color tokens
 */
export interface TypeConfig {
  label: string;
  className: string;
}

/**
 * Event status UI configuration
 * Uses semantic tokens: neutral-*, warning-*, primary-*, success-*, error-*
 */
export const EVENT_STATUS_CONFIG: Record<EventStatusCode, StatusConfig> = {
  [EVENT_STATUS.DRAFT]: {
    label: 'Borrador',
    className: 'bg-neutral-100 text-neutral-800',
  },
  [EVENT_STATUS.PENDING_INTERNAL_APPROVAL]: {
    label: 'Pendiente Interno',
    className: 'bg-warning-100 text-warning-800',
  },
  [EVENT_STATUS.APPROVED_INTERNAL]: {
    label: 'Aprobado Interno',
    className: 'bg-primary-100 text-primary-800',
  },
  [EVENT_STATUS.PENDING_PUBLIC_APPROVAL]: {
    label: 'Pendiente Público',
    className: 'bg-warning-100 text-warning-800',
  },
  [EVENT_STATUS.PUBLISHED]: {
    label: 'Publicado',
    className: 'bg-success-100 text-success-800',
  },
  [EVENT_STATUS.REQUIRES_CHANGES]: {
    label: 'Requiere Cambios',
    className: 'bg-error-100 text-error-800',
  },
  [EVENT_STATUS.REJECTED]: {
    label: 'Rechazado',
    className: 'bg-error-100 text-error-800',
  },
  [EVENT_STATUS.CANCELLED]: {
    label: 'Cancelado',
    className: 'bg-neutral-100 text-neutral-800',
  },
};

/**
 * Event type UI configuration
 * Uses semantic tokens: neutral-*, primary-*
 */
export const EVENT_TYPE_CONFIG: Record<EventTypeCode, TypeConfig> = {
  [EVENT_TYPE.SINGLE_LOCATION]: {
    label: 'Sede Única',
    className: 'bg-neutral-100 text-neutral-700',
  },
  [EVENT_TYPE.MULTI_LOCATION]: {
    label: 'Multi-Sede',
    className: 'bg-primary-100 text-primary-700',
  },
};

/**
 * Default fallback configuration for unknown status
 */
export const DEFAULT_STATUS_CONFIG: StatusConfig = {
  label: 'Desconocido',
  className: 'bg-neutral-100 text-neutral-800',
};

/**
 * Default fallback configuration for unknown type
 */
export const DEFAULT_TYPE_CONFIG: TypeConfig = {
  label: 'Desconocido',
  className: 'bg-neutral-100 text-neutral-700',
};

/**
 * Get status configuration with fallback
 * @param statusCode - Event status code (string or object)
 * @returns Status configuration with label and className
 */
export function getStatusConfig(statusCode: string | undefined): StatusConfig {
  if (!statusCode) return DEFAULT_STATUS_CONFIG;
  return EVENT_STATUS_CONFIG[statusCode as EventStatusCode] || DEFAULT_STATUS_CONFIG;
}

/**
 * Get type configuration with fallback
 * @param typeCode - Event type code (string or object)
 * @returns Type configuration with label and className
 */
export function getTypeConfig(typeCode: string | undefined): TypeConfig {
  if (!typeCode) return DEFAULT_TYPE_CONFIG;
  return EVENT_TYPE_CONFIG[typeCode as EventTypeCode] || DEFAULT_TYPE_CONFIG;
}

/**
 * Badge base classes for consistent styling
 */
export const BADGE_BASE_CLASSES = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

/**
 * Table style constants for consistent UI
 */
export const TABLE_STYLES = {
  container: 'bg-white rounded-lg shadow overflow-hidden',
  header: 'bg-neutral-50',
  headerCell: 'px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider',
  row: 'hover:bg-neutral-50 transition-colors',
  cell: 'px-6 py-4 whitespace-nowrap text-sm text-neutral-900',
  divider: 'divide-y divide-neutral-200',
} as const;
