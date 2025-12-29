'use client'

/**
 * Reject Request Modal Container - Smart Component
 * Manages form state via useRejectRequest hook and passes to dumb component
 */

import { RejectRequestModal } from '@/features/registration-requests/components/dumb/RejectRequestModal'
import { useRejectRequest } from '@/features/registration-requests/hooks/useRejectRequest'

interface RejectRequestModalContainerProps {
  isOpen: boolean
  loading: boolean
  requestName?: string
  onClose: () => void
  onConfirm: (reason: string) => void
}

/**
 *
 * @param root0
 * @param root0.isOpen
 * @param root0.loading
 * @param root0.requestName
 * @param root0.onClose
 * @param root0.onConfirm
 */
export function RejectRequestModalContainer({
  isOpen,
  loading,
  requestName,
  onClose,
  onConfirm,
}: RejectRequestModalContainerProps) {
  const {
    reason,
    error,
    isValid,
    minLength,
    maxLength,
    handleReasonChange,
    handleConfirm,
    handleClose,
  } = useRejectRequest({ isOpen, onConfirm, onClose })

  return (
    <RejectRequestModal
      isOpen={isOpen}
      loading={loading}
      requestName={requestName}
      reason={reason}
      error={error}
      isValid={isValid}
      minLength={minLength}
      maxLength={maxLength}
      onReasonChange={handleReasonChange}
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  )
}

export default RejectRequestModalContainer
