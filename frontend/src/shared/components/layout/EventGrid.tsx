/**
 * EventGrid - Shared responsive grid layout for event cards
 *
 * Pure presentational component with lookup maps for Tailwind classes.
 */

import type { ReactNode } from 'react'

interface EventGridProps {
  children: ReactNode
  columns?: { sm?: number; md?: number; lg?: number; xl?: number }
  gap?: number
  ariaLabel?: string
  className?: string
}

const SM_COL_CLASSES: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
}

const MD_COL_CLASSES: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
}

const LG_COL_CLASSES: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
}

const XL_COL_CLASSES: Record<number, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
}

const GAP_CLASSES: Record<number, string> = {
  2: 'gap-2',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8',
}

export function EventGrid({
  children,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 6,
  ariaLabel = 'Event grid',
  className = '',
}: EventGridProps) {
  const classes = [
    'grid',
    'grid-cols-1',
    SM_COL_CLASSES[columns.sm ?? 1],
    MD_COL_CLASSES[columns.md ?? 2],
    LG_COL_CLASSES[columns.lg ?? 3],
    columns.xl ? XL_COL_CLASSES[columns.xl] : '',
    GAP_CLASSES[gap],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} role="region" aria-label={ariaLabel}>
      {children}
    </div>
  )
}
