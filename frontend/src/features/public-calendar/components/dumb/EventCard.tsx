/**
 * Event Card Component
 *
 * Displays a single event card with image, title, date, location,
 * and featured badge.
 */

import Image from 'next/image'
import { PublicEvent } from '@/features/public-calendar/types/public-calendar.types'

interface EventCardProps {
  event: PublicEvent
  onClick: (eventId: number) => void
}

export const EventCard = ({ event, onClick }: EventCardProps) => {
  const handleClick = (): void => {
    onClick(event.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      onClick(event.id)
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
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer p-4"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 mb-4">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200"
            data-testid="event-image-placeholder"
          >
            <span className="text-gray-400 text-4xl">📅</span>
          </div>
        )}

        {/* Featured Badge */}
        {event.is_featured && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">
            Destacado
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        {/* Category */}
        <div className="text-sm text-blue-600 font-medium mb-1">
          {event.category.name}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        {/* Date */}
        <div className="text-sm text-gray-600 mb-2">
          📅 {formatDate(event.start_date)}
          {event.end_date && event.end_date !== event.start_date && (
            <> - {formatDate(event.end_date)}</>
          )}
        </div>

        {/* Location */}
        <div className="text-sm text-gray-600">
          📍 {location ? `${location.name}, ${location.city}` : 'Ubicación por confirmar'}
        </div>
      </div>
    </article>
  )
}
