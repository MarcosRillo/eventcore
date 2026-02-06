/**
 * Delete Confirmation Modal - Shared Component
 *
 * Generic confirmation modal for delete operations.
 * Reusable across all features (events, categories, locations, etc.)
 * Thin wrapper over ConfirmDialog with variant="danger".
 */

import ConfirmDialog from '@/shared/components/modals/ConfirmDialog'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  title?: string
  itemName?: string
  warningMessage?: string
}

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title = 'Eliminar elemento',
  itemName,
  warningMessage = 'Advertencia: Esta acción no se puede deshacer'
}: DeleteConfirmModalProps) => {
  const message = itemName
    ? `¿Está seguro de que desea eliminar "${itemName}"? ${warningMessage}`
    : `¿Está seguro de que desea eliminar este elemento? ${warningMessage}`

  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={title}
      message={message}
      variant="danger"
      confirmText="Eliminar"
      cancelText="Cancelar"
      onConfirm={onConfirm}
      onCancel={onClose}
      loading={loading}
    />
  )
}
