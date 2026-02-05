'use client'

/**
 * useRegistrationRequest Hook
 * Manages the state and logic for the public registration request form
 */

import { useCallback, useState, useTransition } from 'react'

import { createRegistrationRequest } from '@/features/registration-requests/services/registration-request.service'
import {
  initialFormData,
  RegistrationRequestFormData,
  RegistrationRequestFormErrors,
} from '@/features/registration-requests/types/registration-request.types'

interface UseRegistrationRequestReturn {
  // Form state
  formData: RegistrationRequestFormData
  formErrors: RegistrationRequestFormErrors
  submitting: boolean
  success: boolean

  // Actions
  updateField: (field: keyof RegistrationRequestFormData, value: string | File | null | boolean) => void
  submitForm: () => Promise<void>
  resetForm: () => void
  clearErrors: () => void
}

// Hoisted regex patterns for better performance (avoid recreation on each render)
const CUIT_REGEX = /^\d{2}-\d{8}-\d{1}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validate CUIT format (XX-XXXXXXXX-X)
 * @param cuit
 */
const isValidCuit = (cuit: string): boolean => {
  return CUIT_REGEX.test(cuit)
}

/**
 * Validate email format
 * @param email
 */
const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email)
}

/**
 * Validate file size (max 2MB)
 * @param file
 */
const isValidFileSize = (file: File | null): boolean => {
  if (!file) return true
  return file.size <= 2 * 1024 * 1024 // 2MB
}

/**
 * Validate file type (image only)
 * @param file
 */
const isValidImageType = (file: File | null): boolean => {
  if (!file) return true
  return file.type.startsWith('image/')
}

export const useRegistrationRequest = (): UseRegistrationRequestReturn => {
  // React 19 transition for non-blocking UI
  const [, startTransition] = useTransition()

  const [formData, setFormData] = useState<RegistrationRequestFormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<RegistrationRequestFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  /**
   * Scroll to and focus the first field with an error
   */
  const scrollToFirstError = useCallback((errors: RegistrationRequestFormErrors): void => {
    const firstErrorField = Object.keys(errors)[0]
    if (!firstErrorField) return

    const element = document.querySelector(`[name="${firstErrorField}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      ;(element as HTMLElement).focus?.()
    }
  }, [])

  /**
   * Validate all form fields
   */
  const validateForm = useCallback((): boolean => {
    const errors: RegistrationRequestFormErrors = {}

    // DNI validation
    if (!formData.dni.trim()) {
      errors.dni = 'El DNI es requerido'
    } else if (formData.dni.length > 20) {
      errors.dni = 'El DNI no puede exceder 20 caracteres'
    }

    // First name validation
    if (!formData.first_name.trim()) {
      errors.first_name = 'El nombre es requerido'
    } else if (formData.first_name.length < 2) {
      errors.first_name = 'El nombre debe tener al menos 2 caracteres'
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      errors.last_name = 'El apellido es requerido'
    } else if (formData.last_name.length < 2) {
      errors.last_name = 'El apellido debe tener al menos 2 caracteres'
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido'
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'El email no es válido'
    }

    // WhatsApp validation
    if (!formData.whatsapp.trim()) {
      errors.whatsapp = 'El WhatsApp es requerido'
    } else if (formData.whatsapp.length > 20) {
      errors.whatsapp = 'El WhatsApp no puede exceder 20 caracteres'
    }

    // Organization name validation
    if (!formData.organization_name.trim()) {
      errors.organization_name = 'El nombre de la organización es requerido'
    }

    // Organization CUIT validation
    if (!formData.organization_cuit.trim()) {
      errors.organization_cuit = 'El CUIT es requerido'
    } else if (!isValidCuit(formData.organization_cuit)) {
      errors.organization_cuit = 'El formato del CUIT debe ser XX-XXXXXXXX-X'
    }

    // Organization sector validation
    if (!formData.organization_sector.trim()) {
      errors.organization_sector = 'El sector es requerido'
    }

    // Motivation validation
    if (!formData.motivation.trim()) {
      errors.motivation = 'La motivación es requerida'
    } else if (formData.motivation.length < 50) {
      errors.motivation = 'La motivación debe tener al menos 50 caracteres'
    } else if (formData.motivation.length > 1000) {
      errors.motivation = 'La motivación no puede exceder 1000 caracteres'
    }

    // Profile photo validation
    if (formData.profile_photo) {
      if (!isValidFileSize(formData.profile_photo)) {
        errors.profile_photo = 'La foto no puede exceder 2MB'
      } else if (!isValidImageType(formData.profile_photo)) {
        errors.profile_photo = 'El archivo debe ser una imagen'
      }
    }

    // Organization logo validation
    if (formData.organization_logo) {
      if (!isValidFileSize(formData.organization_logo)) {
        errors.organization_logo = 'El logo no puede exceder 2MB'
      } else if (!isValidImageType(formData.organization_logo)) {
        errors.organization_logo = 'El archivo debe ser una imagen'
      }
    }

    // Website validation (optional but must be valid URL if provided)
    if (formData.website.trim()) {
      try {
        new URL(formData.website)
      } catch {
        errors.website = 'La URL del sitio web no es válida'
      }
    }

    // Terms acceptance validation
    if (!formData.accepted_terms) {
      errors.accepted_terms = 'Debes aceptar los términos y condiciones'
    }

    setFormErrors(errors)

    // Scroll to first error if validation fails
    if (Object.keys(errors).length > 0) {
      scrollToFirstError(errors)
    }

    return Object.keys(errors).length === 0
  }, [formData, scrollToFirstError])

  /**
   * Update a single form field
   */
  const updateField = useCallback(
    (field: keyof RegistrationRequestFormData, value: string | File | null | boolean): void => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      // Clear error for the field being updated
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    },
    []
  )

  /**
   * Submit the registration request
   */
  const submitForm = useCallback(async (): Promise<void> => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setFormErrors({})

    startTransition(async () => {
      try {
        // Build the request data
        const requestData = {
          dni: formData.dni.trim(),
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim(),
          whatsapp: formData.whatsapp.trim(),
          organization_name: formData.organization_name.trim(),
          organization_cuit: formData.organization_cuit.trim(),
          organization_sector: formData.organization_sector.trim(),
          motivation: formData.motivation.trim(),
          website: formData.website.trim() || undefined,
          profile_photo: formData.profile_photo || undefined,
          organization_logo: formData.organization_logo || undefined,
        }

        await createRegistrationRequest(requestData)
        setSuccess(true)
      } catch (error: unknown) {
        // Handle API errors
        const err = error as {
          response?: { data?: { message?: string; errors?: Record<string, string[]> } }
        }

        if (err.response?.data?.errors) {
          const apiErrors = err.response.data.errors
          const newErrors: RegistrationRequestFormErrors = {}

          // Map API errors to form fields
          Object.keys(apiErrors).forEach((key) => {
            const formKey = key as keyof RegistrationRequestFormErrors
            if (formKey in initialFormData || formKey === 'general') {
              newErrors[formKey] = apiErrors[key][0]
            }
          })

          setFormErrors(newErrors)
        } else if (err.response?.data?.message) {
          setFormErrors({ general: err.response.data.message })
        } else {
          setFormErrors({ general: 'Error al enviar la solicitud. Por favor, intenta nuevamente.' })
        }
      } finally {
        setIsSubmitting(false)
      }
    })
  }, [formData, validateForm])

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback((): void => {
    setFormData(initialFormData)
    setFormErrors({})
    setSuccess(false)
  }, [])

  /**
   * Clear all errors
   */
  const clearErrors = useCallback((): void => {
    setFormErrors({})
  }, [])

  // Backward compatibility
  const submitting = isSubmitting

  return {
    formData,
    formErrors,
    submitting,
    success,
    updateField,
    submitForm,
    resetForm,
    clearErrors,
  }
}

export default useRegistrationRequest
