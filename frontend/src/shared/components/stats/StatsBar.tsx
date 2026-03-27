/**
 * StatsBar - Shared presentational component
 *
 * Horizontal stats bar with icon + value + label items.
 * Used by internal-calendar, public-calendar, and organizer-dashboard.
 */

import type { ReactNode } from 'react'

export interface StatBarItem {
  value: number
  label: string
  icon: ReactNode
}

interface StatsBarProps {
  items: StatBarItem[]
  loading: boolean
  skeletonCount?: number
  ariaLabel?: string
}

export function StatsBar({
  items,
  loading,
  skeletonCount = 3,
  ariaLabel = 'Estadísticas',
}: StatsBarProps) {
  if (loading) {
    return (
      <div className="bg-primary-50 border-b border-primary-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-center gap-8" data-testid="stats-loading">
            {Array.from({ length: skeletonCount }).map((_, i) => (
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

  return items.length > 0 ? (
    <div
      className="bg-primary-50 border-b border-primary-100"
      role="region"
      aria-label={ariaLabel}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-primary-700">
              <span aria-hidden="true">{item.icon}</span>
              <span className="font-semibold text-primary-900 tabular-nums">{item.value}</span>
              <span className="hidden sm:inline text-sm text-primary-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : null
}
