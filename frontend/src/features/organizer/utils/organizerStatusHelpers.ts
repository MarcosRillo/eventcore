/**
 * Organizer Status Helpers
 *
 * Utility functions for handling event status colors and labels
 * in the organizer dashboard context.
 */

/**
 * Valid organizer event status codes
 */
export type OrganizerStatusCode =
  | 'draft'
  | 'pending_internal_approval'
  | 'approved_internal'
  | 'pending_public_approval'
  | 'published'
  | 'requires_changes'
  | 'rejected'
  | 'cancelled'

/**
 * Status colors for styling badges and indicators
 */
interface StatusColors {
  bg: string
  text: string
  dot: string
}

/**
 * Status color mapping - hoisted as module constant for performance
 */
const STATUS_COLORS: Record<OrganizerStatusCode, StatusColors> = {
  draft: {
    bg: 'bg-neutral-100',
    text: 'text-neutral-700',
    dot: 'bg-neutral-400',
  },
  pending_internal_approval: {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    dot: 'bg-warning-500',
  },
  approved_internal: {
    bg: 'bg-primary-50',
    text: 'text-primary-700',
    dot: 'bg-primary-500',
  },
  pending_public_approval: {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    dot: 'bg-warning-500',
  },
  published: {
    bg: 'bg-success-50',
    text: 'text-success-700',
    dot: 'bg-success-500',
  },
  requires_changes: {
    bg: 'bg-warning-50',
    text: 'text-warning-700',
    dot: 'bg-warning-500',
  },
  rejected: {
    bg: 'bg-error-50',
    text: 'text-error-700',
    dot: 'bg-error-500',
  },
  cancelled: {
    bg: 'bg-neutral-100',
    text: 'text-neutral-500',
    dot: 'bg-neutral-400',
  },
}

/**
 * Default colors for unknown status codes
 */
const DEFAULT_COLORS: StatusColors = {
  bg: 'bg-neutral-100',
  text: 'text-neutral-700',
  dot: 'bg-neutral-400',
}

/**
 * Status label mapping - hoisted as module constant for performance
 */
const STATUS_LABELS: Record<OrganizerStatusCode, string> = {
  draft: 'Borrador',
  pending_internal_approval: 'Pendiente revision',
  approved_internal: 'Aprobado interno',
  pending_public_approval: 'Pendiente publicacion',
  published: 'Publicado',
  requires_changes: 'Requiere cambios',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
}

/**
 * Get Tailwind CSS classes for status badge styling
 *
 * @param statusCode - The event status code
 * @returns Object containing background, text, and dot color classes
 *
 * @example
 * ```ts
 * const { bg, text, dot } = getOrganizerStatusColors('published')
 * // Returns: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' }
 * ```
 */
export function getOrganizerStatusColors(statusCode: string): StatusColors {
  return STATUS_COLORS[statusCode as OrganizerStatusCode] ?? DEFAULT_COLORS
}

/**
 * Get human-readable label for status code
 *
 * Converts status codes to display-friendly Spanish labels.
 *
 * @param statusCode - The event status code
 * @returns Human-readable label in Spanish
 *
 * @example
 * ```ts
 * getOrganizerStatusLabel('pending_internal_approval')
 * // Returns: 'Pendiente revision'
 * ```
 */
export function getOrganizerStatusLabel(statusCode: string): string {
  return STATUS_LABELS[statusCode as OrganizerStatusCode] ?? statusCode
}

/**
 * Check if a status code is valid for organizer events
 *
 * @param statusCode - The status code to validate
 * @returns True if the status is valid
 */
export function isValidOrganizerStatus(
  statusCode: string
): statusCode is OrganizerStatusCode {
  return statusCode in STATUS_COLORS
}

/**
 * Badge variant mapping for the Badge component
 * Hoisted as module constant for performance (Vercel best practice: rendering-hoist-jsx)
 */
export const STATUS_BADGE_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  draft: 'default',
  pending_internal_approval: 'warning',
  approved_internal: 'info',
  pending_public_approval: 'warning',
  published: 'success',
  requires_changes: 'warning',
  rejected: 'danger',
  cancelled: 'default',
}

/**
 * Get badge variant for status code
 *
 * @param statusCode - The event status code
 * @returns Badge variant string
 */
export function getOrganizerStatusBadgeVariant(
  statusCode: string
): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  return STATUS_BADGE_VARIANTS[statusCode] ?? 'default'
}
