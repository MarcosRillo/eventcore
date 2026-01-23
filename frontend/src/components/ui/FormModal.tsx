/**
 * FormModal Component - Reusable Form Modal Pattern
 * Consolidates create and edit modal patterns with form validation
 * and API error handling
 */

'use client';

import { FormEvent, ReactNode,useEffect, useState } from 'react';

import { Button,Modal } from '@/components/ui';
import { EventFormData } from '@/types/event.types';
import { EventSubtype,EventType } from '@/types/eventType.types';

// Form data types supported by FormModal - specific domain types only
interface ApprovalFormData {
  action: string;
  comment: string;
}

type FormDataType = EventFormData | ApprovalFormData | Partial<EventType> | Partial<EventSubtype>;

// API error structure
interface ApiError {
  response?: {
    status?: number;
    data?: {
      errors?: Record<string, string[]>;
      message?: string;
    };
  };
}

// Form validation function type
export type FormValidator<T> = (data: T) => string[];

// Form field error mapping
export type FieldErrorMap<T> = Partial<Record<keyof T, string>>;

// Form submission handler type
export type FormSubmitHandler<T> = (
  data: T,
  originalData?: T
) => Promise<void>;

// Base props for FormModal
export interface FormModalProps<T extends FormDataType> {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  submitButtonText: string;
  // Form data and handlers
  initialData: T;
  originalData?: T; // For edit mode - to compare changes
  validator?: FormValidator<T>;
  submitHandler: FormSubmitHandler<T>;
  // Form rendering
  children: (props: FormRenderProps<T>) => ReactNode;
  // Modal configuration
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  // Advanced options
  resetOnSuccess?: boolean;
  closeOnSuccess?: boolean;
  preventCloseWhileLoading?: boolean;
}

// Props passed to form render function
export interface FormRenderProps<T> {
  formData: T;
  errors: FieldErrorMap<T>;
  isLoading: boolean;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleFieldChange: <K extends keyof T>(field: K, value: T[K]) => void;
  clearFieldError: (field: keyof T) => void;
}

// Helper function to check if error is API error
const isApiError = (error: unknown): error is ApiError => {
  return (
    error !== null &&
    typeof error === 'object' &&
    'response' in error &&
    error.response !== null &&
    typeof error.response === 'object'
  );
};

// Error alert component
const ErrorAlert = ({ message }: { message: string }) => (
  <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6">
    <div className="flex">
      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <div className="ml-3">
        <p className="text-sm text-red-600">{message}</p>
      </div>
    </div>
  </div>
);

/**
 *
 * @param root0
 * @param root0.isOpen
 * @param root0.onClose
 * @param root0.onSuccess
 * @param root0.title
 * @param root0.submitButtonText
 * @param root0.initialData
 * @param root0.originalData
 * @param root0.validator
 * @param root0.submitHandler
 * @param root0.children
 * @param root0.size
 * @param root0.resetOnSuccess
 * @param root0.closeOnSuccess
 * @param root0.preventCloseWhileLoading
 */
export function FormModal<T extends FormDataType>({
  isOpen,
  onClose,
  onSuccess,
  title,
  submitButtonText,
  initialData,
  originalData,
  validator,
  submitHandler,
  children,
  size = 'md',
  resetOnSuccess = false,
  closeOnSuccess = true,
  preventCloseWhileLoading = true,
}: FormModalProps<T>) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<FieldErrorMap<T>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  // Update form data when initialData or originalData changes
  useEffect(() => {
    setFormData(originalData || initialData);
    setErrors({});
    setApiError('');
  }, [initialData, originalData]);

  // Input change handler for form elements
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof T]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    setApiError('');
  };

  // Generic field change handler
  const handleFieldChange = <K extends keyof T>(field: K, value: T[K]): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when field changes
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
    setApiError('');
  };

  // Clear specific field error
  const clearFieldError = (field: keyof T): void => {
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
    setApiError('');
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!validator) return true;

    const validationErrors = validator(formData);
    const errorMap: FieldErrorMap<T> = {};

    // Simple error mapping - you can extend this logic
    validationErrors.forEach((error) => {
      // Try to map error messages to fields
      // This is a basic implementation - can be improved
      const fieldNames = Object.keys(formData);
      const matchedField = fieldNames.find(field =>
        error.toLowerCase().includes(field.toLowerCase())
      );

      if (matchedField) {
        errorMap[matchedField as keyof T] = error;
      }
    });

    setErrors(errorMap);
    return validationErrors.length === 0;
  };

  // Form submission
  const handleSubmit = async (e?: FormEvent<HTMLFormElement>): Promise<void> => {
    if (e) {
      e.preventDefault();
    }

    setApiError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await submitHandler(formData, originalData);

      // Handle success
      if (resetOnSuccess) {
        setFormData(initialData);
        setErrors({});
      }

      onSuccess();

      if (closeOnSuccess) {
        handleClose();
      }
    } catch (error: unknown) {
      // Handle API errors
      if (isApiError(error) && error.response?.status === 422 && error.response.data?.errors) {
        const serverErrors: FieldErrorMap<T> = {};
        const errorData = error.response.data.errors;

        Object.keys(errorData).forEach((field) => {
          if (field in formData) {
            serverErrors[field as keyof T] = errorData[field][0];
          }
        });

        setErrors(serverErrors);
      } else {
        const errorMessage = isApiError(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Error al procesar el formulario. Inténtalo de nuevo.';
        setApiError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Modal close handler
  const handleClose = (): void => {
    if (preventCloseWhileLoading && isLoading) {
      return;
    }

    if (resetOnSuccess || !originalData) {
      setFormData(initialData);
    }
    setErrors({});
    setApiError('');
    onClose();
  };

  if (!isOpen) return null;

  // Form render props
  const formRenderProps: FormRenderProps<T> = {
    formData,
    errors,
    isLoading,
    handleInputChange,
    handleFieldChange,
    clearFieldError,
  };

  // Form content
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* API Error Alert */}
      {apiError && <ErrorAlert message={apiError} />}

      {/* Form fields rendered by children function */}
      {children(formRenderProps)}
    </form>
  );

  // Footer buttons
  const footerContent = (
    <div className="flex justify-end space-x-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={isLoading}
      >
        Cancelar
      </Button>
      <Button
        type="button"
        variant="primary"
        disabled={isLoading}
        loading={isLoading}
        onClick={() => handleSubmit()}
      >
        {submitButtonText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size={size}
      footer={footerContent}
      closeOnOverlayClick={!isLoading}
    >
      {formContent}
    </Modal>
  );
}

export default FormModal;