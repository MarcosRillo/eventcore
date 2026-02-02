'use client'

/**
 * Suspend Confirm Modal - Dumb Component
 * Modal for confirming suspension of user + organization
 */

import { AlertTriangle } from 'lucide-react'
import { useCallback } from 'react'

import { Button } from '@/shared/components/form'
import { Modal } from '@/shared/components/modals'

interface SuspendConfirmModalProps {
  isOpen: boolean
  loading: boolean
  organizationName?: string
  onClose: () => void
  onConfirm: () => void
}

/**
 *
 * @param root0
 * @param root0.isOpen
 * @param root0.loading
 * @param root0.organizationName
 * @param root0.onClose
 * @param root0.onConfirm
 */
export function SuspendConfirmModal({
  isOpen,
  loading,
  organizationName,
  onClose,
  onConfirm,
}: SuspendConfirmModalProps) {
  const handleClose = useCallback(() => {
    if (!loading) {
      onClose()
    }
  }, [loading, onClose])

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Suspender Usuario y Organización">
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-medium">Suspensión temporal</p>
            <p className="text-yellow-700 text-sm mt-1">
              El usuario y la organización quedarán inactivos y no podrán crear ni gestionar eventos.
              Esta acción es reversible.
            </p>
          </div>
        </div>

        {/* Context */}
        {organizationName && (
          <p className="text-gray-700">
            Estás por suspender a <strong>{organizationName}</strong> y su usuario asociado.
          </p>
        )}

        {/* Effects List */}
        <div className="bg-gray-50 rounded-md p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Efectos de la suspensión:</p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>El usuario no podrá iniciar sesión</li>
            <li>La organización quedará marcada como suspendida</li>
            <li>Los eventos existentes no se eliminarán</li>
            <li>Podrás reactivar la cuenta en cualquier momento</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="warning"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Suspendiendo...' : 'Suspender'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default SuspendConfirmModal
