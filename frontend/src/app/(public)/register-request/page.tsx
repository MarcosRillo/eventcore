'use client'

/**
 * Public Registration Request Page
 * Allows organizations to submit a request to join the platform
 */

import { Building2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui'
import { RegistrationRequestForm } from '@/features/registration-requests/components/dumb/RegistrationRequestForm'
import { useRegistrationRequest } from '@/features/registration-requests/hooks/useRegistrationRequest'

/**
 *
 */
export default function RegisterRequestPage() {
  const {
    formData,
    formErrors,
    submitting,
    success,
    updateField,
    submitForm,
  } = useRegistrationRequest()

  // Success state
  if (success) {
    return (
      <div className="bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100">
                <CheckCircle className="h-6 w-6 text-success-600" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-neutral-900">
                Solicitud Enviada
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Tu solicitud ha sido recibida exitosamente. Nuestro equipo la revisará
                y te contactaremos por email con el resultado.
              </p>
              <p className="mt-4 text-sm text-neutral-500">
                El proceso de revisión puede tomar hasta 48 horas hábiles.
              </p>
              <div className="mt-6">
                <Link href="/">
                  <Button>Volver al inicio</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
            <Building2 className="h-6 w-6 text-primary-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-neutral-900">
            Solicitar Registro
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Completá el formulario para solicitar el registro de tu organización
            en la plataforma de eventos turísticos.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <RegistrationRequestForm
              formData={formData}
              formErrors={formErrors}
              submitting={submitting}
              onFieldChange={updateField}
              onSubmit={submitForm}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            ¿Ya tenés una cuenta?{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
