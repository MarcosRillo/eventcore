'use client'

/**
 * Delete Organization Modal - Dumb Component
 * Modal for confirming deletion of user + organization (only when suspended)
 */

import { AlertCircle, Trash2 } from 'lucide-react'
import { useCallback } from 'react'

import { Modal, Button } from '@/components/ui'

interface DeleteOrganizationModalProps {
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
export function DeleteOrganizationModal({
  isOpen,
  loading,
  organizationName,
  onClose,
  onConfirm,
}: DeleteOrganizationModalProps) {
  const handleClose = useCallback(() => {
    if (!loading) {
      onClose()
    }
  }, [loading, onClose])

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Eliminar Usuario y Organización">
      <div className="space-y-4">
        {/* Danger Banner */}
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Acción permanente e irreversible</p>
            <p className="text-red-700 text-sm mt-1">
              Esta acción eliminará permanentemente el usuario y la organización, incluyendo todos sus datos asociados.
            </p>
          </div>
        </div>

        {/* Context */}
        {organizationName && (
          <p className="text-gray-700">
            Estás por eliminar permanentemente a <strong>{organizationName}</strong> y su usuario asociado.
          </p>
        )}

        {/* What will be deleted */}
        <div className="bg-gray-50 rounded-md p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Se eliminarán los siguientes datos:</p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Cuenta de usuario y credenciales</li>
            <li>Organización y configuración</li>
            <li>Todos los eventos creados por esta organización</li>
            <li>Categorías personalizadas</li>
            <li>Histórico y registros de actividad</li>
          </ul>
        </div>

        {/* Final Warning */}
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <Trash2 className="h-4 w-4" />
          <span>Esta acción no se puede deshacer.</span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar Permanentemente'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteOrganizationModal
