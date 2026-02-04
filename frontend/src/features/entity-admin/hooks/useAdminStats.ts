'use client';

import { useMemo } from 'react';
import useSWR from 'swr';

import { adminStatsService } from '@/features/entity-admin/services';
import type { AdminApprovalStats, AdminStatCardData } from '@/features/entity-admin/types';
import { adminKeys, apiFetcher } from '@/lib/swr';

interface UseAdminStatsReturn {
  stats: AdminApprovalStats | null;
  cardData: AdminStatCardData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAdminStats = (initialStats?: AdminApprovalStats | null): UseAdminStatsReturn => {
  const { data, error, isLoading, mutate } = useSWR<{ data: AdminApprovalStats }>(
    adminKeys.stats,
    apiFetcher,
    { fallbackData: initialStats ? { data: initialStats } : undefined }
  );

  const stats = data?.data ?? null;

  const cardData = useMemo(
    () => stats ? adminStatsService.transformStatsToCardData(stats) : [],
    [stats]
  );

  return {
    stats,
    cardData,
    isLoading,
    error: error?.message ?? null,
    refetch: async () => { await mutate(); },
  };
};

export default useAdminStats;
