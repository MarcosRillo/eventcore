/**
 * AdminEventListItem Component
 *
 * Thin wrapper over EventPreviewCard for the admin dashboard.
 * Maps Event type to normalized preview card props.
 *
 * Best Practices applied:
 * - memo() to avoid re-renders (rerender-memo)
 * - NOOP pattern for optional callbacks (rerender-memo-with-default-value)
 */

'use client'

import { ClipboardCheck } from 'lucide-react'
import { memo } from 'react'

import { formatDate } from '@/lib/utils'
import { EventPreviewCard } from '@/shared/components/display'
import { Button } from '@/shared/components/form'
import { getStatusConfig } from '@/shared/constants/eventStatus'
import type { Event, EventStatusCode } from '@/types/event.types'

const NOOP = () => {}

interface AdminEventListItemProps {
  event: Event
  onManage?: () => void
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

export const AdminEventListItem = memo(function AdminEventListItem({
  event,
  onManage = NOOP,
}: AdminEventListItemProps) {
  const statusCode = getEventStatusCode(event)
  const statusConfig = getStatusConfig(statusCode)
  const badgeVariant = getBadgeVariant(statusCode)
  const formattedDate = event.start_date ? formatDate(event.start_date, 'short') : 'Sin fecha'
  const locationName = event.locations?.[0]?.name ?? event.location?.name ?? 'Sin ubicación'

  return (
    <EventPreviewCard
      imageUrl={event.featured_image}
      imageAlt={event.title}
      status={{ label: statusConfig.label, variant: badgeVariant }}
      isFeatured={event.is_featured}
      eventType={event.event_type ? { name: event.event_type.name, color: event.event_type.color } : undefined}
      title={event.title}
      date={formattedDate}
      location={locationName}
      actions={
        <div className="flex items-center justify-end">
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
      }
    />
  )
})

export default AdminEventListItem
