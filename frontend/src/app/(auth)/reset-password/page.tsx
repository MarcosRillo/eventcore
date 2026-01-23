/**
 * Reset Password Page - Minimalist Design System
 * Page for setting a new password using reset token
 */

'use client';

import Link from 'next/link';
import { Suspense } from 'react';

import { Button, Input, LoadingSpinner } from '@/components/ui';
import { useResetPassword } from '@/features/auth';

const ResetPasswordContent = () => {
  const {
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
  } = useResetPassword();

  // Loading state while validating token
  if (isValidating) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="xl" text="Validando enlace..." />
      </div>
    );
  }

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
            Contraseña actualizada
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Tu contraseña ha sido restablecida exitosamente
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
                    Ya puedes iniciar sesión con tu nueva contraseña.
                  </p>
                </div>
              </div>
            </div>

            <Link href="/login">
              <Button variant="primary" fullWidth size="lg">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-error-600 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-neutral-900">
            Enlace inválido
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            El enlace de recuperación ha expirado o ya fue utilizado
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="bg-error-50 border border-error-200 rounded-md p-4 mb-6">
              <div className="flex">
                <svg className="w-5 h-5 text-error-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-error-700">
                    {error || 'El enlace de recuperación ya no es válido.'}
                  </p>
                </div>
              </div>
            </div>

            <Link href="/forgot-password">
              <Button variant="primary" fullWidth size="lg">
                Solicitar nuevo enlace
              </Button>
            </Link>

            <div className="mt-4 text-center">
              <Link href="/login" className="text-sm text-primary-600 hover:text-primary-500">
                &larr; Volver a iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and title */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-neutral-900">
          Nueva contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Ingresa tu nueva contraseña
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

            {/* Password field */}
            <div>
              <Input
                label="Nueva contraseña"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu nueva contraseña"
                required
                disabled={isLoading}
                fullWidth
                error={fieldErrors.password}
                aria-describedby="password-requirements"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              {/* Password requirements */}
              <div id="password-requirements" className="mt-2 space-y-1" role="list" aria-label="Requisitos de contraseña">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center text-xs" role="listitem">
                    {req.met ? (
                      <svg className="w-4 h-4 text-success-500 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-neutral-300 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className={req.met ? 'text-success-600' : 'text-neutral-500'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm password field */}
            <Input
              label="Confirmar contraseña"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              required
              disabled={isLoading}
              fullWidth
              error={fieldErrors.confirmPassword}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
              Restablecer contraseña
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
};

// Wrap with Suspense for useSearchParams
const ResetPasswordPage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="xl" text="Cargando..." />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
