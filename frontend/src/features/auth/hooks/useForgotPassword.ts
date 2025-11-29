/**
 * Forgot Password Hook
 * Manages forgot password form state and submission
 */
import { useState, useCallback } from 'react';
import { forgotPassword } from '@/services/authService';

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
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const useForgotPassword = (): UseForgotPasswordReturn => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isValid = email.trim() !== '' && isValidEmail(email);

  const handleSubmit = useCallback(async (e?: React.FormEvent): Promise<void> => {
    e?.preventDefault();

    if (!isValid) {
      setError('Por favor ingresa un email válido');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await forgotPassword({ email: email.trim() });
      setSuccess(true);
    } catch (err) {
      // Backend always returns success for security (email enumeration prevention)
      // But network errors can still occur
      if (err instanceof Error) {
        setError('Error de conexión. Por favor intenta de nuevo.');
      } else {
        setError('Error inesperado. Por favor intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, isValid]);

  const reset = useCallback(() => {
    setEmail('');
    setError(null);
    setSuccess(false);
    setIsLoading(false);
  }, []);

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
