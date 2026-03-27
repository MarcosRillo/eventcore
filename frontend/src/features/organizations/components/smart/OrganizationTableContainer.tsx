'use client'

/**
 * Organization Table Container - Smart Component
 * Connects the hook with the presentational components
 */

import React, { useCallback,useState } from 'react'

import { OrganizationDetailModal } from '@/features/organizations/components/dumb/OrganizationDetailModal'
import { OrganizationTable } from '@/features/organizations/components/dumb/OrganizationTable'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import { Button, Input } from '@/shared/components/form'

export const OrganizationTableContainer: React.FC = () => {
  const {
    organizations,
    pagination,
    loading,
    error,
    filters,
    togglingId,
    selectedOrganization,
    loadingDetail,
    handleToggleStatus,
    handleViewDetail,
    handleCloseDetail,
    setFilters,
    clearError,
  } = useOrganizations()

  const [searchInput, setSearchInput] = useState('')

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

  const handleToggleStatusFromModal = useCallback(async () => {
    if (selectedOrganization) {
      await handleToggleStatus(selectedOrganization.id)
    }
  }, [selectedOrganization, handleToggleStatus])

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
              placeholder="Buscar por nombre o CUIT..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyPress}
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
      <OrganizationTable
        organizations={organizations}
        pagination={pagination}
        loading={loading}
        togglingId={togglingId}
        onPageChange={handlePageChange}
        onViewDetail={handleViewDetail}
        onToggleStatus={handleToggleStatus}
      />

      {/* Detail Modal */}
      <OrganizationDetailModal
        organization={selectedOrganization}
        isOpen={!!selectedOrganization || loadingDetail}
        loading={loadingDetail}
        togglingStatus={togglingId === selectedOrganization?.id}
        onClose={handleCloseDetail}
        onToggleStatus={handleToggleStatusFromModal}
      />
    </div>
  )
}

export default OrganizationTableContainer
