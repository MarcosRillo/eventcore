import { useEffect, useState } from 'react';

import { getInternalStats } from '@/features/internal-calendar/services/internal-calendar-stats.service';
import type { InternalStats } from '@/features/internal-calendar/types/internal-calendar.types';

interface UseInternalStatsReturn {
  stats: InternalStats | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches internal calendar statistics using the provided auth token.
 * Fails silently — stats bar is not critical.
 */
export function useInternalStats(token: string): UseInternalStatsReturn {
  const [stats, setStats] = useState<InternalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getInternalStats(token);
        setStats(data);
      } catch {
        setError('Failed to load statistics');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  return { stats, loading, error };
}
