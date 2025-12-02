'use client'

/**
 * AcceptInvitationForm - Dumb Component
 * Displays the form for accepting an invitation
 */

import { Button, Input } from '@/components/ui'

interface InvitationInfo {
  email: string
  role: string
  expires_at: string
}

interface FormData {
  name: string
  dni: string
  password: string
  password_confirmation: string
}

interface FormErrors {
  name?: string
  dni?: string
  password?: string
  password_confirmation?: string
  general?: string
}

interface AcceptInvitationFormProps {
  invitationInfo: InvitationInfo
  formData: FormData
  formErrors: FormErrors
  submitting: boolean
  onFieldChange: (field: keyof FormData, value: string) => void
  onSubmit: () => void
}

export function AcceptInvitationForm({
  invitationInfo,
  formData,
  formErrors,
  submitting,
  onFieldChange,
  onSubmit,
}: AcceptInvitationFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    onFieldChange(name as keyof FormData, value)
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onSubmit()
  }

  const isValid =
    formData.name.trim().length >= 2 &&
    formData.dni.trim().length >= 7 &&
    formData.password.length >= 8 &&
    formData.password === formData.password_confirmation

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* General error */}
      {formErrors.general && (
        <div className="bg-error-50 border border-error-200 rounded-md p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-error-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-error-600">{formErrors.general}</p>
            </div>
          </div>
        </div>
      )}

      {/* Invitation info */}
      <div className="bg-primary-50 border border-primary-200 rounded-md p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-primary-800">Detalles de la invitación</h3>
            <div className="mt-2 text-sm text-primary-700">
              <p>
                <strong>Email:</strong> {invitationInfo.email}
              </p>
              <p>
                <strong>Rol asignado:</strong> {invitationInfo.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Name field */}
      <Input
        label="Nombre completo"
        type="text"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="Tu nombre completo"
        required
        disabled={submitting}
        fullWidth
        error={formErrors.name}
        leftIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
      />

      {/* DNI field */}
      <Input
        label="DNI"
        type="text"
        name="dni"
        value={formData.dni}
        onChange={handleInputChange}
        placeholder="Tu número de DNI"
        required
        disabled={submitting}
        fullWidth
        error={formErrors.dni}
        leftIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
            />
          </svg>
        }
      />

      {/* Password field */}
      <Input
        label="Contraseña"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        placeholder="Crea una contraseña segura"
        required
        disabled={submitting}
        fullWidth
        error={formErrors.password}
        helperText="Mínimo 8 caracteres, una mayúscula, una minúscula y un número"
        leftIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        }
      />

      {/* Password confirmation field */}
      <Input
        label="Confirmar contraseña"
        type="password"
        name="password_confirmation"
        value={formData.password_confirmation}
        onChange={handleInputChange}
        placeholder="Repite tu contraseña"
        required
        disabled={submitting}
        fullWidth
        error={formErrors.password_confirmation}
        leftIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        }
      />

      {/* Submit button */}
      <Button
        type="submit"
        disabled={!isValid || submitting}
        loading={submitting}
        fullWidth
        size="lg"
      >
        Crear mi cuenta
      </Button>
    </form>
  )
}

export default AcceptInvitationForm
