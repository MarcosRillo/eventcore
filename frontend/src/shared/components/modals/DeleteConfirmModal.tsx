/**
 * Delete Confirmation Modal - Shared Component
 *
 * Generic confirmation modal for delete operations.
 * Reusable across all features (events, categories, locations, etc.)
 */

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

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
  title = 'Delete Item',
  itemName,
  warningMessage = 'Warning: This action cannot be undone'
}: DeleteConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="bg-red-50 border-l-4 border-red-600 rounded-sm p-4">
          <p className="text-red-800 font-semibold">
            {warningMessage}
          </p>
        </div>

        <p className="text-neutral-700">
          Are you sure you want to delete{' '}
          {itemName && <strong>&quot;{itemName}&quot;</strong>}?
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
