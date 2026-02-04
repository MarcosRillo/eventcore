'use client'

/**
 * useUserManager Hook
 *
 * Custom React hook for managing user operations.
 * Uses SWR for data fetching, useTransition for loading states,
 * and useOptimistic for instant UI feedback on mutations.
 */

import { useCallback, useMemo, useOptimistic, useState, useTransition } from 'react'
import useSWR from 'swr'

import { useAuth } from '@/context/AuthContext'
import userService from '@/features/users/services/user.service'
import type {
  PaginationMeta,
  UpdateUserData,
  User,
  UserFilters,
} from '@/features/users/types/user.types'
import { apiFetcher, userKeys } from '@/lib/swr'

interface UseUserManagerReturn {
  users: User[]
  pagination: PaginationMeta | null
  loading: boolean
  error: string | null
  filters: UserFilters
  actionLoading: number | null
  selectedUser: User | null
  editingUser: User | null
  fetchUsers: () => void
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
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [isActionPending, startActionTransition] = useTransition()
  const [actionUserId, setActionUserId] = useState<number | null>(null)
  const [filters, setFiltersState] = useState<UserFilters>({
    status: 'all',
    per_page: 15,
    page: 1,
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Build SWR key from filters
  const swrKey = useMemo(() => {
    if (!isAuthenticated || authLoading) return null
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.per_page) params.set('per_page', String(filters.per_page))
    if (filters.search) params.set('search', filters.search)
    if (filters.status && filters.status !== 'all') params.set('status', filters.status)
    return userKeys.list(params.toString())
  }, [isAuthenticated, authLoading, filters])

  const { data, error, isLoading, mutate } = useSWR<{ data: User[]; meta: PaginationMeta }>(
    swrKey,
    apiFetcher,
  )

  const users = useMemo(() => data?.data ?? [], [data])
  const pagination = data?.meta ?? null
  const [optimisticUsers, addOptimisticAction] = useOptimistic(users, optimisticReducer)

  const handleSuspend = useCallback(async (id: number): Promise<boolean> => {
    setActionUserId(id)

    return new Promise((resolve) => {
      startActionTransition(async () => {
        addOptimisticAction({ type: 'suspend', id })
        try {
          await userService.suspendUser(id)
          await mutate()
          if (selectedUser?.id === id) {
            setSelectedUser((prev) =>
              prev ? { ...prev, status: 'suspended' } : null
            )
          }
          setActionUserId(null)
          resolve(true)
        } catch {
          await mutate()
          setActionUserId(null)
          resolve(false)
        }
      })
    })
  }, [selectedUser, addOptimisticAction, mutate])

  const handleUnsuspend = useCallback(async (id: number): Promise<boolean> => {
    setActionUserId(id)

    return new Promise((resolve) => {
      startActionTransition(async () => {
        addOptimisticAction({ type: 'unsuspend', id })
        try {
          await userService.unsuspendUser(id)
          await mutate()
          if (selectedUser?.id === id) {
            setSelectedUser((prev) =>
              prev ? { ...prev, status: 'active' } : null
            )
          }
          setActionUserId(null)
          resolve(true)
        } catch {
          await mutate()
          setActionUserId(null)
          resolve(false)
        }
      })
    })
  }, [selectedUser, addOptimisticAction, mutate])

  const handleDelete = useCallback(async (id: number): Promise<boolean> => {
    setActionUserId(id)

    return new Promise((resolve) => {
      startActionTransition(async () => {
        addOptimisticAction({ type: 'delete', id })
        try {
          await userService.deleteUser(id)
          await mutate()
          if (selectedUser?.id === id) {
            setSelectedUser(null)
          }
          setActionUserId(null)
          resolve(true)
        } catch {
          await mutate()
          setActionUserId(null)
          resolve(false)
        }
      })
    })
  }, [selectedUser, addOptimisticAction, mutate])

  const handleUpdate = useCallback(
    async (id: number, data: UpdateUserData): Promise<boolean> => {
      setActionUserId(id)

      return new Promise((resolve) => {
        startActionTransition(async () => {
          addOptimisticAction({ type: 'update', id, data })
          try {
            const updatedUser = await userService.updateUser(id, data)
            await mutate()
            if (selectedUser?.id === id) {
              setSelectedUser(updatedUser)
            }
            setEditingUser(null)
            setActionUserId(null)
            resolve(true)
          } catch {
            await mutate()
            setActionUserId(null)
            resolve(false)
          }
        })
      })
    },
    [selectedUser, addOptimisticAction, mutate]
  )

  const handleViewDetail = useCallback(async (id: number) => {
    setActionUserId(id)
    startActionTransition(async () => {
      try {
        const user = await userService.getUser(id)
        setSelectedUser(user)
        setActionUserId(null)
      } catch {
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
    // SWR manages error state; mutate to clear by revalidating
    mutate()
  }, [mutate])

  const fetchUsers = useCallback(() => {
    mutate()
  }, [mutate])

  // Compute actionLoading for backward compatibility
  const actionLoading = isActionPending ? actionUserId : null

  return {
    users: optimisticUsers,
    pagination,
    loading: isLoading,
    error: error?.message ?? null,
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
