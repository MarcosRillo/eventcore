import {
  getStatusColors,
  getStatusLabel,
} from '@/features/internal-calendar/utils/eventStatusHelpers';

/**
 * EventStatusBadge Props
 */
interface EventStatusBadgeProps {
  /** The status code to display */
  statusCode: string;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * EventStatusBadge Component
 *
 * Displays a colored badge for event status codes.
 * Used in the internal calendar to show event approval states.
 *
 * @param root0
 * @param root0.statusCode
 * @param root0.className
 * @example
 * ```tsx
 * <EventStatusBadge statusCode="approved_internal" />
 * <EventStatusBadge statusCode="published" className="ml-2" />
 * ```
 */
export function EventStatusBadge({ statusCode, className = '' }: EventStatusBadgeProps) {
  const { bgClass, textClass } = getStatusColors(statusCode);
  const label = getStatusLabel(statusCode);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${bgClass} ${textClass} ${className}`}
    >
      {label}
    </span>
  );
}
