'use client'

/**
 * FuzzySearchSelect Component
 *
 * A searchable dropdown with fuzzy matching using Fuse.js.
 * Shows 10 options on open, filters with fuzzy search as user types.
 * Supports multi-selection with removable chips.
 * Uses @headlessui/react Combobox for accessibility.
 */

import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import Fuse, { IFuseOptions } from 'fuse.js'
import { useEffect, useId, useMemo, useState } from 'react'

export interface FuzzySelectOption {
  id: number
  name: string
}

export interface FuzzySearchSelectProps {
  options: FuzzySelectOption[]
  selected: number[]
  onChange: (ids: number[]) => void
  selectedOptions?: FuzzySelectOption[]
  label: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  maxResults?: number
  name?: string
}

const FUSE_OPTIONS: IFuseOptions<FuzzySelectOption> = {
  keys: ['name'],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 1,
}

/**
 * FuzzySearchSelect - Multi-select with fuzzy search
 */
export function FuzzySearchSelect({
  options = [],
  selected,
  onChange,
  selectedOptions: providedSelectedOptions,
  label,
  placeholder = 'Buscar ubicacion…',
  error,
  disabled = false,
  required = false,
  maxResults = 10,
  name,
}: FuzzySearchSelectProps) {
  const [query, setQuery] = useState('')
  const generatedId = useId()
  const inputId = `fuzzy-select-${generatedId}`

  // Lazy state initialization - Fuse instance created once
  const [fuseInstance] = useState(() => new Fuse(options, FUSE_OPTIONS))

  // Sync Fuse collection when options change (side-effect only)
  useEffect(() => {
    fuseInstance.setCollection(options)
  }, [options, fuseInstance])

  // Derive filtered options from query and options (no state needed)
  const filteredOptions = useMemo(() => {
    if (!options || options.length === 0) return []
    if (!query.trim()) return options.slice(0, maxResults)
    return fuseInstance.search(query).slice(0, maxResults).map(r => r.item)
  }, [options, query, maxResults, fuseInstance])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
  }

  // Get selected options for display
  const displayedSelectedOptions = providedSelectedOptions && providedSelectedOptions.length > 0
    ? providedSelectedOptions.filter(opt => selected.includes(opt.id))
    : options.filter(opt => selected.includes(opt.id))

  // Handle selection toggle
  const handleSelect = (option: FuzzySelectOption | null) => {
    if (!option) return

    if (selected.includes(option.id)) {
      onChange(selected.filter(id => id !== option.id))
    } else {
      onChange([...selected, option.id])
    }
    setQuery('')
  }

  // Remove a selected item
  const handleRemove = (id: number) => {
    onChange(selected.filter(selectedId => selectedId !== id))
  }

  // Base input styles (matching existing form components)
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
    'focus-visible:ring-2 focus-visible:ring-primary-500',
    'disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed',
  ].join(' ')

  return (
    <div className="w-full">
      {/* Label with htmlFor for accessibility */}
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
      {displayedSelectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {displayedSelectedOptions.map((option) => (
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
              name={name}
              className={inputClasses}
              placeholder={placeholder}
              displayValue={() => query}
              onChange={(e) => handleSearch(e.target.value)}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${inputId}-error` : undefined}
            />
            <ComboboxButton className="absolute inset-0 flex items-center justify-end pr-3">
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
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-neutral-500">
                No se encontraron ubicaciones
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

      {/* Error message inline */}
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

export default FuzzySearchSelect
