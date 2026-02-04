import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { SWRConfig } from 'swr'

import { useInvitations } from '@/features/invitations/hooks/useInvitations'
import invitationService from '@/features/invitations/services/invitation.service'
import { Invitation } from '@/features/invitations/types/invitation.types'

jest.mock('@/lib/swr/fetcher', () => ({
  apiFetcher: jest.fn(),
}))

jest.mock('../../services/invitation.service')

import { apiFetcher } from '@/lib/swr/fetcher'

const mockedFetcher = apiFetcher as jest.Mock
const mockInvitationService = invitationService as jest.Mocked<typeof invitationService>

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
)

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

  const mockRoles = [
    { id: 1, role_code: 'entity_admin', role_name: 'Entity Administrator' },
    { id: 2, role_code: 'entity_staff', role_name: 'Entity Staff' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // Default: return empty invitations and roles
    mockedFetcher.mockImplementation((url: string) => {
      if (url === '/invitations') {
        return Promise.resolve({ data: [] })
      }
      if (url === '/roles/assignable') {
        return Promise.resolve({ data: mockRoles })
      }
      return Promise.resolve({ data: [] })
    })
  })

  describe('initial state and fetching', () => {
    it('should fetch invitations on mount', async () => {
      mockedFetcher.mockImplementation((url: string) => {
        if (url === '/invitations') {
          return Promise.resolve({ data: [mockInvitation] })
        }
        if (url === '/roles/assignable') {
          return Promise.resolve({ data: mockRoles })
        }
        return Promise.resolve({ data: [] })
      })

      const { result } = renderHook(() => useInvitations(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.invitations).toEqual([mockInvitation])
      expect(result.current.error).toBeNull()
      expect(mockedFetcher).toHaveBeenCalled()
    })

    it('should handle fetch error', async () => {
      mockedFetcher.mockImplementation((url: string) => {
        if (url === '/invitations') {
          return Promise.reject(new Error('Error al cargar las invitaciones'))
        }
        if (url === '/roles/assignable') {
          return Promise.resolve({ data: mockRoles })
        }
        return Promise.resolve({ data: [] })
      })

      const { result } = renderHook(() => useInvitations(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.invitations).toEqual([])
      expect(result.current.error).toBe('Error al cargar las invitaciones')
    })

    it('should return empty array when no invitations', async () => {
      const { result } = renderHook(() => useInvitations(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.invitations).toEqual([])
      expect(result.current.error).toBeNull()
    })
  })

  describe('handleResend', () => {
    it('should resend invitation and revalidate list', async () => {
      const updatedInvitation = { ...mockInvitation, expires_at: '2025-12-16T00:00:00Z' }
      let callCount = 0
      mockedFetcher.mockImplementation((url: string) => {
        if (url === '/invitations') {
          callCount++
          // First call returns original, subsequent calls return updated
          if (callCount <= 1) {
            return Promise.resolve({ data: [mockInvitation] })
          }
          return Promise.resolve({ data: [updatedInvitation] })
        }
        if (url === '/roles/assignable') {
          return Promise.resolve({ data: mockRoles })
        }
        return Promise.resolve({ data: [] })
      })
      mockInvitationService.resendInvitation.mockResolvedValueOnce(updatedInvitation)

      const { result } = renderHook(() => useInvitations(), { wrapper })

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
      mockedFetcher.mockImplementation((url: string) => {
        if (url === '/invitations') {
          return Promise.resolve({ data: [mockInvitation] })
        }
        if (url === '/roles/assignable') {
          return Promise.resolve({ data: mockRoles })
        }
        return Promise.resolve({ data: [] })
      })

      let resendResolve: (value: Invitation) => void
      mockInvitationService.resendInvitation.mockReturnValueOnce(
        new Promise((resolve) => { resendResolve = resolve })
      )

      const { result } = renderHook(() => useInvitations(), { wrapper })

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
      mockedFetcher.mockImplementation((url: string) => {
        if (url === '/invitations') {
          return Promise.resolve({ data: [mockInvitation] })
        }
        if (url === '/roles/assignable') {
          return Promise.resolve({ data: mockRoles })
        }
        return Promise.resolve({ data: [] })
      })
      mockInvitationService.resendInvitation.mockRejectedValueOnce(new Error('Cannot resend'))

      const { result } = renderHook(() => useInvitations(), { wrapper })

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
    it('should cancel invitation and revalidate list', async () => {
      let callCount = 0
      mockedFetcher.mockImplementation((url: string) => {
        if (url === '/invitations') {
          callCount++
          if (callCount <= 1) {
            return Promise.resolve({ data: [mockInvitation, mockInvitation2] })
          }
          // After cancel, server returns only mockInvitation2
          return Promise.resolve({ data: [mockInvitation2] })
        }
        if (url === '/roles/assignable') {
          return Promise.resolve({ data: mockRoles })
        }
        return Promise.resolve({ data: [] })
      })
      mockInvitationService.cancelInvitation.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useInvitations(), { wrapper })

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
      mockedFetcher.mockImplementation((url: string) => {
        if (url === '/invitations') {
          return Promise.resolve({ data: [mockInvitation] })
        }
        if (url === '/roles/assignable') {
          return Promise.resolve({ data: mockRoles })
        }
        return Promise.resolve({ data: [] })
      })

      let cancelResolve: () => void
      mockInvitationService.cancelInvitation.mockReturnValueOnce(
        new Promise((resolve) => { cancelResolve = resolve })
      )

      const { result } = renderHook(() => useInvitations(), { wrapper })

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

    it('should handle cancel error and revalidate', async () => {
      mockedFetcher.mockImplementation((url: string) => {
        if (url === '/invitations') {
          return Promise.resolve({ data: [mockInvitation] })
        }
        if (url === '/roles/assignable') {
          return Promise.resolve({ data: mockRoles })
        }
        return Promise.resolve({ data: [] })
      })
      mockInvitationService.cancelInvitation.mockRejectedValueOnce(new Error('Cannot cancel'))

      const { result } = renderHook(() => useInvitations(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let success: boolean = true
      await act(async () => {
        success = await result.current.handleCancel(1)
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Error al cancelar la invitación')
      // Invitation should still be in the list after revalidation
      expect(result.current.invitations).toHaveLength(1)
    })
  })

  describe('clearError', () => {
    it('should clear action error', async () => {
      mockedFetcher.mockImplementation((url: string) => {
        if (url === '/invitations') {
          return Promise.resolve({ data: [mockInvitation] })
        }
        if (url === '/roles/assignable') {
          return Promise.resolve({ data: mockRoles })
        }
        return Promise.resolve({ data: [] })
      })
      // Trigger a local action error via a failed resend
      mockInvitationService.resendInvitation.mockRejectedValueOnce(new Error('fail'))

      const { result } = renderHook(() => useInvitations(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.handleResend(1)
      })

      expect(result.current.error).toBe('Error al reenviar la invitación')

      await act(async () => {
        result.current.clearError()
      })

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('fetchInvitations', () => {
    it('should allow manual refetch via SWR mutate', async () => {
      let callCount = 0
      mockedFetcher.mockImplementation((url: string) => {
        if (url === '/invitations') {
          callCount++
          if (callCount <= 1) {
            return Promise.resolve({ data: [mockInvitation] })
          }
          return Promise.resolve({ data: [mockInvitation, mockInvitation2] })
        }
        if (url === '/roles/assignable') {
          return Promise.resolve({ data: mockRoles })
        }
        return Promise.resolve({ data: [] })
      })

      const { result } = renderHook(() => useInvitations(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.invitations).toHaveLength(1)

      await act(async () => {
        await result.current.fetchInvitations()
      })

      expect(result.current.invitations).toHaveLength(2)
    })
  })
})
