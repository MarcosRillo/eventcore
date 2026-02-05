/**
 * SegmentedControl Component
 *
 * Toggle between mutually exclusive options (e.g., upcoming/past).
 * Uses TypeScript generics for type-safe value handling.
 */

'use client'

import { forwardRef } from 'react'

export interface SegmentedControlOption<T extends string> {
  value: T
  label: string
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel?: string
  className?: string
}

/**
 * SegmentedControl - Toggle between options
 *
 * @param options - Array of { value, label } options
 * @param value - Currently selected value
 * @param onChange - Called when selection changes
 * @param ariaLabel - Accessible label for the control group
 */
function SegmentedControlInner<T extends string>(
  {
    options,
    value,
    onChange,
    ariaLabel,
    className = '',
  }: SegmentedControlProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      className={`flex gap-1 bg-neutral-100 rounded-lg p-1 ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isActive = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium
              transition-colors
              focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none
              ${isActive
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
              }
            `}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

// Use type assertion to preserve generic while using forwardRef
export const SegmentedControl = forwardRef(SegmentedControlInner) as <T extends string>(
  props: SegmentedControlProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement

export default SegmentedControl
