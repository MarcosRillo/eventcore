'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'

import organizationService from '@/features/organizations/services/organization.service'
import type {
  Organization,
  OrganizationFilters,
  PaginationMeta,
} from '@/features/organizations/types/organization.types'

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
  // React 19 transitions for non-blocking UI
  const [, startLoadTransition] = useTransition()
  const [, startDetailTransition] = useTransition()
  const [, startToggleTransition] = useTransition()

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<OrganizationFilters>({
    status: 'all',
    per_page: 15,
    page: 1,
  })
  const [togglingIdState, setTogglingIdState] = useState<number | null>(null)
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  const fetchOrganizations = useCallback(
    async (newFilters?: OrganizationFilters) => {
      setIsLoading(true)
      setError(null)

      startLoadTransition(async () => {
        try {
          const result = await organizationService.getOrganizations(newFilters)
          setOrganizations(result.data)
          setPagination(result.pagination)
        } catch {
          setError('Error al cargar las organizaciones')
        } finally {
          setIsLoading(false)
        }
      })
    },
    [startLoadTransition]
  )

  const handleToggleStatus = useCallback(
    async (id: number): Promise<boolean> => {
      setTogglingIdState(id)
      setError(null)

      return new Promise((resolve) => {
        startToggleTransition(async () => {
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
            setTogglingIdState(null)
            resolve(true)
          } catch {
            setError('Error al cambiar el estado de la organización')
            setTogglingIdState(null)
            resolve(false)
          }
        })
      })
    },
    [selectedOrganization, startToggleTransition]
  )

  const handleViewDetail = useCallback(async (id: number) => {
    setIsLoadingDetail(true)
    setError(null)

    startDetailTransition(async () => {
      try {
        const org = await organizationService.getOrganization(id)
        setSelectedOrganization(org)
      } catch {
        setError('Error al cargar el detalle de la organización')
      } finally {
        setIsLoadingDetail(false)
      }
    })
  }, [startDetailTransition])

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

  // Backward compatibility
  const loading = isLoading
  const loadingDetail = isLoadingDetail
  const togglingId = togglingIdState

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
