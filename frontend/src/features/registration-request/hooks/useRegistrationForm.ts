'use client'

import { useState, useCallback } from 'react'
import {
  RegistrationFormData,
  RegistrationFormErrors,
  initialFormData,
} from '../types/registration.types'
import registrationService from '../services/registration.service'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CUIT_REGEX = /^\d{2}-\d{8}-\d$/
const URL_REGEX = /^https?:\/\/.+/

interface UseRegistrationFormReturn {
  formData: RegistrationFormData
  errors: RegistrationFormErrors
  serverError: string | null
  loading: boolean
  success: boolean
  handleChange: (field: keyof RegistrationFormData, value: string) => void
  handleSubmit: () => Promise<void>
  resetForm: () => void
}

const validateField = (
  field: keyof RegistrationFormData,
  value: string
): string | undefined => {
  switch (field) {
    case 'dni':
      if (!value.trim()) return 'El DNI es obligatorio'
      if (value.length > 20) return 'El DNI no puede superar 20 caracteres'
      break
    case 'first_name':
      if (!value.trim()) return 'El nombre es obligatorio'
      if (value.length > 100) return 'El nombre no puede superar 100 caracteres'
      break
    case 'last_name':
      if (!value.trim()) return 'El apellido es obligatorio'
      if (value.length > 100) return 'El apellido no puede superar 100 caracteres'
      break
    case 'email':
      if (!value.trim()) return 'El email es obligatorio'
      if (!EMAIL_REGEX.test(value)) return 'Ingrese un email válido'
      break
    case 'whatsapp':
      if (!value.trim()) return 'El WhatsApp es obligatorio'
      if (value.length > 20) return 'El WhatsApp no puede superar 20 caracteres'
      break
    case 'organization_name':
      if (!value.trim()) return 'El nombre de la organización es obligatorio'
      if (value.length > 255) return 'El nombre no puede superar 255 caracteres'
      break
    case 'organization_cuit':
      if (!value.trim()) return 'El CUIT es obligatorio'
      if (!CUIT_REGEX.test(value)) return 'El CUIT debe tener el formato XX-XXXXXXXX-X'
      break
    case 'organization_sector':
      if (!value.trim()) return 'El rubro es obligatorio'
      if (value.length > 100) return 'El rubro no puede superar 100 caracteres'
      break
    case 'website':
      if (value.trim() && !URL_REGEX.test(value)) return 'Ingrese una URL válida (https://...)'
      break
    case 'motivation':
      if (!value.trim()) return 'La motivación es obligatoria'
      if (value.length < 50) return 'La motivación debe tener al menos 50 caracteres'
      if (value.length > 1000) return 'La motivación no puede superar 1000 caracteres'
      break
  }
  return undefined
}

const validateAllFields = (data: RegistrationFormData): RegistrationFormErrors => {
  const errors: RegistrationFormErrors = {}
  const fields = Object.keys(data) as Array<keyof RegistrationFormData>

  for (const field of fields) {
    const error = validateField(field, data[field])
    if (error) {
      errors[field] = error
    }
  }

  return errors
}

export const useRegistrationForm = (): UseRegistrationFormReturn => {
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData)
  const [errors, setErrors] = useState<RegistrationFormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = useCallback(
    (field: keyof RegistrationFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      // Clear field error on change
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }

      // Clear server error on any change
      if (serverError) {
        setServerError(null)
      }
    },
    [errors, serverError]
  )

  const handleSubmit = useCallback(async () => {
    setServerError(null)

    // Validate all fields
    const validationErrors = validateAllFields(formData)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setLoading(true)

    try {
      await registrationService.submitRegistrationRequest(formData)
      setSuccess(true)
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }

        // Handle validation errors from backend
        if (axiosError.response?.data?.errors) {
          const backendErrors: RegistrationFormErrors = {}
          const errorData = axiosError.response.data.errors

          for (const [field, messages] of Object.entries(errorData)) {
            if (field in formData && Array.isArray(messages)) {
              backendErrors[field as keyof RegistrationFormErrors] = messages[0]
            }
          }

          setErrors(backendErrors)
        } else if (axiosError.response?.data?.message) {
          setServerError(axiosError.response.data.message)
        } else {
          setServerError('Error al enviar la solicitud. Intente nuevamente.')
        }
      } else {
        setServerError('Error de conexión. Verifique su internet e intente nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }, [formData])

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setErrors({})
    setServerError(null)
    setSuccess(false)
  }, [])

  return {
    formData,
    errors,
    serverError,
    loading,
    success,
    handleChange,
    handleSubmit,
    resetForm,
  }
}

export default useRegistrationForm
