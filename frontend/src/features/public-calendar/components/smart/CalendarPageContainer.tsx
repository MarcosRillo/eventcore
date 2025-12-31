/**
 * Calendar Page Container
 * Manages view toggle between Grid and Calendar views
 * Supports server-side initial data to avoid waterfall fetching
 */

'use client'

import { useState, useEffect } from 'react'

import { StatsBar } from '@/features/public-calendar/components/dumb/StatsBar'
import { CalendarViewContainer } from '@/features/public-calendar/components/smart/CalendarViewContainer'
import { PublicCalendarContainer } from '@/features/public-calendar/components/smart/PublicCalendarContainer'
import { publicEventsService } from '@/features/public-calendar/services/public-events.service'
import {
  PublicStats,
  PublicEvent,
  EventType,
  Location,
} from '@/features/public-calendar/types/public-calendar.types'

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
      <StatsBar stats={stats} loading={statsLoading} />

      {/* View Toggle Bar */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-neutral-600">
              Explorá el calendario de eventos turísticos y culturales
            </p>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-neutral-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-primary-600 shadow-sm font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                aria-label="Vista calendario"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Calendario
                </span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary-600 shadow-sm font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                aria-label="Vista cuadrícula"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  Cuadrícula
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
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
      </div>
    </div>
  )
}
