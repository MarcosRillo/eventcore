'use client'

import { FormEvent,useCallback, useState } from 'react'

import { SendInvitationData } from '@/features/invitations/types/invitation.types'

interface FormErrors {
  email?: string
  role_id?: string
}

interface UseCreateInvitationProps {
  onSubmit: (data: SendInvitationData) => Promise<boolean>
  onClose: () => void
  isLoading: boolean
}

interface UseCreateInvitationReturn {
  email: string
  roleId: number | ''
  errors: FormErrors
  setEmail: (email: string) => void
  setRoleId: (roleId: number | '') => void
  clearEmailError: () => void
  clearRoleError: () => void
  handleSubmit: (e: FormEvent) => Promise<void>
  handleClose: () => void
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Hook to manage create invitation form state and validation
 * @param root0
 * @param root0.onSubmit
 * @param root0.onClose
 * @param root0.isLoading
 */
export const useCreateInvitation = ({
  onSubmit,
  onClose,
  isLoading,
}: UseCreateInvitationProps): UseCreateInvitationReturn => {
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState<number | ''>('')
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {}
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      newErrors.email = 'El email es requerido'
    } else if (!validateEmail(trimmedEmail)) {
      newErrors.email = 'Ingrese un email válido'
    }

    if (!roleId) {
      newErrors.role_id = 'Debe seleccionar un rol'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [email, roleId])

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const success = await onSubmit({
      email: email.trim(),
      role_id: roleId as number,
    })

    if (success) {
      setEmail('')
      setRoleId('')
      setErrors({})
      onClose()
    }
  }, [email, roleId, validate, onSubmit, onClose])

  const handleClose = useCallback(() => {
    if (!isLoading) {
      setEmail('')
      setRoleId('')
      setErrors({})
      onClose()
    }
  }, [isLoading, onClose])

  const clearEmailError = useCallback(() => {
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }))
    }
  }, [errors.email])

  const clearRoleError = useCallback(() => {
    if (errors.role_id) {
      setErrors((prev) => ({ ...prev, role_id: undefined }))
    }
  }, [errors.role_id])

  return {
    email,
    roleId,
    errors,
    setEmail,
    setRoleId,
    clearEmailError,
    clearRoleError,
    handleSubmit,
    handleClose,
  }
}

export default useCreateInvitation
