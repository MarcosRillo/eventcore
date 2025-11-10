/**
 * Approve Confirmation Modal
 */

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface ApproveConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  eventTitle?: string
}

export const ApproveConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  eventTitle
}: ApproveConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Event">
      <div className="space-y-4">
        <p className="text-gray-700">
          Are you sure you want to approve{' '}
          {eventTitle && <strong>&quot;{eventTitle}&quot;</strong>}?
        </p>
        <p className="text-sm text-gray-600">
          The event will be marked as approved and can be published to the public calendar.
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
            variant="success"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Approving...' : 'Approve'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
