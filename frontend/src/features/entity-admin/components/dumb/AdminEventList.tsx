/**
 * AdminEventList Component
 *
 * Container for admin event cards with staggered animations,
 * empty state, and error state handling.
 * Dumb component - receives data via props, no business logic.
 */

'use client'

import { AdminEventListItem } from '@/features/entity-admin/components/dumb/AdminEventListItem'
import { AdminEventListItemSkeletons } from '@/features/entity-admin/components/dumb/AdminEventListItemSkeleton'
import EmptyState, { EmptyStateIcons } from '@/shared/components/feedback/EmptyState'
import { Button } from '@/shared/components/form'
import type { Event } from '@/types/event.types'

interface AdminEventListProps {
  events: Event[]
  isLoading: boolean
  error: string | null
  hasActiveFilter: boolean
  onManage: (event: Event) => void
  onRetry?: () => void
  onClearFilters?: () => void
}

// JSX estatico extraido fuera del componente (rendering-hoist-jsx)
const errorIcon = EmptyStateIcons.inbox
const emptyIcon = EmptyStateIcons.calendar
const filteredEmptyIcon = EmptyStateIcons.search

export const AdminEventList = ({
  events,
  isLoading,
  error,
  hasActiveFilter,
  onManage,
  onRetry,
  onClearFilters,
}: AdminEventListProps) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-3 p-4 min-h-[400px]">
        <AdminEventListItemSkeletons count={5} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        icon={errorIcon}
        title="Error al cargar eventos"
        description={error}
        action={
          onRetry && (
            <Button variant="primary" size="sm" onClick={onRetry}>
              Reintentar
            </Button>
          )
        }
      />
    )
  }

  // Empty state - no events with active filter
  if (events.length === 0 && hasActiveFilter) {
    return (
      <EmptyState
        icon={filteredEmptyIcon}
        title="No hay eventos con estos filtros"
        description="Intenta con otros filtros o limpia la selección actual"
        action={
          onClearFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Limpiar filtros
            </Button>
          )
        }
      />
    )
  }

  // Empty state - no events at all
  if (events.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title="No hay eventos"
        description="Los eventos aparecerán aquí cuando se creen"
      />
    )
  }

  // Event list with staggered animations
  return (
    <div className="space-y-3 p-4 min-h-[400px]">
      {events.map((event, index) => (
        <AdminEventListItem
          key={event.id}
          event={event}
          index={index}
          onManage={() => onManage(event)}
        />
      ))}
    </div>
  )
}

export default AdminEventList
