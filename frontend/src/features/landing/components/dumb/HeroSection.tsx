/**
 * Hero Section Component - Minimalist Design
 * Clean landing hero with subtle gradient and CTA
 */

import type { HeroSectionProps } from '@/features/landing/types/landing.types'

export const HeroSection = ({ onExploreClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-100/50 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium text-primary-600 bg-primary-50 rounded-full border border-primary-100">
          Calendario de Eventos
        </span>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
          Descubrí los eventos de{' '}
          <span className="text-primary-500">Tucumán</span>
        </h1>

        <p className="text-lg md:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Explorá los mejores eventos turísticos y culturales de la provincia.
          Festivales, conciertos, gastronomía y más.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onExploreClick}
            className="
              px-8 py-4 rounded-lg
              bg-primary-500 text-white
              text-base font-medium
              shadow-sm hover:shadow-md
              hover:bg-primary-600
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2
            "
            aria-label="Ver todos los eventos"
          >
            Ver Todos los Eventos
          </button>

          <button
            onClick={onExploreClick}
            className="
              px-8 py-4 rounded-lg
              bg-white text-neutral-700
              text-base font-medium
              border border-neutral-200
              hover:bg-neutral-50 hover:border-neutral-300
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-neutral-500/20 focus:ring-offset-2
            "
          >
            Explorar Categorías
          </button>
        </div>
      </div>
    </section>
  )
}
