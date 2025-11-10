/**
 * Public Calendar Component
 *
 * Main public-facing calendar page with event listing and filters.
 */

import { PublicEvent, Category, Location } from '../../types/public-calendar.types'
import { EventCard } from './EventCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface PublicCalendarProps {
  events: PublicEvent[]
  categories: Category[]
  locations: Location[]
  loading: boolean
  error: string | null
  onCategoryFilter: (categoryId: number | null) => void
  onLocationFilter: (locationId: number | null) => void
  onEventClick: (eventId: number) => void
}

export const PublicCalendar = ({
  events,
  categories,
  locations,
  loading,
  error,
  onCategoryFilter,
  onLocationFilter,
  onEventClick
}: PublicCalendarProps) => {
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value
    onCategoryFilter(value ? parseInt(value) : null)
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value
    onLocationFilter(value ? parseInt(value) : null)
  }

  return (
    <main className="min-h-screen bg-gray-50" role="main">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Eventos en Tucumán
          </h1>
          <p className="text-gray-600 mt-2">
            Descubrí los mejores eventos turísticos y culturales
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label
                htmlFor="category-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Categoría
              </label>
              <select
                id="category-filter"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                onChange={handleCategoryChange}
                aria-label="Categoría"
              >
                <option value="">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label
                htmlFor="location-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ubicación
              </label>
              <select
                id="location-filter"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                onChange={handleLocationChange}
                aria-label="Ubicación"
              >
                <option value="">Todas las ubicaciones</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12" role="status" aria-label="Loading events">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No hay eventos disponibles en este momento.</p>
          </div>
        )}

        {/* Event Grid */}
        {!loading && !error && events.length > 0 && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="region"
            aria-label="Event grid"
          >
            {events.map(event => (
              <EventCard key={event.id} event={event} onClick={onEventClick} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
