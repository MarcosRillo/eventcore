/**
 * Button Component - Minimalist Design System
 * Clean, subtle, and professional button component
 */

import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  children: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}, ref) => {
  // Base styles - clean and minimal
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium',
    'rounded-md',
    'transition-all duration-150 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  ].join(' ')

  // Variant styles - softer and more minimal
  const variantClasses: Record<string, string> = {
    // Primary - solid blue, subtle shadow
    primary: [
      'bg-primary-500 text-white',
      'hover:bg-primary-600',
      'active:bg-primary-700',
      'focus:ring-primary-500/40',
      'shadow-sm hover:shadow',
    ].join(' '),

    // Secondary - light background, border
    secondary: [
      'bg-neutral-100 text-neutral-700',
      'hover:bg-neutral-200 hover:text-neutral-900',
      'active:bg-neutral-300',
      'focus:ring-neutral-500/40',
    ].join(' '),

    // Outline - transparent with border
    outline: [
      'bg-transparent text-neutral-700',
      'border border-neutral-300',
      'hover:bg-neutral-50 hover:border-neutral-400',
      'active:bg-neutral-100',
      'focus:ring-primary-500/40',
    ].join(' '),

    // Ghost - no background, subtle hover
    ghost: [
      'bg-transparent text-neutral-600',
      'hover:bg-neutral-100 hover:text-neutral-900',
      'active:bg-neutral-200',
      'focus:ring-neutral-500/40',
    ].join(' '),

    // Danger - red for destructive actions
    danger: [
      'bg-red-500 text-white',
      'hover:bg-red-600',
      'active:bg-red-700',
      'focus:ring-red-500/40',
      'shadow-sm hover:shadow',
    ].join(' '),

    // Success - green for positive actions
    success: [
      'bg-secondary-500 text-white',
      'hover:bg-secondary-600',
      'active:bg-secondary-700',
      'focus:ring-secondary-500/40',
      'shadow-sm hover:shadow',
    ].join(' '),

    // Warning - amber for caution
    warning: [
      'bg-amber-500 text-white',
      'hover:bg-amber-600',
      'active:bg-amber-700',
      'focus:ring-amber-500/40',
      'shadow-sm hover:shadow',
    ].join(' '),
  }

  // Size styles - consistent spacing
  const sizeClasses: Record<string, string> = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-11 px-5 text-base gap-2',
    xl: 'h-12 px-6 text-base gap-2.5',
  }

  // Icon sizes
  const iconSizeClasses: Record<string, string> = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-5 h-5',
  }

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ')

  const iconClasses = iconSizeClasses[size]

  return (
    <button
      ref={ref}
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className={`animate-spin ${iconClasses}`}
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              className="opacity-25"
            />
            <path
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              className="opacity-75"
            />
          </svg>
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <span className={`${iconClasses} flex-shrink-0`} aria-hidden="true">
              {leftIcon}
            </span>
          )}
          <span className="truncate">{children}</span>
          {rightIcon && (
            <span className={`${iconClasses} flex-shrink-0`} aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
