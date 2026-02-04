import useSWR from 'swr';

import { apiFetcher, eventKeys } from '@/lib/swr';
import type { EventDetailResponse } from '@/services/eventApprovalService';

interface UseEventDetailReturn {
  event: EventDetailResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseEventDetailOptions {
  enabled?: boolean;
}

export const useEventDetail = (
  eventId: number | null,
  options: UseEventDetailOptions = {}
): UseEventDetailReturn => {
  const { enabled = true } = options;

  const key = eventId && enabled ? eventKeys.detail(eventId) : null;

  const { data, error, isLoading, mutate } = useSWR<EventDetailResponse>(
    key,
    apiFetcher
  );

  return {
    event: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch: async () => { await mutate(); },
  };
};
