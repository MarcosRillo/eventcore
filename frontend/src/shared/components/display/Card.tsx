/**
 * Card Component - Minimalist Design System
 * Clean container with subtle shadows and borders
 */

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

interface CardBaseProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'bordered' | 'elevated' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  style?: CSSProperties
}

interface CardDivProps extends CardBaseProps {
  onClick?: never
  as?: 'div' | 'article' | 'section'
}

interface CardButtonProps extends CardBaseProps {
  onClick: () => void
  as?: never
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type']
}

type CardProps = CardDivProps | CardButtonProps

const Card = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick,
  hover = false,
  style,
  as,
  ...rest
}: CardProps) => {
  // Base styles - explicit transition properties instead of transition-all
  const baseClasses = 'rounded-lg transition-[border-color,box-shadow] duration-150 ease-in-out'

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
    ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20'
    : ''

  const finalClasses = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    interactiveClasses,
    clickableClasses,
    className,
  ].filter(Boolean).join(' ')

  // Use semantic button element when onClick is provided
  if (onClick) {
    const { type = 'button' } = rest as CardButtonProps
    return (
      <button
        type={type}
        className={`${finalClasses} w-full text-left`}
        onClick={onClick}
        style={style}
      >
        {children}
      </button>
    )
  }

  // Use div or semantic element when no onClick
  const Component = as ?? 'div'
  return (
    <Component className={finalClasses} style={style}>
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
