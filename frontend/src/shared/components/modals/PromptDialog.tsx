/**
 * PromptDialog Component - Minimalist Design System
 * Professional replacement for native prompt() dialogs
 * Integrates with existing Modal, Button, Input and Textarea components
 */

'use client';

import { AlertCircle } from 'lucide-react';
import { useEffect, useId, useRef,useState } from 'react';

import { Button, Input, Textarea } from '@/shared/components/form';
import Modal from '@/shared/components/modals/Modal';

interface PromptDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  multiline?: boolean;
  maxLength?: number;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  /** Button variant for the confirm button */
  variant?: 'primary' | 'danger' | 'warning' | 'success';
}

const PromptDialog: React.FC<PromptDialogProps> = ({
  isOpen,
  title,
  message,
  label,
  placeholder,
  defaultValue = '',
  required = false,
  multiline = false,
  maxLength,
  onConfirm,
  onCancel,
  loading = false,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
}) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputId = useId();

  // Reset value when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError('');
      // Focus input when dialog opens
      const timer = setTimeout(() => {
        if (multiline) {
          textareaRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, defaultValue, multiline]);

  const handleConfirm = () => {
    // Validation
    if (required && !value.trim()) {
      setError('Este campo es requerido');
      return;
    }

    if (maxLength && value.length > maxLength) {
      setError(`El texto no puede exceder ${maxLength} caracteres`);
      return;
    }

    setError('');
    onConfirm(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !multiline && !loading) {
      event.preventDefault();
      handleConfirm();
    }
  };

  const isValueValid = () => {
    if (required && !value.trim()) return false;
    if (maxLength && value.length > maxLength) return false;
    return true;
  };

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={loading}
        className="sm:order-1"
      >
        {cancelText}
      </Button>
      <Button
        variant={variant}
        onClick={handleConfirm}
        loading={loading}
        disabled={!isValueValid()}
        className="sm:order-2"
      >
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onCancel}
      title={title}
      footer={footer}
      size="md"
      closeOnOverlayClick={!loading}
      showCloseButton={!loading}
    >
      <div className="space-y-4">
        {message && (
          <p className="text-sm text-muted leading-relaxed">
            {message}
          </p>
        )}

        <div className="space-y-2">
          {label && (
            <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
              {label}
              {required && <span className="text-error-500 ml-1">*</span>}
            </label>
          )}

          {multiline ? (
            <Textarea
              id={inputId}
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(''); // Clear error on change
              }}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={loading}
              className={error ? 'border-error-500 focus:ring-error-500' : ''}
              rows={4}
            />
          ) : (
            <Input
              id={inputId}
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(''); // Clear error on change
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={loading}
              className={error ? 'border-error-500 focus:ring-error-500' : ''}
            />
          )}

          {/* Character counter */}
          {maxLength && (
            <div className="flex justify-between items-center text-xs text-muted">
              <span></span>
              <span className={value.length > maxLength ? 'text-error-500' : ''}>
                {value.length} / {maxLength}
              </span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <p className="text-sm text-error-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PromptDialog;
