/**
 * Textarea Component
 * Generic reusable textarea component with validation states
 */

import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseClasses = 'border rounded-sm shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-400 px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400';

  const stateClasses = error
    ? 'border-red-600 bg-red-50 focus:border-red-600 focus:ring-red-500/20'
    : 'border-neutral-300 bg-neutral-50 focus:bg-white focus:border-primary-500 focus:ring-primary-500/20';

  const textareaClasses = [
    baseClasses,
    stateClasses,
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-neutral-600 mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={textareaClasses}
        disabled={disabled}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
