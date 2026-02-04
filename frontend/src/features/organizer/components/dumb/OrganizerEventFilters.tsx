/**
 * OrganizerEventFilters - Dumb Component
 *
 * Unified filter bar combining status pills (with count badges)
 * and temporal toggle (upcoming/past).
 */

'use client'

interface StatusCounts {
  total: number
  draft: number
  pending_internal: number
  approved_internal: number
  published: number
  requires_changes: number
  rejected: number
}

interface OrganizerEventFiltersProps {
  activeStatus: string | null
  timeScope: 'upcoming' | 'past'
  onStatusChange: (status: string | null) => void
  onTimeScopeChange: (scope: 'upcoming' | 'past') => void
  statusCounts?: StatusCounts | null
}

const STATUS_FILTERS = [
  { label: 'Todos', value: null, countKey: 'total' as const },
  { label: 'Borrador', value: 'draft', countKey: 'draft' as const },
  { label: 'Pendiente', value: 'pending_internal_approval', countKey: 'pending_internal' as const },
  { label: 'Aprobado', value: 'approved_internal', countKey: 'approved_internal' as const },
  { label: 'Publicado', value: 'published', countKey: 'published' as const },
  { label: 'Req. Cambios', value: 'requires_changes', countKey: 'requires_changes' as const },
  { label: 'Rechazado', value: 'rejected', countKey: 'rejected' as const },
] as const

export const OrganizerEventFilters = ({
  activeStatus,
  timeScope,
  onStatusChange,
  onTimeScopeChange,
  statusCounts,
}: OrganizerEventFiltersProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      {/* Status pills */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar eventos por estado">
        {STATUS_FILTERS.map((filter) => {
          const isActive = activeStatus === filter.value
          const count = statusCounts?.[filter.countKey]

          return (
            <button
              key={filter.label}
              onClick={() => onStatusChange(filter.value)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none
                ${isActive
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-300'
                }
              `}
              aria-pressed={isActive}
            >
              {filter.label}
              {count !== undefined && (
                <span
                  className={`ml-1.5 tabular-nums ${
                    isActive ? 'text-primary-200' : 'text-neutral-400'
                  }`}
                >
                  ({count})
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Separator */}
      <div className="hidden sm:block h-6 border-l border-neutral-300" aria-hidden="true" />

      {/* Time scope toggle */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1" role="group" aria-label="Filtrar por periodo">
        <button
          onClick={() => onTimeScopeChange('upcoming')}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none
            ${timeScope === 'upcoming'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
            }
          `}
          aria-pressed={timeScope === 'upcoming'}
        >
          Proximos
        </button>
        <button
          onClick={() => onTimeScopeChange('past')}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none
            ${timeScope === 'past'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
            }
          `}
          aria-pressed={timeScope === 'past'}
        >
          Pasados
        </button>
      </div>
    </div>
  )
}
