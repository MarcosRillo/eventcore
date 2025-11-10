/**
 * Publish Confirmation Modal
 *
 * Asks user to confirm publishing event.
 */

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface PublishConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}

export const PublishConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading
}: PublishConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publish Event">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to publish this event? It will be submitted for internal approval.
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
            {loading ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
