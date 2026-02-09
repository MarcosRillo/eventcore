/**
 * EmptyState Component - Minimalist Design System
 * Clean empty state with icon, message, and optional action
 */

import { Calendar, FileText, FolderOpen, Inbox, Search, Users } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
  size = 'md',
}: EmptyStateProps) => {
  const sizeClasses: Record<string, { container: string; icon: string; title: string; description: string }> = {
    sm: {
      container: 'py-6 px-4',
      icon: 'w-10 h-10 mb-3',
      title: 'text-sm font-medium',
      description: 'text-xs mt-1',
    },
    md: {
      container: 'py-10 px-6',
      icon: 'w-12 h-12 mb-4',
      title: 'text-base font-medium',
      description: 'text-sm mt-2',
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'w-16 h-16 mb-5',
      title: 'text-lg font-semibold',
      description: 'text-base mt-2',
    },
  }

  const styles = sizeClasses[size]

  return (
    <div className={`flex flex-col items-center justify-center text-center ${styles.container} ${className}`}>
      {icon ? (
        <div className={`text-neutral-300 ${styles.icon}`}>
          {icon}
        </div>
      ) : null}

      <h3 className={`text-neutral-900 ${styles.title}`}>
        {title}
      </h3>

      {description ? (
        <p className={`text-neutral-500 max-w-sm ${styles.description}`}>
          {description}
        </p>
      ) : null}

      {action ? (
        <div className="mt-5">
          {action}
        </div>
      ) : null}
    </div>
  )
}

// Default empty state icons
export const EmptyStateIcons = {
  inbox: <Inbox className="w-full h-full" />,
  search: <Search className="w-full h-full" />,
  document: <FileText className="w-full h-full" />,
  calendar: <Calendar className="w-full h-full" />,
  users: <Users className="w-full h-full" />,
  folder: <FolderOpen className="w-full h-full" />,
}

export default EmptyState
