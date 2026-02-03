'use client'

/**
 * DateTimePicker Component - Spanish locale date and time picker
 * Uses react-day-picker with date-fns Spanish locale
 */

import 'react-day-picker/style.css'

import { format, isBefore, isValid, parse, setHours, setMinutes, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar } from 'lucide-react'
import { ChangeEvent, useEffect, useId, useRef, useState } from 'react'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'

export interface DateTimePickerProps {
  label?: string
  value: string
  onChange: (value: string) => void
  minDate?: Date
  maxDate?: Date
  error?: string
  helperText?: string
  disabled?: boolean
  required?: boolean
  fullWidth?: boolean
  name?: string
  /** When false, hides the time input and emits date-only values (yyyy-MM-dd). Default: true */
  showTime?: boolean
}

/**
 * Formats a Date to ISO datetime-local string (YYYY-MM-DDTHH:mm)
 */
const toDateTimeLocalString = (date: Date): string => {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

/**
 * Parses an ISO datetime-local string or date-only string to Date
 */
const parseDateTimeLocal = (value: string): Date | null => {
  if (!value) return null
  // Try date-only format first (yyyy-MM-dd)
  const dateOnly = parse(value, 'yyyy-MM-dd', new Date())
  if (isValid(dateOnly)) return dateOnly
  // Then try datetime-local format (yyyy-MM-ddTHH:mm)
  const dateTime = parse(value, "yyyy-MM-dd'T'HH:mm", new Date())
  return isValid(dateTime) ? dateTime : null
}

/**
 * Formats a Date for display in Spanish
 */
const formatDisplayDate = (date: Date): string => {
  return format(date, "d 'de' MMMM yyyy, HH:mm", { locale: es })
}

const DateTimePicker = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  error,
  helperText,
  disabled = false,
  required = false,
  fullWidth = false,
  name,
  showTime = true,
}: DateTimePickerProps) => {
  const generatedId = useId()
  const inputId = `datetime-picker-${generatedId}`
  const dialogId = `datetime-dialog-${generatedId}`
  const containerRef = useRef<HTMLDivElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [timeValue, setTimeValue] = useState<string>('12:00')

  // Parse current value
  const selectedDate = parseDateTimeLocal(value)

  // Keep time input in sync with selected date
  useEffect(() => {
    if (selectedDate) {
      setTimeValue(format(selectedDate, 'HH:mm'))
    }
  }, [selectedDate])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleDaySelect = (date: Date | undefined) => {
    if (!date) return

    if (showTime) {
      const [hours, minutes] = timeValue.split(':').map((str) => parseInt(str, 10))
      const newDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hours,
        minutes
      )
      onChange(toDateTimeLocalString(newDate))
    } else {
      onChange(format(date, 'yyyy-MM-dd'))
    }
    setIsOpen(false)
  }

  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value
    setTimeValue(time)

    if (!selectedDate) return

    const [hours, minutes] = time.split(':').map((str) => parseInt(str, 10))
    const newDate = setHours(setMinutes(selectedDate, minutes), hours)
    onChange(toDateTimeLocalString(newDate))
  }

  const handleClear = () => {
    onChange('')
    setTimeValue('12:00')
  }

  // Disable dates before minDate or after maxDate
  const disabledDays = (date: Date): boolean => {
    const dayStart = startOfDay(date)
    if (minDate && isBefore(dayStart, startOfDay(minDate))) {
      return true
    }
    if (maxDate && isBefore(startOfDay(maxDate), dayStart)) {
      return true
    }
    return false
  }

  return (
    <div ref={containerRef} className={`relative ${fullWidth ? 'w-full' : ''}`}>
      {/* Label */}
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

      {/* Input trigger */}
      <button
        id={inputId}
        name={name}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? dialogId : undefined}
        className={`
          w-full h-10 px-3 text-sm text-left
          bg-white border rounded-md
          flex items-center justify-between gap-2
          transition-colors duration-150 ease-in-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:border-primary-500
          disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
          ${error
            ? 'border-error-300 focus-visible:border-error-500 focus-visible:ring-error-500/20 bg-error-50/50'
            : 'border-neutral-200 hover:border-neutral-300'
          }
        `}
      >
        <span className={selectedDate ? 'text-neutral-900' : 'text-neutral-400'}>
          {selectedDate
            ? showTime
              ? formatDisplayDate(selectedDate)
              : format(selectedDate, "d 'de' MMMM yyyy", { locale: es })
            : showTime
              ? 'Seleccionar fecha y hora'
              : 'Seleccionar fecha'}
        </span>
        <Calendar className="w-4 h-4 text-neutral-400 flex-shrink-0" aria-hidden="true" />
      </button>

      {/* Dropdown calendar */}
      {isOpen && (
        <div
          id={dialogId}
          role="dialog"
          aria-label="Seleccionar fecha"
          className="absolute z-50 mt-1 p-4 bg-white rounded-lg shadow-lg border border-neutral-200 left-0"
        >
          <DayPicker
            mode="single"
            selected={selectedDate || undefined}
            onSelect={handleDaySelect}
            locale={es}
            disabled={disabledDays}
            defaultMonth={selectedDate || minDate || new Date()}
            showOutsideDays
            autoFocus
            classNames={{
              root: `${getDefaultClassNames().root} text-sm`,
              today: 'font-semibold',
              selected: 'font-medium',
              disabled: 'cursor-not-allowed',
              outside: '',
              chevron: `${getDefaultClassNames().chevron} fill-neutral-600`,
            }}
          />

          {/* Time input */}
          {showTime && <div className="mt-3 pt-3 border-t border-neutral-200">
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <span>Hora:</span>
              <input
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                disabled={disabled}
                className="flex-1 h-8 px-2 text-sm bg-white border border-neutral-200 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:border-primary-500"
              />
            </label>
          </div>}

          {/* Actions */}
          <div className="mt-3 pt-3 border-t border-neutral-200 flex justify-between gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-sm bg-primary-500 text-white hover:bg-primary-600 rounded-md transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p
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

      {/* Helper text */}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  )
}

export default DateTimePicker
