'use client'

/**
 * Accept Invitation Page - Minimalist Design System
 * Public page for accepting an invitation and creating an account
 */

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense,useEffect } from 'react'

import { LoadingSpinner } from '@/components/ui'
import { AcceptInvitationForm } from '@/features/invitations/components/dumb/AcceptInvitationForm'
import { useAcceptInvitation } from '@/features/invitations/hooks/useAcceptInvitation'

function AcceptInvitationContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const {
    validating,
    tokenValid,
    tokenError,
    invitationInfo,
    formData,
    formErrors,
    submitting,
    success,
    validateToken,
    updateFormData,
    submitForm,
  } = useAcceptInvitation()

  // Validate token on mount
  useEffect(() => {
    if (token) {
      validateToken(token)
    }
  }, [token, validateToken])

  // Handle form submission
  const handleSubmit = () => {
    if (token) {
      submitForm(token)
    }
  }

  // No token provided
  if (!token) {
    return (
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-error-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="mt-4 text-lg font-medium text-neutral-900">
                Token no proporcionado
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                El enlace de invitación no es válido. Por favor, verifica que hayas
                copiado el enlace completo del email.
              </p>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Ir al inicio de sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Validating token
  if (validating) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="xl" text="Validando invitación..." />
      </div>
    )
  }

  // Token invalid or expired
  if (tokenError || !tokenValid) {
    return (
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-error-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="mt-4 text-lg font-medium text-neutral-900">
                Invitación inválida
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                {tokenError ||
                  'El enlace de invitación no es válido o ha expirado.'}
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                Por favor, contacta al administrador para recibir una nueva
                invitación.
              </p>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Ir al inicio de sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-success-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="mt-4 text-lg font-medium text-neutral-900">
                ¡Cuenta creada exitosamente!
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Tu cuenta ha sido creada. Serás redirigido al inicio de sesión...
              </p>
              <div className="mt-4">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show form
  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and title */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-neutral-900">
          Acepta tu invitación
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Completa tus datos para crear tu cuenta
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {invitationInfo && (
            <AcceptInvitationForm
              invitationInfo={invitationInfo}
              formData={formData}
              formErrors={formErrors}
              submitting={submitting}
              onFieldChange={updateFormData}
              onSubmit={handleSubmit}
            />
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              ¿Ya tienes una cuenta?{' '}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 *
 */
export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="xl" text="Cargando..." />
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  )
}
