/**
 * useAdminStats Hook
 *
 * Custom hook for fetching and managing admin approval statistics.
 * Provides stats data, card data for dashboard, loading states, and refetch capability.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
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
export const useAdminStats = (): UseAdminStatsReturn => {
  const [stats, setStats] = useState<AdminApprovalStats | null>(null);
  const [cardData, setCardData] = useState<AdminStatCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    cardData,
    isLoading,
    error,
    refetch: fetchStats,
  };
};

export default useAdminStats;
