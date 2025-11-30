/**
 * ErrorState Component - Minimalist Design System
 * Clean error display with retry action
 */

import type { ReactNode } from 'react'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryText?: string
  icon?: ReactNode
  className?: string
  variant?: 'default' | 'inline' | 'card'
}

const ErrorState = ({
  title = 'Algo salió mal',
  message = 'Ha ocurrido un error. Por favor, intenta de nuevo.',
  onRetry,
  retryText = 'Reintentar',
  icon,
  className = '',
  variant = 'default',
}: ErrorStateProps) => {
  const defaultIcon = (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  )

  const variantClasses: Record<string, { container: string; iconSize: string }> = {
    default: {
      container: 'py-10 px-6',
      iconSize: 'w-12 h-12',
    },
    inline: {
      container: 'py-4 px-4',
      iconSize: 'w-8 h-8',
    },
    card: {
      container: 'py-8 px-6 bg-error-50/50 border border-error-100 rounded-lg',
      iconSize: 'w-10 h-10',
    },
  }

  const styles = variantClasses[variant]

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${styles.container} ${className}`}
      role="alert"
    >
      <div className={`text-error-400 mb-4 ${styles.iconSize}`}>
        {icon || defaultIcon}
      </div>

      <h3 className="text-base font-medium text-neutral-900">
        {title}
      </h3>

      {message && (
        <p className="text-sm text-neutral-500 mt-1 max-w-sm">
          {message}
        </p>
      )}

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-error-600 bg-error-50 hover:bg-error-100 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-error-500/40"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {retryText}
        </button>
      )}
    </div>
  )
}

// Preset error variants
interface NetworkErrorProps {
  onRetry?: () => void
  className?: string
}

export const NetworkError = ({ onRetry, className = '' }: NetworkErrorProps) => (
  <ErrorState
    title="Error de conexión"
    message="No se pudo conectar al servidor. Verifica tu conexión a internet."
    onRetry={onRetry}
    className={className}
    icon={
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
      </svg>
    }
  />
)

interface NotFoundErrorProps {
  resource?: string
  className?: string
}

export const NotFoundError = ({ resource = 'recurso', className = '' }: NotFoundErrorProps) => (
  <ErrorState
    title="No encontrado"
    message={`El ${resource} que buscas no existe o fue eliminado.`}
    className={className}
    icon={
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    }
  />
)

interface PermissionErrorProps {
  className?: string
}

export const PermissionError = ({ className = '' }: PermissionErrorProps) => (
  <ErrorState
    title="Acceso denegado"
    message="No tienes permisos para acceder a este recurso."
    className={className}
    icon={
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    }
  />
)

export default ErrorState
