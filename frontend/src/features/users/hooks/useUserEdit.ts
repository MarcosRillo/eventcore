'use client'

import { useState, useEffect, useCallback } from 'react'

import type { User, UpdateUserData } from '@/features/users/types/user.types'

interface UserEditErrors {
  name?: string
  email?: string
}

interface UseUserEditProps {
  user: User | null
  onSave: (id: number, data: UpdateUserData) => Promise<boolean>
  onClose: () => void
}

interface UseUserEditReturn {
  name: string
  email: string
  errors: UserEditErrors
  setName: (name: string) => void
  setEmail: (email: string) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleClose: () => void
}

/**
 * Hook to manage user edit form state and validation
 * @param root0
 * @param root0.user
 * @param root0.onSave
 * @param root0.onClose
 */
export const useUserEdit = ({
  user,
  onSave,
  onClose,
}: UseUserEditProps): UseUserEditReturn => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<UserEditErrors>({})

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setErrors({})
    }
  }, [user])

  const validate = useCallback((): boolean => {
    const newErrors: UserEditErrors = {}
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      newErrors.name = 'El nombre es obligatorio'
    } else if (trimmedName.length > 255) {
      newErrors.name = 'El nombre no puede exceder 255 caracteres'
    }

    if (!trimmedEmail) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'El email debe ser válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [name, email])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !validate()) return

    const success = await onSave(user.id, { name: name.trim(), email: email.trim() })
    if (success) {
      onClose()
    }
  }, [user, validate, onSave, onClose, name, email])

  const handleClose = useCallback(() => {
    setErrors({})
    onClose()
  }, [onClose])

  return {
    name,
    email,
    errors,
    setName,
    setEmail,
    handleSubmit,
    handleClose,
  }
}

export default useUserEdit
