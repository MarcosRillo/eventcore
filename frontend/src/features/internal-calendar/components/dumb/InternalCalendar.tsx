/**
 * Internal Calendar Grid View Component
 *
 * Grid view for displaying internal calendar events (approved_internal + published).
 * Simpler than public calendar (no filters needed for internal users).
 *
 * Created following TDD methodology (tests written first).
 */

'use client';

import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';
import { InternalEventCard } from '@/features/internal-calendar/components/dumb/InternalEventCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface InternalCalendarProps {
  events: InternalCalendarEvent[];
  loading: boolean;
  error: string | null;
  onEventClick: (eventId: number) => void;
}

export function InternalCalendar({
  events,
  loading,
  error,
  onEventClick,
}: InternalCalendarProps) {
  // Loading state
  if (loading) {
    return (
      <div
        className="flex justify-center py-12"
        role="status"
        aria-label="Cargando eventos"
      >
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-neutral-600">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">{error}</p>
      </div>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-neutral-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
          role="img"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-neutral-900">No hay eventos</h3>
        <p className="mt-2 text-neutral-600">
          No hay eventos aprobados en este momento.
        </p>
      </div>
    );
  }

  // Event grid
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      role="region"
      aria-label="Event grid"
    >
      {events.map((event) => (
        <InternalEventCard
          key={event.id}
          event={event}
          onClick={onEventClick}
        />
      ))}
    </div>
  );
}
