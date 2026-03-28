/**
 * PageHeader - Shared presentational component
 *
 * Consistent page header with title, optional subtitle, and action slot.
 */

import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, action, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">{title}</h1>
        {subtitle ? (
          <p className="text-neutral-600 mt-1">{subtitle}</p>
        ) : null}
      </div>
      {action ? (
        <div>{action}</div>
      ) : null}
    </div>
  )
}
