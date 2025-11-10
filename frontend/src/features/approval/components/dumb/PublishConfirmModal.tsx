/**
 * Publish Confirmation Modal
 */

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface PublishConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  eventTitle?: string
}

export const PublishConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  eventTitle
}: PublishConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publish Event">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to publish{' '}
          {eventTitle && <strong>&quot;{eventTitle}&quot;</strong>} to the public calendar?
        </p>
        <p className="text-sm text-gray-600">
          The event will be visible to all users on the public calendar.
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
            {loading ? 'Publishing...' : 'Publish to Calendar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
