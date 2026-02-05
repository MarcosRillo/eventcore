/**
 * OrganizerEventListItem - Redesigned with improved UX/UI
 *
 * Features:
 * - Status badge at top for visual hierarchy
 * - Horizontal metadata with separators
 * - Responsive action buttons
 * - Proper accessibility with aria-hidden icons
 * - Memoized for performance
 */

import { Calendar, ImageIcon, MapPin, Tag } from 'lucide-react'
import { memo } from 'react'

import { EventActionButtonsContainer } from '@/features/organizer/components/smart/EventActionButtonsContainer'
import { OrganizerEvent } from '@/features/organizer/types/event.types'
import {
  getOrganizerStatusBadgeVariant,
  getOrganizerStatusLabel,
} from '@/features/organizer/utils/organizerStatusHelpers'
import { formatDate } from '@/lib/utils'
import { Badge, SafeImage } from '@/shared/components/display'
import Card from '@/shared/components/display/Card'
import { Button } from '@/shared/components/form'

const IMAGE_PLACEHOLDER = (
  <div className="flex items-center justify-center w-full h-full bg-neutral-100">
    <ImageIcon className="w-6 h-6 text-neutral-300" aria-hidden="true" />
  </div>
)

interface OrganizerEventListItemProps {
  event: OrganizerEvent
  onEdit: () => void
  onView: () => void
  onSuccess?: (deletedEventId?: number) => void
  disabled?: boolean
}

/**
 * OrganizerEventListItem Component
 *
 * Displays a single event in the organizer dashboard with:
 * - Status badge prominently at top
 * - Title with line-clamp for long text
 * - Metadata row with date, location, and category
 * - Action buttons aligned right
 */
export const OrganizerEventListItem = memo(function OrganizerEventListItem({
  event,
  onEdit,
  onView,
  onSuccess,
  disabled = false,
}: OrganizerEventListItemProps) {
  // Extract status code from status object or use as string
  const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status
  // Always use translated label for consistent Spanish display
  const statusDisplay = getOrganizerStatusLabel(statusCode)

  // Get event date formatted
  const eventDate = event.start_date
  const formattedDate = eventDate ? formatDate(eventDate, 'short') : 'Sin fecha'

  // Get location name from locations array
  const locationName = event.locations?.[0]?.name ?? 'N/A'

  // Get event type and subtype names
  const eventTypeName = event.event_type?.name ?? 'N/A'
  const eventSubtypeName = event.event_subtype?.name

  // Get badge variant for status
  const badgeVariant = getOrganizerStatusBadgeVariant(statusCode)

  const thumbnailSrc = event.featured_image

  return (
    <Card
      as="article"
      variant="default"
      padding="md"
      hover
      className="flex gap-3"
    >
      {/* Thumbnail */}
      <div className="w-24 h-[4.5rem] shrink-0 rounded-lg overflow-hidden bg-neutral-100">
        {thumbnailSrc ? (
          <SafeImage
            src={thumbnailSrc}
            alt={event.title}
            width={96}
            height={72}
            className="object-cover w-full h-full"
            fallback={IMAGE_PLACEHOLDER}
          />
        ) : (
          IMAGE_PLACEHOLDER
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 min-w-0 flex-1">
        {/* Row 1: Status Badge */}
        <div className="flex items-center justify-between">
          <Badge
            variant={badgeVariant}
            size="sm"
            dot
          >
            {statusDisplay}
          </Badge>
        </div>

        {/* Row 2: Title */}
        <h3 className="text-base font-semibold text-neutral-900 line-clamp-2 min-w-0">
          {event.title}
        </h3>

        {/* Row 3: Metadata */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-neutral-400 shrink-0" aria-hidden="true" />
            <span>{formattedDate}</span>
          </span>
          <span className="text-neutral-300" aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-neutral-400 shrink-0" aria-hidden="true" />
            <span className="truncate max-w-[150px]">{locationName}</span>
          </span>
          <span className="text-neutral-300" aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-neutral-400 shrink-0" aria-hidden="true" />
            <span className="truncate max-w-[200px]">
              {eventTypeName}
              {eventSubtypeName ? ` - ${eventSubtypeName}` : ''}
            </span>
          </span>
        </div>

        {/* Row 4: Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-neutral-100">
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
    </Card>
  )
})
