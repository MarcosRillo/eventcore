/**
 * Reject Confirmation Modal with reason input
 */

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'

interface RejectConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  loading: boolean
  eventTitle?: string
}

export const RejectConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  eventTitle
}: RejectConfirmModalProps) => {
  const [reason, setReason] = useState('')

  const handleConfirm = (): void => {
    if (reason.trim()) {
      onConfirm(reason)
      setReason('')
    }
  }

  const handleClose = (): void => {
    setReason('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reject Event">
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 font-semibold">
            This will reject the event submission
          </p>
        </div>

        <p className="text-gray-700">
          Please provide a reason for rejecting{' '}
          {eventTitle && <strong>&quot;{eventTitle}&quot;</strong>}:
        </p>

        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for rejection..."
          rows={4}
          disabled={loading}
          aria-label="Rejection reason"
        />

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={loading || !reason.trim()}
          >
            {loading ? 'Rejecting...' : 'Reject Event'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
