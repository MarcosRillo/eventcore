'use client'

import { useRegistrationForm } from '@/features/registration-request/hooks/useRegistrationForm'
import { RegistrationForm } from '@/features/registration-request/components/dumb/RegistrationForm'

export default function SolicitarCuentaPage() {
  const {
    formData,
    errors,
    serverError,
    loading,
    success,
    handleChange,
    handleSubmit,
  } = useRegistrationForm()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <RegistrationForm
          formData={formData}
          errors={errors}
          serverError={serverError}
          loading={loading}
          success={success}
          onFieldChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
