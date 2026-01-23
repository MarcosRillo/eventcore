/**
 * Checkbox Component - Minimalist Design System
 * Clean checkbox with label and description support
 */

import { type ChangeEvent,useId } from 'react'

interface CheckboxProps {
  id?: string
  name?: string
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  error?: string
  className?: string
  description?: string
}

const Checkbox = ({
  id,
  name,
  label,
  checked,
  onChange,
  disabled = false,
  error,
  className = '',
  description,
}: CheckboxProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
  }

  // Generate stable unique ID for accessibility (useId ensures SSR/CSR match)
  const generatedId = useId()
  const checkboxId = id || `checkbox-${generatedId}`

  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className={`
            w-4 h-4 rounded
            border-neutral-300
            text-primary-500
            transition-colors duration-150
            focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            ${!disabled ? 'cursor-pointer' : ''}
            ${error ? 'border-error-300' : ''}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${checkboxId}-error` : description ? `${checkboxId}-description` : undefined}
        />
      </div>

      {(label || description || error) && (
        <div className="ml-3">
          {label && (
            <label
              htmlFor={checkboxId}
              className={`
                text-sm font-medium text-neutral-700
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {label}
            </label>
          )}
          {description && (
            <p id={`${checkboxId}-description`} className="text-sm text-neutral-500 mt-0.5">
              {description}
            </p>
          )}
          {error && (
            <p id={`${checkboxId}-error`} className="text-sm text-error-600 mt-0.5" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default Checkbox
