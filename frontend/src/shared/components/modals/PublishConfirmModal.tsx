/**
 * Publish Confirmation Modal - Shared Component
 *
 * Generic confirmation modal for publish/submit operations.
 * Reusable across all features that need publish/approval workflows.
 * Thin wrapper over ConfirmDialog with info/warning variants.
 */

import ConfirmDialog from '@/shared/components/modals/ConfirmDialog'

interface PublishConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  title?: string
  message?: string
  confirmLabel?: string
  variant?: 'info' | 'warning'
}

export const PublishConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title = 'Enviar a revisión',
  message = '¿Está seguro de que desea enviar este elemento? Será enviado para aprobación interna.',
  confirmLabel = 'Enviar',
  variant = 'info'
}: PublishConfirmModalProps) => {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={title}
      message={message}
      variant={variant}
      confirmText={confirmLabel}
      cancelText="Cancelar"
      onConfirm={onConfirm}
      onCancel={onClose}
      loading={loading}
    />
  )
}
