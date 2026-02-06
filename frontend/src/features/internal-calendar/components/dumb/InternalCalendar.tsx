/**
 * Internal Calendar Grid View Component
 *
 * Grid view for displaying internal calendar events (approved_internal + published).
 * Simpler than public calendar (no filters needed for internal users).
 *
 * Created following TDD methodology (tests written first).
 */

'use client';

import { InternalEventCard } from '@/features/internal-calendar/components/dumb/InternalEventCard';
import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';
import { LoadingSpinner } from '@/shared/components/feedback';
import EmptyState, { EmptyStateIcons } from '@/shared/components/feedback/EmptyState';

interface InternalCalendarProps {
  events: InternalCalendarEvent[];
  loading: boolean;
  error: string | null;
  basePath: string;
}

/**
 *
 * @param root0
 * @param root0.events
 * @param root0.loading
 * @param root0.error
 * @param root0.basePath
 */
export function InternalCalendar({
  events,
  loading,
  error,
  basePath,
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
      <EmptyState
        icon={EmptyStateIcons.calendar}
        title="No hay eventos"
        description="No hay eventos aprobados en este momento."
        size="md"
      />
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
        <InternalEventCard key={event.id} event={event} basePath={basePath} />
      ))}
    </div>
  );
}
