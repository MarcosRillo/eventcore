'use client'

/**
 * Reject Request Modal - Dumb Component
 * Modal for entering rejection reason
 */

import { useState, useCallback, useEffect, type ChangeEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import { Modal, Button, Textarea } from '@/components/ui'

interface RejectRequestModalProps {
  isOpen: boolean
  loading: boolean
  requestName?: string
  onClose: () => void
  onConfirm: (reason: string) => void
}

const MIN_REASON_LENGTH = 10
const MAX_REASON_LENGTH = 500

export function RejectRequestModal({
  isOpen,
  loading,
  requestName,
  onClose,
  onConfirm,
}: RejectRequestModalProps) {
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
    if (!loading) {
      onClose()
    }
  }, [loading, onClose])

  const isValid = reason.trim().length >= MIN_REASON_LENGTH

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Rechazar Solicitud">
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Esta acción es irreversible</p>
            <p className="text-red-700 text-sm mt-1">
              El solicitante recibirá una notificación por email con el motivo del rechazo.
            </p>
          </div>
        </div>

        {/* Context */}
        {requestName && (
          <p className="text-gray-700">
            Estás por rechazar la solicitud de <strong>{requestName}</strong>.
          </p>
        )}

        {/* Reason Input */}
        <div>
          <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-1">
            Motivo del rechazo <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="rejection-reason"
            value={reason}
            onChange={handleReasonChange}
            placeholder="Explique brevemente el motivo por el cual se rechaza esta solicitud..."
            rows={4}
            disabled={loading}
            aria-describedby="reason-help"
          />
          <div className="flex justify-between mt-1">
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <p id="reason-help" className="text-sm text-gray-500">
                Mínimo {MIN_REASON_LENGTH} caracteres
              </p>
            )}
            <span className="text-sm text-gray-500">
              {reason.length}/{MAX_REASON_LENGTH}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={loading || !isValid}
          >
            {loading ? 'Rechazando...' : 'Rechazar Solicitud'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default RejectRequestModal
