'use client'

/**
 * Login Page Container
 * Authentication page with email and password form
 * Logic is handled by useLoginForm hook
 */

import Link from 'next/link';
import { useRef } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useLoginForm } from '@/features/auth';
import { LoadingSpinner } from '@/shared/components/feedback';
import { Button, Input, PasswordInput } from '@/shared/components/form';

export function LoginPageContainer() {
  const { isAuthenticated } = useAuth();
  const {
    data,
    error,
    isLoading,
    fieldErrors,
    validateField,
    getFirstErrorField,
    updateField,
    handleSubmit,
  } = useLoginForm();

  // Refs for focus management
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    if (name === 'email' || name === 'password') {
      updateField(name as keyof typeof data, value);
    }
  };

  const handleBlur = (field: 'email' | 'password'): void => {
    // Validate on blur if field has content
    if (data[field]) {
      validateField(field);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Check for errors and focus first invalid field
    const firstErrorField = getFirstErrorField();
    if (firstErrorField) {
      const ref = firstErrorField === 'email' ? emailRef : passwordRef;
      ref.current?.focus();
      return;
    }

    await handleSubmit();
  };

  // Show loading if user is already authenticated
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="xl" text="Redirigiendo..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and title */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-neutral-900">
          Eventos Tucumán
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Plataforma de eventos turísticos y culturales
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleFormSubmit}>
            {/* Error message */}
            {error && (
              <div className="bg-error-50 border border-error-200 rounded-md p-4" role="alert">
                <div className="flex">
                  <svg className="w-5 h-5 text-error-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-error-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email field */}
            <Input
              ref={emailRef}
              label="Correo electrónico"
              type="email"
              name="email"
              autoComplete="email"
              value={data.email}
              onChange={handleInputChange}
              onBlur={() => handleBlur('email')}
              placeholder="tu@ejemplo.com…"
              required
              disabled={isLoading}
              fullWidth
              error={fieldErrors.email}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            {/* Password field */}
            <PasswordInput
              ref={passwordRef}
              label="Contraseña"
              name="password"
              autoComplete="current-password"
              value={data.password}
              onChange={handleInputChange}
              onBlur={() => handleBlur('password')}
              placeholder="Tu contraseña…"
              required
              disabled={isLoading}
              fullWidth
              error={fieldErrors.password}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            {/* Forgot password link */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit button - always enabled until loading */}
            <Button
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              fullWidth
              size="lg"
            >
              {isLoading ? 'Iniciando sesión…' : 'Iniciar Sesión'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
