'use client'

/**
 * useUserManager Hook
 *
 * Custom React hook for managing user operations.
 * Uses React 19 useTransition for loading states and useOptimistic for instant UI feedback.
 */

import { useCallback, useEffect, useOptimistic,useState, useTransition } from 'react'

import userService from '@/features/users/services/user.service'
import type {
  PaginationMeta,
  UpdateUserData,
  User,
  UserFilters,
} from '@/features/users/types/user.types'

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

type OptimisticAction =
  | { type: 'suspend'; id: number }
  | { type: 'unsuspend'; id: number }
  | { type: 'delete'; id: number }
  | { type: 'update'; id: number; data: Partial<User> }

function optimisticReducer(users: User[], action: OptimisticAction): User[] {
  switch (action.type) {
    case 'suspend':
      return users.map((user) =>
        user.id === action.id ? { ...user, status: 'suspended' } : user
      )
    case 'unsuspend':
      return users.map((user) =>
        user.id === action.id ? { ...user, status: 'active' } : user
      )
    case 'delete':
      return users.filter((user) => user.id !== action.id)
    case 'update':
      return users.map((user) =>
        user.id === action.id ? { ...user, ...action.data } : user
      )
    default:
      return users
  }
}

export const useUserManager = (): UseUserManagerReturn => {
  const [users, setUsers] = useState<User[]>([])
  const [optimisticUsers, addOptimisticAction] = useOptimistic(users, optimisticReducer)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isActionPending, startActionTransition] = useTransition()
  const [actionUserId, setActionUserId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<UserFilters>({
    status: 'all',
    per_page: 15,
    page: 1,
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const fetchUsers = useCallback(
    async (newFilters?: UserFilters) => {
      setError(null)
      startTransition(async () => {
        try {
          const result = await userService.getUsers(newFilters)
          setUsers(result.data)
          setPagination(result.meta)
        } catch {
          setError('Error al cargar los usuarios')
        }
      })
    },
    []
  )

  const handleSuspend = useCallback(async (id: number): Promise<boolean> => {
    setActionUserId(id)
    setError(null)

    return new Promise((resolve) => {
      startActionTransition(async () => {
        addOptimisticAction({ type: 'suspend', id })
        try {
          const updatedUser = await userService.suspendUser(id)
          setUsers((prev) =>
            prev.map((user) => (user.id === id ? updatedUser : user))
          )
          if (selectedUser?.id === id) {
            setSelectedUser(updatedUser)
          }
          setActionUserId(null)
          resolve(true)
        } catch {
          setError('Error al suspender el usuario')
          setActionUserId(null)
          resolve(false)
        }
      })
    })
  }, [selectedUser, addOptimisticAction])

  const handleUnsuspend = useCallback(async (id: number): Promise<boolean> => {
    setActionUserId(id)
    setError(null)

    return new Promise((resolve) => {
      startActionTransition(async () => {
        addOptimisticAction({ type: 'unsuspend', id })
        try {
          const updatedUser = await userService.unsuspendUser(id)
          setUsers((prev) =>
            prev.map((user) => (user.id === id ? updatedUser : user))
          )
          if (selectedUser?.id === id) {
            setSelectedUser(updatedUser)
          }
          setActionUserId(null)
          resolve(true)
        } catch {
          setError('Error al reactivar el usuario')
          setActionUserId(null)
          resolve(false)
        }
      })
    })
  }, [selectedUser, addOptimisticAction])

  const handleDelete = useCallback(async (id: number): Promise<boolean> => {
    setActionUserId(id)
    setError(null)

    return new Promise((resolve) => {
      startActionTransition(async () => {
        addOptimisticAction({ type: 'delete', id })
        try {
          await userService.deleteUser(id)
          setUsers((prev) => prev.filter((user) => user.id !== id))
          if (selectedUser?.id === id) {
            setSelectedUser(null)
          }
          setActionUserId(null)
          resolve(true)
        } catch {
          setError('Error al eliminar el usuario')
          setActionUserId(null)
          resolve(false)
        }
      })
    })
  }, [selectedUser, addOptimisticAction])

  const handleUpdate = useCallback(
    async (id: number, data: UpdateUserData): Promise<boolean> => {
      setActionUserId(id)
      setError(null)

      return new Promise((resolve) => {
        startActionTransition(async () => {
          addOptimisticAction({ type: 'update', id, data })
          try {
            const updatedUser = await userService.updateUser(id, data)
            setUsers((prev) =>
              prev.map((user) => (user.id === id ? updatedUser : user))
            )
            if (selectedUser?.id === id) {
              setSelectedUser(updatedUser)
            }
            setEditingUser(null)
            setActionUserId(null)
            resolve(true)
          } catch {
            setError('Error al actualizar el usuario')
            setActionUserId(null)
            resolve(false)
          }
        })
      })
    },
    [selectedUser, addOptimisticAction]
  )

  const handleViewDetail = useCallback(async (id: number) => {
    setActionUserId(id)
    setError(null)
    startActionTransition(async () => {
      try {
        const user = await userService.getUser(id)
        setSelectedUser(user)
        setActionUserId(null)
      } catch {
        setError('Error al cargar el detalle del usuario')
        setActionUserId(null)
      }
    })
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

  // Compute actionLoading for backward compatibility
  const actionLoading = isActionPending ? actionUserId : null

  return {
    users: optimisticUsers,
    pagination,
    loading: isPending,
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
