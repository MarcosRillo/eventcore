import { useEffect, useState } from 'react';

import { publicEventsService } from '@/features/public-calendar/services/public-events.service';
import type { PublicStats } from '@/features/public-calendar/types/public-calendar.types';

interface UsePublicStatsReturn {
  stats: PublicStats | null;
  statsLoading: boolean;
}

/**
 * Fetches public calendar statistics.
 * SSR optimization: if `initialStats` is provided, skips the fetch entirely.
 */
export function usePublicStats(initialStats?: PublicStats | null): UsePublicStatsReturn {
  const [stats, setStats] = useState<PublicStats | null>(initialStats ?? null);
  const [statsLoading, setStatsLoading] = useState(initialStats === undefined);

  useEffect(() => {
    if (initialStats !== undefined) {
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await publicEventsService.getStats();
        setStats(response.data);
      } catch {
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [initialStats]);

  return { stats, statsLoading };
}
