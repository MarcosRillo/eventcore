/**
 * LoadingSpinner Component - Minimalist Design System
 * Clean spinner with subtle animations
 */

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'neutral' | 'white'
  text?: string
  fullScreen?: boolean
  className?: string
}

const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false,
  className = '',
}: LoadingSpinnerProps) => {
  const sizeClasses: Record<string, string> = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  const colorClasses: Record<string, string> = {
    primary: 'text-primary-500',
    neutral: 'text-neutral-400',
    white: 'text-white',
  }

  const textSizeClasses: Record<string, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }

  const spinnerClasses = [
    sizeClasses[size],
    colorClasses[color],
    'animate-spin',
    className,
  ].filter(Boolean).join(' ')

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg
        className={spinnerClasses}
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          className="opacity-20"
        />
        <path
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          className="opacity-80"
        />
      </svg>

      {text && (
        <span className={`font-medium text-neutral-600 ${textSizeClasses[size]}`}>
          {text}
        </span>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
        role="status"
        aria-label={text || 'Cargando'}
      >
        {spinner}
      </div>
    )
  }

  return (
    <div role="status" aria-label={text || 'Cargando'}>
      {spinner}
    </div>
  )
}

// Inline loading indicator for buttons/text
interface LoadingDotsProps {
  className?: string
}

export const LoadingDots = ({ className = '' }: LoadingDotsProps) => (
  <span className={`inline-flex gap-1 ${className}`} aria-hidden="true">
    <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </span>
)

// Loading overlay for containers
interface LoadingOverlayProps {
  message?: string
  className?: string
}

export const LoadingOverlay = ({ message, className = '' }: LoadingOverlayProps) => (
  <div
    className={`absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px] z-10 ${className}`}
    role="status"
    aria-label={message || 'Cargando'}
  >
    <LoadingSpinner size="lg" text={message} />
  </div>
)

export default LoadingSpinner
