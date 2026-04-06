/**
 * ErrorBanner - Shared presentational component
 *
 * Displays an error alert with a message and optional dismiss/retry action.
 * Extracted from admin page containers (Sectors, EventTypes, Locations).
 */

import type { ReactNode } from 'react'

interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
  dismissIcon?: ReactNode
}

export function ErrorBanner({ message, onDismiss, dismissIcon }: ErrorBannerProps) {
  return (
    <div className="bg-error-50 border border-error-200 rounded-md p-4 mb-6" role="alert">
      <div className="flex items-start">
        <svg
          className="w-5 h-5 text-error-400 mt-0.5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-error-800 mb-1">Error en la operación</h3>
          <p className="text-sm text-error-600">{message}</p>
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-3 text-error-400 hover:text-error-600"
            aria-label="Reintentar carga de datos"
          >
            {dismissIcon ?? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        ) : null}
      </div>
    </div>
  )
}
