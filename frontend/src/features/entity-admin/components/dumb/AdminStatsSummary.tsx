/**
 * AdminStatsSummary Component
 *
 * Compact horizontal stats bar with clickeable stats.
 * Dumb component - receives data via props, no business logic.
 */

'use client'

import { memo } from 'react'

import type { AdminApprovalStats } from '@/features/entity-admin/types'
import { FilterPill } from '@/shared/components/form'
import type { EventStatusCode } from '@/types/event.types'

interface StatItemConfig {
  key: keyof AdminApprovalStats
  label: string
  shortLabel: string
  statusFilter: EventStatusCode | null
}

const STAT_ITEMS: StatItemConfig[] = [
  { key: 'total', label: 'Total', shortLabel: 'Total', statusFilter: null },
  { key: 'pending_internal_approval', label: 'Pend. Interno', shortLabel: 'P.Int', statusFilter: 'pending_internal_approval' },
  { key: 'pending_public_approval', label: 'Pend. Público', shortLabel: 'P.Pub', statusFilter: 'pending_public_approval' },
  { key: 'published', label: 'Publicados', shortLabel: 'Pub', statusFilter: 'published' },
  { key: 'requires_changes', label: 'Req. Cambios', shortLabel: 'Req.C', statusFilter: 'requires_changes' },
]

interface AdminStatsSummaryProps {
  stats: AdminApprovalStats | null
  activeFilter: EventStatusCode | null
  onStatClick: (status: EventStatusCode | null) => void
  isLoading?: boolean
}

/**
 * Skeleton loading state for stats bar
 */
function AdminStatsSummarySkeleton() {
  return (
    <div className="bg-primary-50 border-b border-primary-100">
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
        {STAT_ITEMS.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md"
          >
            <div className="h-4 w-16 bg-primary-200 rounded animate-pulse" />
            <div className="h-5 w-6 bg-primary-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * AdminStatsSummary Component
 *
 * Displays a compact horizontal stats bar with clickeable filters.
 * Each stat shows a label and count, clicking filters the event list.
 */
export const AdminStatsSummary = memo(function AdminStatsSummary({
  stats,
  activeFilter,
  onStatClick,
  isLoading = false,
}: AdminStatsSummaryProps) {
  if (isLoading || !stats) {
    return <AdminStatsSummarySkeleton />
  }

  return (
    <div className="bg-primary-50 border-b border-primary-100">
      <div
        className="flex items-center gap-1 px-4 py-2 overflow-x-auto"
        role="group"
        aria-label="Filtrar eventos por estadística"
      >
        {STAT_ITEMS.map((item) => {
          const isActive = activeFilter === item.statusFilter
          const count = stats[item.key]

          return (
            <FilterPill
              key={item.key}
              active={isActive}
              count={count}
              onClick={() => onStatClick(item.statusFilter)}
              variant="subtle"
              className="whitespace-nowrap"
            >
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel}</span>
            </FilterPill>
          )
        })}
      </div>
    </div>
  )
})

export default AdminStatsSummary
