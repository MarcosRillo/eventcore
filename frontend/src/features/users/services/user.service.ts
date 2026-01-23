/**
 * User Service
 * API service functions for user management
 */

import type {
  PaginationMeta,
  UpdateUserData,
  User,
  UserFilters,
  UserResponse,
  UsersResponse,
} from '@/features/users/types/user.types'
import apiClient from '@/services/apiClient'

/**
 * Fetch all entity_staff users with optional filters
 * @param filters
 */
export const getUsers = async (
  filters?: UserFilters
): Promise<{ data: User[]; meta: PaginationMeta }> => {
  const params = new URLSearchParams()

  if (filters?.search) {
    params.append('search', filters.search)
  }
  if (filters?.status && filters.status !== 'all') {
    params.append('status', filters.status)
  }
  if (filters?.per_page) {
    params.append('per_page', filters.per_page.toString())
  }
  if (filters?.page) {
    params.append('page', filters.page.toString())
  }

  const queryString = params.toString()
  const url = queryString ? `/users?${queryString}` : '/users'

  const response = await apiClient.get<UsersResponse>(url)
  return {
    data: response.data.data,
    meta: response.data.meta,
  }
}

/**
 * Fetch a single user by ID
 * @param id
 */
export const getUser = async (id: number): Promise<User> => {
  const response = await apiClient.get<UserResponse>(`/users/${id}`)
  return response.data.data
}

/**
 * Update user profile (name, email)
 * @param id
 * @param data
 */
export const updateUser = async (
  id: number,
  data: UpdateUserData
): Promise<User> => {
  const response = await apiClient.put<UserResponse>(`/users/${id}`, data)
  return response.data.data
}

/**
 * Suspend a user
 * @param id
 */
export const suspendUser = async (id: number): Promise<User> => {
  const response = await apiClient.patch<UserResponse>(`/users/${id}/suspend`)
  return response.data.data
}

/**
 * Unsuspend a user
 * @param id
 */
export const unsuspendUser = async (id: number): Promise<User> => {
  const response = await apiClient.patch<UserResponse>(`/users/${id}/unsuspend`)
  return response.data.data
}

/**
 * Delete a user (soft delete)
 * @param id
 */
export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/users/${id}`)
}

/**
 * Export default object with all service functions
 */
const userService = {
  getUsers,
  getUser,
  updateUser,
  suspendUser,
  unsuspendUser,
  deleteUser,
}

export default userService
