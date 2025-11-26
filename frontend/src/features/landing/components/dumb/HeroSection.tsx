/**
 * Hero Section Component
 * Main landing hero with background image and CTA
 */

import { HeroSectionProps } from '@/features/landing/types/landing.types'

export const HeroSection = ({ onExploreClick }: HeroSectionProps) => {
  return (
    <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Descubrí Tucumán
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8">
          Los mejores eventos turísticos y culturales de la provincia
        </p>
        <button
          onClick={onExploreClick}
          className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          aria-label="Ver todos los eventos"
        >
          Ver Todos los Eventos
        </button>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
