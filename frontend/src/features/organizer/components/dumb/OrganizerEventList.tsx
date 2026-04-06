import { OrganizerEventListItem } from '@/features/organizer/components/smart/OrganizerEventListItem'
import { OrganizerEvent } from '@/features/organizer/types/event.types'
import { EventPreviewCardSkeletons } from '@/shared/components/display'
import EmptyState, { EmptyStateIcons } from '@/shared/components/feedback/EmptyState'
import { Button } from '@/shared/components/form'
import { EventGrid } from '@/shared/components/layout'

interface OrganizerEventListProps {
  events: OrganizerEvent[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  total: number
  statusFilter: string | null
  isDeleting: boolean
  onPageChange: (page: number) => void
  onStatusFilter: (status: string | null) => void
  onEdit: (id: number) => void
  onView: (id: number) => void
  onSuccess?: () => void
  onRetry: () => void
}

export const OrganizerEventList = ({
  events,
  loading,
  error,
  currentPage,
  totalPages,
  total,
  statusFilter,
  isDeleting,
  onPageChange,
  onStatusFilter,
  onEdit,
  onView,
  onSuccess,
  onRetry
}: OrganizerEventListProps) => {
  // Loading state
  if (loading) {
    return (
      <EventGrid columns={{ sm: 1, md: 2, lg: 3 }} gap={6}>
        <EventPreviewCardSkeletons count={6} />
      </EventGrid>
    )
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        icon={EmptyStateIcons.inbox}
        title="Error al cargar eventos"
        description={error}
        action={
          <Button variant="primary" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        }
      />
    )
  }

  // Empty state - no events at all
  if (events.length === 0 && !statusFilter) {
    return (
      <EmptyState
        icon={EmptyStateIcons.calendar}
        title="Aun no tienes eventos"
        description="Crea tu primer evento para comenzar"
      />
    )
  }

  // Empty state - no matching filter
  if (events.length === 0 && statusFilter) {
    return (
      <EmptyState
        icon={EmptyStateIcons.search}
        title="No se encontraron eventos"
        description="Prueba con un filtro diferente o crea un nuevo evento"
        action={
          <Button variant="outline" size="sm" onClick={() => onStatusFilter(null)}>
            Limpiar filtros
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label htmlFor="status-filter" className="text-sm font-medium text-neutral-700">
            Filter by status:
          </label>
          <select
            id="status-filter"
            value={statusFilter || ''}
            onChange={(e) => onStatusFilter(e.target.value || null)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="text-sm text-neutral-600">
          Total: {total} events
        </div>
      </div>

      {/* Event Grid */}
      <EventGrid columns={{ sm: 1, md: 2, lg: 3 }} gap={6}>
        {events.map((event) => (
          <OrganizerEventListItem
            key={event.id}
            event={event}
            onEdit={() => onEdit(event.id)}
            onView={() => onView(event.id)}
            onSuccess={onSuccess}
            disabled={isDeleting}
          />
        ))}
      </EventGrid>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>

          <span className="text-sm text-neutral-600">
            Pagina {currentPage} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Deleting overlay */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <p>Eliminando evento...</p>
          </div>
        </div>
      )}
    </div>
  )
}
