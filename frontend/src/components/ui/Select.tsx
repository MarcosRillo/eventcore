/**
 * Select Component
 * Custom select component using Headless UI for accessibility and professional UX
 */

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  value: string | number | null;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  required?: boolean;
}

const Select: React.FC<SelectProps> = ({
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
}) => {
  const baseClasses = 'border rounded-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 disabled:bg-neutral-100 disabled:cursor-not-allowed cursor-pointer';

  const sizeClasses = {
    sm: 'pl-3 pr-8 py-1.5 text-sm',
    md: 'pl-3 pr-8 py-2 text-base',
    lg: 'pl-4 pr-10 py-3 text-base',
  };

  const stateClasses = error
    ? 'border-red-600 bg-red-50 focus:border-red-600 focus:ring-red-500/20'
    : 'border-neutral-300 bg-neutral-50 focus:bg-white focus:border-primary-500 focus:ring-primary-500/20';

  const buttonClasses = [
    baseClasses,
    sizeClasses[size],
    stateClasses,
    'relative w-full text-left bg-white',
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
  };

  const iconPositionClasses = {
    sm: 'top-1.5 right-2',
    md: 'top-2 right-2',
    lg: 'top-3 right-3',
  };

  // Find the selected option to display its label
  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption?.label || placeholder;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-neutral-600 mb-2">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      <Listbox value={value ?? undefined} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button className={buttonClasses}>
            <span className={`block truncate ${
              !selectedOption ? 'text-neutral-400' : 'text-neutral-900'
            }`}>
              {displayValue}
            </span>

            <span className={`absolute inset-y-0 ${iconPositionClasses[size]} flex items-center pointer-events-none`}>
              <ChevronUpDownIcon
                className={`${iconClasses[size]} text-neutral-400`}
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-neutral-200 focus:outline-none sm:text-sm">
              {options.map((option, optionIdx) => (
                <Listbox.Option
                  key={optionIdx}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-8 pr-4 ${
                      active
                        ? 'bg-primary-50 text-primary-900'
                        : 'text-neutral-900'
                    } ${
                      option.disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`
                  }
                  value={option.value}
                  disabled={option.disabled}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-semibold' : 'font-normal'
                        }`}
                      >
                        {option.label}
                      </span>

                      {selected && (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-2 ${
                            active ? 'text-primary-600' : 'text-primary-600'
                          }`}
                        >
                          <CheckIcon className="h-4 w-4" aria-hidden="true" />
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
        <p className="mt-2 text-sm text-red-600 font-medium" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-2 text-sm text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Select;
