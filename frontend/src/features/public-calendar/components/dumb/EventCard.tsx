/**
 * Event Card Component - Minimalist Design System
 *
 * Displays a single event card with image, title, date, location,
 * and featured badge. Uses Card and Badge UI components.
 */

import { ArrowRight, Calendar, MapPin } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { memo } from 'react'

import { getContrastTextColor } from '@/features/internal-calendar/utils/eventTypeColorMapping'
import { PublicEvent } from '@/features/public-calendar/types/public-calendar.types'
import { Badge, SafeImage } from '@/shared/components/display'
import ImagePlaceholder from '@/shared/components/display/ImagePlaceholder'

interface EventCardProps {
  event: PublicEvent
  onClick?: (eventId: number) => void
}

export const EventCard = memo(function EventCard({ event, onClick }: EventCardProps) {
  const handleClick = (): void => {
    onClick?.(event.id)
  }

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.(event.id)
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const imageUrl = event.featured_image || event.image_url
  const location = event.locations && event.locations.length > 0 ? event.locations[0] : null

  return (
    <article
      className="
        group bg-white rounded-lg border border-neutral-200 overflow-hidden
        hover:border-neutral-300 hover:shadow-md
        transition-all duration-150
        cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20
      "
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Ver evento: ${event.title}`}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-neutral-100">
        {imageUrl ? (
          <SafeImage
            src={imageUrl}
            alt={event.title}
            fill
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300 motion-reduce:transition-none motion-reduce:transform-none"
            fallback={<ImagePlaceholder />}
          />
        ) : (
          <ImagePlaceholder />
        )}

        {/* Featured Badge */}
        {event.is_featured && (
          <div className="absolute top-3 right-3">
            <Badge variant="warning" size="sm">
              Destacado
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Event Type */}
        <div className="mb-2">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: event.event_type.color || '#3B82F6',
              color: getContrastTextColor(event.event_type.color || '#3B82F6')
            }}
          >
            {event.event_type.name}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-neutral-900 mb-3 line-clamp-2">
          {event.title}
        </h3>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
          <Calendar className="w-4 h-4 text-neutral-400" aria-hidden="true" />
          <span>
            {formatDate(event.start_date)}
            {event.end_date && event.end_date !== event.start_date && (
              <> - {formatDate(event.end_date)}</>
            )}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
          <MapPin className="w-4 h-4 text-neutral-400" aria-hidden="true" />
          <span>{location ? `${location.name}, ${location.city}` : 'Ubicación por confirmar'}</span>
        </div>

        {/* CTA */}
        <div className="border-t border-neutral-100 pt-3 flex items-center justify-between">
          <span className="text-xs text-neutral-500">Ver detalles</span>
          <ArrowRight className="w-4 h-4 text-primary-600" aria-hidden="true" />
        </div>
      </div>
    </article>
  )
})
