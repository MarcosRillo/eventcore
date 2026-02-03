import Link from 'next/link';
import { memo } from 'react';

import { EventStatusBadge } from '@/features/internal-calendar/components/dumb/EventStatusBadge';
import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';

/**
 * InternalEventCard Props
 */
interface InternalEventCardProps {
  /** The event to display */
  event: InternalCalendarEvent;
}

/**
 * InternalEventCard Component
 *
 * Displays an event card for the internal calendar.
 * Shows title, status, organization, dates, and location.
 * Navigates to event detail page when clicked.
 *
 * @param root0
 * @param root0.event
 * @example
 * ```tsx
 * <InternalEventCard event={event} />
 * ```
 */
export const InternalEventCard = memo(function InternalEventCard({ event }: InternalEventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Link
      href={`/organizer/calendar/${event.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Header: Title and Status */}
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
        <EventStatusBadge statusCode={event.status.status_code} />
      </div>

      {/* Organization */}
      <div className="mb-2 flex items-center text-sm text-gray-600">
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <span className="font-medium">{event.organization.name}</span>
      </div>

      {/* Dates */}
      <div className="mb-2 flex items-center text-sm text-gray-600">
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>
          {formatDate(event.start_date)}
          {event.end_date !== event.start_date && ` - ${formatDate(event.end_date)}`}
        </span>
      </div>

      {/* Location */}
      {event.locations && event.locations.length > 0 && (
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>
            {event.locations[0].name}, {event.locations[0].city}
          </span>
        </div>
      )}
    </Link>
  );
});
