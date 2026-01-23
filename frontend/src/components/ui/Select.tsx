/**
 * Select Component - Minimalist Design System
 * Clean dropdown using Headless UI for accessibility
 */

import { Listbox, Transition } from '@headlessui/react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Fragment } from 'react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface SelectProps {
  label?: string
  value: string | number | null
  onChange: (value: string | number) => void
  options: SelectOption[]
  placeholder?: string
  error?: string
  helperText?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
  required?: boolean
}

const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  error,
  helperText,
  disabled = false,
  size = 'md',
  fullWidth = false,
  className = '',
  required = false,
}: SelectProps) => {
  // Size variants
  const sizeClasses: Record<string, string> = {
    sm: 'h-8 pl-3 pr-8 text-sm',
    md: 'h-10 pl-3 pr-10 text-sm',
    lg: 'h-12 pl-4 pr-10 text-base',
  }

  // Base button classes
  const buttonClasses = [
    'relative w-full text-left',
    'bg-white border rounded-md',
    'transition-all duration-150 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500',
    'disabled:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50',
    sizeClasses[size],
    error
      ? 'border-error-300 focus:border-error-500 focus:ring-error-500/10'
      : 'border-neutral-200 hover:border-neutral-300',
    className,
  ].filter(Boolean).join(' ')

  // Icon sizes
  const iconSize: Record<string, string> = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  // Find selected option
  const selectedOption = options.find(option => option.value === value)
  const displayValue = selectedOption?.label || placeholder

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className={`block text-sm font-medium mb-1.5 ${error ? 'text-error-600' : 'text-neutral-700'}`}>
          {label}
          {required && <span className="text-error-500 ml-0.5">*</span>}
        </label>
      )}

      <Listbox value={value ?? undefined} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button className={buttonClasses}>
            <span className={`block truncate ${!selectedOption ? 'text-neutral-400' : 'text-neutral-900'}`}>
              {displayValue}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronsUpDown className={`${iconSize[size]} text-neutral-400`} aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg border border-neutral-100 focus:outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-9 pr-4 text-sm ${
                      active ? 'bg-neutral-50 text-neutral-900' : 'text-neutral-700'
                    } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                  }
                  value={option.value}
                  disabled={option.disabled}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {option.label}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      {error && (
        <p className="mt-1.5 text-sm text-error-600" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1.5 text-sm text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  )
}

export default Select
