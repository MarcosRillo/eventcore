/**
 * InternalCalendarViewContainer - Smart Component
 *
 * Container for calendar view that fetches events and transforms them
 * to BigCalendar format. Passes data to BigCalendarView.
 */

'use client';

import { useState } from 'react';
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';
import { BigCalendarView } from '@/features/internal-calendar/components/dumb/BigCalendarView';
import { transformToBigCalendarEvents } from '@/features/internal-calendar/utils/calendarEventTransform';
import { EventDetailModal } from '@/features/internal-calendar/components/dumb/EventDetailModal';
import type { BigCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';

export function InternalCalendarViewContainer() {
  const { events, loading, error } = useInternalCalendarEvents();
  const [selectedEvent, setSelectedEvent] = useState<BigCalendarEvent | null>(null);

  // Transform events to BigCalendar format
  const bigCalendarEvents = transformToBigCalendarEvents(events);

  const handleSelectEvent = (event: BigCalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">{error}</p>
      </div>
    );
  }

  return (
    <>
      <BigCalendarView
        events={bigCalendarEvents}
        loading={loading}
        onSelectEvent={handleSelectEvent}
      />

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={true}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
