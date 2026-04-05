/**
 * User types for the users management feature
 */

import type { PaginationMeta } from '@/types/api-response.types'

export type { PaginationMeta }

export interface UserRole {
  id: number
  role_code: string
  role_name: string
  description: string
  permissions: string[]
}

export interface User {
  id: number
  name: string
  email: string
  status: 'active' | 'suspended'
  role: UserRole | null
  created_at: string
  updated_at: string
}

export interface UserFilters {
  search?: string
  status?: 'all' | 'active' | 'suspended'
  per_page?: number
  page?: number
}

export interface UsersResponse {
  success: boolean
  data: User[]
  meta: PaginationMeta
}

export interface UserResponse {
  success: boolean
  data: User
  message?: string
}

export interface UpdateUserData {
  name: string
  email: string
}

/**
 * Helper to check if user is active
 * @param user
 */
export const isUserActive = (user: User): boolean => {
  return user.status === 'active'
}

/**
 * Helper to get status badge color
 * @param status
 */
export const getUserStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'green'
    case 'suspended':
      return 'red'
    default:
      return 'gray'
  }
}

/**
 * Helper to get status display name
 * @param status
 */
export const getUserStatusLabel = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Activo'
    case 'suspended':
      return 'Suspendido'
    default:
      return status
  }
}
