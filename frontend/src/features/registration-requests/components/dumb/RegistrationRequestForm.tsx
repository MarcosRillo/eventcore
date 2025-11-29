'use client'

/**
 * RegistrationRequestForm - Dumb Component
 * Public form for organizations to request registration
 */

import { Button, Input } from '@/components/ui'
import {
  RegistrationRequestFormData,
  RegistrationRequestFormErrors,
} from '../../types/registration-request.types'

interface RegistrationRequestFormProps {
  formData: RegistrationRequestFormData
  formErrors: RegistrationRequestFormErrors
  submitting: boolean
  onFieldChange: (field: keyof RegistrationRequestFormData, value: string | File | null) => void
  onSubmit: () => void
}

const ORGANIZATION_SECTORS = [
  { value: '', label: 'Seleccionar sector...' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'tourism_agency', label: 'Agencia de Turismo' },
  { value: 'museum', label: 'Museo' },
  { value: 'cultural_center', label: 'Centro Cultural' },
  { value: 'entertainment', label: 'Entretenimiento' },
  { value: 'sports', label: 'Deportes' },
  { value: 'education', label: 'Educacion' },
  { value: 'government', label: 'Gobierno' },
  { value: 'ngo', label: 'ONG' },
  { value: 'other', label: 'Otro' },
]

export function RegistrationRequestForm({
  formData,
  formErrors,
  submitting,
  onFieldChange,
  onSubmit,
}: RegistrationRequestFormProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target
    onFieldChange(name as keyof RegistrationRequestFormData, value)
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: 'profile_photo' | 'organization_logo'
  ): void => {
    const file = e.target.files?.[0] || null
    onFieldChange(fieldName, file)
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onSubmit()
  }

  const characterCount = formData.motivation.length

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {/* General error */}
      {formErrors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-600">{formErrors.general}</p>
            </div>
          </div>
        </div>
      )}

      {/* Personal Information Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Datos Personales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            placeholder="Tu nombre"
            required
            disabled={submitting}
            error={formErrors.first_name}
          />
          <Input
            label="Apellido"
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            placeholder="Tu apellido"
            required
            disabled={submitting}
            error={formErrors.last_name}
          />
          <Input
            label="DNI"
            type="text"
            name="dni"
            value={formData.dni}
            onChange={handleInputChange}
            placeholder="12345678"
            required
            disabled={submitting}
            error={formErrors.dni}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="tu@email.com"
            required
            disabled={submitting}
            error={formErrors.email}
          />
          <Input
            label="WhatsApp"
            type="text"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleInputChange}
            placeholder="+54 9 11 1234-5678"
            required
            disabled={submitting}
            error={formErrors.whatsapp}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto de Perfil (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'profile_photo')}
              disabled={submitting}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50"
            />
            {formErrors.profile_photo && (
              <p className="mt-1 text-sm text-red-600">{formErrors.profile_photo}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Maximo 2MB. Formatos: JPG, PNG</p>
          </div>
        </div>
      </div>

      {/* Organization Information Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Datos de la Organizacion</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre de la Organizacion"
            type="text"
            name="organization_name"
            value={formData.organization_name}
            onChange={handleInputChange}
            placeholder="Mi Organizacion S.A."
            required
            disabled={submitting}
            error={formErrors.organization_name}
          />
          <Input
            label="CUIT"
            type="text"
            name="organization_cuit"
            value={formData.organization_cuit}
            onChange={handleInputChange}
            placeholder="20-12345678-9"
            required
            disabled={submitting}
            error={formErrors.organization_cuit}
            helperText="Formato: XX-XXXXXXXX-X"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sector <span className="text-red-500">*</span>
            </label>
            <select
              name="organization_sector"
              value={formData.organization_sector}
              onChange={handleInputChange}
              disabled={submitting}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:opacity-50 disabled:bg-gray-100 ${
                formErrors.organization_sector ? 'border-red-300' : ''
              }`}
            >
              {ORGANIZATION_SECTORS.map((sector) => (
                <option key={sector.value} value={sector.value}>
                  {sector.label}
                </option>
              ))}
            </select>
            {formErrors.organization_sector && (
              <p className="mt-1 text-sm text-red-600">{formErrors.organization_sector}</p>
            )}
          </div>
          <Input
            label="Sitio Web (opcional)"
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="https://miorganizacion.com"
            disabled={submitting}
            error={formErrors.website}
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo de la Organizacion (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'organization_logo')}
              disabled={submitting}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50"
            />
            {formErrors.organization_logo && (
              <p className="mt-1 text-sm text-red-600">{formErrors.organization_logo}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Maximo 2MB. Formatos: JPG, PNG</p>
          </div>
        </div>
      </div>

      {/* Motivation Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Motivacion</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Por que deseas unirte a la plataforma? <span className="text-red-500">*</span>
          </label>
          <textarea
            name="motivation"
            value={formData.motivation}
            onChange={handleInputChange}
            rows={4}
            disabled={submitting}
            placeholder="Describe brevemente por que tu organizacion quiere publicar eventos en la plataforma de turismo..."
            className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:opacity-50 disabled:bg-gray-100 ${
              formErrors.motivation ? 'border-red-300' : ''
            }`}
          />
          <div className="mt-1 flex justify-between">
            <div>
              {formErrors.motivation && (
                <p className="text-sm text-red-600">{formErrors.motivation}</p>
              )}
            </div>
            <p
              className={`text-xs ${
                characterCount < 50
                  ? 'text-red-500'
                  : characterCount > 1000
                  ? 'text-red-500'
                  : 'text-gray-500'
              }`}
            >
              {characterCount}/1000 caracteres (minimo 50)
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={submitting}
          loading={submitting}
          fullWidth
          size="lg"
        >
          Enviar Solicitud
        </Button>
        <p className="mt-4 text-xs text-gray-500 text-center">
          Al enviar este formulario, aceptas que tu solicitud sera revisada por nuestro equipo.
          Te notificaremos por email sobre el estado de tu solicitud.
        </p>
      </div>
    </form>
  )
}

export default RegistrationRequestForm
