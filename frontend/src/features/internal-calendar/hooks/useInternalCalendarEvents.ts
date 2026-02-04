import { useMemo } from 'react';
import useSWR from 'swr';

import type {
  InternalCalendarEvent,
  InternalCalendarFilters,
} from '@/features/internal-calendar/types/internal-calendar.types';
import { apiFetcher, internalCalendarKeys } from '@/lib/swr';

interface UseInternalCalendarEventsReturn {
  events: InternalCalendarEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useInternalCalendarEvents(
  filters: InternalCalendarFilters = {}
): UseInternalCalendarEventsReturn {
  const key = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (filters.event_type_id) params.set('event_type_id', String(filters.event_type_id));
    return internalCalendarKeys.events(params.toString());
  }, [filters.status, filters.start_date, filters.end_date, filters.event_type_id]);

  const { data, error, isLoading, mutate } = useSWR<{ data: InternalCalendarEvent[] }>(
    key,
    apiFetcher,
  );

  return {
    events: data?.data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch: async () => { await mutate(); },
  };
}
