import { Calendar, MapPin, Tag } from 'lucide-react'

import Badge from '@/components/ui/Badge'
import { EventActionButtonsContainer } from '@/features/organizer/components/smart/EventActionButtonsContainer'
import { OrganizerEvent } from '@/features/organizer/types/event.types'
import { Button } from '@/shared/components/form'

interface OrganizerEventListItemProps {
  event: OrganizerEvent
  onEdit: () => void
  onView: () => void
  onSuccess?: () => void
  disabled?: boolean
}

export const OrganizerEventListItem = ({
  event,
  onEdit,
  onView,
  onSuccess,
  disabled = false
}: OrganizerEventListItemProps) => {
  const statusBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    draft: 'default',
    pending: 'warning',
    pending_internal_approval: 'warning',
    approved_internal: 'success',
    approved: 'success',
    rejected: 'danger',
    published: 'info',
    requires_changes: 'warning',
    cancelled: 'default'
  }

  // Extract status code from status object or use as string
  const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status
  const statusDisplay = typeof event.status === 'object' ? event.status.status_name : event.status

  // Get event date
  const eventDate = event.start_date

  // Get location name from locations array
  const locationName = event.locations?.[0]?.name || 'N/A'

  // Get event type and subtype names
  const eventTypeName = event.event_type?.name || 'N/A'
  const eventSubtypeName = event.event_subtype?.name

  return (
    <article className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 hover:shadow-md transition-all duration-150 gap-4">
      <div className="flex-1">
        <h3 className="text-base font-semibold text-neutral-900">{event.title}</h3>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>{eventDate ? new Date(eventDate).toLocaleDateString('es-AR') : 'Sin fecha'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>{locationName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Tag className="w-4 h-4 text-neutral-400 shrink-0" />
            <span>
              {eventTypeName}
              {eventSubtypeName && ` - ${eventSubtypeName}`}
            </span>
          </div>
        </div>
        <Badge
          variant={statusBadgeVariant[statusCode as keyof typeof statusBadgeVariant] || 'default'}
          size="sm"
          dot
          className="mt-3"
        >
          {statusDisplay}
        </Badge>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onView}
          disabled={disabled}
          aria-label={`Ver ${event.title}`}
        >
          Ver
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onEdit}
          disabled={disabled}
          aria-label={`Editar ${event.title}`}
        >
          Editar
        </Button>

        <EventActionButtonsContainer
          event={event}
          onSuccess={onSuccess}
        />
      </div>
    </article>
  )
}
