/**
 * InternalCalendarGridContainer - Smart Component
 *
 * Container for grid view that manages event data.
 * Passes data to InternalCalendar dumb component.
 */

'use client';

import { InternalCalendar } from '@/features/internal-calendar/components/dumb/InternalCalendar';
import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';

export interface InternalCalendarGridContainerProps {
  events: InternalCalendarEvent[];
  loading: boolean;
  error: string | null;
}

/**
 *
 * @param root0
 * @param root0.events
 * @param root0.loading
 * @param root0.error
 */
export function InternalCalendarGridContainer({
  events,
  loading,
  error,
}: InternalCalendarGridContainerProps) {
  return <InternalCalendar events={events} loading={loading} error={error} />;
}
