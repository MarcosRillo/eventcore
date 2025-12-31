'use client'

/**
 * useRegistrationRequests Hook
 *
 * Manages state and actions for registration requests admin panel.
 * Uses React 19 useTransition for loading states and useOptimistic for instant UI updates.
 */

import { useState, useCallback, useEffect, useTransition, useOptimistic } from 'react'

import registrationRequestService from '@/features/registration-requests/services/registration-request.service'
import {
  RegistrationRequest,
  RegistrationRequestDetail,
  RegistrationRequestStatus,
  DisplayStatusFilter,
} from '@/features/registration-requests/types/registration-request.types'

interface UseRegistrationRequestsReturn {
  // Data
  requests: RegistrationRequest[]
  selectedRequest: RegistrationRequestDetail | null

  // State
  loading: boolean
  detailLoading: boolean
  actionLoading: boolean
  error: string | null

  // Filters
  displayFilter: DisplayStatusFilter
  setDisplayFilter: (filter: DisplayStatusFilter) => void

  // Actions
  selectRequest: (id: number | null) => Promise<void>
  approveRequest: (id: number) => Promise<boolean>
  rejectRequest: (id: number, reason: string) => Promise<boolean>
  suspendRequest: (id: number) => Promise<boolean>
  unsuspendRequest: (id: number) => Promise<boolean>
  deleteRequest: (id: number) => Promise<boolean>
  refresh: () => Promise<void>
  clearError: () => void
}

type OptimisticAction =
  | { type: 'approve'; id: number }
  | { type: 'reject'; id: number; reason: string }
  | { type: 'suspend'; id: number }
  | { type: 'unsuspend'; id: number }
  | { type: 'delete'; id: number }

function optimisticReducer(
  requests: RegistrationRequest[],
  action: OptimisticAction
): RegistrationRequest[] {
  switch (action.type) {
    case 'approve':
      return requests.map((req) =>
        req.id === action.id
          ? { ...req, status: 'approved' as RegistrationRequestStatus }
          : req
      )
    case 'reject':
      return requests.map((req) =>
        req.id === action.id
          ? { ...req, status: 'rejected' as RegistrationRequestStatus, rejection_reason: action.reason }
          : req
      )
    case 'suspend':
      return requests.map((req) =>
        req.id === action.id
          ? { ...req, user_status: 'suspended', organization_status: 'suspended' }
          : req
      )
    case 'unsuspend':
      return requests.map((req) =>
        req.id === action.id
          ? { ...req, user_status: 'active', organization_status: 'active' }
          : req
      )
    case 'delete':
      return requests.map((req) =>
        req.id === action.id
          ? { ...req, is_deleted: true }
          : req
      )
    default:
      return requests
  }
}

export const useRegistrationRequests = (): UseRegistrationRequestsReturn => {
  // Data state
  const [requests, setRequests] = useState<RegistrationRequest[]>([])
  const [optimisticRequests, addOptimisticAction] = useOptimistic(requests, optimisticReducer)
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequestDetail | null>(null)

  // React 19 transitions for loading states
  const [isLoadingPending, startLoadingTransition] = useTransition()
  const [isDetailPending, startDetailTransition] = useTransition()
  const [isActionPending, startActionTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Filter state (filtering happens on frontend)
  const [displayFilter, setDisplayFilter] = useState<DisplayStatusFilter>('default')

  /**
   * Fetch all registration requests (no backend filtering)
   */
  const fetchRequests = useCallback(async (): Promise<void> => {
    setError(null)
    startLoadingTransition(async () => {
      try {
        const data = await registrationRequestService.getAll({})
        setRequests(data)
      } catch {
        setError('Error al cargar las solicitudes')
      }
    })
  }, [])

  /**
   * Select a request and load its details
   */
  const selectRequest = useCallback(async (id: number | null): Promise<void> => {
    if (id === null) {
      setSelectedRequest(null)
      return
    }

    setError(null)
    startDetailTransition(async () => {
      try {
        const detail = await registrationRequestService.getById(id)
        setSelectedRequest(detail)
      } catch {
        setError('Error al cargar el detalle de la solicitud')
        setSelectedRequest(null)
      }
    })
  }, [])

  /**
   * Approve a registration request
   */
  const approveRequest = useCallback(async (id: number): Promise<boolean> => {
    setError(null)

    return new Promise((resolve) => {
      startActionTransition(async () => {
        addOptimisticAction({ type: 'approve', id })
        try {
          const result = await registrationRequestService.approve(id)

          // Update local state with new user_id, organization_id and active status
          setRequests((prev) =>
            prev.map((req) =>
              req.id === id
                ? {
                    ...req,
                    status: 'approved' as RegistrationRequestStatus,
                    user_id: result.user_id,
                    organization_id: result.organization_id,
                    user_status: 'active',
                    organization_status: 'active',
                  }
                : req
            )
          )

          // Clear selection if this was the selected request
          if (selectedRequest?.id === id) {
            setSelectedRequest(null)
          }

          resolve(true)
        } catch {
          setError('Error al aprobar la solicitud')
          resolve(false)
        }
      })
    })
  }, [selectedRequest?.id, addOptimisticAction])

  /**
   * Reject a registration request
   */
  const rejectRequest = useCallback(async (id: number, reason: string): Promise<boolean> => {
    setError(null)

    return new Promise((resolve) => {
      startActionTransition(async () => {
        addOptimisticAction({ type: 'reject', id, reason })
        try {
          await registrationRequestService.reject(id, reason)

          // Update local state
          setRequests((prev) =>
            prev.map((req) =>
              req.id === id
                ? { ...req, status: 'rejected' as RegistrationRequestStatus, rejection_reason: reason }
                : req
            )
          )

          // Clear selection if this was the selected request
          if (selectedRequest?.id === id) {
            setSelectedRequest(null)
          }

          resolve(true)
        } catch {
          setError('Error al rechazar la solicitud')
          resolve(false)
        }
      })
    })
  }, [selectedRequest?.id, addOptimisticAction])

  /**
   * Suspend an approved registration request
   */
  const suspendRequest = useCallback(async (id: number): Promise<boolean> => {
    setError(null)

    return new Promise((resolve) => {
      startActionTransition(async () => {
        addOptimisticAction({ type: 'suspend', id })
        try {
          const updated = await registrationRequestService.suspend(id)

          // Update local state with new user_status
          setRequests((prev) =>
            prev.map((req) =>
              req.id === id ? { ...req, user_status: updated.user_status, organization_status: updated.organization_status } : req
            )
          )

          // Clear selection if this was the selected request
          if (selectedRequest?.id === id) {
            setSelectedRequest(null)
          }

          resolve(true)
        } catch {
          setError('Error al suspender la solicitud')
          resolve(false)
        }
      })
    })
  }, [selectedRequest?.id, addOptimisticAction])

  /**
   * Unsuspend (reactivate) a suspended registration request
   */
  const unsuspendRequest = useCallback(async (id: number): Promise<boolean> => {
    setError(null)

    return new Promise((resolve) => {
      startActionTransition(async () => {
        addOptimisticAction({ type: 'unsuspend', id })
        try {
          const updated = await registrationRequestService.unsuspend(id)

          // Update local state with new user_status
          setRequests((prev) =>
            prev.map((req) =>
              req.id === id ? { ...req, user_status: updated.user_status, organization_status: updated.organization_status } : req
            )
          )

          // Clear selection if this was the selected request
          if (selectedRequest?.id === id) {
            setSelectedRequest(null)
          }

          resolve(true)
        } catch {
          setError('Error al reactivar la solicitud')
          resolve(false)
        }
      })
    })
  }, [selectedRequest?.id, addOptimisticAction])

  /**
   * Delete a suspended registration request (soft delete user + organization)
   */
  const deleteRequest = useCallback(async (id: number): Promise<boolean> => {
    setError(null)

    return new Promise((resolve) => {
      startActionTransition(async () => {
        addOptimisticAction({ type: 'delete', id })
        try {
          await registrationRequestService.delete(id)

          // Update local state - mark as deleted (soft delete)
          setRequests((prev) =>
            prev.map((req) =>
              req.id === id
                ? { ...req, is_deleted: true }
                : req
            )
          )

          // Clear selection if this was the selected request
          if (selectedRequest?.id === id) {
            setSelectedRequest(null)
          }

          resolve(true)
        } catch {
          setError('Error al eliminar el usuario y organización')
          resolve(false)
        }
      })
    })
  }, [selectedRequest?.id, addOptimisticAction])

  /**
   * Refresh the requests list
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchRequests()
  }, [fetchRequests])

  /**
   * Clear error state
   */
  const clearError = useCallback((): void => {
    setError(null)
  }, [])

  // Initial fetch and refetch on filter change
  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  // Backward compatibility: map transition states to original names
  const loading = isLoadingPending
  const detailLoading = isDetailPending
  const actionLoading = isActionPending

  return {
    requests: optimisticRequests,
    selectedRequest,
    loading,
    detailLoading,
    actionLoading,
    error,
    displayFilter,
    setDisplayFilter,
    selectRequest,
    approveRequest: approveRequest,
    rejectRequest: rejectRequest,
    suspendRequest: suspendRequest,
    unsuspendRequest: unsuspendRequest,
    deleteRequest: deleteRequest,
    refresh,
    clearError,
  }
}

export default useRegistrationRequests
