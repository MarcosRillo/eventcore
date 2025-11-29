/**
 * Card Component - Minimalist Design System
 * Clean container with subtle shadows and borders
 */

import type { ReactNode, KeyboardEvent } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'bordered' | 'elevated' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  onClick?: () => void
  hover?: boolean
  as?: 'div' | 'article' | 'section'
}

const Card = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick,
  hover = false,
  as: Component = 'div',
}: CardProps) => {
  // Base styles
  const baseClasses = 'rounded-lg transition-all duration-150 ease-in-out'

  // Variant styles - minimal and clean
  const variantClasses: Record<string, string> = {
    default: 'bg-white border border-neutral-200',
    bordered: 'bg-white border border-neutral-300',
    elevated: 'bg-white shadow-sm border border-neutral-100',
    flat: 'bg-neutral-50',
  }

  // Padding scale
  const paddingClasses: Record<string, string> = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  }

  // Interactive states
  const interactiveClasses = (hover || onClick)
    ? 'hover:shadow-md hover:border-neutral-300 active:shadow-sm'
    : ''

  const clickableClasses = onClick
    ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/20'
    : ''

  const finalClasses = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    interactiveClasses,
    clickableClasses,
    className,
  ].filter(Boolean).join(' ')

  return (
    <Component
      className={finalClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
    >
      {children}
    </Component>
  )
}

// Card Header subcomponent
interface CardSubcomponentProps {
  children: ReactNode
  className?: string
}

export const CardHeader = ({ children, className = '' }: CardSubcomponentProps) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
)

// Card Title subcomponent
interface CardTitleProps extends CardSubcomponentProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const CardTitle = ({ children, className = '', as: Component = 'h3' }: CardTitleProps) => (
  <Component className={`text-lg font-semibold text-neutral-900 ${className}`}>
    {children}
  </Component>
)

// Card Description subcomponent
export const CardDescription = ({ children, className = '' }: CardSubcomponentProps) => (
  <p className={`text-sm text-neutral-500 mt-1 ${className}`}>
    {children}
  </p>
)

// Card Content subcomponent
export const CardContent = ({ children, className = '' }: CardSubcomponentProps) => (
  <div className={className}>
    {children}
  </div>
)

// Card Footer subcomponent
export const CardFooter = ({ children, className = '' }: CardSubcomponentProps) => (
  <div className={`mt-4 pt-4 border-t border-neutral-100 ${className}`}>
    {children}
  </div>
)

export default Card
