/**
 * Event Card Component - Minimalist Design System
 *
 * Displays a single event card with image, title, date, location,
 * and featured badge. Uses Card and Badge UI components.
 */

import type { KeyboardEvent } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui'
import { PublicEvent } from '@/features/public-calendar/types/public-calendar.types'

interface EventCardProps {
  event: PublicEvent
  onClick?: (eventId: number) => void
}

export const EventCard = ({ event, onClick }: EventCardProps) => {
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
        bg-white rounded-lg border border-neutral-200 overflow-hidden
        hover:border-neutral-300 hover:shadow-md
        transition-all duration-150
        cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-primary-500/20
      "
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Ver evento: ${event.title}`}
    >
      {/* Image */}
      <div className="relative h-48 bg-neutral-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100"
            data-testid="event-image-placeholder"
          >
            <svg
              className="w-12 h-12 text-primary-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
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
          <Badge variant="info" size="sm">
            {event.event_type.name}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-neutral-900 mb-3 line-clamp-2">
          {event.title}
        </h3>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
          <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <span>
            {formatDate(event.start_date)}
            {event.end_date && event.end_date !== event.start_date && (
              <> - {formatDate(event.end_date)}</>
            )}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
          <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span>{location ? `${location.name}, ${location.city}` : 'Ubicación por confirmar'}</span>
        </div>

        {/* CTA */}
        <div className="border-t border-neutral-100 pt-3 flex items-center justify-between">
          <span className="text-xs text-neutral-500">Ver detalles</span>
          <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </article>
  )
}
