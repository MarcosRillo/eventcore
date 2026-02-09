'use client'

/**
 * FilterBar - Shared filter container with optional collapsible mobile support
 *
 * Renders a card-style wrapper for filter controls. Supports an optional
 * internal grid, mobile collapsible toggle, and clear-filters footer.
 */

import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'

interface FilterBarProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  collapsible?: boolean
  defaultOpen?: boolean
  hasActiveFilters?: boolean
  onClearFilters?: () => void
  ariaLabel?: string
  className?: string
}

const GRID_COL_CLASSES: Record<number, string> = {
  1: 'grid-cols-1 md:grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-4',
}

export function FilterBar({
  children,
  columns,
  collapsible = false,
  defaultOpen = false,
  hasActiveFilters = false,
  onClearFilters,
  ariaLabel = 'Filtros',
  className = '',
}: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const wrapperClasses = [
    'bg-white rounded-lg border border-neutral-200 p-4',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = columns ? (
    <div className={`grid ${GRID_COL_CLASSES[columns]} gap-4`}>
      {children}
    </div>
  ) : (
    children
  )

  return (
    <div className={wrapperClasses} role="region" aria-label={ariaLabel}>
      {collapsible ? (
        <>
          <button
            className="md:hidden w-full flex items-center justify-between text-left -m-4 p-4"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="filters-content"
          >
            <span className="font-medium text-neutral-700 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />
              Filtros
              {hasActiveFilters ? (
                <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                  Activos
                </span>
              ) : null}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          <div
            id="filters-content"
            className={isOpen ? 'block mt-4' : 'hidden md:block'}
          >
            {content}

            {hasActiveFilters && onClearFilters ? (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <button
                  onClick={onClearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <>
          {content}

          {hasActiveFilters && onClearFilters ? (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <button
                onClick={onClearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
