/**
 * PasswordInput Component - Minimalist Design System
 * Password input with visibility toggle and optional requirements display
 */

'use client'

import { Eye, EyeOff } from 'lucide-react'
import { forwardRef, InputHTMLAttributes, ReactNode, useId, useState } from 'react'

interface PasswordRequirement {
  label: string
  met: boolean
}

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  showToggle?: boolean
  showRequirements?: boolean
  requirements?: PasswordRequirement[]
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  size = 'md',
  fullWidth = false,
  showToggle = true,
  showRequirements = false,
  requirements = [],
  className = '',
  disabled,
  required,
  id,
  'aria-describedby': externalAriaDescribedBy,
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)

  // Generate stable unique ID for accessibility (useId ensures SSR/CSR match)
  const generatedId = useId()
  const inputId = id || `password-input-${generatedId}`

  // Merge aria-describedby values
  const computedAriaDescribedBy = [
    error ? `${inputId}-error` : null,
    helperText && !error ? `${inputId}-helper` : null,
    showRequirements && requirements.length > 0 ? `${inputId}-requirements` : null,
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
    right: showToggle ? (size === 'lg' ? 'pr-11' : 'pr-10') : '',
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

  const toggleVisibility = (): void => {
    setIsVisible((prev) => !prev)
  }

  // Handler to detect Caps Lock state
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'))
    }
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
          type={isVisible ? 'text' : 'password'}
          spellCheck={false}
          className={inputClasses}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={computedAriaDescribedBy}
          onKeyUp={handleKeyUp}
          onBlur={(e) => {
            setIsCapsLockOn(false)
            props.onBlur?.(e)
          }}
          {...props}
        />

        {showToggle && (
          <button
            type="button"
            onClick={toggleVisibility}
            disabled={disabled}
            className={`absolute right-3 ${iconPosition[size]} text-neutral-400 hover:text-neutral-600 focus:outline-none focus:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {isVisible ? (
              <EyeOff className={iconSize[size]} aria-hidden="true" />
            ) : (
              <Eye className={iconSize[size]} aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {isCapsLockOn && !error && (
        <p className="mt-1.5 text-sm text-warning-600 flex items-center gap-1" role="status">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Bloq Mayús está activado
        </p>
      )}

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

      {showRequirements && requirements.length > 0 && (
        <div
          id={`${inputId}-requirements`}
          className="mt-2 space-y-1"
          role="list"
          aria-label="Requisitos de contraseña"
        >
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center text-xs" role="listitem">
              {req.met ? (
                <svg className="w-4 h-4 text-success-500 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-neutral-300 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                </svg>
              )}
              <span className={req.met ? 'text-success-600' : 'text-neutral-500'}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput
export type { PasswordInputProps, PasswordRequirement }
