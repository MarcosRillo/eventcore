import type { InternalCalendarStatusCode } from '@/features/internal-calendar/types/internal-calendar.types';

/**
 * Status badge color configuration
 */
interface StatusColors {
  bgClass: string;
  textClass: string;
}

/**
 * Get Tailwind CSS classes for status badge styling
 *
 * Returns background and text color classes based on status code.
 * Uses Tailwind's color palette for consistent styling.
 *
 * @param statusCode - The event status code
 * @returns Object containing background and text color classes
 *
 * @example
 * ```ts
 * const { bgClass, textClass } = getStatusColors('published');
 * // Returns: { bgClass: 'bg-green-100', textClass: 'text-green-800' }
 * ```
 */
export function getStatusColors(statusCode: string): StatusColors {
  switch (statusCode) {
    case 'approved_internal':
      return {
        bgClass: 'bg-blue-100',
        textClass: 'text-blue-800',
      };
    case 'pending_public_approval':
      return {
        bgClass: 'bg-yellow-100',
        textClass: 'text-yellow-800',
      };
    case 'published':
      return {
        bgClass: 'bg-green-100',
        textClass: 'text-green-800',
      };
    default:
      return {
        bgClass: 'bg-gray-100',
        textClass: 'text-gray-800',
      };
  }
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
 * getStatusLabel('approved_internal'); // Returns: 'Aprobado Interno'
 * ```
 */
export function getStatusLabel(statusCode: string): string {
  switch (statusCode) {
    case 'approved_internal':
      return 'Aprobado Interno';
    case 'pending_public_approval':
      return 'Pendiente Aprobación Pública';
    case 'published':
      return 'Publicado';
    default:
      return statusCode;
  }
}

/**
 * Check if a status code is valid for internal calendar
 *
 * @param statusCode - The status code to validate
 * @returns True if the status is valid for internal calendar
 */
export function isValidInternalCalendarStatus(
  statusCode: string
): statusCode is InternalCalendarStatusCode {
  return ['approved_internal', 'pending_public_approval', 'published'].includes(
    statusCode
  );
}
