/**
 * Login Form Hook
 * Manages login form state and submission logic
 */
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/shared/context';
import { LoginCredentials, UseLoginFormReturn } from '@/types/auth.types';

interface FieldErrors {
  email?: string;
  password?: string;
}

interface UseLoginFormReturnExtended extends UseLoginFormReturn {
  fieldErrors: FieldErrors;
  validateField: (field: keyof LoginCredentials) => boolean;
  getFirstErrorField: () => keyof LoginCredentials | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Constants for rate limiting
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30000; // 30 seconds

export const useLoginForm = (): UseLoginFormReturnExtended => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);
  const { login, isLoading, error, isAuthenticated, user, clearError } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  // Track if fields have been touched (for showing validation on blur)
  const touchedRef = useRef<{ email: boolean; password: boolean }>({ email: false, password: false });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Usar role_code (requerido) en lugar de role_name (opcional)
      if (user.role?.role_code === 'organizer_admin') {
        router.push('/organizer/dashboard');
      } else {
        router.push('/internal-calendar');
      }
    }
  }, [isAuthenticated, user, router]);

  // Clear error when credentials change
  useEffect(() => {
    if (error && (email || password)) {
      clearError();
    }
  }, [email, password, error, clearError]);

  // Validate a single field
  const validateField = useCallback((field: keyof LoginCredentials): boolean => {
    let fieldError: string | undefined;

    if (field === 'email') {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        fieldError = 'El correo electrónico es requerido';
      } else if (!EMAIL_REGEX.test(trimmedEmail)) {
        fieldError = 'Ingresa un correo electrónico válido';
      }
    } else if (field === 'password') {
      if (!password) {
        fieldError = 'La contraseña es requerida';
      }
    }

    setFieldErrors((prev) => ({
      ...prev,
      [field]: fieldError,
    }));

    return !fieldError;
  }, [email, password]);

  // Validate all fields and return the first field with error
  const getFirstErrorField = useCallback((): keyof LoginCredentials | null => {
    const emailValid = validateField('email');
    const passwordValid = validateField('password');

    if (!emailValid) return 'email';
    if (!passwordValid) return 'password';
    return null;
  }, [validateField]);

  // Clear field error when typing
  const setEmailValue = (value: string): void => {
    setEmail(value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const setPasswordValue = (value: string): void => {
    setPassword(value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  // Mark field as touched on blur
  const markTouched = (field: keyof LoginCredentials): void => {
    touchedRef.current[field] = true;
  };

  // Computed state - form is valid when both fields have content
  const isFormValid = email.trim() !== '' && password.trim() !== '';

  // Actions
  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e?.preventDefault();

    // Check for client-side rate limiting lockout
    if (lockoutUntil && new Date() < lockoutUntil) {
      const secondsLeft = Math.ceil((lockoutUntil.getTime() - Date.now()) / 1000);
      addToast({
        message: `Demasiados intentos. Espera ${secondsLeft} segundos.`,
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    // Clear lockout if it has expired
    if (lockoutUntil && new Date() >= lockoutUntil) {
      setLockoutUntil(null);
      setFailedAttempts(0);
    }

    // Mark all fields as touched
    touchedRef.current = { email: true, password: true };

    // Validate all fields
    const firstError = getFirstErrorField();
    if (firstError) {
      return;
    }

    const credentials: LoginCredentials = {
      email: email.trim(),
      password: password.trim(),
    };

    const success = await login(credentials);

    if (success) {
      // Reset rate limiting on success
      setFailedAttempts(0);
      setLockoutUntil(null);
      // Toast de éxito con duración corta (3s) - UX best practice
      addToast({
        message: 'Sesión iniciada correctamente',
        type: 'success',
        duration: 3000,
      });
    } else {
      // Increment failed attempts and check for lockout
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);

      if (newCount >= MAX_FAILED_ATTEMPTS) {
        // Lockout for 30 seconds after 5 failed attempts
        setLockoutUntil(new Date(Date.now() + LOCKOUT_DURATION_MS));
        addToast({
          message: 'Demasiados intentos fallidos. Espera 30 segundos.',
          type: 'warning',
          duration: 5000,
        });
      } else {
        // Toast de error con duración larga (5s) - dar tiempo para leer
        addToast({
          message: 'Credenciales incorrectas. Verifica tu email y contraseña.',
          type: 'error',
          duration: 5000,
        });
      }
    }
    // La redirección se maneja en el useEffect de arriba cuando user esté disponible
  };

  const clearFormError = (): void => {
    clearError();
  };

  return {
    // FormHandler state
    data: { email, password },
    error,
    isLoading,
    isValid: isFormValid,
    isDirty: email !== '' || password !== '',
    // Field-level validation
    fieldErrors,
    validateField,
    getFirstErrorField,
    // FormActions methods
    updateField: <K extends keyof LoginCredentials>(field: K, value: LoginCredentials[K]) => {
      if (field === 'email') {
        setEmailValue(value as string);
      } else if (field === 'password') {
        setPasswordValue(value as string);
      }
    },
    setError: clearFormError,
    submit: handleSubmit,
    reset: () => {
      setEmail('');
      setPassword('');
      setFieldErrors({});
      setFailedAttempts(0);
      setLockoutUntil(null);
      touchedRef.current = { email: false, password: false };
    },
    validate: () => isFormValid,
    // Additional login form specific method
    handleSubmit,
    // Mark field as touched (for blur validation)
    markTouched,
  } as UseLoginFormReturnExtended & { markTouched: (field: keyof LoginCredentials) => void };
};
