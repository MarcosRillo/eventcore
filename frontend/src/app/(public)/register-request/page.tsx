'use client'

/**
 * Public Registration Request Page
 * Allows organizations to submit a request to join the platform
 */

import Link from 'next/link'
import { Building2, CheckCircle } from 'lucide-react'
import { useRegistrationRequest } from '@/features/registration-requests/hooks/useRegistrationRequest'
import { RegistrationRequestForm } from '@/features/registration-requests/components/dumb/RegistrationRequestForm'

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
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                Solicitud Enviada
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Tu solicitud ha sido recibida exitosamente. Nuestro equipo la revisara
                y te contactaremos por email con el resultado.
              </p>
              <p className="mt-4 text-sm text-gray-500">
                El proceso de revision puede tomar hasta 48 horas habiles.
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Solicitar Registro
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Completa el formulario para solicitar el registro de tu organizacion
            en la plataforma de eventos turisticos.
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
          <p className="text-sm text-gray-600">
            Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
