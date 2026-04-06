import { useEffect, useState } from 'react';

import { internalCalendarService } from '@/features/internal-calendar/services/internalCalendar.service';
import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';

interface UseInternalEventDetailReturn {
  event: InternalCalendarEvent | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches an internal calendar event by ID.
 * Handles loading, not-found ("Evento no encontrado"), and error states.
 */
export function useInternalEventDetail(eventId: number): UseInternalEventDetailReturn {
  const [event, setEvent] = useState<InternalCalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);

      try {
        const foundEvent = await internalCalendarService.getEventById(eventId);

        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          setError('Evento no encontrado');
        }
      } catch {
        setError('Error al cargar el evento');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  return { event, loading, error };
}
