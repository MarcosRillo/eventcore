/**
 * Button Component - Tucumán Turismo Theme
 * Generic reusable button component with institutional design system
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md',
    secondary: 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 border border-neutral-300 focus:ring-primary-500',
    outline: 'border-2 border-primary-500 bg-white text-primary-700 hover:bg-primary-50 focus:ring-primary-500 hover:border-primary-600',
    ghost: 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus:ring-primary-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm',
    success: 'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 focus:ring-secondary-500 shadow-sm',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 focus:ring-amber-500 shadow-sm',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-2.5 text-base min-h-[44px]',
    xl: 'px-8 py-3 text-base min-h-[48px]',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-5 h-5',
  };

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  const iconClasses = iconSizeClasses[size];

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg 
            className={`animate-spin -ml-1 mr-2 ${iconClasses} text-current`} 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
              className="opacity-25" 
            />
            <path 
              fill="currentColor" 
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
              className="opacity-75" 
            />
          </svg>
          {children}
        </>
      ) : (
        <>
          {leftIcon && (
            <span className={`mr-2 ${iconClasses} flex-shrink-0`}>
              {leftIcon}
            </span>
          )}
          <span className="truncate">{children}</span>
          {rightIcon && (
            <span className={`ml-2 ${iconClasses} flex-shrink-0`}>
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;