/**
 * StatsBar - Dumb Component
 * Displays public calendar statistics
 */

import { PublicStats } from '@/features/public-calendar/types/public-calendar.types'

interface StatsBarProps {
  stats: PublicStats | null
  loading: boolean
}

export function StatsBar({ stats, loading }: StatsBarProps) {
  if (loading) {
    return (
      <div className="bg-primary-50 border-b border-primary-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-center gap-8">
            {[1, 2, 3].map((i) => (
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
      label: 'Eventos publicados',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      value: stats.total_categories,
      label: 'Categorías activas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      value: stats.events_this_month,
      label: 'Este mes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
  ]

  return (
    <div className="bg-primary-50 border-b border-primary-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
          {statItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-primary-700">
              {item.icon}
              <span className="font-semibold text-primary-900">{item.value}</span>
              <span className="text-sm text-primary-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StatsBar
