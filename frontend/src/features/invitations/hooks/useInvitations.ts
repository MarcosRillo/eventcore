'use client'

/**
 * useInvitations Hook
 *
 * Manages invitation state and operations.
 * Uses React 19 useTransition for loading states and useOptimistic for cancel.
 */

import { useCallback, useEffect, useOptimistic,useState, useTransition } from 'react'

import invitationService from '@/features/invitations/services/invitation.service'
import { AssignableRole, Invitation, SendInvitationData } from '@/features/invitations/types/invitation.types'

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
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [optimisticInvitations, addOptimisticAction] = useOptimistic(invitations, optimisticReducer)
  const [roles, setRoles] = useState<AssignableRole[]>([])

  // React 19 transitions for non-blocking UI
  const [, startLoadingTransition] = useTransition()
  const [, startRolesTransition] = useTransition()
  const [isCreatingPending, startCreatingTransition] = useTransition()
  const [isActionPending, startActionTransition] = useTransition()

  // Manual loading states for reliable test behavior
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)
  const [actionType, setActionType] = useState<'resend' | 'cancel' | null>(null)

  const fetchInvitations = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    startLoadingTransition(async () => {
      try {
        const data = await invitationService.getInvitations()
        setInvitations(data)
      } catch {
        setError('Error al cargar las invitaciones')
      } finally {
        setIsLoading(false)
      }
    })
  }, [])

  const fetchRoles = useCallback(async () => {
    setIsLoadingRoles(true)
    startRolesTransition(async () => {
      try {
        const data = await invitationService.getAssignableRoles()
        setRoles(data)
      } catch {
        setError('Error al cargar los roles')
      } finally {
        setIsLoadingRoles(false)
      }
    })
  }, [])

  const handleCreate = useCallback(async (data: SendInvitationData): Promise<boolean> => {
    setError(null)

    return new Promise((resolve) => {
      startCreatingTransition(async () => {
        try {
          const newInvitation = await invitationService.sendInvitation(data)
          setInvitations((prev) => [newInvitation, ...prev])
          resolve(true)
        } catch {
          setError('Error al crear la invitación')
          resolve(false)
        }
      })
    })
  }, [])

  const handleResend = useCallback(async (id: number): Promise<boolean> => {
    setError(null)
    setActionId(id)
    setActionType('resend')

    return new Promise((resolve) => {
      startActionTransition(async () => {
        try {
          const updatedInvitation = await invitationService.resendInvitation(id)
          setInvitations((prev) =>
            prev.map((inv) => (inv.id === id ? updatedInvitation : inv))
          )
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
  }, [])

  const handleCancel = useCallback(async (id: number): Promise<boolean> => {
    setError(null)
    setActionId(id)
    setActionType('cancel')

    return new Promise((resolve) => {
      startActionTransition(async () => {
        addOptimisticAction({ type: 'cancel', id })
        try {
          await invitationService.cancelInvitation(id)
          setInvitations((prev) => prev.filter((inv) => inv.id !== id))
          setActionId(null)
          setActionType(null)
          resolve(true)
        } catch {
          setError('Error al cancelar la invitación')
          setActionId(null)
          setActionType(null)
          resolve(false)
        }
      })
    })
  }, [addOptimisticAction])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    fetchInvitations()
    fetchRoles()
  }, [fetchInvitations, fetchRoles])

  // Backward compatibility: map states to original names
  const loading = isLoading
  const loadingRoles = isLoadingRoles
  const creating = isCreatingPending
  const resendingId = isActionPending && actionType === 'resend' ? actionId : null
  const cancellingId = isActionPending && actionType === 'cancel' ? actionId : null

  return {
    invitations: optimisticInvitations,
    roles,
    loading,
    loadingRoles,
    creating,
    error,
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
