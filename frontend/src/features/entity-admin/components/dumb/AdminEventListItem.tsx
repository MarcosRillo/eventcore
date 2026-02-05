/**
 * AdminEventListItem Component
 *
 * Event card with 4 rows: status + organizer, title + star, metadata, actions.
 * Dumb component - receives data via props, no business logic.
 *
 * Best Practices applied:
 * - memo() to avoid re-renders (rerender-memo)
 * - NOOP pattern for optional callbacks (rerender-memo-with-default-value)
 * - aria-hidden on decorative icons (Web Interface Guidelines)
 */

'use client'

import { Calendar, ClipboardCheck, MapPin, Star, Tag } from 'lucide-react'
import { memo } from 'react'

import { getStatusConfig } from '@/features/events/constants'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/shared/components/display'
import Card from '@/shared/components/display/Card'
import { Button } from '@/shared/components/form'
import type { Event, EventStatusCode } from '@/types/event.types'

// Extraer defaults fuera del componente (rerender-memo-with-default-value)
const NOOP = () => {}

interface AdminEventListItemProps {
  event: Event
  onManage?: () => void
  index?: number
}

/**
 * Map status config className to Badge variant
 */
function getBadgeVariant(statusCode: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  const config = getStatusConfig(statusCode)
  if (config.className.includes('success')) return 'success'
  if (config.className.includes('warning')) return 'warning'
  if (config.className.includes('error')) return 'danger'
  if (config.className.includes('primary')) return 'info'
  return 'default'
}

/**
 * Extract status code from event status (object or string)
 */
function getEventStatusCode(event: Event): EventStatusCode {
  if (typeof event.status === 'string') return event.status
  return event.status.status_code || 'draft'
}

/**
 * AdminEventListItem Component
 *
 * Displays a single event in the admin dashboard with:
 * - Status badge + organizer name
 * - Title with featured star indicator
 * - Metadata row with date, location, and type
 * - Action button to manage approval
 */
export const AdminEventListItem = memo(function AdminEventListItem({
  event,
  onManage = NOOP,
  index = 0,
}: AdminEventListItemProps) {
  // Derivar estado durante render (no useMemo para expresiones simples)
  const statusCode = getEventStatusCode(event)
  const statusConfig = getStatusConfig(statusCode)
  const badgeVariant = getBadgeVariant(statusCode)
  const formattedDate = event.start_date ? formatDate(event.start_date, 'short') : 'Sin fecha'

  // Get location name from locations array or location object
  const locationName = event.locations?.[0]?.name ?? event.location?.name ?? 'Sin ubicación'

  // Get event type name
  const eventTypeName = event.event_type?.name ?? 'Sin tipo'

  return (
    <Card
      as="article"
      variant="default"
      padding="md"
      hover
      className="flex flex-col gap-3 animate-slideInUp"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Row 1: Status + Organizer */}
      <div className="flex items-center justify-between gap-2">
        <Badge variant={badgeVariant} size="sm" dot>
          {statusConfig.label}
        </Badge>
        {event.organizer && (
          <span className="text-sm text-neutral-500 truncate max-w-[200px]">
            {event.organizer.name}
          </span>
        )}
      </div>

      {/* Row 2: Title */}
      <h3 className="text-base font-semibold text-neutral-900 line-clamp-2 min-w-0 flex items-center gap-2">
        <span className="truncate">{event.title}</span>
        {event.is_featured && (
          <Star
            className="w-4 h-4 text-warning-500 fill-warning-500 shrink-0"
            aria-hidden="true"
          />
        )}
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
          <span className="truncate max-w-[150px]">{eventTypeName}</span>
        </span>
      </div>

      {/* Row 4: Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
        <Button
          variant="primary"
          size="sm"
          onClick={onManage}
          leftIcon={<ClipboardCheck className="w-4 h-4" />}
          aria-label={`Gestionar aprobación de ${event.title}`}
        >
          Gestionar
        </Button>
      </div>
    </Card>
  )
})

export default AdminEventListItem
