/**
 * InternalCalendarGridContainer - Smart Component
 *
 * Container for grid view that fetches and manages event data.
 * Passes data to InternalCalendar dumb component.
 * Navigates to event detail page on click.
 */

'use client';

import { useRouter } from 'next/navigation';

import { InternalCalendar } from '@/features/internal-calendar/components/dumb/InternalCalendar';
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';
import type { InternalCalendarFilters } from '@/features/internal-calendar/types/internal-calendar.types';

export interface InternalCalendarGridContainerProps {
  filters?: InternalCalendarFilters;
}

/**
 *
 * @param root0
 * @param root0.filters
 */
export function InternalCalendarGridContainer({
  filters = {},
}: InternalCalendarGridContainerProps) {
  const router = useRouter();
  const { events, loading, error } = useInternalCalendarEvents(filters);

  const handleEventClick = (eventId: number) => {
    // Navigate to event detail page
    router.push(`/internal-calendar/${eventId}`);
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
