'use client'

/**
 * useAcceptInvitation Hook
 * Manages the state and logic for accepting an invitation
 */

import { useRouter } from 'next/navigation'
import { useState, useCallback, useTransition } from 'react'

import { validateInvitationToken, acceptInvitation } from '@/features/invitations/services/invitation.service'
import type { AcceptInvitationData } from '@/features/invitations/types/invitation.types'

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

interface UseAcceptInvitationReturn {
  // Token validation state
  validating: boolean
  tokenValid: boolean
  tokenError: string | null
  invitationInfo: InvitationInfo | null

  // Form state
  formData: FormData
  formErrors: FormErrors
  submitting: boolean
  success: boolean

  // Actions
  validateToken: (token: string) => Promise<void>
  updateFormData: (field: keyof FormData, value: string) => void
  submitForm: (token: string) => Promise<void>
  clearErrors: () => void
}

const initialFormData: FormData = {
  name: '',
  dni: '',
  password: '',
  password_confirmation: '',
}

export const useAcceptInvitation = (): UseAcceptInvitationReturn => {
  const router = useRouter()

  // React 19 transitions for non-blocking UI
  const [, startValidatingTransition] = useTransition()
  const [, startSubmitTransition] = useTransition()

  // Manual loading states for reliable test behavior
  const [isValidating, setIsValidating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Token validation state
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null)

  // Form state
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState(false)

  /**
   * Validate the invitation token
   */
  const validateToken = useCallback(async (token: string): Promise<void> => {
    if (!token) {
      setTokenError('Token de invitación no proporcionado')
      return
    }

    setIsValidating(true)
    setTokenError(null)

    startValidatingTransition(async () => {
      try {
        const data = await validateInvitationToken(token)

        // If we get data back, the token is valid
        setTokenValid(true)
        setInvitationInfo({
          email: data.email,
          role: data.role,
          expires_at: data.expires_at,
        })
      } catch {
        setTokenError('El token de invitación no es válido o ha expirado.')
      } finally {
        setIsValidating(false)
      }
    })
  }, [startValidatingTransition])

  /**
   * Update form data
   */
  const updateFormData = useCallback((field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for the field being updated
    setFormErrors((prev) => ({ ...prev, [field]: undefined }))
  }, [])

  /**
   * Validate form data
   */
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido'
    } else if (formData.name.length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres'
    }

    // DNI validation
    if (!formData.dni.trim()) {
      errors.dni = 'El DNI es requerido'
    } else if (formData.dni.length < 7 || formData.dni.length > 20) {
      errors.dni = 'El DNI debe tener entre 7 y 20 caracteres'
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres'
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'La contraseña debe contener al menos una mayúscula'
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'La contraseña debe contener al menos una minúscula'
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'La contraseña debe contener al menos un número'
    }

    // Password confirmation validation
    if (!formData.password_confirmation) {
      errors.password_confirmation = 'Confirma tu contraseña'
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Las contraseñas no coinciden'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  /**
   * Submit the form to accept invitation
   */
  const submitForm = useCallback(
    async (token: string): Promise<void> => {
      if (!validateForm()) {
        return
      }

      setIsSubmitting(true)
      setFormErrors({})

      startSubmitTransition(async () => {
        try {
          const acceptData: AcceptInvitationData = {
            token,
            name: formData.name.trim(),
            dni: formData.dni.trim(),
            password: formData.password,
            password_confirmation: formData.password_confirmation,
          }

          await acceptInvitation(acceptData)
          setSuccess(true)

          // Redirect to login after short delay
          setTimeout(() => {
            router.push('/login?registered=true')
          }, 2000)
        } catch (error: unknown) {
          // Handle API errors
          const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }

          if (err.response?.data?.errors) {
            const apiErrors = err.response.data.errors
            const newErrors: FormErrors = {}

            if (apiErrors.name) newErrors.name = apiErrors.name[0]
            if (apiErrors.dni) newErrors.dni = apiErrors.dni[0]
            if (apiErrors.password) newErrors.password = apiErrors.password[0]
            if (apiErrors.token) newErrors.general = apiErrors.token[0]

            setFormErrors(newErrors)
          } else if (err.response?.data?.message) {
            setFormErrors({ general: err.response.data.message })
          } else {
            setFormErrors({ general: 'Error al crear la cuenta. Por favor, intenta nuevamente.' })
          }
        } finally {
          setIsSubmitting(false)
        }
      })
    },
    [formData, validateForm, router, startSubmitTransition]
  )

  /**
   * Clear all errors
   */
  const clearErrors = useCallback((): void => {
    setFormErrors({})
    setTokenError(null)
  }, [])

  // Backward compatibility: map states to original names
  const validating = isValidating
  const submitting = isSubmitting

  return {
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
    clearErrors,
  }
}

export default useAcceptInvitation
