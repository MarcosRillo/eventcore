'use client'

/**
 * useRegistrationRequests Hook
 *
 * Manages state and actions for registration requests admin panel.
 * Uses SWR for data fetching with React 19 useTransition + useOptimistic for mutations.
 */

import { useCallback, useMemo, useOptimistic, useState, useTransition } from 'react'
import useSWR from 'swr'

import { useAuth } from '@/context/AuthContext'
import registrationRequestService from '@/features/registration-requests/services/registration-request.service'
import {
  DisplayStatusFilter,
  RegistrationRequest,
  RegistrationRequestDetail,
  RegistrationRequestsResponse,
  RegistrationRequestStatus,
} from '@/features/registration-requests/types/registration-request.types'
import { apiFetcher, registrationRequestKeys } from '@/lib/swr'

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
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // SWR key: null disables fetching when not authenticated
  const swrKey = useMemo(() => {
    if (!isAuthenticated || authLoading) return null
    return registrationRequestKeys.list('')
  }, [isAuthenticated, authLoading])

  const { data, error: swrError, isLoading, mutate } = useSWR<RegistrationRequestsResponse>(
    swrKey,
    apiFetcher,
  )

  // Extract the array from the API response wrapper
  const requests = useMemo(() => data?.data ?? [], [data])
  const [optimisticRequests, addOptimisticAction] = useOptimistic(requests, optimisticReducer)

  // Detail and action state
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequestDetail | null>(null)
  const [isDetailPending, startDetailTransition] = useTransition()
  const [isActionPending, startActionTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Filter state (filtering happens on frontend)
  const [displayFilter, setDisplayFilter] = useState<DisplayStatusFilter>('default')

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
          await registrationRequestService.approve(id)

          // Clear selection if this was the selected request
          if (selectedRequest?.id === id) {
            setSelectedRequest(null)
          }

          // Revalidate SWR cache to get fresh server data
          await mutate()

          resolve(true)
        } catch {
          setError('Error al aprobar la solicitud')
          // Revalidate to revert optimistic update
          await mutate()
          resolve(false)
        }
      })
    })
  }, [selectedRequest?.id, addOptimisticAction, mutate])

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

          // Clear selection if this was the selected request
          if (selectedRequest?.id === id) {
            setSelectedRequest(null)
          }

          // Revalidate SWR cache to get fresh server data
          await mutate()

          resolve(true)
        } catch {
          setError('Error al rechazar la solicitud')
          // Revalidate to revert optimistic update
          await mutate()
          resolve(false)
        }
      })
    })
  }, [selectedRequest?.id, addOptimisticAction, mutate])

  /**
   * Suspend an approved registration request
   */
  const suspendRequest = useCallback(async (id: number): Promise<boolean> => {
    setError(null)

    return new Promise((resolve) => {
      startActionTransition(async () => {
        addOptimisticAction({ type: 'suspend', id })
        try {
          await registrationRequestService.suspend(id)

          // Clear selection if this was the selected request
          if (selectedRequest?.id === id) {
            setSelectedRequest(null)
          }

          // Revalidate SWR cache to get fresh server data
          await mutate()

          resolve(true)
        } catch {
          setError('Error al suspender la solicitud')
          // Revalidate to revert optimistic update
          await mutate()
          resolve(false)
        }
      })
    })
  }, [selectedRequest?.id, addOptimisticAction, mutate])

  /**
   * Unsuspend (reactivate) a suspended registration request
   */
  const unsuspendRequest = useCallback(async (id: number): Promise<boolean> => {
    setError(null)

    return new Promise((resolve) => {
      startActionTransition(async () => {
        addOptimisticAction({ type: 'unsuspend', id })
        try {
          await registrationRequestService.unsuspend(id)

          // Clear selection if this was the selected request
          if (selectedRequest?.id === id) {
            setSelectedRequest(null)
          }

          // Revalidate SWR cache to get fresh server data
          await mutate()

          resolve(true)
        } catch {
          setError('Error al reactivar la solicitud')
          // Revalidate to revert optimistic update
          await mutate()
          resolve(false)
        }
      })
    })
  }, [selectedRequest?.id, addOptimisticAction, mutate])

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

          // Clear selection if this was the selected request
          if (selectedRequest?.id === id) {
            setSelectedRequest(null)
          }

          // Revalidate SWR cache to get fresh server data
          await mutate()

          resolve(true)
        } catch {
          setError('Error al eliminar el usuario y organización')
          // Revalidate to revert optimistic update
          await mutate()
          resolve(false)
        }
      })
    })
  }, [selectedRequest?.id, addOptimisticAction, mutate])

  /**
   * Refresh the requests list via SWR revalidation
   */
  const refresh = useCallback(async (): Promise<void> => {
    await mutate()
  }, [mutate])

  /**
   * Clear error state
   */
  const clearError = useCallback((): void => {
    setError(null)
  }, [])

  // Map SWR/transition states to return interface
  const loading = isLoading
  const detailLoading = isDetailPending
  const actionLoading = isActionPending

  return {
    requests: optimisticRequests,
    selectedRequest,
    loading,
    detailLoading,
    actionLoading,
    error: error ?? swrError?.message ?? null,
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
