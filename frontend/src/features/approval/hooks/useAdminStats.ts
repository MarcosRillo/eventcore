/**
 * Custom hook for admin stats
 *
 * Fetches and manages approval statistics for admin dashboard.
 * Accepts optional initialStats from server-side fetch to avoid waterfall.
 */

import { useState, useEffect } from 'react'

import { adminStatsService } from '@/features/approval/services/admin-stats.service'
import { AdminStats } from '@/features/approval/types/approval.types'

interface UseAdminStatsReturn {
  stats: AdminStats | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useAdminStats = (initialStats?: AdminStats | null): UseAdminStatsReturn => {
  const [stats, setStats] = useState<AdminStats | null>(initialStats ?? null)
  const [loading, setLoading] = useState(!initialStats)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminStatsService.getSummary()
      setStats(data)
    } catch {
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Skip initial fetch if we have server-provided data
    if (!initialStats) {
      fetchStats()
    }
  }, [initialStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}
