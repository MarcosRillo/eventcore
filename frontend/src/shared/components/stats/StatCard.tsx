/**
 * StatCard Component - Minimalist Design System
 * Clean stat display with icon and trend indicator
 */

import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    label?: string
  }
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'error'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

const StatCard = ({
  label,
  value,
  icon,
  trend,
  variant = 'default',
  size = 'md',
  className = '',
  onClick,
}: StatCardProps) => {
  const sizeClasses = {
    sm: {
      container: 'p-4',
      icon: 'w-8 h-8',
      value: 'text-xl',
      label: 'text-xs',
    },
    md: {
      container: 'p-5',
      icon: 'w-10 h-10',
      value: 'text-2xl',
      label: 'text-sm',
    },
    lg: {
      container: 'p-6',
      icon: 'w-12 h-12',
      value: 'text-3xl',
      label: 'text-sm',
    },
  }

  // Support both 'danger' and 'error' as aliases
  const normalizedVariant = variant === 'error' ? 'danger' : variant

  const variantClasses = {
    default: {
      icon: 'bg-neutral-100 text-neutral-600',
      accent: 'text-neutral-600',
    },
    primary: {
      icon: 'bg-primary-50 text-primary-500',
      accent: 'text-primary-500',
    },
    success: {
      icon: 'bg-success-50 text-success-600',
      accent: 'text-success-600',
    },
    warning: {
      icon: 'bg-warning-50 text-warning-600',
      accent: 'text-warning-600',
    },
    danger: {
      icon: 'bg-error-50 text-error-600',
      accent: 'text-error-600',
    },
    info: {
      icon: 'bg-info-50 text-info-600',
      accent: 'text-info-600',
    },
  }

  const styles = sizeClasses[size]
  const colors = variantClasses[normalizedVariant] || variantClasses.default

  const isClickable = !!onClick

  const content = (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className={`font-medium text-neutral-500 ${styles.label}`}>
          {label}
        </p>
        <p className={`font-semibold text-neutral-900 mt-1 tabular-nums ${styles.value}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>

        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.value > 0 ? (
              <svg className="w-4 h-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : trend.value < 0 ? (
              <svg className="w-4 h-4 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            ) : null}
            <span className={`text-xs font-medium ${trend.value > 0 ? 'text-success-600' : trend.value < 0 ? 'text-error-600' : 'text-neutral-500'}`}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            {trend.label && (
              <span className="text-xs text-neutral-400">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>

      {icon && (
        <div className={`rounded-lg p-2.5 ${colors.icon} ${styles.icon} flex items-center justify-center`}>
          {icon}
        </div>
      )}
    </div>
  )

  const baseClassName = `
    bg-white rounded-lg border border-neutral-200
    ${styles.container}
    ${className}
  `

  if (isClickable) {
    return (
      <button
        type="button"
        className={`${baseClassName} w-full text-left cursor-pointer hover:border-neutral-300 hover:shadow-sm transition-[border-color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none`}
        onClick={onClick}
        aria-label={`Ver detalles de ${label}`}
      >
        {content}
      </button>
    )
  }

  return (
    <div className={baseClassName}>
      {content}
    </div>
  )
}

// Preset stat icons
export const StatIcons = {
  calendar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  clock: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
}

export default StatCard
