/**
 * AdminEventFilters Component
 *
 * Unified filter bar combining status pills (with count badges)
 * and temporal toggle (upcoming/past).
 * Dumb component - receives data via props, no business logic.
 */

'use client'

import { Search } from 'lucide-react'

import { FilterPill, Input, SegmentedControl, Select } from '@/shared/components/form'
import type { EventStatusCode, EventTypeInfo } from '@/types/event.types'

export interface AdminStatusCounts {
  total: number
  pending_internal_approval: number
  pending_public_approval: number
  published: number
  requires_changes: number
  rejected: number
}

interface AdminEventFiltersProps {
  activeStatus: EventStatusCode | null
  timeScope: 'upcoming' | 'past'
  onStatusChange: (status: EventStatusCode | null) => void
  onTimeScopeChange: (scope: 'upcoming' | 'past') => void
  statusCounts?: AdminStatusCounts | null
  searchValue?: string
  onSearchChange?: (value: string) => void
  eventTypes?: EventTypeInfo[]
  selectedEventTypeId?: number | null
  onEventTypeChange?: (eventTypeId: number | null) => void
}

const STATUS_FILTERS = [
  { label: 'Todos', value: null, countKey: 'total' as const },
  { label: 'Pend. Interno', value: 'pending_internal_approval' as EventStatusCode, countKey: 'pending_internal_approval' as const },
  { label: 'Pend. Público', value: 'pending_public_approval' as EventStatusCode, countKey: 'pending_public_approval' as const },
  { label: 'Publicados', value: 'published' as EventStatusCode, countKey: 'published' as const },
  { label: 'Req. Cambios', value: 'requires_changes' as EventStatusCode, countKey: 'requires_changes' as const },
  { label: 'Rechazados', value: 'rejected' as EventStatusCode, countKey: 'rejected' as const },
] as const

export const AdminEventFilters = ({
  activeStatus,
  timeScope,
  onStatusChange,
  onTimeScopeChange,
  statusCounts,
  searchValue,
  onSearchChange,
  eventTypes,
  selectedEventTypeId,
  onEventTypeChange,
}: AdminEventFiltersProps) => {
  return (
    <div className="space-y-4 mb-4">
      {/* Search + Event Type filter */}
      {onSearchChange && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 sm:max-w-sm">
            <Input
              name="search-events"
              autoComplete="off"
              placeholder="Buscar por título o descripción…"
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              size="sm"
            />
          </div>
          {onEventTypeChange && (
            <div className="w-full sm:w-56">
              <Select
                value={selectedEventTypeId ?? ''}
                onChange={(val) => onEventTypeChange(val ? Number(val) : null)}
                options={[
                  { value: '', label: 'Todos los tipos' },
                  ...(eventTypes ?? []).map(t => ({ value: t.id, label: t.name })),
                ]}
                placeholder="Tipo de evento"
                size="sm"
              />
            </div>
          )}
        </div>
      )}

      {/* Status pills + Time scope */}
      <div className="flex flex-wrap items-center gap-4">
      {/* Status pills */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar eventos por estado">
        {STATUS_FILTERS.map((filter) => {
          const isActive = activeStatus === filter.value
          const count = filter.countKey && statusCounts ? statusCounts[filter.countKey] : undefined

          return (
            <FilterPill
              key={filter.label}
              active={isActive}
              count={count}
              onClick={() => onStatusChange(filter.value)}
            >
              {filter.label}
            </FilterPill>
          )
        })}
      </div>

      {/* Separator */}
      <div className="hidden sm:block h-6 border-l border-neutral-300" aria-hidden="true" />

      {/* Time scope toggle */}
      <SegmentedControl
        options={[
          { value: 'upcoming', label: 'Próximos' },
          { value: 'past', label: 'Pasados' },
        ]}
        value={timeScope}
        onChange={onTimeScopeChange}
        ariaLabel="Filtrar por periodo"
      />
      </div>
    </div>
  )
}

export default AdminEventFilters
