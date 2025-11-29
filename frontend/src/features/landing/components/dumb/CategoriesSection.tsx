/**
 * Categories Section Component - Minimalist Design
 * Clean category cards with subtle hover effects
 */

import type { CategoriesSectionProps } from '@/features/landing/types/landing.types'
import { LoadingSpinner, EmptyState, EmptyStateIcons } from '@/components/ui'

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
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Explorar por Categoría
          </h2>
          <p className="text-lg text-neutral-500 max-w-xl mx-auto">
            Encuentra eventos según tus intereses
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Categories Grid */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => onCategoryClick(category.id)}
                className="
                  group
                  bg-neutral-50 p-6 md:p-8 rounded-xl
                  border border-neutral-100
                  hover:bg-white hover:border-neutral-200 hover:shadow-md
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary-500/20
                "
                aria-label={`Ver eventos de ${category.name}`}
              >
                <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  {getCategoryIcon(category.name)}
                </div>
                <h3 className="text-base md:text-lg font-semibold text-neutral-900">
                  {category.name}
                </h3>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <EmptyState
            icon={EmptyStateIcons.folder}
            title="Sin categorías disponibles"
            description="No hay categorías de eventos en este momento."
          />
        )}
      </div>
    </section>
  )
}
