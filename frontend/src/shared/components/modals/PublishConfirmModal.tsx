/**
 * Publish Confirmation Modal - Shared Component
 *
 * Generic confirmation modal for publish operations.
 * Reusable across all features that need publish/approval workflows.
 */

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface PublishConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  title?: string
  message?: string
  confirmLabel?: string
}

export const PublishConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title = 'Publish Item',
  message = 'Are you sure you want to publish this item? It will be submitted for internal approval.',
  confirmLabel = 'Publish'
}: PublishConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-neutral-700">
          {message}
        </p>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? `${confirmLabel}ing...` : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
