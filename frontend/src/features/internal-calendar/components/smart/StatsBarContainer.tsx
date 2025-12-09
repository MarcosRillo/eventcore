/**
 * StatsBarContainer - Smart Component (Internal Calendar)
 *
 * Container component that fetches stats data and passes to StatsBar.
 * Manages loading state and error handling.
 *
 * Created following TDD methodology.
 */

'use client'

import { useState, useEffect } from 'react'
import { StatsBar } from '@/features/internal-calendar/components/dumb/StatsBar'
import { getInternalStats } from '@/features/internal-calendar/services/internal-calendar-stats.service'
import type { InternalStats } from '@/features/internal-calendar/types/internal-calendar.types'

interface StatsBarContainerProps {
  token: string
}

export function StatsBarContainer({ token }: StatsBarContainerProps) {
  const [stats, setStats] = useState<InternalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getInternalStats(token)
        setStats(data)
      } catch {
        setError('Failed to load statistics')
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [token])

  // Don't render anything if there's an error
  // (fail silently - stats bar is not critical)
  if (error) {
    return null
  }

  return <StatsBar stats={stats} loading={loading} />
}
