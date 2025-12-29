'use client'

import { Loader2, CheckCircle, AlertCircle, User, Building2, FileText } from 'lucide-react'
import Link from 'next/link'

import {
  RegistrationRequestFormData,
  RegistrationRequestFormErrors,
} from '@/features/registration-requests/types/registration-request.types'

// Type aliases for simpler usage
type RegistrationFormData = Omit<RegistrationRequestFormData, 'profile_photo' | 'organization_logo'>
type RegistrationFormErrors = RegistrationRequestFormErrors

interface RegistrationFormProps {
  formData: RegistrationFormData
  errors: RegistrationFormErrors
  serverError: string | null
  loading: boolean
  success: boolean
  onFieldChange: (field: keyof RegistrationFormData, value: string) => void
  onSubmit: () => void
}

interface InputFieldProps {
  id: string
  label: string
  value: string
  error?: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
  onChange: (value: string) => void
}

const InputField = ({
  id,
  label,
  value,
  error,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  maxLength,
  onChange,
}: InputFieldProps) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1.5">
      {label} {required && <span className="text-error-500 ml-0.5">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      className={`w-full h-10 px-3 text-sm bg-white border rounded-md text-neutral-900 placeholder:text-neutral-400 transition-all duration-150 ease-in-out focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed ${
        error
          ? 'border-error-300 focus:border-error-500 focus:ring-error-500/10 bg-error-50/50'
          : 'border-neutral-200'
      }`}
      data-testid={`input-${id}`}
    />
    {error && (
      <p className="mt-1.5 text-sm text-error-600" data-testid={`error-${id}`}>
        {error}
      </p>
    )}
  </div>
)

interface TextAreaFieldProps {
  id: string
  label: string
  value: string
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  minLength?: number
  maxLength?: number
  onChange: (value: string) => void
}

const TextAreaField = ({
  id,
  label,
  value,
  error,
  placeholder,
  required = false,
  disabled = false,
  minLength,
  maxLength,
  onChange,
}: TextAreaFieldProps) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-1.5">
      {label} {required && <span className="text-error-500 ml-0.5">*</span>}
    </label>
    <textarea
      id={id}
      name={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      minLength={minLength}
      maxLength={maxLength}
      rows={4}
      className={`w-full px-3 py-2 text-sm bg-white border rounded-md text-neutral-900 placeholder:text-neutral-400 transition-all duration-150 ease-in-out focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed resize-none ${
        error
          ? 'border-error-300 focus:border-error-500 focus:ring-error-500/10 bg-error-50/50'
          : 'border-neutral-200'
      }`}
      data-testid={`input-${id}`}
    />
    <div className="flex justify-between mt-1.5">
      {error ? (
        <p className="text-sm text-error-600" data-testid={`error-${id}`}>
          {error}
        </p>
      ) : (
        <span />
      )}
      <span className="text-sm text-neutral-500">
        {value.length}/{maxLength}
      </span>
    </div>
  </div>
)

export const RegistrationForm = ({
  formData,
  errors,
  serverError,
  loading,
  success,
  onFieldChange,
  onSubmit,
}: RegistrationFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8" data-testid="success-message">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-success-500 mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Solicitud Enviada
          </h2>
          <p className="text-neutral-600 mb-6">
            Tu solicitud ha sido recibida correctamente. Recibirás un email de confirmación
            en <strong>{formData.email}</strong>.
          </p>
          <p className="text-neutral-600 mb-6">
            El equipo del Ente de Turismo revisará tu solicitud y te notificará
            cuando sea aprobada.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg" data-testid="registration-form">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-neutral-900">Solicitar Cuenta de Organizador</h1>
        <p className="mt-2 text-neutral-600">
          Complete el formulario para solicitar acceso a la plataforma de eventos.
          Su solicitud será revisada por el Ente de Turismo.
        </p>
      </div>

      {serverError && (
        <div className="mx-6 mt-6 p-4 bg-error-50 border border-error-200 rounded-md flex items-start" data-testid="server-error">
          <AlertCircle className="h-5 w-5 text-error-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-error-700">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Sección 1: Datos Personales */}
        <div>
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-lg font-semibold text-neutral-900">Datos Personales</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="dni"
              label="DNI"
              value={formData.dni}
              error={errors.dni}
              placeholder="12345678"
              required
              disabled={loading}
              maxLength={20}
              onChange={(v) => onFieldChange('dni', v)}
            />
            <InputField
              id="first_name"
              label="Nombre"
              value={formData.first_name}
              error={errors.first_name}
              placeholder="Juan"
              required
              disabled={loading}
              maxLength={100}
              onChange={(v) => onFieldChange('first_name', v)}
            />
            <InputField
              id="last_name"
              label="Apellido"
              value={formData.last_name}
              error={errors.last_name}
              placeholder="Pérez"
              required
              disabled={loading}
              maxLength={100}
              onChange={(v) => onFieldChange('last_name', v)}
            />
            <InputField
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              error={errors.email}
              placeholder="juan@ejemplo.com"
              required
              disabled={loading}
              onChange={(v) => onFieldChange('email', v)}
            />
            <InputField
              id="whatsapp"
              label="WhatsApp"
              type="tel"
              value={formData.whatsapp}
              error={errors.whatsapp}
              placeholder="+54 381 1234567"
              required
              disabled={loading}
              maxLength={20}
              onChange={(v) => onFieldChange('whatsapp', v)}
            />
          </div>
        </div>

        {/* Sección 2: Datos de Organización */}
        <div>
          <div className="flex items-center mb-4">
            <Building2 className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-lg font-semibold text-neutral-900">Datos de la Organización</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="organization_name"
              label="Nombre de la Organización"
              value={formData.organization_name}
              error={errors.organization_name}
              placeholder="La Rural Tucumán"
              required
              disabled={loading}
              maxLength={255}
              onChange={(v) => onFieldChange('organization_name', v)}
            />
            <InputField
              id="organization_cuit"
              label="CUIT"
              value={formData.organization_cuit}
              error={errors.organization_cuit}
              placeholder="30-12345678-9"
              required
              disabled={loading}
              onChange={(v) => onFieldChange('organization_cuit', v)}
            />
            <InputField
              id="organization_sector"
              label="Rubro / Sector"
              value={formData.organization_sector}
              error={errors.organization_sector}
              placeholder="Eventos y Exposiciones"
              required
              disabled={loading}
              maxLength={100}
              onChange={(v) => onFieldChange('organization_sector', v)}
            />
            <InputField
              id="website"
              label="Sitio Web"
              type="url"
              value={formData.website}
              error={errors.website}
              placeholder="https://www.ejemplo.com"
              disabled={loading}
              maxLength={255}
              onChange={(v) => onFieldChange('website', v)}
            />
          </div>
        </div>

        {/* Sección 3: Motivación */}
        <div>
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-lg font-semibold text-neutral-900">Motivación</h2>
          </div>
          <TextAreaField
            id="motivation"
            label="¿Por qué desea publicar eventos en la plataforma?"
            value={formData.motivation}
            error={errors.motivation}
            placeholder="Describa brevemente su organización y qué tipo de eventos desea publicar..."
            required
            disabled={loading}
            minLength={50}
            maxLength={1000}
            onChange={(v) => onFieldChange('motivation', v)}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="submit-button"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Enviando solicitud...
              </>
            ) : (
              'Enviar Solicitud'
            )}
          </button>
          <p className="mt-3 text-sm text-neutral-500 text-center">
            Los campos marcados con <span className="text-error-500">*</span> son obligatorios
          </p>
        </div>
      </form>
    </div>
  )
}

export default RegistrationForm
