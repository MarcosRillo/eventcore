import { InternalEventCard } from '@/features/internal-calendar/components/dumb/InternalEventCard';
import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';

/**
 * InternalCalendarView Props
 */
interface InternalCalendarViewProps {
  /** List of events to display */
  events: InternalCalendarEvent[];
  /** Loading state */
  loading: boolean;
  /** Optional click handler for events */
  onEventClick?: (eventId: number) => void;
}

/**
 * InternalCalendarView Component
 *
 * Displays a list of internal calendar events with loading and empty states.
 * Presentational component that receives data from a container.
 *
 * @example
 * ```tsx
 * <InternalCalendarView
 *   events={events}
 *   loading={false}
 *   onEventClick={(id) => navigate(`/events/${id}`)}
 * />
 * ```
 */
export function InternalCalendarView({
  events,
  loading,
  onEventClick,
}: InternalCalendarViewProps) {
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <p className="text-gray-600">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-600">No hay eventos disponibles</p>
        </div>
      </div>
    );
  }

  // Events list
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
