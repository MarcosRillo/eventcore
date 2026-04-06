import { useCallback, useEffect, useState } from 'react';

import { getEvent } from '@/features/organizer/services/organizer-event.service';
import type { OrganizerEvent } from '@/features/organizer/types/event.types';

interface UseOrganizerEventDetailReturn {
  event: OrganizerEvent | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Fetches an organizer event by ID with refetch support.
 * `refetch` is exposed so the container can reload after actions like submit/delete.
 */
export function useOrganizerEventDetail(eventId: number): UseOrganizerEventDetailReturn {
  const [event, setEvent] = useState<OrganizerEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const eventData = await getEvent(eventId);
      setEvent(eventData);
    } catch {
      setError('Error al cargar el evento');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId, fetchEvent]);

  return { event, loading, error, refetch: fetchEvent };
}
