'use client';

/**
 * InternalCalendarViewContainer - Smart Component
 *
 * Container for calendar view that transforms events
 * to BigCalendar format. Passes data to BigCalendarView.
 * Navigates to event detail page on click.
 */

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { View } from 'react-big-calendar';

import { BigCalendarView } from '@/features/internal-calendar/components/dumb/BigCalendarView';
import type {
  BigCalendarEvent,
  InternalCalendarEvent,
} from '@/features/internal-calendar/types/internal-calendar.types';
import { transformToBigCalendarEvents } from '@/features/internal-calendar/utils/calendarEventTransform';

export interface InternalCalendarViewContainerProps {
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
export function InternalCalendarViewContainer({
  events,
  loading,
  error,
  basePath,
}: InternalCalendarViewContainerProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>('month');

  // Transform events to BigCalendar format (memoized to avoid recalculation on every render)
  const bigCalendarEvents = useMemo(
    () => transformToBigCalendarEvents(events),
    [events]
  );

  const handleSelectEvent = (event: BigCalendarEvent) => {
    // Navigate to event detail page
    router.push(`${basePath}/${event.id}`);
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
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
      currentDate={currentDate}
      currentView={currentView}
      onNavigate={handleNavigate}
      onView={handleViewChange}
    />
  );
}
