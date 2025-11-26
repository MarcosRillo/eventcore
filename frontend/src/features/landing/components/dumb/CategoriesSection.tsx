/**
 * Categories Section Component
 * Displays event categories with icons
 */

import { CategoriesSectionProps } from '@/features/landing/types/landing.types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// Icon mapping for categories (using emojis as placeholders)
const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase()
  if (name.includes('música') || name.includes('musica')) return '🎵'
  if (name.includes('cultura') || name.includes('arte')) return '🎭'
  if (name.includes('gastronomía') || name.includes('gastronomia') || name.includes('comida')) return '🍴'
  if (name.includes('deporte')) return '⚽'
  if (name.includes('festival')) return '🎉'
  if (name.includes('turismo')) return '🏔️'
  return '📅'
}

export const CategoriesSection = ({
  categories,
  loading,
  onCategoryClick
}: CategoriesSectionProps) => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explorar por Categoría
          </h2>
          <p className="text-lg text-gray-600">
            Encuentra eventos según tus intereses
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Categories Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => onCategoryClick(category.id)}
                className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl hover:shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Ver eventos de ${category.name}`}
              >
                <div className="text-5xl mb-4">
                  {getCategoryIcon(category.name)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {category.name}
                </h3>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No hay categorías disponibles en este momento.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
