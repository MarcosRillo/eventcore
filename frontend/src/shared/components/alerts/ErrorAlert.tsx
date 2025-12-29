/**
 * ErrorAlert - Reusable error alert component
 * Uses semantic color tokens for consistent styling
 */

'use client';

import { XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ErrorAlertProps {
  /** Error message to display */
  message: string;
  /** Optional title (defaults to "Error") */
  title?: string;
  /** Optional additional details */
  details?: string;
  /** Handler for dismissing the error */
  onDismiss?: () => void;
  /** Optional retry handler */
  onRetry?: () => void;
  /** Retry button text (defaults to "Intentar de nuevo") */
  retryText?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 *
 * @param root0
 * @param root0.message
 * @param root0.title
 * @param root0.details
 * @param root0.onDismiss
 * @param root0.onRetry
 * @param root0.retryText
 * @param root0.testId
 */
export function ErrorAlert({
  message,
  title = 'Error',
  details,
  onDismiss,
  onRetry,
  retryText = 'Intentar de nuevo',
  testId = 'error-alert',
}: ErrorAlertProps) {
  return (
    <div
      className="bg-error-50 border border-error-200 rounded-md p-4"
      data-testid={testId}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-error-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-error-800">{title}</h3>
          <div className="mt-2 text-sm text-error-700">
            <p>{message}</p>
            {details && (
              <p className="mt-1 text-xs text-error-600">{details}</p>
            )}
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="text-sm text-error-800 underline hover:text-error-600 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2"
              >
                {retryText}
              </button>
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex bg-error-50 rounded-md p-1.5 text-error-500 hover:bg-error-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-error-50 focus:ring-error-600"
              aria-label="Cerrar"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ErrorAlert;
