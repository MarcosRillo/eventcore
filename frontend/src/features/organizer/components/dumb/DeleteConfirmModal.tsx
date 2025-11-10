/**
 * Delete Confirmation Modal
 *
 * Asks user to confirm deleting event (destructive action).
 */

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  eventTitle?: string
}

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  eventTitle
}: DeleteConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Event">
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 font-semibold">
            Warning: This action cannot be undone
          </p>
        </div>

        <p className="text-gray-700">
          Are you sure you want to delete{' '}
          {eventTitle && <strong>&quot;{eventTitle}&quot;</strong>}?
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
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
