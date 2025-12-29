/**
 * Login Form Hook
 * Manages login form state and submission logic
 */
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { useAuth } from '@/context/AuthContext';
import { LoginCredentials, UseLoginFormReturn } from '@/types/auth.types';

export const useLoginForm = (): UseLoginFormReturn => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, isAuthenticated, user, clearError } = useAuth(); // ✅ Agregar user
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirigir según el rol del usuario
      if (user.role?.role_name === 'Event Organizer') {
        router.push('/organizer/dashboard');
      } else {
        router.push('/events');
      }
    }
  }, [isAuthenticated, user, router]);

  // Clear error when credentials change
  useEffect(() => {
    if (error && (email || password)) {
      clearError();
    }
  }, [email, password, error, clearError]);

  // Computed state
  const isFormValid = email.trim() !== '' && password.trim() !== '';

  // Actions
  const setEmailValue = (value: string) => {
    setEmail(value);
  };

  const setPasswordValue = (value: string) => {
    setPassword(value);
  };

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e?.preventDefault();
    
    if (!isFormValid) return;

    const credentials: LoginCredentials = {
      email: email.trim(),
      password: password.trim(),
    };
    
    const success = await login(credentials);
    
    if (success) {
      // ✅ La redirección se maneja en el useEffect de arriba cuando user esté disponible
      // No necesitamos router.push aquí
    }
  };

  const clearFormError = () => {
    clearError();
  };

  return {
    // FormHandler state
    data: { email, password },
    error,
    isLoading,
    isValid: isFormValid,
    isDirty: email !== '' || password !== '',
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
    },
    validate: () => isFormValid,
    // Additional login form specific method
    handleSubmit,
  };
};