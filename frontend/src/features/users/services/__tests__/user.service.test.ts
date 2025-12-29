import { AxiosResponse } from 'axios'

import userService from '@/features/users/services/user.service'
import type { User, UsersResponse, UserResponse, PaginationMeta } from '@/features/users/types/user.types'
import apiClient from '@/services/apiClient'


jest.mock('@/services/apiClient')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

const createMockResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: { headers: {} } as AxiosResponse['config'],
})

describe('userService', () => {
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
    per_page: 10,
    total: 2,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUsers', () => {
    it('should fetch users without filters', async () => {
      const mockResponse: UsersResponse = {
        success: true,
        data: [mockUser, mockUser2],
        meta: mockPaginationMeta,
      }
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await userService.getUsers()

      expect(mockApiClient.get).toHaveBeenCalledWith('/users')
      expect(result.data).toEqual([mockUser, mockUser2])
      expect(result.meta).toEqual(mockPaginationMeta)
      expect(result.data).toHaveLength(2)
    })

    it('should fetch users with search filter', async () => {
      const mockResponse: UsersResponse = {
        success: true,
        data: [mockUser],
        meta: { ...mockPaginationMeta, total: 1 },
      }
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await userService.getUsers({ search: 'patricia' })

      expect(mockApiClient.get).toHaveBeenCalledWith('/users?search=patricia')
      expect(result.data).toEqual([mockUser])
      expect(result.data).toHaveLength(1)
    })

    it('should fetch users with status filter', async () => {
      const mockResponse: UsersResponse = {
        success: true,
        data: [mockUser2],
        meta: { ...mockPaginationMeta, total: 1 },
      }
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await userService.getUsers({ status: 'suspended' })

      expect(mockApiClient.get).toHaveBeenCalledWith('/users?status=suspended')
      expect(result.data[0].status).toBe('suspended')
    })

    it('should not include status=all in query params', async () => {
      const mockResponse: UsersResponse = {
        success: true,
        data: [mockUser, mockUser2],
        meta: mockPaginationMeta,
      }
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      await userService.getUsers({ status: 'all' })

      expect(mockApiClient.get).toHaveBeenCalledWith('/users')
    })

    it('should fetch users with pagination', async () => {
      const mockResponse: UsersResponse = {
        success: true,
        data: [mockUser],
        meta: { ...mockPaginationMeta, current_page: 2, last_page: 2 },
      }
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await userService.getUsers({ page: 2, per_page: 5 })

      expect(mockApiClient.get).toHaveBeenCalledWith('/users?per_page=5&page=2')
      expect(result.meta.current_page).toBe(2)
    })

    it('should handle API errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(userService.getUsers()).rejects.toThrow('Network error')
    })

    it('should return empty array when no users', async () => {
      const mockResponse: UsersResponse = {
        success: true,
        data: [],
        meta: { ...mockPaginationMeta, total: 0 },
      }
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await userService.getUsers()

      expect(result.data).toEqual([])
      expect(result.meta.total).toBe(0)
    })
  })

  describe('getUser', () => {
    it('should fetch a single user by ID', async () => {
      const mockResponse: UserResponse = {
        success: true,
        data: mockUser,
      }
      mockApiClient.get.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await userService.getUser(1)

      expect(mockApiClient.get).toHaveBeenCalledWith('/users/1')
      expect(result).toEqual(mockUser)
      expect(result.id).toBe(1)
    })

    it('should handle not found errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('User not found'))

      await expect(userService.getUser(999)).rejects.toThrow('User not found')
    })
  })

  describe('updateUser', () => {
    it('should update user name and email', async () => {
      const updatedUser = { ...mockUser, name: 'Patricia López Updated', email: 'patricia.updated@enteturismo.gov.ar' }
      const mockResponse: UserResponse = {
        success: true,
        data: updatedUser,
        message: 'Usuario actualizado correctamente.',
      }
      mockApiClient.put.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await userService.updateUser(1, {
        name: 'Patricia López Updated',
        email: 'patricia.updated@enteturismo.gov.ar',
      })

      expect(mockApiClient.put).toHaveBeenCalledWith('/users/1', {
        name: 'Patricia López Updated',
        email: 'patricia.updated@enteturismo.gov.ar',
      })
      expect(result.name).toBe('Patricia López Updated')
      expect(result.email).toBe('patricia.updated@enteturismo.gov.ar')
    })

    it('should handle validation errors', async () => {
      mockApiClient.put.mockRejectedValueOnce(new Error('Validation failed'))

      await expect(
        userService.updateUser(1, { name: '', email: 'invalid' })
      ).rejects.toThrow('Validation failed')
    })
  })

  describe('suspendUser', () => {
    it('should suspend a user', async () => {
      const suspendedUser = { ...mockUser, status: 'suspended' as const }
      const mockResponse: UserResponse = {
        success: true,
        data: suspendedUser,
        message: 'Usuario suspendido correctamente.',
      }
      mockApiClient.patch.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await userService.suspendUser(1)

      expect(mockApiClient.patch).toHaveBeenCalledWith('/users/1/suspend')
      expect(result.status).toBe('suspended')
    })

    it('should handle suspend errors', async () => {
      mockApiClient.patch.mockRejectedValueOnce(new Error('Cannot suspend user'))

      await expect(userService.suspendUser(1)).rejects.toThrow('Cannot suspend user')
    })
  })

  describe('unsuspendUser', () => {
    it('should unsuspend a user', async () => {
      const activeUser = { ...mockUser2, status: 'active' as const }
      const mockResponse: UserResponse = {
        success: true,
        data: activeUser,
        message: 'Usuario reactivado correctamente.',
      }
      mockApiClient.patch.mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await userService.unsuspendUser(2)

      expect(mockApiClient.patch).toHaveBeenCalledWith('/users/2/unsuspend')
      expect(result.status).toBe('active')
    })

    it('should handle unsuspend errors', async () => {
      mockApiClient.patch.mockRejectedValueOnce(new Error('Cannot unsuspend user'))

      await expect(userService.unsuspendUser(2)).rejects.toThrow('Cannot unsuspend user')
    })
  })

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const mockResponse = {
        success: true,
        message: 'Usuario eliminado correctamente.',
      }
      mockApiClient.delete.mockResolvedValueOnce(createMockResponse(mockResponse))

      await expect(userService.deleteUser(1)).resolves.toBeUndefined()
      expect(mockApiClient.delete).toHaveBeenCalledWith('/users/1')
    })

    it('should handle delete errors', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Cannot delete user'))

      await expect(userService.deleteUser(1)).rejects.toThrow('Cannot delete user')
    })

    it('should handle permission errors', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Permission denied'))

      await expect(userService.deleteUser(1)).rejects.toThrow('Permission denied')
    })
  })
})
