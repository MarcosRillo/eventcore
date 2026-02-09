/**
 * EventActionButtons Component (Presentational)
 *
 * Renders contextual actions (Submit for Review, Delete) as an overflow menu.
 * Buttons visibility depends on event status.
 *
 * Best Practices applied:
 * - memo() to avoid re-renders (rerender-memo)
 * - Hoisted static JSX (rendering-hoist-jsx)
 * - Simple boolean expressions, no useMemo (rerender-simple-expression-in-memo)
 * - Default value is primitive, safe (rerender-memo-with-default-value)
 */

import { Send, Trash2 } from 'lucide-react'
import { memo } from 'react'

import { OrganizerEvent } from '@/features/organizer/types/event.types'
import type { OverflowMenuItem } from '@/shared/components/display/OverflowMenu'
import OverflowMenu from '@/shared/components/display/OverflowMenu'

interface EventActionButtonsProps {
  event: OrganizerEvent
  onSubmit: (eventId: number) => void
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

// Hoisted static JSX (rendering-hoist-jsx)
const sendIcon = <Send size={16} aria-hidden="true" />
const trashIcon = <Trash2 size={16} aria-hidden="true" />

export const EventActionButtons = memo(function EventActionButtons({
  event,
  onSubmit,
  onDelete,
  loading = false,
}: EventActionButtonsProps) {
  const statusCode = getStatusCode(event.status)
  const canSubmit = statusCode === 'draft' || statusCode === 'requires_changes'
  const canDelete = statusCode === 'draft'

  const items: OverflowMenuItem[] = [
    ...(canSubmit
      ? [
          {
            label: 'Enviar a revisión',
            onClick: () => onSubmit(event.id),
            icon: sendIcon,
            disabled: loading,
          },
        ]
      : []),
    ...(canDelete
      ? [
          {
            label: 'Eliminar',
            onClick: () => onDelete(event.id),
            variant: 'danger' as const,
            icon: trashIcon,
            disabled: loading,
          },
        ]
      : []),
  ]

  return <OverflowMenu items={items} ariaLabel={`Acciones de ${event.title}`} />
})
