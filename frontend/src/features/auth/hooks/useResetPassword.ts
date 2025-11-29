/**
 * Reset Password Hook
 * Manages reset password form state, token validation, and submission
 */
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { validateResetToken, resetPassword } from '@/services/authService';

interface PasswordErrors {
  password?: string;
  confirmPassword?: string;
}

interface UseResetPasswordReturn {
  // Form state
  password: string;
  confirmPassword: string;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;

  // Status
  isLoading: boolean;
  isValidating: boolean;
  error: string | null;
  fieldErrors: PasswordErrors;
  success: boolean;
  tokenValid: boolean | null;

  // Computed
  isValid: boolean;
  passwordRequirements: PasswordRequirement[];

  // Actions
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

/**
 * Password validation requirements
 */
const getPasswordRequirements = (password: string): PasswordRequirement[] => [
  { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
  { label: 'Al menos una mayúscula', met: /[A-Z]/.test(password) },
  { label: 'Al menos una minúscula', met: /[a-z]/.test(password) },
  { label: 'Al menos un número', met: /[0-9]/.test(password) },
];

/**
 * Validates password meets all requirements
 */
const isPasswordValid = (password: string): boolean => {
  return getPasswordRequirements(password).every(req => req.met);
};

export const useResetPassword = (): UseResetPasswordReturn => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  // Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status state
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<PasswordErrors>({});
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  // Validate token on mount
  useEffect(() => {
    const checkToken = async () => {
      if (!token || !email) {
        setTokenValid(false);
        setIsValidating(false);
        setError('El enlace de recuperación es inválido. Por favor solicita uno nuevo.');
        return;
      }

      try {
        const response = await validateResetToken({ email, token });
        setTokenValid(response.data.valid);
        if (!response.data.valid) {
          setError('El enlace ha expirado o ya fue utilizado. Por favor solicita uno nuevo.');
        }
      } catch {
        setTokenValid(false);
        setError('Error al validar el enlace. Por favor intenta de nuevo.');
      } finally {
        setIsValidating(false);
      }
    };

    checkToken();
  }, [token, email]);

  // Computed values
  const passwordRequirements = getPasswordRequirements(password);
  const isValid = isPasswordValid(password) && password === confirmPassword && password !== '';

  // Validate form fields
  const validateForm = useCallback((): boolean => {
    const errors: PasswordErrors = {};

    if (!password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (!isPasswordValid(password)) {
      errors.password = 'La contraseña no cumple los requisitos';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [password, confirmPassword]);

  const handleSubmit = useCallback(async (e?: React.FormEvent): Promise<void> => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!tokenValid) {
      setError('El enlace de recuperación ya no es válido.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await resetPassword({
        email,
        token,
        password,
        password_confirmation: confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        // Check for specific error messages from backend
        if (err.message.includes('token') || err.message.includes('expired')) {
          setError('El enlace ha expirado. Por favor solicita uno nuevo.');
          setTokenValid(false);
        } else {
          setError('Error al restablecer la contraseña. Por favor intenta de nuevo.');
        }
      } else {
        setError('Error inesperado. Por favor intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, token, password, confirmPassword, tokenValid, validateForm]);

  const reset = useCallback(() => {
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setFieldErrors({});
    setSuccess(false);
    setIsLoading(false);
  }, []);

  return {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    isLoading,
    isValidating,
    error,
    fieldErrors,
    success,
    tokenValid,
    isValid,
    passwordRequirements,
    handleSubmit,
    reset,
  };
};

export default useResetPassword;
