/**
 * Forgot Password Hook
 * Manages forgot password form state and submission
 * Uses React 19 useTransition for non-blocking UI
 */
import { useCallback, useState, useTransition } from 'react';

import { forgotPassword } from '@/services/authService';
import { useToast } from '@/shared/context';

interface UseForgotPasswordReturn {
  email: string;
  setEmail: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  isValid: boolean;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
}

/**
 * Validates email format
 * @param email
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const useForgotPassword = (): UseForgotPasswordReturn => {
  // React 19 transition for non-blocking UI
  const [, startTransition] = useTransition();
  const [isLoadingState, setIsLoadingState] = useState(false);
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isValid = email.trim() !== '' && isValidEmail(email);

  const handleSubmit = useCallback(async (e?: React.FormEvent): Promise<void> => {
    e?.preventDefault();

    if (!isValid) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setIsLoadingState(true);
    setError(null);

    startTransition(async () => {
      try {
        await forgotPassword({ email: email.trim() });
        setSuccess(true);
        addToast({
          message: 'Revisa tu correo para continuar con la recuperación.',
          type: 'success',
          duration: 5000,
        });
      } catch (err) {
        // Backend always returns success for security (email enumeration prevention)
        // But network errors can still occur
        const errorMessage = err instanceof Error
          ? 'Error de conexión. Por favor intenta de nuevo.'
          : 'Error inesperado. Por favor intenta de nuevo.';
        setError(errorMessage);
        addToast({
          message: errorMessage,
          type: 'error',
          duration: 5000,
        });
      } finally {
        setIsLoadingState(false);
      }
    });
  }, [email, isValid, startTransition, addToast]);

  const reset = useCallback(() => {
    setEmail('');
    setError(null);
    setSuccess(false);
    setIsLoadingState(false);
  }, []);

  // Backward compatibility
  const isLoading = isLoadingState;

  return {
    email,
    setEmail,
    isLoading,
    error,
    success,
    isValid,
    handleSubmit,
    reset,
  };
};

export default useForgotPassword;
