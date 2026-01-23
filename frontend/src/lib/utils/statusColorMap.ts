/**
 * Status Color Mapping Utility
 * Maps event status codes to semantic Tailwind color classes
 * Following the design system with semantic tokens: neutral, warning, success, error, primary
 */

export type EventStatusCode =
  | 'draft'
  | 'pending_internal_approval'
  | 'approved_internal'
  | 'pending_public_approval'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'requires_changes'
  | 'cancelled';

interface StatusColorConfig {
  bg: string;
  text: string;
  border?: string;
}

/**
 * Semantic color mapping following design system
 * Uses: neutral, warning, success, error, primary, info
 */
export const STATUS_COLOR_MAP: Record<EventStatusCode, StatusColorConfig> = {
  draft: {
    bg: 'bg-neutral-100',
    text: 'text-neutral-700',
    border: 'border-neutral-200',
  },
  pending_internal_approval: {
    bg: 'bg-warning-100',
    text: 'text-warning-700',
    border: 'border-warning-200',
  },
  pending_public_approval: {
    bg: 'bg-warning-100',
    text: 'text-warning-700',
    border: 'border-warning-200',
  },
  approved_internal: {
    bg: 'bg-success-100',
    text: 'text-success-700',
    border: 'border-success-200',
  },
  approved: {
    bg: 'bg-success-100',
    text: 'text-success-700',
    border: 'border-success-200',
  },
  rejected: {
    bg: 'bg-error-100',
    text: 'text-error-700',
    border: 'border-error-200',
  },
  published: {
    bg: 'bg-primary-100',
    text: 'text-primary-700',
    border: 'border-primary-200',
  },
  requires_changes: {
    bg: 'bg-warning-100',
    text: 'text-warning-700',
    border: 'border-warning-200',
  },
  cancelled: {
    bg: 'bg-neutral-200',
    text: 'text-neutral-600',
    border: 'border-neutral-300',
  },
};

/**
 * Get status color classes for a given status code
 * Returns combined className string for easy spreading
 * @param statusCode
 */
export const getStatusColorClasses = (statusCode: string): string => {
  const config = STATUS_COLOR_MAP[statusCode as EventStatusCode];

  if (!config) {
    // Fallback for unknown statuses
    return 'bg-neutral-100 text-neutral-700 border-neutral-200';
  }

  return `${config.bg} ${config.text} ${config.border || ''}`.trim();
};

/**
 * Get individual color config object
 * @param statusCode
 */
export const getStatusColorConfig = (statusCode: string): StatusColorConfig => {
  return STATUS_COLOR_MAP[statusCode as EventStatusCode] || {
    bg: 'bg-neutral-100',
    text: 'text-neutral-700',
    border: 'border-neutral-200',
  };
};
