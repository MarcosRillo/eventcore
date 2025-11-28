'use client'

import { useState, useCallback, useEffect } from 'react'
import { Invitation } from '../types/invitation.types'
import invitationService from '../services/invitation.service'

interface UseInvitationsReturn {
  invitations: Invitation[]
  loading: boolean
  error: string | null
  resendingId: number | null
  cancellingId: number | null
  fetchInvitations: () => Promise<void>
  handleResend: (id: number) => Promise<boolean>
  handleCancel: (id: number) => Promise<boolean>
  clearError: () => void
}

export const useInvitations = (): UseInvitationsReturn => {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendingId, setResendingId] = useState<number | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  const fetchInvitations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await invitationService.getInvitations()
      setInvitations(data)
    } catch {
      setError('Error al cargar las invitaciones')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleResend = useCallback(async (id: number): Promise<boolean> => {
    setResendingId(id)
    setError(null)
    try {
      const updatedInvitation = await invitationService.resendInvitation(id)
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === id ? updatedInvitation : inv))
      )
      return true
    } catch {
      setError('Error al reenviar la invitación')
      return false
    } finally {
      setResendingId(null)
    }
  }, [])

  const handleCancel = useCallback(async (id: number): Promise<boolean> => {
    setCancellingId(id)
    setError(null)
    try {
      await invitationService.cancelInvitation(id)
      setInvitations((prev) => prev.filter((inv) => inv.id !== id))
      return true
    } catch {
      setError('Error al cancelar la invitación')
      return false
    } finally {
      setCancellingId(null)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations])

  return {
    invitations,
    loading,
    error,
    resendingId,
    cancellingId,
    fetchInvitations,
    handleResend,
    handleCancel,
    clearError,
  }
}

export default useInvitations
