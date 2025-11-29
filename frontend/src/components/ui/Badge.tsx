/**
 * Badge Component - Minimalist Design System
 * Clean status indicators with pastel colors
 * Uses semantic design tokens for consistent theming
 */

import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  dot?: boolean
}

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}: BadgeProps) => {
  // Base styles
  const baseClasses = 'inline-flex items-center font-medium rounded-full'

  // Size variants
  const sizeClasses: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
  }

  // Color variants - using semantic design tokens
  const variantClasses: Record<string, string> = {
    default: 'bg-neutral-100 text-neutral-600',
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-700',
    danger: 'bg-error-50 text-error-700',
    info: 'bg-primary-50 text-primary-700',
    outline: 'bg-transparent border border-neutral-200 text-neutral-600',
  }

  // Dot colors for status indicators - using semantic tokens
  const dotColors: Record<string, string> = {
    default: 'bg-neutral-400',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-error-500',
    info: 'bg-primary-500',
    outline: 'bg-neutral-400',
  }

  const finalClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    className,
  ].filter(Boolean).join(' ')

  return (
    <span className={finalClasses}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

export default Badge
