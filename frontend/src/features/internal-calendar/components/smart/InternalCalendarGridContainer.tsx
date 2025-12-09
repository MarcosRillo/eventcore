/**
 * InternalCalendarGridContainer - Smart Component
 *
 * Container for grid view that fetches and manages event data.
 * Passes data to InternalCalendar dumb component.
 */

'use client';

import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';
import { InternalCalendar } from '@/features/internal-calendar/components/dumb/InternalCalendar';

export function InternalCalendarGridContainer() {
  const { events, loading, error } = useInternalCalendarEvents();

  const handleEventClick = (eventId: number) => {
    // TODO: Navigate to event detail page when implemented
    // For now, just log the event ID
    if (typeof window !== 'undefined') {
      console.log('Event clicked:', eventId);
    }
  };

  return (
    <InternalCalendar
      events={events}
      loading={loading}
      error={error}
      onEventClick={handleEventClick}
    />
  );
}
