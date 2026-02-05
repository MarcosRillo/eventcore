'use client';

import { useMemo } from 'react';
import useSWR from 'swr';

import type { AdminStatusCounts } from '@/features/entity-admin/components/dumb/AdminEventFilters';
import { adminStatsService } from '@/features/entity-admin/services';
import type { AdminApprovalStats, AdminStatCardData } from '@/features/entity-admin/types';
import { adminKeys, apiFetcher } from '@/lib/swr';

interface UseAdminStatsReturn {
  stats: AdminApprovalStats | null;
  cardData: AdminStatCardData[];
  statusCounts: AdminStatusCounts | null;
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

  // Derive status counts for filter badges
  const statusCounts: AdminStatusCounts | null = stats ? {
    total: stats.total,
    pending_internal_approval: stats.pending_internal_approval,
    pending_public_approval: stats.pending_public_approval,
    published: stats.published,
    requires_changes: stats.requires_changes,
    rejected: stats.rejected,
  } : null;

  return {
    stats,
    cardData,
    statusCounts,
    isLoading,
    error: error?.message ?? null,
    refetch: async () => { await mutate(); },
  };
};

export default useAdminStats;
