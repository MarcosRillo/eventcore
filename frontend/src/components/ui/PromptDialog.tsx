/**
 * PromptDialog Component - Tucumán Turismo Theme
 * Professional replacement for native prompt() dialogs
 * Integrates with existing Modal, Button, Input and Textarea components
 */

'use client';

import { useState, useEffect, useRef } from 'react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Textarea from '@/components/ui/Textarea';

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

  // Reset value when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError('');
      // Focus input when dialog opens
      setTimeout(() => {
        if (multiline) {
          textareaRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 100);
    }
  }, [isOpen, defaultValue, multiline]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !loading) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel, loading]);

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

  const handleKeyPress = (event: React.KeyboardEvent) => {
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
            <label className="block text-sm font-medium text-foreground">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          {multiline ? (
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(''); // Clear error on change
              }}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={loading}
              className={error ? 'border-red-500 focus:ring-red-500' : ''}
              rows={4}
            />
          ) : (
            <Input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(''); // Clear error on change
              }}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              maxLength={maxLength}
              disabled={loading}
              className={error ? 'border-red-500 focus:ring-red-500' : ''}
            />
          )}

          {/* Character counter */}
          {maxLength && (
            <div className="flex justify-between items-center text-xs text-muted">
              <span></span>
              <span className={value.length > maxLength ? 'text-red-500' : ''}>
                {value.length} / {maxLength}
              </span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PromptDialog;