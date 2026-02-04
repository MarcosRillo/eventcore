'use client';

import useSWR from 'swr';

import { OrganizerStats } from '@/features/organizer-dashboard/types/organizerStats.types';
import { apiFetcher, organizerKeys } from '@/lib/swr';

interface UseOrganizerStatsReturn {
  stats: OrganizerStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useOrganizerStats = (): UseOrganizerStatsReturn => {
  const { data, error, isLoading, mutate } = useSWR<{ data: OrganizerStats }>(
    organizerKeys.stats,
    apiFetcher
  );

  return {
    stats: data?.data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    refetch: async () => { await mutate(); },
  };
};
