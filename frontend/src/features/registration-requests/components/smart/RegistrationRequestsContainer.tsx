'use client'

/**
 * Registration Requests Container - Smart Component
 * Orchestrates hook and dumb components for registration request management
 */

import { useState, useCallback, useEffect } from 'react'

import { useToast } from '@/components/ui'
import { DeleteOrganizationModal } from '@/features/registration-requests/components/dumb/DeleteOrganizationModal'
import { RegistrationRequestDetailPanel } from '@/features/registration-requests/components/dumb/RegistrationRequestDetail'
import { RegistrationRequestTable } from '@/features/registration-requests/components/dumb/RegistrationRequestTable'
import { SuspendConfirmModal } from '@/features/registration-requests/components/dumb/SuspendConfirmModal'
import { RejectRequestModalContainer } from '@/features/registration-requests/components/smart/RejectRequestModalContainer'
import { useRegistrationRequests } from '@/features/registration-requests/hooks/useRegistrationRequests'
import type { RegistrationRequest } from '@/features/registration-requests/types/registration-request.types'

/**
 *
 */
export function RegistrationRequestsContainer() {
  const { addToast } = useToast()

  // Hook for data and actions
  const {
    requests,
    selectedRequest,
    loading,
    detailLoading,
    actionLoading,
    error,
    displayFilter,
    setDisplayFilter,
    selectRequest,
    approveRequest,
    rejectRequest,
    suspendRequest,
    unsuspendRequest,
    deleteRequest,
    clearError,
  } = useRegistrationRequests()

  // Modal states
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [pendingRejectId, setPendingRejectId] = useState<number | null>(null)
  const [pendingRejectName, setPendingRejectName] = useState<string>('')
  const [pendingActionId, setPendingActionId] = useState<number | null>(null)
  const [pendingActionOrgName, setPendingActionOrgName] = useState<string>('')

  // Handle view detail
  const handleViewDetail = useCallback(
    async (request: RegistrationRequest) => {
      setIsDetailOpen(true)
      await selectRequest(request.id)
    },
    [selectRequest]
  )

  // Handle close detail panel
  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false)
    selectRequest(null)
  }, [selectRequest])

  // Handle approve from table (direct)
  const handleApproveFromTable = useCallback(
    async (request: RegistrationRequest) => {
      const success = await approveRequest(request.id)
      if (success) {
        addToast({
          type: 'success',
          message: `Solicitud de ${request.full_name} aprobada. Se enviaron las credenciales por email.`,
        })
      }
    },
    [approveRequest, addToast]
  )

  // Handle approve from detail panel
  const handleApproveFromDetail = useCallback(async () => {
    if (!selectedRequest) return

    const success = await approveRequest(selectedRequest.id)
    if (success) {
      addToast({
        type: 'success',
        message: `Solicitud de ${selectedRequest.full_name} aprobada. Se enviaron las credenciales por email.`,
      })
      handleCloseDetail()
    }
  }, [selectedRequest, approveRequest, addToast, handleCloseDetail])

  // Handle reject initiation from table
  const handleRejectFromTable = useCallback((request: RegistrationRequest) => {
    setPendingRejectId(request.id)
    setPendingRejectName(request.full_name)
    setIsRejectModalOpen(true)
  }, [])

  // Handle reject initiation from detail panel
  const handleRejectFromDetail = useCallback(() => {
    if (!selectedRequest) return

    setPendingRejectId(selectedRequest.id)
    setPendingRejectName(selectedRequest.full_name)
    setIsRejectModalOpen(true)
  }, [selectedRequest])

  // Handle reject confirmation
  const handleRejectConfirm = useCallback(
    async (reason: string) => {
      if (pendingRejectId === null) return

      const success = await rejectRequest(pendingRejectId, reason)
      if (success) {
        addToast({
          type: 'success',
          message: `Solicitud rechazada. Se notificó al solicitante por email.`,
        })
        setIsRejectModalOpen(false)
        setPendingRejectId(null)
        setPendingRejectName('')

        // Close detail if it was the rejected request
        if (selectedRequest?.id === pendingRejectId) {
          handleCloseDetail()
        }
      }
    },
    [pendingRejectId, rejectRequest, addToast, selectedRequest?.id, handleCloseDetail]
  )

  // Handle reject modal close
  const handleRejectModalClose = useCallback(() => {
    setIsRejectModalOpen(false)
    setPendingRejectId(null)
    setPendingRejectName('')
  }, [])

  // Handle suspend initiation from table
  const handleSuspendFromTable = useCallback((request: RegistrationRequest) => {
    setPendingActionId(request.id)
    setPendingActionOrgName(request.organization_name)
    setIsSuspendModalOpen(true)
  }, [])

  // Handle suspend confirmation
  const handleSuspendConfirm = useCallback(async () => {
    if (pendingActionId === null) return

    const success = await suspendRequest(pendingActionId)
    if (success) {
      addToast({
        type: 'success',
        message: `Usuario y organización suspendidos exitosamente.`,
      })
      setIsSuspendModalOpen(false)
      setPendingActionId(null)
      setPendingActionOrgName('')
    }
  }, [pendingActionId, suspendRequest, addToast])

  // Handle suspend modal close
  const handleSuspendModalClose = useCallback(() => {
    setIsSuspendModalOpen(false)
    setPendingActionId(null)
    setPendingActionOrgName('')
  }, [])

  // Handle unsuspend from table (direct, no modal)
  const handleUnsuspendFromTable = useCallback(
    async (request: RegistrationRequest) => {
      const success = await unsuspendRequest(request.id)
      if (success) {
        addToast({
          type: 'success',
          message: `Usuario y organización reactivados exitosamente.`,
        })
      }
    },
    [unsuspendRequest, addToast]
  )

  // Handle delete initiation from table
  const handleDeleteFromTable = useCallback((request: RegistrationRequest) => {
    setPendingActionId(request.id)
    setPendingActionOrgName(request.organization_name)
    setIsDeleteModalOpen(true)
  }, [])

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (pendingActionId === null) return

    const success = await deleteRequest(pendingActionId)
    if (success) {
      addToast({
        type: 'success',
        message: `Usuario y organización eliminados permanentemente.`,
      })
      setIsDeleteModalOpen(false)
      setPendingActionId(null)
      setPendingActionOrgName('')
    }
  }, [pendingActionId, deleteRequest, addToast])

  // Handle delete modal close
  const handleDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false)
    setPendingActionId(null)
    setPendingActionOrgName('')
  }, [])

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      addToast({ type: 'error', message: error })
      clearError()
    }
  }, [error, addToast, clearError])

  return (
    <>
      {/* Main Table */}
      <RegistrationRequestTable
        requests={requests}
        loading={loading}
        displayFilter={displayFilter}
        onDisplayFilterChange={setDisplayFilter}
        onViewDetail={handleViewDetail}
        onApprove={handleApproveFromTable}
        onReject={handleRejectFromTable}
        onSuspend={handleSuspendFromTable}
        onUnsuspend={handleUnsuspendFromTable}
        onDelete={handleDeleteFromTable}
      />

      {/* Detail Slide-over Panel */}
      <RegistrationRequestDetailPanel
        request={selectedRequest}
        loading={detailLoading}
        actionLoading={actionLoading}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onApprove={handleApproveFromDetail}
        onReject={handleRejectFromDetail}
      />

      {/* Reject Modal */}
      <RejectRequestModalContainer
        isOpen={isRejectModalOpen}
        loading={actionLoading}
        requestName={pendingRejectName}
        onClose={handleRejectModalClose}
        onConfirm={handleRejectConfirm}
      />

      {/* Suspend Modal */}
      <SuspendConfirmModal
        isOpen={isSuspendModalOpen}
        loading={actionLoading}
        organizationName={pendingActionOrgName}
        onClose={handleSuspendModalClose}
        onConfirm={handleSuspendConfirm}
      />

      {/* Delete Modal */}
      <DeleteOrganizationModal
        isOpen={isDeleteModalOpen}
        loading={actionLoading}
        organizationName={pendingActionOrgName}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}

export default RegistrationRequestsContainer
