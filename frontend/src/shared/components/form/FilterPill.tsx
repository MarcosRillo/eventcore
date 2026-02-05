/**
 * FilterPill Component
 *
 * Reusable toggle button for filtering and selection states.
 * Supports two variants: default (with border) and subtle (borderless).
 */

'use client'

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react'

const NOOP = () => {}

export interface FilterPillProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  active?: boolean
  count?: number
  onClick?: () => void
  variant?: 'default' | 'subtle'
}

/**
 * FilterPill - Toggle button for filter states
 *
 * @param active - Whether the pill is currently selected
 * @param count - Optional count badge to display
 * @param variant - 'default' (bordered) or 'subtle' (borderless for stats bars)
 */
export const FilterPill = forwardRef<HTMLButtonElement, FilterPillProps>(
  function FilterPill(
    {
      children,
      active = false,
      count,
      onClick = NOOP,
      variant = 'default',
      className = '',
      ...props
    },
    ref
  ) {
    const baseClasses = [
      'px-3 py-1.5 rounded-md text-sm font-medium',
      'transition-colors',
      'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none',
    ].join(' ')

    const variantClasses = {
      default: {
        active: 'bg-primary-600 text-white',
        inactive: 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-300',
      },
      subtle: {
        active: 'bg-primary-600 text-white',
        inactive: 'text-primary-700 hover:bg-primary-100',
      },
    }

    const countClasses = {
      default: {
        active: 'text-primary-200',
        inactive: 'text-neutral-400',
      },
      subtle: {
        active: 'text-primary-100',
        inactive: 'text-primary-900',
      },
    }

    const stateKey = active ? 'active' : 'inactive'

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant][stateKey]} ${className}`}
        aria-pressed={active}
        {...props}
      >
        {children}
        {count !== undefined && (
          <span className={`ml-1.5 tabular-nums font-semibold ${countClasses[variant][stateKey]}`}>
            {variant === 'default' ? `(${count})` : count}
          </span>
        )}
      </button>
    )
  }
)

export default FilterPill
