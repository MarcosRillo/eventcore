/**
 * Input Component - Minimalist Design System
 * Clean and subtle input field with elegant focus states
 */

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  required,
  id,
  'aria-describedby': externalAriaDescribedBy,
  ...props
}, ref) => {
  // Generate stable unique ID for accessibility (useId ensures SSR/CSR match)
  const generatedId = useId()
  const inputId = id || `input-${generatedId}`

  // Merge aria-describedby values
  const computedAriaDescribedBy = [
    error ? `${inputId}-error` : null,
    helperText && !error ? `${inputId}-helper` : null,
    externalAriaDescribedBy,
  ].filter(Boolean).join(' ') || undefined

  // Base input styles
  const baseClasses = [
    'w-full',
    'bg-white',
    'border border-neutral-200',
    'text-neutral-900',
    'placeholder:text-neutral-400',
    'rounded-md',
    'transition-all duration-150 ease-in-out',
    'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10',
    'disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed',
  ].join(' ')

  // Size variants
  const sizeClasses: Record<string, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  }

  // Error state - using semantic error tokens
  const errorClasses = error
    ? 'border-error-300 focus:border-error-500 focus:ring-error-500/10 bg-error-50/50'
    : ''

  // Icon padding adjustments
  const iconPadding = {
    left: leftIcon ? (size === 'lg' ? 'pl-11' : 'pl-10') : '',
    right: rightIcon ? (size === 'lg' ? 'pr-11' : 'pr-10') : '',
  }

  const inputClasses = [
    baseClasses,
    sizeClasses[size],
    errorClasses,
    iconPadding.left,
    iconPadding.right,
    className,
  ].filter(Boolean).join(' ')

  // Icon styles
  const iconSize: Record<string, string> = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const iconPosition: Record<string, string> = {
    sm: 'top-2',
    md: 'top-3',
    lg: 'top-3.5',
  }

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={inputId}
          className={`
            block text-sm font-medium mb-1.5 transition-colors
            ${error ? 'text-error-600' : 'text-neutral-700'}
          `}
        >
          {label}
          {required && <span className="text-error-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className={`absolute left-3 ${iconPosition[size]} pointer-events-none`}>
            <span className={`${iconSize[size]} ${error ? 'text-error-500' : 'text-neutral-400'}`}>
              {leftIcon}
            </span>
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={computedAriaDescribedBy}
          {...props}
        />

        {rightIcon && (
          <div className={`absolute right-3 ${iconPosition[size]} pointer-events-none`}>
            <span className={`${iconSize[size]} ${error ? 'text-error-500' : 'text-neutral-400'}`}>
              {rightIcon}
            </span>
          </div>
        )}
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-error-600 flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
