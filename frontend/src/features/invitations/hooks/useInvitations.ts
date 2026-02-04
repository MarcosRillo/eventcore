'use client'

/**
 * useInvitations Hook
 *
 * Manages invitation state and operations.
 * Uses SWR for data fetching, React 19 useTransition for loading states,
 * and useOptimistic for cancel.
 */

import { useCallback, useMemo, useOptimistic, useState, useTransition } from 'react'
import useSWR from 'swr'

import invitationService from '@/features/invitations/services/invitation.service'
import {
  AssignableRole,
  Invitation,
  InvitationsListResponse,
  RolesListResponse,
  SendInvitationData,
} from '@/features/invitations/types/invitation.types'
import { apiFetcher, invitationKeys } from '@/lib/swr'

interface UseInvitationsReturn {
  invitations: Invitation[]
  roles: AssignableRole[]
  loading: boolean
  loadingRoles: boolean
  creating: boolean
  error: string | null
  resendingId: number | null
  cancellingId: number | null
  fetchInvitations: () => Promise<void>
  fetchRoles: () => Promise<void>
  handleCreate: (data: SendInvitationData) => Promise<boolean>
  handleResend: (id: number) => Promise<boolean>
  handleCancel: (id: number) => Promise<boolean>
  clearError: () => void
}

type OptimisticAction = { type: 'cancel'; id: number }

function optimisticReducer(invitations: Invitation[], action: OptimisticAction): Invitation[] {
  switch (action.type) {
    case 'cancel':
      return invitations.filter((inv) => inv.id !== action.id)
    default:
      return invitations
  }
}

export const useInvitations = (): UseInvitationsReturn => {
  // SWR for data fetching
  const {
    data: invitationsData,
    error: invError,
    isLoading: invLoading,
    mutate: mutateInvitations,
  } = useSWR<InvitationsListResponse>(invitationKeys.list, apiFetcher)

  const {
    data: rolesData,
    error: rolesError,
    isLoading: rolesLoading,
    mutate: mutateRoles,
  } = useSWR<RolesListResponse>(invitationKeys.roles, apiFetcher)

  // Derive arrays from SWR data
  const invitations = useMemo(() => invitationsData?.data ?? [], [invitationsData])
  const roles = useMemo(() => rolesData?.data ?? [], [rolesData])

  // Optimistic updates for cancel
  const [optimisticInvitations, addOptimisticAction] = useOptimistic(invitations, optimisticReducer)

  // React 19 transitions for non-blocking UI
  const [isCreatingPending, startCreatingTransition] = useTransition()
  const [isActionPending, startActionTransition] = useTransition()

  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)
  const [actionType, setActionType] = useState<'resend' | 'cancel' | null>(null)

  const handleCreate = useCallback(async (data: SendInvitationData): Promise<boolean> => {
    setError(null)

    return new Promise((resolve) => {
      startCreatingTransition(async () => {
        try {
          await invitationService.sendInvitation(data)
          await mutateInvitations()
          resolve(true)
        } catch {
          setError('Error al crear la invitación')
          resolve(false)
        }
      })
    })
  }, [mutateInvitations])

  const handleResend = useCallback(async (id: number): Promise<boolean> => {
    setError(null)
    setActionId(id)
    setActionType('resend')

    return new Promise((resolve) => {
      startActionTransition(async () => {
        try {
          await invitationService.resendInvitation(id)
          await mutateInvitations()
          setActionId(null)
          setActionType(null)
          resolve(true)
        } catch {
          setError('Error al reenviar la invitación')
          setActionId(null)
          setActionType(null)
          resolve(false)
        }
      })
    })
  }, [mutateInvitations])

  const handleCancel = useCallback(async (id: number): Promise<boolean> => {
    setError(null)
    setActionId(id)
    setActionType('cancel')

    return new Promise((resolve) => {
      startActionTransition(async () => {
        addOptimisticAction({ type: 'cancel', id })
        try {
          await invitationService.cancelInvitation(id)
          await mutateInvitations()
          setActionId(null)
          setActionType(null)
          resolve(true)
        } catch {
          setError('Error al cancelar la invitación')
          await mutateInvitations()
          setActionId(null)
          setActionType(null)
          resolve(false)
        }
      })
    })
  }, [addOptimisticAction, mutateInvitations])

  const clearError = useCallback(() => {
    setError(null)
    // Revalidate to clear SWR errors on next successful fetch
    mutateInvitations()
    mutateRoles()
  }, [mutateInvitations, mutateRoles])

  // Backward compatibility: map SWR mutate to fetch functions
  const fetchInvitations = useCallback(async () => {
    await mutateInvitations()
  }, [mutateInvitations])

  const fetchRoles = useCallback(async () => {
    await mutateRoles()
  }, [mutateRoles])

  // Backward compatibility: map states to original names
  const loading = invLoading
  const loadingRoles = rolesLoading
  const creating = isCreatingPending
  const resendingId = isActionPending && actionType === 'resend' ? actionId : null
  const cancellingId = isActionPending && actionType === 'cancel' ? actionId : null

  // Combine errors: manual errors take precedence, then SWR fetch errors
  const combinedError = error ?? invError?.message ?? rolesError?.message ?? null

  return {
    invitations: optimisticInvitations,
    roles,
    loading,
    loadingRoles,
    creating,
    error: combinedError,
    resendingId,
    cancellingId,
    fetchInvitations,
    fetchRoles,
    handleCreate,
    handleResend,
    handleCancel,
    clearError,
  }
}

export default useInvitations
