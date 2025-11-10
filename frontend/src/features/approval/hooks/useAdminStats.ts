/**
 * Custom hook for admin stats
 *
 * Fetches and manages approval statistics for admin dashboard.
 */

import { useState, useEffect } from 'react'
import { adminStatsService } from '../services/admin-stats.service'
import { AdminStats } from '../types/approval.types'

interface UseAdminStatsReturn {
  stats: AdminStats | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useAdminStats = (): UseAdminStatsReturn => {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
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
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}
