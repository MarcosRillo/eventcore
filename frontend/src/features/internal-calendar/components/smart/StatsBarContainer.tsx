'use client';

/**
 * StatsBarContainer - Smart Component (Internal Calendar)
 *
 * Container component that fetches stats data and passes to shared StatsBar.
 * Manages loading state and error handling.
 */

import { Calendar, Tag, TrendingUp } from 'lucide-react'

import { useInternalStats } from '@/features/internal-calendar/hooks/useInternalStats'
import type { InternalStats } from '@/features/internal-calendar/types/internal-calendar.types'
import type { StatBarItem } from '@/shared/components/stats'
import { StatsBar } from '@/shared/components/stats'

interface StatsBarContainerProps {
  token: string
}

function buildItems(stats: InternalStats): StatBarItem[] {
  return [
    { value: stats.total_events, label: 'Eventos aprobados', icon: <Calendar className="w-5 h-5" /> },
    { value: stats.total_event_types, label: 'Tipos de eventos activos', icon: <Tag className="w-5 h-5" /> },
    { value: stats.events_this_month, label: 'Este mes', icon: <TrendingUp className="w-5 h-5" /> },
  ]
}

export function StatsBarContainer({ token }: StatsBarContainerProps) {
  const { stats, loading, error } = useInternalStats(token)

  // Don't render anything if there's an error
  // (fail silently - stats bar is not critical)
  if (error) {
    return null
  }

  return (
    <StatsBar
      items={stats ? buildItems(stats) : []}
      loading={loading}
      ariaLabel="Estadísticas del calendario interno"
    />
  )
}
