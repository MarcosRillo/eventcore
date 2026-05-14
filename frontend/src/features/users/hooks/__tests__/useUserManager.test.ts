import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { SWRConfig } from 'swr'

import { useUserManager } from '@/features/users/hooks/useUserManager'
import userService from '@/features/users/services/user.service'
import type { User } from '@/features/users/types/user.types'
import { createMockPaginationMeta } from '@/test-utils/factories'

jest.mock('@/lib/swr/fetcher', () => ({
  apiFetcher: jest.fn(),
}))

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: 1, name: 'Test User', role: 'admin' },
  }),
}))

jest.mock('../../services/user.service')

import { apiFetcher } from '@/lib/swr/fetcher'

const mockedFetcher = apiFetcher as jest.Mock
const mockUserService = userService as jest.Mocked<typeof userService>

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children
  )

describe('useUserManager', () => {
  const mockUser: User = {
    id: 1,
    name: 'Patricia López',
    email: 'patricia.lopez@enteturismo.gov.ar',
    status: 'active',
    role: {
      id: 4,
      role_code: 'entity_staff',
      role_name: 'Entity Staff',
      description: 'Staff member',
      permissions: [],
    },
    created_at: '2025-11-28T00:00:00Z',
    updated_at: '2025-11-28T00:00:00Z',
  }

  const mockUser2: User = {
    id: 2,
    name: 'Miguel Sánchez',
    email: 'miguel.sanchez@enteturismo.gov.ar',
    status: 'suspended',
    role: {
      id: 4,
      role_code: 'entity_staff',
      role_name: 'Entity Staff',
      description: 'Staff member',
      permissions: [],
    },
    created_at: '2025-11-28T00:00:00Z',
    updated_at: '2025-11-28T00:00:00Z',
  }

  const mockPaginationMeta = createMockPaginationMeta({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 2,
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state and fetching', () => {
    it('should fetch users on mount', async () => {
      mockedFetcher.mockResolvedValueOnce({
        data: [mockUser, mockUser2],
        meta: mockPaginationMeta,
      })

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.users).toEqual([mockUser, mockUser2])
      expect(result.current.pagination).toEqual(mockPaginationMeta)
      expect(result.current.error).toBeNull()
      expect(mockedFetcher).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch error', async () => {
      mockedFetcher.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.users).toEqual([])
      expect(result.current.error).toBe('Network error')
    })

    it('should return empty array when no users', async () => {
      mockedFetcher.mockResolvedValueOnce({
        data: [],
        meta: { ...mockPaginationMeta, total: 0 },
      })

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.users).toEqual([])
      expect(result.current.error).toBeNull()
    })
  })

  describe('handleSuspend', () => {
    it('should suspend user and update list', async () => {
      const suspendedUser = { ...mockUser, status: 'suspended' as const }
      mockedFetcher
        .mockResolvedValueOnce({
          data: [mockUser, mockUser2],
          meta: mockPaginationMeta,
        })
        .mockResolvedValueOnce({
          data: [suspendedUser, mockUser2],
          meta: mockPaginationMeta,
        })
      mockUserService.suspendUser.mockResolvedValueOnce(suspendedUser)

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let success = false
      await act(async () => {
        success = await result.current.handleSuspend(1)
      })

      expect(success).toBe(true)
      expect(mockUserService.suspendUser).toHaveBeenCalledWith(1)
      expect(result.current.users[0].status).toBe('suspended')
      expect(result.current.error).toBeNull()
    })

    it('should set actionLoading while suspending', async () => {
      mockedFetcher.mockResolvedValueOnce({
        data: [mockUser],
        meta: mockPaginationMeta,
      })

      let suspendResolve: (value: User) => void
      mockUserService.suspendUser.mockReturnValueOnce(
        new Promise((resolve) => {
          suspendResolve = resolve
        })
      )

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleSuspend(1)
      })

      expect(result.current.actionLoading).toBe(1)

      mockedFetcher.mockResolvedValueOnce({
        data: [{ ...mockUser, status: 'suspended' }],
        meta: mockPaginationMeta,
      })

      await act(async () => {
        suspendResolve!({ ...mockUser, status: 'suspended' })
      })

      expect(result.current.actionLoading).toBeNull()
    })

    it('should handle suspend error', async () => {
      mockedFetcher
        .mockResolvedValueOnce({
          data: [mockUser],
          meta: mockPaginationMeta,
        })
        .mockResolvedValueOnce({
          data: [mockUser],
          meta: mockPaginationMeta,
        })
      mockUserService.suspendUser.mockRejectedValueOnce(new Error('Cannot suspend'))

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let success = true
      await act(async () => {
        success = await result.current.handleSuspend(1)
      })

      expect(success).toBe(false)
    })
  })

  describe('handleUnsuspend', () => {
    it('should unsuspend user and update list', async () => {
      const activeUser = { ...mockUser2, status: 'active' as const }
      mockedFetcher
        .mockResolvedValueOnce({
          data: [mockUser2],
          meta: mockPaginationMeta,
        })
        .mockResolvedValueOnce({
          data: [activeUser],
          meta: mockPaginationMeta,
        })
      mockUserService.unsuspendUser.mockResolvedValueOnce(activeUser)

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let success = false
      await act(async () => {
        success = await result.current.handleUnsuspend(2)
      })

      expect(success).toBe(true)
      expect(mockUserService.unsuspendUser).toHaveBeenCalledWith(2)
      expect(result.current.users[0].status).toBe('active')
    })

    it('should handle unsuspend error', async () => {
      mockedFetcher
        .mockResolvedValueOnce({
          data: [mockUser2],
          meta: mockPaginationMeta,
        })
        .mockResolvedValueOnce({
          data: [mockUser2],
          meta: mockPaginationMeta,
        })
      mockUserService.unsuspendUser.mockRejectedValueOnce(new Error('Cannot unsuspend'))

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let success = true
      await act(async () => {
        success = await result.current.handleUnsuspend(2)
      })

      expect(success).toBe(false)
    })
  })

  describe('handleDelete', () => {
    it('should delete user and remove from list', async () => {
      mockedFetcher
        .mockResolvedValueOnce({
          data: [mockUser, mockUser2],
          meta: mockPaginationMeta,
        })
        .mockResolvedValueOnce({
          data: [mockUser2],
          meta: { ...mockPaginationMeta, total: 1 },
        })
      mockUserService.deleteUser.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.users).toHaveLength(2)

      let success = false
      await act(async () => {
        success = await result.current.handleDelete(1)
      })

      expect(success).toBe(true)
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(1)
    })

    it('should handle delete error', async () => {
      mockedFetcher
        .mockResolvedValueOnce({
          data: [mockUser],
          meta: mockPaginationMeta,
        })
        .mockResolvedValueOnce({
          data: [mockUser],
          meta: mockPaginationMeta,
        })
      mockUserService.deleteUser.mockRejectedValueOnce(new Error('Cannot delete'))

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let success = true
      await act(async () => {
        success = await result.current.handleDelete(1)
      })

      expect(success).toBe(false)
      expect(result.current.users).toHaveLength(1)
    })
  })

  describe('handleUpdate', () => {
    it('should update user and update list', async () => {
      const updatedUser = { ...mockUser, name: 'Patricia López Updated' }
      mockedFetcher
        .mockResolvedValueOnce({
          data: [mockUser],
          meta: mockPaginationMeta,
        })
        .mockResolvedValueOnce({
          data: [updatedUser],
          meta: mockPaginationMeta,
        })
      mockUserService.updateUser.mockResolvedValueOnce(updatedUser)

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let success = false
      await act(async () => {
        success = await result.current.handleUpdate(1, {
          name: 'Patricia López Updated',
          email: mockUser.email,
        })
      })

      expect(success).toBe(true)
      expect(mockUserService.updateUser).toHaveBeenCalledWith(1, {
        name: 'Patricia López Updated',
        email: mockUser.email,
      })
      expect(result.current.users[0].name).toBe('Patricia López Updated')
    })

    it('should close edit modal after successful update', async () => {
      const updatedUser = { ...mockUser, name: 'Patricia López Updated' }
      mockedFetcher
        .mockResolvedValueOnce({
          data: [mockUser],
          meta: mockPaginationMeta,
        })
        .mockResolvedValueOnce({
          data: [updatedUser],
          meta: mockPaginationMeta,
        })
      mockUserService.updateUser.mockResolvedValueOnce(updatedUser)

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleOpenEdit(mockUser)
      })

      expect(result.current.editingUser).toEqual(mockUser)

      await act(async () => {
        await result.current.handleUpdate(1, {
          name: 'Patricia López Updated',
          email: mockUser.email,
        })
      })

      expect(result.current.editingUser).toBeNull()
    })

    it('should handle update error', async () => {
      mockedFetcher
        .mockResolvedValueOnce({
          data: [mockUser],
          meta: mockPaginationMeta,
        })
        .mockResolvedValueOnce({
          data: [mockUser],
          meta: mockPaginationMeta,
        })
      mockUserService.updateUser.mockRejectedValueOnce(new Error('Cannot update'))

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let success = true
      await act(async () => {
        success = await result.current.handleUpdate(1, {
          name: 'New Name',
          email: 'new@email.com',
        })
      })

      expect(success).toBe(false)
    })
  })

  describe('handleOpenEdit and handleCloseEdit', () => {
    it('should open edit modal with user', async () => {
      mockedFetcher.mockResolvedValueOnce({
        data: [mockUser],
        meta: mockPaginationMeta,
      })

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.editingUser).toBeNull()

      act(() => {
        result.current.handleOpenEdit(mockUser)
      })

      expect(result.current.editingUser).toEqual(mockUser)
    })

    it('should close edit modal', async () => {
      mockedFetcher.mockResolvedValueOnce({
        data: [mockUser],
        meta: mockPaginationMeta,
      })

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleOpenEdit(mockUser)
      })

      expect(result.current.editingUser).not.toBeNull()

      act(() => {
        result.current.handleCloseEdit()
      })

      expect(result.current.editingUser).toBeNull()
    })
  })

  describe('setFilters', () => {
    it('should update filters and trigger refetch', async () => {
      mockedFetcher
        .mockResolvedValueOnce({
          data: [mockUser, mockUser2],
          meta: mockPaginationMeta,
        })
        .mockResolvedValueOnce({
          data: [mockUser2],
          meta: { ...mockPaginationMeta, total: 1 },
        })

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.users).toHaveLength(2)

      act(() => {
        result.current.setFilters({ status: 'suspended' })
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.filters.status).toBe('suspended')
    })
  })

  describe('clearError', () => {
    it('should clear error by revalidating', async () => {
      mockedFetcher
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: [mockUser],
          meta: mockPaginationMeta,
        })

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')

      await act(async () => {
        result.current.clearError()
      })

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('fetchUsers', () => {
    it('should allow manual refetch', async () => {
      mockedFetcher
        .mockResolvedValueOnce({
          data: [mockUser],
          meta: mockPaginationMeta,
        })
        .mockResolvedValueOnce({
          data: [mockUser, mockUser2],
          meta: mockPaginationMeta,
        })

      const { result } = renderHook(() => useUserManager(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.users).toHaveLength(1)

      await act(async () => {
        result.current.fetchUsers()
      })

      await waitFor(() => {
        expect(result.current.users).toHaveLength(2)
      })

      expect(mockedFetcher).toHaveBeenCalledTimes(2)
    })
  })
})
