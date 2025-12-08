import { useState, useEffect, useCallback, useMemo } from 'react';
import { internalCalendarService } from '@/features/internal-calendar/services/internalCalendar.service';
import type {
  InternalCalendarEvent,
  InternalCalendarFilters,
} from '@/features/internal-calendar/types/internal-calendar.types';

/**
 * Hook return type
 */
interface UseInternalCalendarEventsReturn {
  events: InternalCalendarEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing internal calendar events
 *
 * Fetches events on mount and provides a refetch function for manual refreshes.
 * Handles loading and error states automatically.
 *
 * @param filters - Optional filters for events
 * @returns Object containing events, loading state, error, and refetch function
 *
 * @example
 * ```tsx
 * const { events, loading, error, refetch } = useInternalCalendarEvents({
 *   status: 'published',
 *   start_date: '2025-12-01',
 *   end_date: '2025-12-31'
 * });
 * ```
 */
export function useInternalCalendarEvents(
  filters: InternalCalendarFilters = {}
): UseInternalCalendarEventsReturn {
  const [events, setEvents] = useState<InternalCalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized filters key for deep comparison (prevents infinite loops)
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  // Fetch on mount and when filters change
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await internalCalendarService.getEvents(filters);
        setEvents(data);
      } catch (err) {
        // Handle error gracefully
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch internal calendar events');
        }
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]); // Using filtersKey for deep comparison instead of filters to prevent infinite loops

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await internalCalendarService.getEvents(filters);
      setEvents(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch internal calendar events');
      }
      setEvents([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]); // Using filtersKey instead of filters to prevent unnecessary recreations

  return {
    events,
    loading,
    error,
    refetch,
  };
}
