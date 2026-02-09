/**
 * EventPreviewCard - Shared vertical event card for management dashboards
 *
 * Displays event as the tourist would see it: image on top with overlays,
 * event type badge, title, date, location, and an actions slot.
 *
 * Best Practices applied:
 * - memo() to avoid re-renders (rerender-memo)
 * - Ternary conditionals instead of && (rendering-conditional-render)
 * - Hoisted static JSX (rendering-hoist-jsx)
 * - aria-hidden on decorative icons (Web Interface Guidelines)
 */

'use client'

import { Calendar, MapPin } from 'lucide-react'
import type { ReactNode } from 'react'
import { memo } from 'react'

import { getContrastTextColor } from '@/features/internal-calendar/utils/eventTypeColorMapping'
import Badge from '@/shared/components/display/Badge'
import Card from '@/shared/components/display/Card'
import ImagePlaceholder from '@/shared/components/display/ImagePlaceholder'
import SafeImage from '@/shared/components/display/SafeImage'

const DEFAULT_EVENT_TYPE_COLOR = '#3B82F6'

interface EventPreviewCardProps {
  imageUrl?: string
  imageAlt: string
  status?: { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }
  isFeatured?: boolean
  eventType?: { name: string; color?: string }
  title: string
  date: string
  location: string
  actions?: ReactNode
  className?: string
}

// Hoisted static JSX (rendering-hoist-jsx)
const imagePlaceholder = <ImagePlaceholder />

const EventPreviewCard = memo(function EventPreviewCard({
  imageUrl,
  imageAlt,
  status,
  isFeatured = false,
  eventType,
  title,
  date,
  location,
  actions,
  className = '',
}: EventPreviewCardProps) {
  const eventTypeColor = eventType?.color ?? DEFAULT_EVENT_TYPE_COLOR

  return (
    <Card
      as="article"
      variant="default"
      padding="none"
      hover
      className={`flex flex-col overflow-hidden ${className}`}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-neutral-100">
        {imageUrl ? (
          <SafeImage
            src={imageUrl}
            alt={imageAlt}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            fallback={imagePlaceholder}
          />
        ) : (
          imagePlaceholder
        )}

        {/* Status overlay - top left */}
        {status ? (
          <div className="absolute top-3 left-3">
            <Badge variant={status.variant} size="sm" dot>
              {status.label}
            </Badge>
          </div>
        ) : null}

        {/* Featured overlay - top right */}
        {isFeatured ? (
          <div className="absolute top-3 right-3">
            <Badge variant="warning" size="sm" dot>
              Destacado
            </Badge>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Event Type Badge */}
        {eventType ? (
          <div className="mb-2">
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: eventTypeColor,
                color: getContrastTextColor(eventTypeColor),
              }}
            >
              {eventType.name}
            </span>
          </div>
        ) : null}

        {/* Title */}
        <h3 className="text-base font-semibold text-neutral-900 mb-3 line-clamp-2">
          {title}
        </h3>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
          <Calendar className="w-4 h-4 text-neutral-400 shrink-0" aria-hidden="true" />
          <span>{date}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <MapPin className="w-4 h-4 text-neutral-400 shrink-0" aria-hidden="true" />
          <span className="truncate">{location}</span>
        </div>
      </div>

      {/* Actions slot */}
      {actions ? (
        <div className="px-4 pb-4 pt-3 border-t border-neutral-100">
          {actions}
        </div>
      ) : null}
    </Card>
  )
})

export default EventPreviewCard
