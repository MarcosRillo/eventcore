'use client'

/**
 * AsyncSearchableMultiSelect Component
 *
 * A searchable dropdown that fetches options from API with debounce.
 * Supports multi-selection with removable chips.
 * Uses @headlessui/react Combobox for accessibility.
 */

import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { useCallback,useEffect, useId, useRef, useState } from 'react'

export interface SelectOption {
  id: number
  name: string
}

export interface AsyncSearchableMultiSelectProps {
  onSearch: (query: string) => Promise<SelectOption[]>
  selected: number[]
  onChange: (ids: number[]) => void
  selectedOptions?: SelectOption[]
  label: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  debounceMs?: number
  minChars?: number
}

/**
 *
 * @param root0
 * @param root0.onSearch
 * @param root0.selected
 * @param root0.onChange
 * @param root0.selectedOptions
 * @param root0.label
 * @param root0.placeholder
 * @param root0.error
 * @param root0.disabled
 * @param root0.required
 * @param root0.debounceMs
 * @param root0.minChars
 */
export function AsyncSearchableMultiSelect({
  onSearch,
  selected,
  onChange,
  selectedOptions: initialSelectedOptions = [],
  label,
  placeholder = 'Escribe para buscar...',
  error,
  disabled = false,
  required = false,
  debounceMs = 300,
  minChars = 2,
}: AsyncSearchableMultiSelectProps) {
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<SelectOption[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedOptionsCache, setSelectedOptionsCache] = useState<SelectOption[]>(initialSelectedOptions)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const generatedId = useId()
  const inputId = `async-select-${generatedId}`

  // Update cache when initialSelectedOptions changes
  useEffect(() => {
    if (initialSelectedOptions.length > 0) {
      setSelectedOptionsCache(prev => {
        const existingIds = new Set(prev.map(o => o.id))
        const newOptions = initialSelectedOptions.filter(o => !existingIds.has(o.id))
        return [...prev, ...newOptions]
      })
    }
  }, [initialSelectedOptions])

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minChars) {
      setOptions([])
      return
    }

    setLoading(true)
    try {
      const results = await onSearch(searchQuery)
      setOptions(results)
    } catch {
      setOptions([])
    } finally {
      setLoading(false)
    }
  }, [onSearch, minChars])

  // Handle query change with debounce
  const handleQueryChange = (value: string) => {
    setQuery(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (value.length < minChars) {
      setOptions([])
      return
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value)
    }, debounceMs)
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Get selected options for display (from cache)
  const displayedSelectedOptions = selectedOptionsCache.filter(opt => selected.includes(opt.id))

  // Handle selection toggle
  const handleSelect = (option: SelectOption | null) => {
    if (!option) return

    // Add to cache if not already there
    if (!selectedOptionsCache.find(o => o.id === option.id)) {
      setSelectedOptionsCache(prev => [...prev, option])
    }

    if (selected.includes(option.id)) {
      onChange(selected.filter(id => id !== option.id))
    } else {
      onChange([...selected, option.id])
    }
    setQuery('')
    setOptions([])
  }

  // Remove a selected item
  const handleRemove = (id: number) => {
    onChange(selected.filter(selectedId => selectedId !== id))
  }

  // Base input styles
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
              className={inputClasses}
              placeholder={placeholder}
              displayValue={() => query}
              onChange={(e) => handleQueryChange(e.target.value)}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${inputId}-error` : undefined}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
              {loading ? (
                <svg className="w-4 h-4 text-neutral-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </ComboboxButton>
          </div>

          <ComboboxOptions
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none"
          >
            {query.length < minChars ? (
              <div className="px-4 py-2 text-sm text-neutral-500">
                Escribe al menos {minChars} caracteres para buscar
              </div>
            ) : loading ? (
              <div className="px-4 py-2 text-sm text-neutral-500">
                Buscando...
              </div>
            ) : options.length === 0 ? (
              <div className="px-4 py-2 text-sm text-neutral-500">
                No se encontraron resultados
              </div>
            ) : (
              options.map((option) => {
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

export default AsyncSearchableMultiSelect
