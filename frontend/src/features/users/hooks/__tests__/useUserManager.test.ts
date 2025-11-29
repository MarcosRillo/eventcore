import { renderHook, act, waitFor } from '@testing-library/react'
import { useUserManager } from '../useUserManager'
import userService from '../../services/user.service'
import type { User, PaginationMeta } from '../../types/user.types'

jest.mock('../../services/user.service')

const mockUserService = userService as jest.Mocked<typeof userService>

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

  const mockPaginationMeta: PaginationMeta = {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 2,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state and fetching', () => {
    it('should fetch users on mount', async () => {
      mockUserService.getUsers.mockResolvedValueOnce({
        data: [mockUser, mockUser2],
        meta: mockPaginationMeta,
      })

      const { result } = renderHook(() => useUserManager())

      expect(result.current.loading).toBe(true)
      expect(result.current.users).toEqual([])

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.users).toEqual([mockUser, mockUser2])
      expect(result.current.pagination).toEqual(mockPaginationMeta)
      expect(result.current.error).toBeNull()
      expect(mockUserService.getUsers).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch error', async () => {
      mockUserService.getUsers.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useUserManager())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.users).toEqual([])
      expect(result.current.error).toBe('Error al cargar los usuarios')
    })

    it('should return empty array when no users', async () => {
      mockUserService.getUsers.mockResolvedValueOnce({
        data: [],
        meta: { ...mockPaginationMeta, total: 0 },
      })

      const { result } = renderHook(() => useUserManager())

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
      mockUserService.getUsers.mockResolvedValueOnce({
        data: [mockUser, mockUser2],
        meta: mockPaginationMeta,
      })
      mockUserService.suspendUser.mockResolvedValueOnce(suspendedUser)

      const { result } = renderHook(() => useUserManager())

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
      mockUserService.getUsers.mockResolvedValueOnce({
        data: [mockUser],
        meta: mockPaginationMeta,
      })

      let suspendResolve: (value: User) => void
      mockUserService.suspendUser.mockReturnValueOnce(
        new Promise((resolve) => {
          suspendResolve = resolve
        })
      )

      const { result } = renderHook(() => useUserManager())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleSuspend(1)
      })

      expect(result.current.actionLoading).toBe(1)

      await act(async () => {
        suspendResolve!({ ...mockUser, status: 'suspended' })
      })

      expect(result.current.actionLoading).toBeNull()
    })

    it('should handle suspend error', async () => {
      mockUserService.getUsers.mockResolvedValueOnce({
        data: [mockUser],
        meta: mockPaginationMeta,
      })
      mockUserService.suspendUser.mockRejectedValueOnce(new Error('Cannot suspend'))

      const { result } = renderHook(() => useUserManager())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let success = true
      await act(async () => {
        success = await result.current.handleSuspend(1)
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Error al suspender el usuario')
    })
  })

  describe('handleUnsuspend', () => {
    it('should unsuspend user and update list', async () => {
      const activeUser = { ...mockUser2, status: 'active' as const }
      mockUserService.getUsers.mockResolvedValueOnce({
        data: [mockUser2],
        meta: mockPaginationMeta,
      })
      mockUserService.unsuspendUser.mockResolvedValueOnce(activeUser)

      const { result } = renderHook(() => useUserManager())

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
      mockUserService.getUsers.mockResolvedValueOnce({
        data: [mockUser2],
        meta: mockPaginationMeta,
      })
      mockUserService.unsuspendUser.mockRejectedValueOnce(new Error('Cannot unsuspend'))

      const { result } = renderHook(() => useUserManager())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let success = true
      await act(async () => {
        success = await result.current.handleUnsuspend(2)
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Error al reactivar el usuario')
    })
  })

  describe('handleDelete', () => {
    it('should delete user and remove from list', async () => {
      mockUserService.getUsers.mockResolvedValueOnce({
        data: [mockUser, mockUser2],
        meta: mockPaginationMeta,
      })
      mockUserService.deleteUser.mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useUserManager())

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
      expect(result.current.users).toHaveLength(1)
      expect(result.current.users[0].id).toBe(2)
    })

    it('should handle delete error', async () => {
      mockUserService.getUsers.mockResolvedValueOnce({
        data: [mockUser],
        meta: mockPaginationMeta,
      })
      mockUserService.deleteUser.mockRejectedValueOnce(new Error('Cannot delete'))

      const { result } = renderHook(() => useUserManager())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let success = true
      await act(async () => {
        success = await result.current.handleDelete(1)
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Error al eliminar el usuario')
      expect(result.current.users).toHaveLength(1)
    })
  })

  describe('handleUpdate', () => {
    it('should update user and update list', async () => {
      const updatedUser = { ...mockUser, name: 'Patricia López Updated' }
      mockUserService.getUsers.mockResolvedValueOnce({
        data: [mockUser],
        meta: mockPaginationMeta,
      })
      mockUserService.updateUser.mockResolvedValueOnce(updatedUser)

      const { result } = renderHook(() => useUserManager())

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
      mockUserService.getUsers.mockResolvedValueOnce({
        data: [mockUser],
        meta: mockPaginationMeta,
      })
      mockUserService.updateUser.mockResolvedValueOnce(updatedUser)

      const { result } = renderHook(() => useUserManager())

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
      mockUserService.getUsers.mockResolvedValueOnce({
        data: [mockUser],
        meta: mockPaginationMeta,
      })
      mockUserService.updateUser.mockRejectedValueOnce(new Error('Cannot update'))

      const { result } = renderHook(() => useUserManager())

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
      expect(result.current.error).toBe('Error al actualizar el usuario')
    })
  })

  describe('handleOpenEdit and handleCloseEdit', () => {
    it('should open edit modal with user', async () => {
      mockUserService.getUsers.mockResolvedValueOnce({
        data: [mockUser],
        meta: mockPaginationMeta,
      })

      const { result } = renderHook(() => useUserManager())

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
      mockUserService.getUsers.mockResolvedValueOnce({
        data: [mockUser],
        meta: mockPaginationMeta,
      })

      const { result } = renderHook(() => useUserManager())

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
      mockUserService.getUsers
        .mockResolvedValueOnce({
          data: [mockUser, mockUser2],
          meta: mockPaginationMeta,
        })
        .mockResolvedValueOnce({
          data: [mockUser2],
          meta: { ...mockPaginationMeta, total: 1 },
        })

      const { result } = renderHook(() => useUserManager())

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
    it('should clear error', async () => {
      mockUserService.getUsers.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useUserManager())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Error al cargar los usuarios')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('fetchUsers', () => {
    it('should allow manual refetch', async () => {
      mockUserService.getUsers
        .mockResolvedValueOnce({
          data: [mockUser],
          meta: mockPaginationMeta,
        })
        .mockResolvedValueOnce({
          data: [mockUser, mockUser2],
          meta: mockPaginationMeta,
        })

      const { result } = renderHook(() => useUserManager())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.users).toHaveLength(1)

      await act(async () => {
        await result.current.fetchUsers()
      })

      expect(result.current.users).toHaveLength(2)
      expect(mockUserService.getUsers).toHaveBeenCalledTimes(2)
    })
  })
})
