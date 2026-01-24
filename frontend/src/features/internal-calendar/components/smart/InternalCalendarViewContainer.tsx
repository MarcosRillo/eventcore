/**
 * InternalCalendarViewContainer - Smart Component
 *
 * Container for calendar view that fetches events and transforms them
 * to BigCalendar format. Passes data to BigCalendarView.
 * Navigates to event detail page on click.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { View } from 'react-big-calendar';

import { BigCalendarView } from '@/features/internal-calendar/components/dumb/BigCalendarView';
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';
import type {
  BigCalendarEvent,
  InternalCalendarFilters,
} from '@/features/internal-calendar/types/internal-calendar.types';
import { transformToBigCalendarEvents } from '@/features/internal-calendar/utils/calendarEventTransform';

export interface InternalCalendarViewContainerProps {
  filters?: InternalCalendarFilters;
}

/**
 *
 * @param root0
 * @param root0.filters
 */
export function InternalCalendarViewContainer({
  filters = {},
}: InternalCalendarViewContainerProps) {
  const router = useRouter();
  const { events, loading, error } = useInternalCalendarEvents(filters);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>('month');

  // Transform events to BigCalendar format
  const bigCalendarEvents = transformToBigCalendarEvents(events);

  const handleSelectEvent = (event: BigCalendarEvent) => {
    // Navigate to event detail page
    router.push(`/internal-calendar/${event.id}`);
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
