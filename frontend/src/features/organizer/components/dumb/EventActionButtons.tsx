/**
 * EventActionButtons Component (Presentational)
 *
 * Displays action buttons for event: Submit for Review, Duplicate, Delete.
 * Buttons visibility depends on event status.
 */

import Button from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { OrganizerEvent } from '@/features/organizer/types/event.types'

interface EventActionButtonsProps {
  event: OrganizerEvent
  onSubmit: (eventId: number) => void
  onDelete: (eventId: number) => void
  loading?: boolean
}

/**
 * Get status code from event status (handles both string and object formats)
 * @param status
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

      <Tooltip content="Próximamente" position="top">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {}}
          disabled={true}
          aria-label="Duplicar evento (próximamente)"
        >
          Duplicar
        </Button>
      </Tooltip>

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
