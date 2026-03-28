/**
 * Calendar Page Container
 * Manages view toggle between Grid and Calendar views
 * Supports server-side initial data to avoid waterfall fetching
 */

'use client'

import { Calendar, LayoutGrid, Tag, TrendingUp } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Suspense,useEffect,useState } from 'react'

import { publicEventsService } from '@/features/public-calendar/services/public-events.service'
import {
  EventType,
  Location,
  PublicEvent,
  PublicStats,
} from '@/features/public-calendar/types/public-calendar.types'
import { SkeletonCard } from '@/shared/components/feedback'
import type { StatBarItem } from '@/shared/components/stats'
import { StatsBar } from '@/shared/components/stats'

// Lazy load view containers - only the active view is loaded
const CalendarViewContainer = dynamic(
  () => import('@/features/public-calendar/components/smart/CalendarViewContainer').then(mod => ({ default: mod.CalendarViewContainer })),
  { ssr: false }
)
const PublicCalendarContainer = dynamic(
  () => import('@/features/public-calendar/components/smart/PublicCalendarContainer').then(mod => ({ default: mod.PublicCalendarContainer })),
  { ssr: false }
)

// Loading fallback for calendar views
const CalendarViewSkeleton = () => (
  <div className="space-y-4">
    <div className="h-12 bg-neutral-200 rounded-lg animate-pulse" />
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
      {Array.from({ length: 35 }).map((_, i) => (
        <SkeletonCard key={i} className="aspect-square" />
      ))}
    </div>
  </div>
)

function buildStatsItems(stats: PublicStats): StatBarItem[] {
  return [
    { value: stats.total_events, label: 'Eventos publicados', icon: <Calendar className="w-5 h-5" /> },
    { value: stats.total_event_types, label: 'Tipos de eventos activos', icon: <Tag className="w-5 h-5" /> },
    { value: stats.events_this_month, label: 'Este mes', icon: <TrendingUp className="w-5 h-5" /> },
  ]
}

type ViewMode = 'grid' | 'calendar'

interface CalendarPageContainerProps {
  initialStats?: PublicStats | null
  initialEvents?: PublicEvent[]
  initialEventTypes?: EventType[]
  initialLocations?: Location[]
}

export const CalendarPageContainer = ({
  initialStats,
  initialEvents,
  initialEventTypes,
  initialLocations,
}: CalendarPageContainerProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [stats, setStats] = useState<PublicStats | null>(initialStats ?? null)
  const [statsLoading, setStatsLoading] = useState(initialStats === undefined)

  // Fetch stats only if not provided from server
  useEffect(() => {
    if (initialStats !== undefined) {
      return
    }

    const fetchStats = async () => {
      try {
        const response = await publicEventsService.getStats()
        setStats(response.data)
      } catch {
        setStats(null)
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [initialStats])

  return (
    <div className="bg-neutral-50">
      {/* Stats Bar */}
      <StatsBar
        items={stats ? buildStatsItems(stats) : []}
        loading={statsLoading}
        ariaLabel="Estadísticas del calendario público"
      />

      {/* View Toggle Bar */}
      <div className="bg-white border-b border-neutral-200">
        <div className="py-4">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3">
            <p className="hidden sm:block text-neutral-600">
              Explorá el calendario de eventos turísticos y culturales
            </p>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-neutral-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 min-h-[44px] rounded-md transition-colors motion-reduce:transition-none ${
                  viewMode === 'calendar'
                    ? 'bg-white text-primary-600 shadow-sm font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                aria-label="Vista calendario"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" aria-hidden="true" />
                  Calendario
                </span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 min-h-[44px] rounded-md transition-colors motion-reduce:transition-none ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary-600 shadow-sm font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                aria-label="Vista cuadrícula"
              >
                <span className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5" aria-hidden="true" />
                  Cuadrícula
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-6">
        <Suspense fallback={<CalendarViewSkeleton />}>
          {viewMode === 'calendar' ? (
            <CalendarViewContainer
              initialEvents={initialEvents}
              initialEventTypes={initialEventTypes}
              initialLocations={initialLocations}
            />
          ) : (
            <PublicCalendarContainer
              initialEvents={initialEvents}
              initialEventTypes={initialEventTypes}
              initialLocations={initialLocations}
            />
          )}
        </Suspense>
      </div>
    </div>
  )
}
