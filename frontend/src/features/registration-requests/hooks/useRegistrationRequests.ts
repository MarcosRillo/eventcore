'use client'

/**
 * useRegistrationRequests Hook
 * Manages state and actions for registration requests admin panel
 */

import { useState, useCallback, useEffect } from 'react'

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

export const useRegistrationRequests = (): UseRegistrationRequestsReturn => {
  // Data state
  const [requests, setRequests] = useState<RegistrationRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequestDetail | null>(null)

  // UI state
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter state (filtering happens on frontend)
  const [displayFilter, setDisplayFilter] = useState<DisplayStatusFilter>('default')

  /**
   * Fetch all registration requests (no backend filtering)
   */
  const fetchRequests = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      // Fetch all requests - filtering happens on frontend
      const data = await registrationRequestService.getAll({})
      setRequests(data)
    } catch {
      setError('Error al cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Select a request and load its details
   */
  const selectRequest = useCallback(async (id: number | null): Promise<void> => {
    if (id === null) {
      setSelectedRequest(null)
      return
    }

    setDetailLoading(true)
    setError(null)

    try {
      const detail = await registrationRequestService.getById(id)
      setSelectedRequest(detail)
    } catch {
      setError('Error al cargar el detalle de la solicitud')
      setSelectedRequest(null)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  /**
   * Approve a registration request
   */
  const approveRequest = useCallback(async (id: number): Promise<boolean> => {
    setActionLoading(true)
    setError(null)

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

      return true
    } catch {
      setError('Error al aprobar la solicitud')
      return false
    } finally {
      setActionLoading(false)
    }
  }, [selectedRequest?.id])

  /**
   * Reject a registration request
   */
  const rejectRequest = useCallback(async (id: number, reason: string): Promise<boolean> => {
    setActionLoading(true)
    setError(null)

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

      return true
    } catch {
      setError('Error al rechazar la solicitud')
      return false
    } finally {
      setActionLoading(false)
    }
  }, [selectedRequest?.id])

  /**
   * Suspend an approved registration request
   */
  const suspendRequest = useCallback(async (id: number): Promise<boolean> => {
    setActionLoading(true)
    setError(null)

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

      return true
    } catch {
      setError('Error al suspender la solicitud')
      return false
    } finally {
      setActionLoading(false)
    }
  }, [selectedRequest?.id])

  /**
   * Unsuspend (reactivate) a suspended registration request
   */
  const unsuspendRequest = useCallback(async (id: number): Promise<boolean> => {
    setActionLoading(true)
    setError(null)

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

      return true
    } catch {
      setError('Error al reactivar la solicitud')
      return false
    } finally {
      setActionLoading(false)
    }
  }, [selectedRequest?.id])

  /**
   * Delete a suspended registration request (soft delete user + organization)
   */
  const deleteRequest = useCallback(async (id: number): Promise<boolean> => {
    setActionLoading(true)
    setError(null)

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

      return true
    } catch {
      setError('Error al eliminar el usuario y organización')
      return false
    } finally {
      setActionLoading(false)
    }
  }, [selectedRequest?.id])

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

  return {
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
    refresh,
    clearError,
  }
}

export default useRegistrationRequests
