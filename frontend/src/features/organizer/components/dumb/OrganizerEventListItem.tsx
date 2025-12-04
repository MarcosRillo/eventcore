import { OrganizerEvent } from '@/features/organizer/types/event.types'
import { EventActionButtonsContainer } from '@/features/organizer/components/smart/EventActionButtonsContainer'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

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
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-shadow gap-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-neutral-900">{event.title}</h3>
        <div className="mt-1 space-y-1 text-sm text-neutral-600">
          <p>Date: {eventDate ? new Date(eventDate).toLocaleDateString() : 'N/A'}</p>
          <p>Location: {locationName}</p>
          <p>
            Type: {eventTypeName}
            {eventSubtypeName && ` - ${eventSubtypeName}`}
          </p>
        </div>
        <Badge
          variant={statusBadgeVariant[statusCode as keyof typeof statusBadgeVariant] || 'default'}
          size="sm"
          dot
          className="mt-2"
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
    </div>
  )
}
