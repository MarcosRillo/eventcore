'use client'

/**
 * SearchableMultiSelect Component
 * A searchable dropdown that allows selecting multiple options
 * Uses @headlessui/react Combobox for accessibility
 */

import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { useState, useMemo, useId } from 'react'

export interface SelectOption {
  id: number
  name: string
}

export interface SearchableMultiSelectProps {
  options: SelectOption[]
  selected: number[]
  onChange: (ids: number[]) => void
  placeholder?: string
  label: string
  error?: string
  disabled?: boolean
  required?: boolean
}

/**
 *
 * @param root0
 * @param root0.options
 * @param root0.selected
 * @param root0.onChange
 * @param root0.placeholder
 * @param root0.label
 * @param root0.error
 * @param root0.disabled
 * @param root0.required
 */
export function SearchableMultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Buscar...',
  label,
  error,
  disabled = false,
  required = false,
}: SearchableMultiSelectProps) {
  const [query, setQuery] = useState('')
  const generatedId = useId()
  const inputId = `searchable-select-${generatedId}`

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!query) return options
    const lowerQuery = query.toLowerCase()
    return options.filter((option) =>
      option.name.toLowerCase().includes(lowerQuery)
    )
  }, [options, query])

  // Get selected options objects for display
  const selectedOptions = useMemo(() => {
    return options.filter((option) => selected.includes(option.id))
  }, [options, selected])

  // Handle selection toggle
  const handleSelect = (option: SelectOption | null) => {
    if (!option) return

    if (selected.includes(option.id)) {
      // Remove if already selected
      onChange(selected.filter((id) => id !== option.id))
    } else {
      // Add to selection
      onChange([...selected, option.id])
    }
    setQuery('')
  }

  // Remove a selected item
  const handleRemove = (id: number) => {
    onChange(selected.filter((selectedId) => selectedId !== id))
  }

  // Base input styles (matching Input component pattern)
  const inputClasses = [
    'w-full',
    'bg-white',
    'border',
    error ? 'border-error-300' : 'border-neutral-200',
    'text-neutral-900',
    'placeholder:text-neutral-400',
    'rounded-md',
    'h-10 px-3 text-sm',
    'transition-all duration-150 ease-in-out',
    'focus:outline-none',
    error ? 'focus:border-error-500 focus:ring-error-500/10' : 'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10',
    'disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed',
  ].join(' ')

  return (
    <div className="w-full">
      {/* Label */}
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

      {/* Selected chips */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-sm rounded-md border border-primary-200"
            >
              {option.name}
              <button
                type="button"
                onClick={() => handleRemove(option.id)}
                disabled={disabled}
                className="hover:text-primary-900 focus:outline-none disabled:opacity-50"
                aria-label={`Remover ${option.name}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Combobox */}
      <Combobox
        value={null}
        onChange={handleSelect}
        disabled={disabled}
      >
        <div className="relative">
          <div className="relative">
            <ComboboxInput
              id={inputId}
              className={inputClasses}
              placeholder={placeholder}
              displayValue={() => query}
              onChange={(e) => setQuery(e.target.value)}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${inputId}-error` : undefined}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="w-4 h-4 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </ComboboxButton>
          </div>

          <ComboboxOptions
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none"
          >
            {filteredOptions.length === 0 && query !== '' ? (
              <div className="px-4 py-2 text-sm text-neutral-500">
                No se encontraron resultados
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option.id)
                return (
                  <ComboboxOption
                    key={option.id}
                    value={option}
                    className={({ focus }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        focus ? 'bg-primary-50 text-primary-900' : 'text-neutral-900'
                      }`
                    }
                  >
                    {/* Checkbox indicator */}
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-neutral-300'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                    </span>
                    <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                      {option.name}
                    </span>
                  </ComboboxOption>
                )
              })
            )}
          </ComboboxOptions>
        </div>
      </Combobox>

      {/* Error message */}
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-error-600 flex items-center gap-1"
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
    </div>
  )
}

export default SearchableMultiSelect
