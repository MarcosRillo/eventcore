/**
 * EventActionButtons Component (Presentational)
 *
 * Displays action buttons for event: Publish, Duplicate, Delete.
 * Buttons visibility depends on event status.
 */

import { OrganizerEvent } from '@/features/organizer/types/event.types'
import Button from '@/components/ui/Button'

interface EventActionButtonsProps {
  event: OrganizerEvent
  onPublish: (eventId: number) => void
  onDuplicate: (eventId: number) => void
  onDelete: (eventId: number) => void
  loading?: boolean
}

export const EventActionButtons = ({
  event,
  onPublish,
  onDuplicate,
  onDelete,
  loading = false
}: EventActionButtonsProps) => {
  const canPublish = event.status === 'draft'

  return (
    <div className="flex gap-2">
      {canPublish && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => onPublish(event.id)}
          disabled={loading}
          aria-label={`Publish event ${event.title}`}
        >
          Publish
        </Button>
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onDuplicate(event.id)}
        disabled={loading}
        aria-label={`Duplicate event ${event.title}`}
      >
        Duplicate
      </Button>

      <Button
        variant="danger"
        size="sm"
        onClick={() => onDelete(event.id)}
        disabled={loading}
        aria-label={`Delete event ${event.title}`}
      >
        Delete
      </Button>
    </div>
  )
}
