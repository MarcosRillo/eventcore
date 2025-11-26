/**
 * Featured Events Section Component
 * Displays upcoming featured events in a grid
 */

import { FeaturedEventsSectionProps } from '@/features/landing/types/landing.types'
import { EventCard } from '@/features/public-calendar/components/dumb/EventCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export const FeaturedEventsSection = ({
  events,
  loading,
  onEventClick,
  onViewAllClick
}: FeaturedEventsSectionProps) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Próximos Eventos Destacados
          </h2>
          <p className="text-lg text-gray-600">
            No te pierdas los eventos más esperados de Tucumán
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Events Grid */}
        {!loading && events.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {events.slice(0, 6).map(event => (
                <EventCard key={event.id} event={event} onClick={onEventClick} />
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <button
                onClick={onViewAllClick}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                aria-label="Ver todos los eventos"
              >
                Ver Todos los Eventos
              </button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No hay eventos destacados en este momento.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
