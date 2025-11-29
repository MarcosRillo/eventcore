/**
 * Skeleton Component - Minimalist Design System
 * Clean loading placeholders with subtle pulse animation
 */

import type { CSSProperties } from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  lines?: number
  animated?: boolean
}

const Skeleton = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
  animated = true,
}: SkeletonProps) => {
  const baseClasses = [
    'bg-neutral-100',
    animated ? 'animate-pulse' : '',
  ].filter(Boolean).join(' ')

  const variantClasses: Record<string, string> = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  }

  const style: CSSProperties = {}
  if (width) {
    style.width = typeof width === 'number' ? `${width}px` : width
  }
  if (height) {
    style.height = typeof height === 'number' ? `${height}px` : height
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses.text}`}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : style.width || '100%',
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

interface SkeletonTextProps {
  lines?: number
  className?: string
}

export const SkeletonText = ({ lines = 1, className = '' }: SkeletonTextProps) => (
  <Skeleton variant="text" lines={lines} className={className} />
)

interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const SkeletonAvatar = ({ size = 'md', className = '' }: SkeletonAvatarProps) => {
  const sizes = { sm: 32, md: 40, lg: 56 }
  return (
    <Skeleton
      variant="circular"
      width={sizes[size]}
      height={sizes[size]}
      className={className}
    />
  )
}

interface SkeletonButtonProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const SkeletonButton = ({ size = 'md', className = '' }: SkeletonButtonProps) => {
  const heights = { sm: 32, md: 40, lg: 48 }
  return (
    <Skeleton
      variant="rounded"
      width={100}
      height={heights[size]}
      className={className}
    />
  )
}

interface SkeletonCardProps {
  className?: string
}

export const SkeletonCard = ({ className = '' }: SkeletonCardProps) => (
  <div className={`p-4 border border-neutral-200 rounded-lg ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <SkeletonAvatar size="md" />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" className="mb-2" />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
)

interface SkeletonTableProps {
  rows?: number
  columns?: number
  className?: string
}

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }: SkeletonTableProps) => (
  <div className={`space-y-3 ${className}`}>
    <div className="flex gap-4 pb-3 border-b border-neutral-200">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={16} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 py-2">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            variant="text"
            width={`${100 / columns}%`}
            height={14}
          />
        ))}
      </div>
    ))}
  </div>
)

export default Skeleton
