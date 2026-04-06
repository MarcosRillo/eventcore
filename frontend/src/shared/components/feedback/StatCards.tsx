/**
 * StatCards - Shared presentational component
 *
 * Renders a responsive 3-column grid of stat cards.
 * Extracted from admin page containers (Sectors, EventTypes, Locations).
 */

import type { ReactNode } from 'react'

interface StatCardItem {
  label: string
  value: number
  icon: ReactNode
  valueClassName?: string
  iconBgClassName?: string
  iconClassName?: string
}

interface StatCardsProps {
  items: StatCardItem[]
}

export function StatCards({ items }: StatCardsProps) {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <div key={index} className="bg-white rounded-lg shadow px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">{item.label}</p>
              <p className={`text-2xl font-bold ${item.valueClassName ?? 'text-neutral-900'}`}>
                {item.value}
              </p>
            </div>
            <div className={`p-3 rounded-full ${item.iconBgClassName ?? 'bg-primary-100'}`}>
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
