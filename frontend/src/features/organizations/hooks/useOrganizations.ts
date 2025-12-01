'use client'

import { useState, useCallback, useEffect } from 'react'
import type {
  Organization,
  OrganizationFilters,
  PaginationMeta,
} from '../types/organization.types'
import organizationService from '../services/organization.service'

interface UseOrganizationsReturn {
  organizations: Organization[]
  pagination: PaginationMeta | null
  loading: boolean
  error: string | null
  filters: OrganizationFilters
  togglingId: number | null
  selectedOrganization: Organization | null
  loadingDetail: boolean
  fetchOrganizations: (filters?: OrganizationFilters) => Promise<void>
  handleToggleStatus: (id: number) => Promise<boolean>
  handleViewDetail: (id: number) => Promise<void>
  handleCloseDetail: () => void
  setFilters: (filters: OrganizationFilters) => void
  clearError: () => void
}

export const useOrganizations = (): UseOrganizationsReturn => {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<OrganizationFilters>({
    status: 'all',
    per_page: 15,
    page: 1,
  })
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const fetchOrganizations = useCallback(
    async (newFilters?: OrganizationFilters) => {
      setLoading(true)
      setError(null)
      try {
        const result = await organizationService.getOrganizations(newFilters)
        setOrganizations(result.data)
        setPagination(result.pagination)
      } catch {
        setError('Error al cargar las organizaciones')
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const handleToggleStatus = useCallback(
    async (id: number): Promise<boolean> => {
      setTogglingId(id)
      setError(null)
      try {
        const updatedOrg =
          await organizationService.toggleOrganizationStatus(id)
        setOrganizations((prev) =>
          prev.map((org) => (org.id === id ? updatedOrg : org))
        )
        // Also update selected organization if it's the same
        if (selectedOrganization?.id === id) {
          setSelectedOrganization(updatedOrg)
        }
        return true
      } catch {
        setError('Error al cambiar el estado de la organización')
        return false
      } finally {
        setTogglingId(null)
      }
    },
    [selectedOrganization]
  )

  const handleViewDetail = useCallback(async (id: number) => {
    setLoadingDetail(true)
    setError(null)
    try {
      const org = await organizationService.getOrganization(id)
      setSelectedOrganization(org)
    } catch {
      setError('Error al cargar el detalle de la organización')
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelectedOrganization(null)
  }, [])

  const setFilters = useCallback((newFilters: OrganizationFilters) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchOrganizations(filters)
  }, [fetchOrganizations, filters])

  return {
    organizations,
    pagination,
    loading,
    error,
    filters,
    togglingId,
    selectedOrganization,
    loadingDetail,
    fetchOrganizations,
    handleToggleStatus,
    handleViewDetail,
    handleCloseDetail,
    setFilters,
    clearError,
  }
}

export default useOrganizations
