'use client';

import { useState, useEffect } from 'react';

import { organizerStatsService } from '@/features/organizer-dashboard/services/organizerStatsService';
import { OrganizerStats } from '@/features/organizer-dashboard/types/organizerStats.types';

interface UseOrganizerStatsReturn {
  stats: OrganizerStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useOrganizerStats = (): UseOrganizerStatsReturn => {
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizerStatsService.getStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
