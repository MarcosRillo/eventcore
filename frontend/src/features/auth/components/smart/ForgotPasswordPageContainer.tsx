'use client'

/**
 * Forgot Password Page Container
 * Page for requesting password reset email
 */

import Link from 'next/link';

import { Button, Input } from '@/components/ui';
import { useForgotPassword } from '@/features/auth';

export function ForgotPasswordPageContainer() {
  const {
    email,
    setEmail,
    isLoading,
    error,
    success,
    isValid,
    handleSubmit,
  } = useForgotPassword();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  // Success state
  if (success) {
    return (
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-success-600 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-neutral-900">
            Revisa tu correo
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="bg-success-50 border border-success-200 rounded-md p-4 mb-6">
              <div className="flex">
                <svg className="w-5 h-5 text-success-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-success-700">
                    Hemos enviado las instrucciones a <strong>{email}</strong>
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-neutral-600 mb-6">
              El enlace expirará en 60 minutos. Si no recibes el email, revisa tu carpeta de spam.
            </p>

            <Link href="/login">
              <Button variant="primary" fullWidth>
                Volver a iniciar sesión
              </Button>
            </Link>
          </div>
        </div>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-neutral-900">
          Recuperar contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
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
              value={email}
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

            {/* Submit button */}
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              loading={isLoading}
              fullWidth
              size="lg"
            >
              Enviar enlace de recuperación
            </Button>
          </form>

          {/* Back to login link */}
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-primary-600 hover:text-primary-500">
              &larr; Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
