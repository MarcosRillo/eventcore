'use client'

import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

import { EventTypeIcon } from '@/features/event-types/components/dumb/EventTypeIcon'
import type { CategoriesSectionProps } from '@/features/landing/types/landing.types'
import type { EventType } from '@/features/public-calendar/types/public-calendar.types'
import { EmptyState, EmptyStateIcons, LoadingSpinner } from '@/shared/components/feedback'

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

function CategoryCard({
  eventType,
  onClick,
}: {
  eventType: EventType
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const color = eventType.color || '#3B82F6'
  const rgb = hexToRgb(color)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label={`Ver eventos de ${eventType.name}`}
      type="button"
      className="group relative overflow-hidden rounded-2xl border bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:transform-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 md:p-6"
      style={{
        boxShadow: hovered
          ? `0 8px 25px rgba(${rgb}, 0.25)`
          : '0 1px 3px rgba(0, 0, 0, 0.04)',
        borderColor: hovered ? color : undefined,
      }}
    >
      {/* Color overlay on hover */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 100%, black 35%)`, opacity: hovered ? 1 : 0 }}
        aria-hidden="true"
      />

      {/* Left accent bar */}
      <div
        className="absolute bottom-4 left-0 top-4 w-[3px] rounded-r-full transition-opacity duration-200"
        style={{ backgroundColor: color, opacity: hovered ? 0 : 1 }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4">
        {/* Icon container */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-200 md:h-14 md:w-14"
          style={{
            backgroundColor: hovered ? 'rgba(255, 255, 255, 0.2)' : `color-mix(in srgb, ${color} 12%, white)`,
          }}
          aria-hidden="true"
        >
          <span
            className="transition-colors duration-200"
            style={{ color: hovered ? 'white' : color }}
          >
            <EventTypeIcon icon={eventType.icon} className="h-6 w-6 md:h-7 md:w-7" />
          </span>
        </div>

        {/* Name + arrow */}
        <div className="flex items-center justify-between gap-2">
          <h3
            className="text-base font-semibold text-neutral-900 transition-colors duration-200 md:text-lg"
            style={{ color: hovered ? 'white' : undefined }}
          >
            {eventType.name}
          </h3>
          <ArrowRight
            className="h-4 w-4 flex-shrink-0 transition-all duration-200"
            style={{
              color: 'white',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateX(2px)' : 'translateX(-4px)',
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </button>
  )
}

export const CategoriesSection = ({
  eventTypes,
  loading,
  onCategoryClick,
}: CategoriesSectionProps) => {
  return (
    <section className="bg-white py-12 md:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Section Header */}
        <div className="mb-8 flex flex-col items-center gap-4 text-center md:mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-600">
            Categorías
          </span>
          <h2 className="text-3xl font-bold text-neutral-900 md:text-4xl">
            ¿Qué estás buscando?
          </h2>
          <p className="text-neutral-600">
            Elegí una categoría y encontrá eventos en Tucumán
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {!loading && eventTypes.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
            {eventTypes.map((eventType) => (
              <CategoryCard
                key={eventType.id}
                eventType={eventType}
                onClick={() => onCategoryClick(eventType.id)}
              />
            ))}
          </div>
        )}

        {!loading && eventTypes.length === 0 && (
          <EmptyState
            icon={EmptyStateIcons.folder}
            title="Sin tipos de eventos disponibles"
            description="No hay tipos de eventos en este momento."
          />
        )}
      </div>
    </section>
  )
}
