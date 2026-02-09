/**
 * OrganizerEventListItem - Thin wrapper over EventPreviewCard
 *
 * Maps OrganizerEvent type to normalized EventPreviewCard props.
 *
 * Best Practices applied:
 * - memo() to avoid re-renders (rerender-memo)
 * - Ternary conditionals (rendering-conditional-render)
 */

import { memo } from 'react'

import { EventActionButtonsContainer } from '@/features/organizer/components/smart/EventActionButtonsContainer'
import { OrganizerEvent } from '@/features/organizer/types/event.types'
import {
  getOrganizerStatusBadgeVariant,
  getOrganizerStatusLabel,
} from '@/features/organizer/utils/organizerStatusHelpers'
import { formatDate } from '@/lib/utils'
import { EventPreviewCard } from '@/shared/components/display'
import { Button } from '@/shared/components/form'

interface OrganizerEventListItemProps {
  event: OrganizerEvent
  onEdit: () => void
  onView: () => void
  onSuccess?: (deletedEventId?: number) => void
  disabled?: boolean
}

export const OrganizerEventListItem = memo(function OrganizerEventListItem({
  event,
  onEdit,
  onView,
  onSuccess,
  disabled = false,
}: OrganizerEventListItemProps) {
  const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status
  const statusLabel = getOrganizerStatusLabel(statusCode)
  const badgeVariant = getOrganizerStatusBadgeVariant(statusCode)
  const formattedDate = event.start_date ? formatDate(event.start_date, 'short') : 'Sin fecha'
  const locationName = event.locations?.[0]?.name ?? 'N/A'
  const eventTypeName = event.event_type?.name ?? 'N/A'
  const eventSubtypeName = event.event_subtype?.name

  return (
    <EventPreviewCard
      imageUrl={event.featured_image}
      imageAlt={event.title}
      status={{ label: statusLabel, variant: badgeVariant }}
      isFeatured={event.is_featured}
      eventType={{ name: eventSubtypeName ? `${eventTypeName} - ${eventSubtypeName}` : eventTypeName }}
      title={event.title}
      date={formattedDate}
      location={locationName}
      actions={
        <div className="flex items-center justify-end gap-2">
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
      }
    />
  )
})
