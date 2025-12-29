/**
 * Login Page - Minimalist Design System
 * Authentication page with email and password form
 * Logic is handled by useLoginForm hook
 */

'use client';

import Link from 'next/link';

import { Button, Input, LoadingSpinner } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLoginForm } from '@/features/auth';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const {
    data,
    error,
    isLoading,
    isValid,
    updateField,
    handleSubmit,
  } = useLoginForm();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    if (name === 'email' || name === 'password') {
      updateField(name as keyof typeof data, value);
    }
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
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error message */}
            {error && (
              <div className="bg-error-50 border border-error-200 rounded-md p-4">
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
              label="Correo electrónico"
              type="email"
              name="email"
              value={data.email}
              onChange={handleInputChange}
              placeholder="tu@ejemplo.com"
              required
              disabled={isLoading}
              fullWidth
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />

            {/* Password field */}
            <Input
              label="Contraseña"
              type="password"
              name="password"
              value={data.password}
              onChange={handleInputChange}
              placeholder="Tu contraseña"
              required
              disabled={isLoading}
              fullWidth
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

            {/* Submit button */}
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              loading={isLoading}
              fullWidth
              size="lg"
            >
              Iniciar Sesión
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
