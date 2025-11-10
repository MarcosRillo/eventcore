/**
 * Request Changes Modal with comments input
 */

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'

interface RequestChangesModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (comments: string) => void
  loading: boolean
  eventTitle?: string
}

export const RequestChangesModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  eventTitle
}: RequestChangesModalProps) => {
  const [comments, setComments] = useState('')

  const handleConfirm = (): void => {
    if (comments.trim()) {
      onConfirm(comments)
      setComments('')
    }
  }

  const handleClose = (): void => {
    setComments('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Changes">
      <div className="space-y-4">
        <p className="text-gray-700">
          Request changes to{' '}
          {eventTitle && <strong>&quot;{eventTitle}&quot;</strong>}:
        </p>

        <Textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Describe what changes are needed..."
          rows={4}
          disabled={loading}
          aria-label="Change request comments"
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
            variant="warning"
            onClick={handleConfirm}
            disabled={loading || !comments.trim()}
          >
            {loading ? 'Sending...' : 'Request Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
