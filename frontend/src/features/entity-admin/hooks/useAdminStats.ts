/**
 * useAdminStats Hook
 *
 * Custom hook for fetching and managing admin approval statistics.
 * Provides stats data, card data for dashboard, loading states, and refetch capability.
 * Accepts optional initialStats from server-side fetch to avoid waterfall.
 */

'use client';

import { useCallback,useEffect, useState } from 'react';

import { adminStatsService } from '@/features/entity-admin/services';
import type { AdminApprovalStats, AdminStatCardData } from '@/features/entity-admin/types';

interface UseAdminStatsReturn {
  stats: AdminApprovalStats | null;
  cardData: AdminStatCardData[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing admin approval statistics
 */
export const useAdminStats = (initialStats?: AdminApprovalStats | null): UseAdminStatsReturn => {
  const [stats, setStats] = useState<AdminApprovalStats | null>(initialStats ?? null);
  const [cardData, setCardData] = useState<AdminStatCardData[]>(
    initialStats ? adminStatsService.transformStatsToCardData(initialStats) : []
  );
  const [isLoading, setIsLoading] = useState(!initialStats);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await adminStatsService.getApprovalStats();
      setStats(data);
      setCardData(adminStatsService.transformStatsToCardData(data));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(errorMessage);
      setStats(null);
      setCardData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Skip initial fetch if we have server-provided data
    if (!initialStats) {
      fetchStats();
    }
  }, [fetchStats, initialStats]);

  return {
    stats,
    cardData,
    isLoading,
    error,
    refetch: fetchStats,
  };
};

export default useAdminStats;
