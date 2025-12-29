/**
 * Approval Action Buttons Component (Presentational)
 *
 * Displays action buttons based on event status.
 */

import Button from '@/components/ui/Button'
import { Event } from '@/features/approval/types/approval.types'

interface ApprovalActionButtonsProps {
  event: Event
  onApprove: (eventId: number) => void
  onReject: (eventId: number) => void
  onRequestChanges: (eventId: number) => void
  onPublish: (eventId: number) => void
  loading?: boolean
}

export const ApprovalActionButtons = ({
  event,
  onApprove,
  onReject,
  onRequestChanges,
  onPublish,
  loading = false
}: ApprovalActionButtonsProps) => {
  const isPending = event.status === 'pending_internal'
  const isApproved = event.status === 'approved_internal'
  const isPublished = event.status === 'published'
  const isRejected = event.status === 'rejected'

  // No actions for published or rejected events
  if (isPublished || isRejected) {
    return null
  }

  return (
    <div className="flex gap-2">
      {isPending && (
        <>
          <Button
            variant="success"
            size="sm"
            onClick={() => onApprove(event.id)}
            disabled={loading}
            aria-label={`Approve event ${event.title}`}
          >
            Approve
          </Button>

          <Button
            variant="warning"
            size="sm"
            onClick={() => onRequestChanges(event.id)}
            disabled={loading}
            aria-label={`Request changes for event ${event.title}`}
          >
            Request Changes
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onReject(event.id)}
            disabled={loading}
            aria-label={`Reject event ${event.title}`}
          >
            Reject
          </Button>
        </>
      )}

      {isApproved && (
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
    </div>
  )
}
