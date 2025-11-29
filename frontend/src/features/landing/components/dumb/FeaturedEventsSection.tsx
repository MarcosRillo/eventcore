/**
 * Featured Events Section Component - Minimalist Design
 * Clean event cards grid with subtle styling
 */

import type { FeaturedEventsSectionProps } from '@/features/landing/types/landing.types'
import { EventCard } from '@/features/public-calendar/components/dumb/EventCard'
import { LoadingSpinner, EmptyState, EmptyStateIcons, Button } from '@/components/ui'

export const FeaturedEventsSection = ({
  events,
  loading,
  onEventClick,
  onViewAllClick
}: FeaturedEventsSectionProps) => {
  return (
    <section className="py-20 bg-neutral-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Próximos Eventos Destacados
          </h2>
          <p className="text-lg text-neutral-500 max-w-xl mx-auto">
            No te pierdas los eventos más esperados de Tucumán
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Events Grid */}
        {!loading && events.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {events.slice(0, 6).map(event => (
                <EventCard key={event.id} event={event} onClick={onEventClick} />
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Button
                variant="primary"
                size="lg"
                onClick={onViewAllClick}
              >
                Ver Todos los Eventos
              </Button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <EmptyState
            icon={EmptyStateIcons.calendar}
            title="Sin eventos destacados"
            description="No hay eventos destacados en este momento. Vuelve pronto."
          />
        )}
      </div>
    </section>
  )
}
