/**
 * ColorPicker Component
 * Pure presentation component for color selection
 * Follows Minimalist Design System patterns with full accessibility
 */

import { useId } from 'react'

// Preset colors palette - consistent with event types
const PRESET_COLORS = [
  '#3B82F6', // Blue (default)
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
]

export interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
  helperText?: string
  className?: string
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  error,
  helperText,
  className = '',
}) => {
  const generatedId = useId()
  const inputId = `color-picker-${generatedId}`
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const handleHexChange = (hexValue: string): void => {
    if (/^#[0-9A-Fa-f]{0,6}$/.test(hexValue)) {
      onChange(hexValue)
    }
  }

  // Aria describedby computation
  const ariaDescribedBy =
    [error ? errorId : null, helperText && !error ? helperId : null]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label
        htmlFor={inputId}
        className={`block text-sm font-medium transition-colors ${
          error ? 'text-error-600' : 'text-neutral-700'
        }`}
      >
        {label}
      </label>

      {/* Main controls */}
      <div className="flex items-center gap-3">
        {/* Color preview swatch */}
        <div
          className={`w-10 h-10 rounded-md border-2 shadow-sm flex-shrink-0 ${
            error ? 'border-error-300' : 'border-neutral-200'
          }`}
          style={{ backgroundColor: value }}
          aria-hidden="true"
        />

        {/* Native color input */}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-label={`Selector de color para ${label}`}
          className={`w-10 h-10 rounded-md border-2 cursor-pointer flex-shrink-0 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 disabled:cursor-not-allowed disabled:opacity-50 ${
            error
              ? 'border-error-300'
              : 'border-neutral-200 hover:border-neutral-300'
          }`}
        />

        {/* Hex input */}
        <input
          type="text"
          id={inputId}
          value={value}
          onChange={(e) => handleHexChange(e.target.value)}
          disabled={disabled}
          placeholder="#AABBCC"
          maxLength={7}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={ariaDescribedBy}
          className={`flex-1 h-10 px-3 text-sm bg-white border rounded-md text-neutral-900 placeholder:text-neutral-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/10 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed ${
            error
              ? 'border-error-300 focus:border-error-500 focus:ring-error-500/10'
              : 'border-neutral-200 focus:border-primary-500'
          }`}
        />
      </div>

      {/* Preset colors */}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            disabled={disabled}
            aria-label={`Seleccionar color ${color}`}
            className={`w-6 h-6 rounded-full border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
              value === color
                ? 'border-neutral-900 scale-110'
                : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p
          id={errorId}
          className="text-sm text-error-600 flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p id={helperId} className="text-sm text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  )
}
