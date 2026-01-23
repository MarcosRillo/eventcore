import { act, renderHook, waitFor } from '@testing-library/react'

import { useInvitations } from '@/features/invitations/hooks/useInvitations'
import invitationService from '@/features/invitations/services/invitation.service'
import { Invitation } from '@/features/invitations/types/invitation.types'

jest.mock('../../services/invitation.service')

const mockInvitationService = invitationService as jest.Mocked<typeof invitationService>

describe('useInvitations', () => {
  const mockInvitation: Invitation = {
    id: 1,
    email: 'test@example.com',
    role: 'Entity Administrator',
    invited_by: 'Admin User',
    expires_at: '2025-12-15T00:00:00Z',
    created_at: '2025-11-28T00:00:00Z',
  }

  const mockInvitation2: Invitation = {
    id: 2,
    email: 'test2@example.com',
    role: 'Entity Staff',
    invited_by: 'Admin User',
    expires_at: '2025-12-15T00:00:00Z',
    created_at: '2025-11-28T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state and fetching', () => {
    it('should fetch invitations on mount', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation])

      const { result } = renderHook(() => useInvitations())

      expect(result.current.loading).toBe(true)
      expect(result.current.invitations).toEqual([])

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.invitations).toEqual([mockInvitation])
      expect(result.current.error).toBeNull()
      expect(mockInvitationService.getInvitations).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch error', async () => {
      mockInvitationService.getInvitations.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useInvitations())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.invitations).toEqual([])
      expect(result.current.error).toBe('Error al cargar las invitaciones')
    })

    it('should return empty array when no invitations', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([])

      const { result } = renderHook(() => useInvitations())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.invitations).toEqual([])
      expect(result.current.error).toBeNull()
    })
  })

  describe('handleResend', () => {
    it('should resend invitation and update list', async () => {
      const updatedInvitation = { ...mockInvitation, expires_at: '2025-12-16T00:00:00Z' }
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation])
      mockInvitationService.resendInvitation.mockResolvedValueOnce(updatedInvitation)

      const { result } = renderHook(() => useInvitations())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let success: boolean = false
      await act(async () => {
        success = await result.current.handleResend(1)
      })

      expect(success).toBe(true)
      expect(mockInvitationService.resendInvitation).toHaveBeenCalledWith(1)
      expect(result.current.invitations[0].expires_at).toBe('2025-12-16T00:00:00Z')
      expect(result.current.error).toBeNull()
    })

    it('should set resendingId while resending', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation])

      let resendResolve: (value: Invitation) => void
      mockInvitationService.resendInvitation.mockReturnValueOnce(
        new Promise((resolve) => { resendResolve = resolve })
      )

      const { result } = renderHook(() => useInvitations())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleResend(1)
      })

      expect(result.current.resendingId).toBe(1)

      await act(async () => {
        resendResolve!(mockInvitation)
      })

      expect(result.current.resendingId).toBeNull()
    })

    it('should handle resend error', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation])
      mockInvitationService.resendInvitation.mockRejectedValueOnce(new Error('Cannot resend'))

      const { result } = renderHook(() => useInvitations())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let success: boolean = true
      await act(async () => {
        success = await result.current.handleResend(1)
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Error al reenviar la invitación')
    })
  })

  describe('handleCancel', () => {
    it('should cancel invitation and remove from list', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation, mockInvitation2])
      mockInvitationService.cancelInvitation.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useInvitations())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.invitations).toHaveLength(2)

      let success: boolean = false
      await act(async () => {
        success = await result.current.handleCancel(1)
      })

      expect(success).toBe(true)
      expect(mockInvitationService.cancelInvitation).toHaveBeenCalledWith(1)
      expect(result.current.invitations).toHaveLength(1)
      expect(result.current.invitations[0].id).toBe(2)
    })

    it('should set cancellingId while cancelling', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation])

      let cancelResolve: () => void
      mockInvitationService.cancelInvitation.mockReturnValueOnce(
        new Promise((resolve) => { cancelResolve = resolve })
      )

      const { result } = renderHook(() => useInvitations())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleCancel(1)
      })

      expect(result.current.cancellingId).toBe(1)

      await act(async () => {
        cancelResolve!()
      })

      expect(result.current.cancellingId).toBeNull()
    })

    it('should handle cancel error', async () => {
      mockInvitationService.getInvitations.mockResolvedValueOnce([mockInvitation])
      mockInvitationService.cancelInvitation.mockRejectedValueOnce(new Error('Cannot cancel'))

      const { result } = renderHook(() => useInvitations())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let success: boolean = true
      await act(async () => {
        success = await result.current.handleCancel(1)
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Error al cancelar la invitación')
      // Invitation should still be in the list
      expect(result.current.invitations).toHaveLength(1)
    })
  })

  describe('clearError', () => {
    it('should clear error', async () => {
      mockInvitationService.getInvitations.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useInvitations())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Error al cargar las invitaciones')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('fetchInvitations', () => {
    it('should allow manual refetch', async () => {
      mockInvitationService.getInvitations
        .mockResolvedValueOnce([mockInvitation])
        .mockResolvedValueOnce([mockInvitation, mockInvitation2])

      const { result } = renderHook(() => useInvitations())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.invitations).toHaveLength(1)

      await act(async () => {
        await result.current.fetchInvitations()
      })

      expect(result.current.invitations).toHaveLength(2)
      expect(mockInvitationService.getInvitations).toHaveBeenCalledTimes(2)
    })
  })
})
