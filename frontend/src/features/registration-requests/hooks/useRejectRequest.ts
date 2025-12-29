'use client'

import { useState, useEffect, useCallback, type ChangeEvent } from 'react'

const MIN_REASON_LENGTH = 10
const MAX_REASON_LENGTH = 500

interface UseRejectRequestProps {
  isOpen: boolean
  onConfirm: (reason: string) => void
  onClose: () => void
}

interface UseRejectRequestReturn {
  reason: string
  error: string | null
  isValid: boolean
  minLength: number
  maxLength: number
  handleReasonChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  handleConfirm: () => void
  handleClose: () => void
}

/**
 * Hook to manage reject request modal state and validation
 * @param root0
 * @param root0.isOpen
 * @param root0.onConfirm
 * @param root0.onClose
 */
export const useRejectRequest = ({
  isOpen,
  onConfirm,
  onClose,
}: UseRejectRequestProps): UseRejectRequestReturn => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setReason('')
      setError(null)
    }
  }, [isOpen])

  const validateReason = useCallback((value: string): string | null => {
    const trimmed = value.trim()
    if (!trimmed) {
      return 'El motivo es obligatorio'
    }
    if (trimmed.length < MIN_REASON_LENGTH) {
      return `El motivo debe tener al menos ${MIN_REASON_LENGTH} caracteres`
    }
    if (trimmed.length > MAX_REASON_LENGTH) {
      return `El motivo no puede superar ${MAX_REASON_LENGTH} caracteres`
    }
    return null
  }, [])

  const handleReasonChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setReason(value)
      if (error) {
        setError(validateReason(value))
      }
    },
    [error, validateReason]
  )

  const handleConfirm = useCallback(() => {
    const validationError = validateReason(reason)
    if (validationError) {
      setError(validationError)
      return
    }
    onConfirm(reason.trim())
  }, [reason, validateReason, onConfirm])

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const isValid = reason.trim().length >= MIN_REASON_LENGTH

  return {
    reason,
    error,
    isValid,
    minLength: MIN_REASON_LENGTH,
    maxLength: MAX_REASON_LENGTH,
    handleReasonChange,
    handleConfirm,
    handleClose,
  }
}

export default useRejectRequest
