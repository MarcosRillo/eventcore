'use client'

/**
 * RegistrationRequestForm - Dumb Component
 * Public form for organizations to request registration
 */

import Image from 'next/image'
import { useRef } from 'react'
import useSWR from 'swr'
import { withMask } from 'use-mask-input'

import { useImagePreview } from '@/features/registration-requests/hooks/useImagePreview'
import {
  RegistrationRequestFormData,
  RegistrationRequestFormErrors,
} from '@/features/registration-requests/types/registration-request.types'
import { publicEventKeys, publicFetcher } from '@/lib/swr'
import Button from '@/shared/components/form/Button'
import Checkbox from '@/shared/components/form/Checkbox'
import Input from '@/shared/components/form/Input'
import Select from '@/shared/components/form/Select'
import Textarea from '@/shared/components/form/Textarea'

interface RegistrationRequestFormProps {
  formData: RegistrationRequestFormData
  formErrors: RegistrationRequestFormErrors
  submitting: boolean
  onFieldChange: (field: keyof RegistrationRequestFormData, value: string | File | null | boolean) => void
  onSubmit: () => void
}

interface ActiveSector {
  id: number;
  name: string;
}


/**
 *
 * @param root0
 * @param root0.formData
 * @param root0.formErrors
 * @param root0.submitting
 * @param root0.onFieldChange
 * @param root0.onSubmit
 */
export function RegistrationRequestForm({
  formData,
  formErrors,
  submitting,
  onFieldChange,
  onSubmit,
}: RegistrationRequestFormProps) {
  const profilePhotoPreview = useImagePreview(formData.profile_photo)
  const logoPreview = useImagePreview(formData.organization_logo)

  const { data: activeSectors, error: sectorsError, isLoading: sectorsLoading } = useSWR<ActiveSector[]>(
    publicEventKeys.sectors,
    publicFetcher
  )

  const sectorOptions = activeSectors
    ? activeSectors.map((s) => ({ value: String(s.id), label: s.name }))
    : []

  // CUIT mask ref using use-mask-input
  const cuitInputRef = useRef<HTMLInputElement>(null)
  const cuitMaskRef = withMask('99-99999999-9')

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target
    onFieldChange(name as keyof RegistrationRequestFormData, value)
  }

  const handleCheckboxChange = (checked: boolean): void => {
    onFieldChange('accepted_terms', checked)
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: 'profile_photo' | 'organization_logo'
  ): void => {
    const file = e.target.files?.[0] || null
    onFieldChange(fieldName, file)
  }

  const handleRemoveFile = (fieldName: 'profile_photo' | 'organization_logo'): void => {
    onFieldChange(fieldName, null)
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onSubmit()
  }

  // Fix 9: counter is neutral at 0 chars (untouched), red only after user has typed something short
  const motivationLength = formData.motivation.length
  const isCounterError = motivationLength > 0 && motivationLength < 50

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
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

      {/* Personal Information Section */}
      <div>
        <h3 className="text-lg font-medium text-neutral-900 mb-4">Datos Personales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            type="text"
            name="first_name"
            autoComplete="given-name"
            value={formData.first_name}
            onChange={handleInputChange}
            placeholder="Tu nombre…"
            required
            disabled={submitting}
            error={formErrors.first_name}
          />
          <Input
            label="Apellido"
            type="text"
            name="last_name"
            autoComplete="family-name"
            value={formData.last_name}
            onChange={handleInputChange}
            placeholder="Tu apellido…"
            required
            disabled={submitting}
            error={formErrors.last_name}
          />
          <Input
            label="DNI"
            type="text"
            name="dni"
            inputMode="numeric"
            autoComplete="off"
            value={formData.dni}
            onChange={handleInputChange}
            placeholder="12345678…"
            required
            disabled={submitting}
            error={formErrors.dni}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="tu@email.com…"
            required
            disabled={submitting}
            error={formErrors.email}
          />
          <Input
            label="WhatsApp"
            type="tel"
            inputMode="tel"
            name="whatsapp"
            autoComplete="tel"
            value={formData.whatsapp}
            onChange={handleInputChange}
            placeholder="+54 9 11 1234-5678…"
            required
            disabled={submitting}
            error={formErrors.whatsapp}
          />
          <div>
            <label htmlFor="profile_photo" className="block text-sm font-medium text-neutral-700 mb-1">
              Foto de Perfil (opcional)
            </label>
            {profilePhotoPreview ? (
              <div className="flex items-center gap-4 mb-2">
                <Image
                  src={profilePhotoPreview}
                  alt="Vista previa de foto de perfil"
                  width={64}
                  height={64}
                  className="rounded-full object-cover border border-neutral-200"
                  unoptimized
                />
                {/* Fix 11: adequate touch target for Eliminar button */}
                <button
                  type="button"
                  onClick={() => handleRemoveFile('profile_photo')}
                  disabled={submitting}
                  className="py-2 px-3 min-h-[44px] text-sm text-error-600 hover:text-error-700 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            ) : (
              <input
                id="profile_photo"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'profile_photo')}
                disabled={submitting}
                className="block w-full text-sm text-neutral-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100
                  disabled:opacity-50"
              />
            )}
            {formErrors.profile_photo && (
              <p className="mt-1 text-sm text-error-600">{formErrors.profile_photo}</p>
            )}
            <p className="mt-1 text-xs text-neutral-500">Máximo 2MB. Formatos: JPG, PNG</p>
          </div>
        </div>
      </div>

      {/* Organization Information Section */}
      <div>
        <h3 className="text-lg font-medium text-neutral-900 mb-4">Datos de la Organización</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre de la Organización"
            type="text"
            name="organization_name"
            autoComplete="organization"
            value={formData.organization_name}
            onChange={handleInputChange}
            placeholder="Mi Organización S.A.…"
            required
            disabled={submitting}
            error={formErrors.organization_name}
          />
          {/* Fix 15: CUIT helper text hint */}
          <Input
            ref={(el) => {
              // Combine refs: store element ref and apply mask
              cuitInputRef.current = el
              cuitMaskRef(el)
            }}
            label="CUIT"
            type="text"
            inputMode="numeric"
            name="organization_cuit"
            autoComplete="off"
            value={formData.organization_cuit}
            onChange={handleInputChange}
            placeholder="20-12345678-9…"
            required
            disabled={submitting}
            error={formErrors.organization_cuit}
            helperText="Formato: XX-XXXXXXXX-X"
          />
          <Select
            label="Sector"
            name="organization_sector"
            value={formData.organization_sector}
            onChange={(value) => onFieldChange('organization_sector', String(value))}
            options={sectorOptions}
            placeholder={sectorsLoading ? 'Cargando sectores...' : sectorsError ? 'Error al cargar sectores — reintentá más tarde' : 'Seleccionar sector…'}
            error={formErrors.organization_sector}
            required
            disabled={submitting || sectorsLoading || !!sectorsError}
            fullWidth
          />
          <Input
            label="Sitio Web (opcional)"
            type="url"
            name="website"
            autoComplete="url"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="https://miorganizacion.com…"
            disabled={submitting}
            error={formErrors.website}
          />
          <div className="md:col-span-2">
            <label htmlFor="organization_logo" className="block text-sm font-medium text-neutral-700 mb-1">
              Logo de la Organización (opcional)
            </label>
            {logoPreview ? (
              <div className="flex items-center gap-4 mb-2">
                <Image
                  src={logoPreview}
                  alt="Vista previa del logo"
                  width={80}
                  height={80}
                  className="rounded-lg object-contain border border-neutral-200 bg-white p-1"
                  unoptimized
                />
                {/* Fix 11: adequate touch target for Eliminar button */}
                <button
                  type="button"
                  onClick={() => handleRemoveFile('organization_logo')}
                  disabled={submitting}
                  className="py-2 px-3 min-h-[44px] text-sm text-error-600 hover:text-error-700 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            ) : (
              <input
                id="organization_logo"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'organization_logo')}
                disabled={submitting}
                className="block w-full text-sm text-neutral-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100
                  disabled:opacity-50"
              />
            )}
            {formErrors.organization_logo && (
              <p className="mt-1 text-sm text-error-600">{formErrors.organization_logo}</p>
            )}
            <p className="mt-1 text-xs text-neutral-500">Máximo 2MB. Formatos: JPG, PNG</p>
          </div>
        </div>
      </div>

      {/* Motivation Section */}
      <div>
        <h3 className="text-lg font-medium text-neutral-900 mb-4">Motivación</h3>
        <div>
          <Textarea
            label="¿Por qué deseas unirte a la plataforma?"
            name="motivation"
            value={formData.motivation}
            onChange={handleInputChange}
            rows={4}
            disabled={submitting}
            error={formErrors.motivation}
            required
            placeholder="Describe brevemente por qué tu organización quiere publicar eventos en la plataforma de turismo…"
            fullWidth
          />
          {/* Fix 9: counter is neutral gray at 0 chars, red only after user starts typing (< 50) */}
          <p
            className={`mt-1 text-xs ${
              isCounterError || motivationLength > 1000
                ? 'text-error-500'
                : 'text-neutral-500'
            }`}
          >
            {motivationLength < 50
              ? `${50 - motivationLength} caracteres más requeridos`
              : `${1000 - motivationLength} caracteres restantes`}
          </p>
        </div>
      </div>

      {/* Terms Checkbox */}
      <div className="border-t border-neutral-200 pt-6">
        <Checkbox
          id="accepted_terms"
          name="accepted_terms"
          checked={formData.accepted_terms}
          onChange={handleCheckboxChange}
          disabled={submitting}
          error={formErrors.accepted_terms}
          required
          label={
            <>
              Acepto los{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">
                términos y condiciones
              </a>
              {" "}y la{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">
                política de privacidad
              </a>
              {" "}de la plataforma
            </>
          }
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={submitting || !formData.accepted_terms}
          loading={submitting}
          fullWidth
          size="lg"
        >
          {submitting ? 'Enviando solicitud…' : 'Enviar Solicitud'}
        </Button>
        <p className="mt-4 text-xs text-neutral-500 text-center">
          Al enviar este formulario, tu solicitud será revisada por nuestro equipo.
          Te notificaremos por email sobre el estado de tu solicitud.
        </p>
      </div>
    </form>
  )
}

export default RegistrationRequestForm
