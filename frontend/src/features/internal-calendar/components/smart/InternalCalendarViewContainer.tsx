/**
 * InternalCalendarViewContainer - Smart Component
 *
 * Container for calendar view that fetches events and transforms them
 * to BigCalendar format. Passes data to BigCalendarView.
 * Navigates to event detail page on click.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';
import { BigCalendarView } from '@/features/internal-calendar/components/dumb/BigCalendarView';
import { transformToBigCalendarEvents } from '@/features/internal-calendar/utils/calendarEventTransform';
import type {
  BigCalendarEvent,
  InternalCalendarFilters,
} from '@/features/internal-calendar/types/internal-calendar.types';

export interface InternalCalendarViewContainerProps {
  filters?: InternalCalendarFilters;
}

export function InternalCalendarViewContainer({
  filters = {},
}: InternalCalendarViewContainerProps) {
  const router = useRouter();
  const { events, loading, error } = useInternalCalendarEvents(filters);

  // Transform events to BigCalendar format
  const bigCalendarEvents = transformToBigCalendarEvents(events);

  const handleSelectEvent = (event: BigCalendarEvent) => {
    // Navigate to event detail page
    router.push(`/internal-calendar/${event.id}`);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">{error}</p>
      </div>
    );
  }

  return (
    <BigCalendarView
      events={bigCalendarEvents}
      loading={loading}
      onSelectEvent={handleSelectEvent}
    />
  );
}
