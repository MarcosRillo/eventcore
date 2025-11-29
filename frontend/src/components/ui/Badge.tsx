/**
 * Badge Component - Minimalist Design System
 * Clean status indicators with pastel colors
 */

import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  dot?: boolean
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) => {
  // Base styles
  const baseClasses = 'inline-flex items-center font-medium rounded-full'

  // Size variants
  const sizeClasses: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm',
  }

  // Color variants - soft pastel backgrounds
  const variantClasses: Record<string, string> = {
    default: 'bg-neutral-100 text-neutral-600',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    outline: 'bg-transparent border border-neutral-200 text-neutral-600',
  }

  // Dot colors for status indicators
  const dotColors: Record<string, string> = {
    default: 'bg-neutral-400',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500',
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
