'use client'

import { useState, useCallback, useEffect } from 'react'
import type {
  User,
  UserFilters,
  UpdateUserData,
  PaginationMeta,
} from '../types/user.types'
import userService from '../services/user.service'

interface UseUserManagerReturn {
  users: User[]
  pagination: PaginationMeta | null
  loading: boolean
  error: string | null
  filters: UserFilters
  actionLoading: number | null
  selectedUser: User | null
  editingUser: User | null
  fetchUsers: (filters?: UserFilters) => Promise<void>
  handleSuspend: (id: number) => Promise<boolean>
  handleUnsuspend: (id: number) => Promise<boolean>
  handleDelete: (id: number) => Promise<boolean>
  handleUpdate: (id: number, data: UpdateUserData) => Promise<boolean>
  handleViewDetail: (id: number) => Promise<void>
  handleCloseDetail: () => void
  handleOpenEdit: (user: User) => void
  handleCloseEdit: () => void
  setFilters: (filters: UserFilters) => void
  clearError: () => void
}

export const useUserManager = (): UseUserManagerReturn => {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<UserFilters>({
    status: 'all',
    per_page: 15,
    page: 1,
  })
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const fetchUsers = useCallback(
    async (newFilters?: UserFilters) => {
      setLoading(true)
      setError(null)
      try {
        const result = await userService.getUsers(newFilters)
        setUsers(result.data)
        setPagination(result.meta)
      } catch {
        setError('Error al cargar los usuarios')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const handleSuspend = useCallback(async (id: number): Promise<boolean> => {
    setActionLoading(id)
    setError(null)
    try {
      const updatedUser = await userService.suspendUser(id)
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user))
      )
      if (selectedUser?.id === id) {
        setSelectedUser(updatedUser)
      }
      return true
    } catch {
      setError('Error al suspender el usuario')
      return false
    } finally {
      setActionLoading(null)
    }
  }, [selectedUser])

  const handleUnsuspend = useCallback(async (id: number): Promise<boolean> => {
    setActionLoading(id)
    setError(null)
    try {
      const updatedUser = await userService.unsuspendUser(id)
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user))
      )
      if (selectedUser?.id === id) {
        setSelectedUser(updatedUser)
      }
      return true
    } catch {
      setError('Error al reactivar el usuario')
      return false
    } finally {
      setActionLoading(null)
    }
  }, [selectedUser])

  const handleDelete = useCallback(async (id: number): Promise<boolean> => {
    setActionLoading(id)
    setError(null)
    try {
      await userService.deleteUser(id)
      setUsers((prev) => prev.filter((user) => user.id !== id))
      if (selectedUser?.id === id) {
        setSelectedUser(null)
      }
      return true
    } catch {
      setError('Error al eliminar el usuario')
      return false
    } finally {
      setActionLoading(null)
    }
  }, [selectedUser])

  const handleUpdate = useCallback(
    async (id: number, data: UpdateUserData): Promise<boolean> => {
      setActionLoading(id)
      setError(null)
      try {
        const updatedUser = await userService.updateUser(id, data)
        setUsers((prev) =>
          prev.map((user) => (user.id === id ? updatedUser : user))
        )
        if (selectedUser?.id === id) {
          setSelectedUser(updatedUser)
        }
        setEditingUser(null)
        return true
      } catch {
        setError('Error al actualizar el usuario')
        return false
      } finally {
        setActionLoading(null)
      }
    },
    [selectedUser]
  )

  const handleViewDetail = useCallback(async (id: number) => {
    setActionLoading(id)
    setError(null)
    try {
      const user = await userService.getUser(id)
      setSelectedUser(user)
    } catch {
      setError('Error al cargar el detalle del usuario')
    } finally {
      setActionLoading(null)
    }
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelectedUser(null)
  }, [])

  const handleOpenEdit = useCallback((user: User) => {
    setEditingUser(user)
  }, [])

  const handleCloseEdit = useCallback(() => {
    setEditingUser(null)
  }, [])

  const setFilters = useCallback((newFilters: UserFilters) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchUsers(filters)
  }, [fetchUsers, filters])

  return {
    users,
    pagination,
    loading,
    error,
    filters,
    actionLoading,
    selectedUser,
    editingUser,
    fetchUsers,
    handleSuspend,
    handleUnsuspend,
    handleDelete,
    handleUpdate,
    handleViewDetail,
    handleCloseDetail,
    handleOpenEdit,
    handleCloseEdit,
    setFilters,
    clearError,
  }
}

export default useUserManager
