'use client'

import { useCallback, useMemo, useState, useTransition } from 'react'
import useSWR from 'swr'

import { useAuth } from '@/context/AuthContext'
import {
  getOrganization,
  toggleOrganizationStatus,
} from '@/features/organizations/services/organization.service'
import type {
  Organization,
  OrganizationFilters,
  OrganizationsResponse,
  PaginationMeta,
} from '@/features/organizations/types/organization.types'
import { useDebounce } from '@/hooks/useDebounce'
import { apiFetcher, organizationKeys } from '@/lib/swr'

interface UseOrganizationsReturn {
  organizations: Organization[]
  pagination: PaginationMeta | null
  loading: boolean
  isValidating: boolean
  error: string | null
  filters: OrganizationFilters
  togglingId: number | null
  selectedOrganization: Organization | null
  loadingDetail: boolean
  fetchOrganizations: () => Promise<void>
  handleToggleStatus: (id: number) => Promise<boolean>
  handleViewDetail: (id: number) => Promise<void>
  handleCloseDetail: () => void
  setFilters: (filters: OrganizationFilters) => void
  clearError: () => void
}

export const useOrganizations = (): UseOrganizationsReturn => {
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // React 19 transitions for non-blocking UI on toggle and detail
  const [, startToggleTransition] = useTransition()
  const [, startDetailTransition] = useTransition()

  // Local state for filters, mutations, and detail
  const [filters, setFiltersState] = useState<OrganizationFilters>({
    status: 'all',
    per_page: 15,
    page: 1,
  })
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Debounce search to avoid excessive requests
  const debouncedSearch = useDebounce(filters.search, 300)

  // Build SWR key from filters (null when not authenticated)
  const swrKey = useMemo(() => {
    if (!isAuthenticated || authLoading) return null
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.per_page) params.set('per_page', String(filters.per_page))
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (filters.status && filters.status !== 'all') params.set('status', filters.status)
    return organizationKeys.list(params.toString())
  }, [isAuthenticated, authLoading, filters.page, filters.per_page, debouncedSearch, filters.status])

  const { data, error: swrError, isLoading, isValidating, mutate } = useSWR<OrganizationsResponse>(
    swrKey,
    apiFetcher,
    { keepPreviousData: true },
  )

  // Derive organizations and pagination from SWR data
  const organizations = useMemo(() => data?.data ?? [], [data])
  const pagination = data?.pagination ?? null

  // Combine SWR error with local error
  const error = localError ?? (swrError ? 'Error al cargar las organizaciones' : null)

  // fetchOrganizations simplified to SWR revalidation
  const fetchOrganizations = useCallback(async () => {
    await mutate()
  }, [mutate])

  const handleToggleStatus = useCallback(
    async (id: number): Promise<boolean> => {
      setTogglingId(id)
      setLocalError(null)

      return new Promise((resolve) => {
        startToggleTransition(async () => {
          try {
            const updatedOrg = await toggleOrganizationStatus(id)
            // Revalidate the list via SWR
            await mutate()
            // Also update selected organization if it's the same
            if (selectedOrganization?.id === id) {
              setSelectedOrganization(updatedOrg)
            }
            setTogglingId(null)
            resolve(true)
          } catch {
            setLocalError('Error al cambiar el estado de la organizacion')
            setTogglingId(null)
            resolve(false)
          }
        })
      })
    },
    [selectedOrganization, mutate]
  )

  const handleViewDetail = useCallback(async (id: number) => {
    setIsLoadingDetail(true)
    setLocalError(null)

    startDetailTransition(async () => {
      try {
        const org = await getOrganization(id)
        setSelectedOrganization(org)
      } catch {
        setLocalError('Error al cargar el detalle de la organizacion')
      } finally {
        setIsLoadingDetail(false)
      }
    })
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelectedOrganization(null)
  }, [])

  const setFilters = useCallback((newFilters: OrganizationFilters) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearError = useCallback(() => {
    setLocalError(null)
  }, [])

  return {
    organizations,
    pagination,
    loading: isLoading,
    isValidating,
    error,
    filters,
    togglingId,
    selectedOrganization,
    loadingDetail: isLoadingDetail,
    fetchOrganizations,
    handleToggleStatus,
    handleViewDetail,
    handleCloseDetail,
    setFilters,
    clearError,
  }
}

export default useOrganizations
