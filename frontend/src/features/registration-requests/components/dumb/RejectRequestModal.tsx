/**
 * Reject Request Modal - Dumb Component
 * Modal for entering rejection reason
 * Receives all state via props (no hooks)
 */

import { AlertCircle } from 'lucide-react'
import { type ChangeEvent } from 'react'

import { Button, Textarea } from '@/shared/components/form'
import { Modal } from '@/shared/components/modals'

interface RejectRequestModalProps {
  isOpen: boolean
  loading: boolean
  requestName?: string
  reason: string
  error: string | null
  isValid: boolean
  minLength: number
  maxLength: number
  onReasonChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onConfirm: () => void
  onClose: () => void
}

/**
 *
 * @param root0
 * @param root0.isOpen
 * @param root0.loading
 * @param root0.requestName
 * @param root0.reason
 * @param root0.error
 * @param root0.isValid
 * @param root0.minLength
 * @param root0.maxLength
 * @param root0.onReasonChange
 * @param root0.onConfirm
 * @param root0.onClose
 */
export function RejectRequestModal({
  isOpen,
  loading,
  requestName,
  reason,
  error,
  isValid,
  minLength,
  maxLength,
  onReasonChange,
  onConfirm,
  onClose,
}: RejectRequestModalProps) {
  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

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
            onChange={onReasonChange}
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
                Mínimo {minLength} caracteres
              </p>
            )}
            <span className="text-sm text-gray-500">
              {reason.length}/{maxLength}
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
            onClick={onConfirm}
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
