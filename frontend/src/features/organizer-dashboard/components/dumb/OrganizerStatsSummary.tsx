/**
 * OrganizerStatsSummary - Dumb Component
 *
 * Compact horizontal stats bar for organizer dashboard.
 * Read-only display (not clickable). Follows StatsBar pattern.
 */

'use client'

import type { OrganizerStats } from '@/features/organizer-dashboard/types/organizerStats.types'

interface OrganizerStatsSummaryProps {
  stats: OrganizerStats | null
  loading: boolean
}

export const OrganizerStatsSummary = ({ stats, loading }: OrganizerStatsSummaryProps) => {
  if (loading) {
    return (
      <div className="bg-primary-50 border-b border-primary-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-center gap-8" data-testid="stats-loading">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-2">
                <div className="h-5 w-12 bg-primary-200 rounded" />
                <div className="h-4 w-20 bg-primary-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statItems = [
    {
      value: stats.total_events,
      label: 'Total eventos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      value: stats.upcoming_events,
      label: 'Proximos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      value: stats.past_events,
      label: 'Pasados',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      value: stats.pending_internal,
      label: 'Pendientes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      ),
    },
    {
      value: stats.requires_changes,
      label: 'Req. cambios',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
    },
  ]

  return (
    <div
      className="bg-primary-50 border-b border-primary-100"
      role="region"
      aria-label="Resumen de estadisticas"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
          {statItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-primary-700">
              {item.icon}
              <span className="font-semibold text-primary-900 tabular-nums">{item.value}</span>
              <span className="text-sm text-primary-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
