/**
 * EventActionButtons Component (Presentational)
 *
 * Displays action buttons for event: Submit for Review, Duplicate, Delete.
 * Buttons visibility depends on event status.
 */

import { OrganizerEvent } from '@/features/organizer/types/event.types'
import Button from '@/components/ui/Button'

interface EventActionButtonsProps {
  event: OrganizerEvent
  onSubmit: (eventId: number) => void
  onDuplicate: (eventId: number) => void
  onDelete: (eventId: number) => void
  loading?: boolean
}

/**
 * Get status code from event status (handles both string and object formats)
 */
const getStatusCode = (status: OrganizerEvent['status']): string => {
  if (typeof status === 'string') {
    return status
  }
  return status.status_code
}

export const EventActionButtons = ({
  event,
  onSubmit,
  onDuplicate,
  onDelete,
  loading = false
}: EventActionButtonsProps) => {
  const statusCode = getStatusCode(event.status)
  const canSubmit = statusCode === 'draft' || statusCode === 'requires_changes'
  const canDelete = statusCode === 'draft'

  return (
    <div className="flex gap-2">
      {canSubmit && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => onSubmit(event.id)}
          disabled={loading}
          aria-label={`Submit event ${event.title} for review`}
        >
          Enviar a revisión
        </Button>
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onDuplicate(event.id)}
        disabled={loading}
        aria-label={`Duplicate event ${event.title}`}
      >
        Duplicar
      </Button>

      {canDelete && (
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(event.id)}
          disabled={loading}
          aria-label={`Delete event ${event.title}`}
        >
          Eliminar
        </Button>
      )}
    </div>
  )
}
