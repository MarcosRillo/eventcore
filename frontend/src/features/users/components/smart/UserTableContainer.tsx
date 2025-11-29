'use client'

/**
 * User Table Container - Smart Component
 * Connects the hook with the presentational components
 */

import { useState, useCallback } from 'react'
import { UserTable } from '../dumb/UserTable'
import { UserEditModal } from '../dumb/UserEditModal'
import { DeleteConfirmModal } from '@/shared/components/modals/DeleteConfirmModal'
import { useUserManager } from '../../hooks/useUserManager'
import { Input, Button } from '@/components/ui'

export function UserTableContainer() {
  const {
    users,
    pagination,
    loading,
    error,
    filters,
    actionLoading,
    editingUser,
    handleSuspend,
    handleUnsuspend,
    handleDelete,
    handleUpdate,
    handleOpenEdit,
    handleCloseEdit,
    setFilters,
    clearError,
  } = useUserManager()

  const [searchInput, setSearchInput] = useState('')
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)
  const [deletingUserName, setDeletingUserName] = useState('')

  const handleSearch = useCallback(() => {
    setFilters({ search: searchInput, page: 1 })
  }, [searchInput, setFilters])

  const handleSearchKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch]
  )

  const handleClearSearch = useCallback(() => {
    setSearchInput('')
    setFilters({ search: '', page: 1 })
  }, [setFilters])

  const handleStatusFilter = useCallback(
    (status: 'all' | 'active' | 'suspended') => {
      setFilters({ status, page: 1 })
    },
    [setFilters]
  )

  const handlePageChange = useCallback(
    (page: number) => {
      setFilters({ page })
    },
    [setFilters]
  )

  const handleDeleteClick = useCallback((id: number) => {
    const user = users.find((u) => u.id === id)
    if (user) {
      setDeletingUserId(id)
      setDeletingUserName(user.name)
    }
  }, [users])

  const handleConfirmDelete = useCallback(async () => {
    if (deletingUserId) {
      const success = await handleDelete(deletingUserId)
      if (success) {
        setDeletingUserId(null)
        setDeletingUserName('')
      }
    }
  }, [deletingUserId, handleDelete])

  const handleCancelDelete = useCallback(() => {
    setDeletingUserId(null)
    setDeletingUserName('')
  }, [])

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-600"
                type="button"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <Input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              fullWidth
            />
            <Button variant="primary" onClick={handleSearch}>
              Buscar
            </Button>
            {filters.search && (
              <Button variant="outline" onClick={handleClearSearch}>
                Limpiar
              </Button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <Button
              variant={filters.status === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={filters.status === 'active' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('active')}
            >
              Activos
            </Button>
            <Button
              variant={filters.status === 'suspended' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter('suspended')}
            >
              Suspendidos
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <UserTable
        users={users}
        pagination={pagination}
        loading={loading}
        actionLoading={actionLoading}
        onPageChange={handlePageChange}
        onEdit={handleOpenEdit}
        onSuspend={handleSuspend}
        onUnsuspend={handleUnsuspend}
        onDelete={handleDeleteClick}
      />

      {/* Edit Modal */}
      <UserEditModal
        user={editingUser}
        isOpen={!!editingUser}
        loading={actionLoading === editingUser?.id}
        onClose={handleCloseEdit}
        onSave={handleUpdate}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingUserId}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        loading={actionLoading === deletingUserId}
        title="Eliminar Usuario"
        itemName={deletingUserName}
        warningMessage="Esta acción no se puede deshacer. El usuario perderá acceso al sistema."
      />
    </div>
  )
}

export default UserTableContainer
