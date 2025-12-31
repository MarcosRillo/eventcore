/**
 * Custom hook for approval actions
 *
 * Provides methods to approve, reject, request changes, and publish events.
 * Uses React 19 useTransition for loading states.
 */

import { useState, useTransition } from 'react'

import { useToast } from '@/components/ui/Toast'
import { approvalService } from '@/features/approval/services/approval.service'

interface UseApprovalActionsReturn {
  loading: boolean
  approveModalOpen: boolean
  rejectModalOpen: boolean
  requestChangesModalOpen: boolean
  publishModalOpen: boolean
  selectedEventId: number | null
  openApproveModal: (eventId: number) => void
  closeApproveModal: () => void
  openRejectModal: (eventId: number) => void
  closeRejectModal: () => void
  openRequestChangesModal: (eventId: number) => void
  closeRequestChangesModal: () => void
  openPublishModal: (eventId: number) => void
  closePublishModal: () => void
  approveEvent: (eventId: number) => Promise<void>
  rejectEvent: (eventId: number, reason: string) => Promise<void>
  requestChanges: (eventId: number, comments: string) => Promise<void>
  publishEvent: (eventId: number) => Promise<void>
}

export const useApprovalActions = (
  onSuccess?: () => void
): UseApprovalActionsReturn => {
  const { addToast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [requestChangesModalOpen, setRequestChangesModalOpen] = useState(false)
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)

  const openApproveModal = (eventId: number): void => {
    setSelectedEventId(eventId)
    setApproveModalOpen(true)
  }

  const closeApproveModal = (): void => {
    setApproveModalOpen(false)
    setSelectedEventId(null)
  }

  const openRejectModal = (eventId: number): void => {
    setSelectedEventId(eventId)
    setRejectModalOpen(true)
  }

  const closeRejectModal = (): void => {
    setRejectModalOpen(false)
    setSelectedEventId(null)
  }

  const openRequestChangesModal = (eventId: number): void => {
    setSelectedEventId(eventId)
    setRequestChangesModalOpen(true)
  }

  const closeRequestChangesModal = (): void => {
    setRequestChangesModalOpen(false)
    setSelectedEventId(null)
  }

  const openPublishModal = (eventId: number): void => {
    setSelectedEventId(eventId)
    setPublishModalOpen(true)
  }

  const closePublishModal = (): void => {
    setPublishModalOpen(false)
    setSelectedEventId(null)
  }

  const approveEvent = async (eventId: number): Promise<void> => {
    startTransition(async () => {
      try {
        await approvalService.approve(eventId)
        addToast({ message: 'Event approved successfully', type: 'success' })
        closeApproveModal()
        onSuccess?.()
      } catch {
        addToast({ message: 'Failed to approve event', type: 'error' })
      }
    })
  }

  const rejectEvent = async (eventId: number, reason: string): Promise<void> => {
    startTransition(async () => {
      try {
        await approvalService.reject(eventId, reason)
        addToast({ message: 'Event rejected', type: 'success' })
        closeRejectModal()
        onSuccess?.()
      } catch {
        addToast({ message: 'Failed to reject event', type: 'error' })
      }
    })
  }

  const requestChanges = async (eventId: number, comments: string): Promise<void> => {
    startTransition(async () => {
      try {
        await approvalService.requestChanges(eventId, comments)
        addToast({ message: 'Changes requested successfully', type: 'success' })
        closeRequestChangesModal()
        onSuccess?.()
      } catch {
        addToast({ message: 'Failed to request changes', type: 'error' })
      }
    })
  }

  const publishEvent = async (eventId: number): Promise<void> => {
    startTransition(async () => {
      try {
        await approvalService.publish(eventId)
        addToast({ message: 'Event published to public calendar', type: 'success' })
        closePublishModal()
        onSuccess?.()
      } catch {
        addToast({ message: 'Failed to publish event', type: 'error' })
      }
    })
  }

  // Backward compatibility
  const loading = isPending

  return {
    loading,
    approveModalOpen,
    rejectModalOpen,
    requestChangesModalOpen,
    publishModalOpen,
    selectedEventId,
    openApproveModal,
    closeApproveModal,
    openRejectModal,
    closeRejectModal,
    openRequestChangesModal,
    closeRequestChangesModal,
    openPublishModal,
    closePublishModal,
    approveEvent,
    rejectEvent,
    requestChanges,
    publishEvent
  }
}
