/**
 * Textarea Component - Minimalist Design System
 * Clean textarea with elegant focus states
 */

import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  disabled,
  required,
  id,
  rows = 4,
  ...props
}, ref) => {
  // Generate unique ID for accessibility
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`

  // Base classes
  const baseClasses = [
    'w-full',
    'bg-white',
    'border border-neutral-200',
    'text-neutral-900',
    'placeholder:text-neutral-400',
    'rounded-md',
    'px-3 py-2.5',
    'text-sm',
    'resize-y',
    'transition-all duration-150 ease-in-out',
    'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10',
    'disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed',
  ].join(' ')

  // Error state
  const errorClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50/50'
    : ''

  const textareaClasses = [
    baseClasses,
    errorClasses,
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={textareaId}
          className={`block text-sm font-medium mb-1.5 ${error ? 'text-red-600' : 'text-neutral-700'}`}
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        className={textareaClasses}
        disabled={disabled}
        required={required}
        rows={rows}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        {...props}
      />

      {error && (
        <p
          id={`${textareaId}-error`}
          className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
          role="alert"
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
        <p id={`${textareaId}-helper`} className="mt-1.5 text-sm text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
