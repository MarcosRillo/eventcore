/**
 * Organization Service
 * API service functions for organization management
 */

import type {
  Organization,
  OrganizationFilters,
  OrganizationsResponse,
  OrganizationResponse,
  PaginationMeta,
} from '@/features/organizations/types/organization.types'
import apiClient from '@/services/apiClient'

/**
 * Fetch all linked organizations with optional filters
 * @param filters
 */
export const getOrganizations = async (
  filters?: OrganizationFilters
): Promise<{ data: Organization[]; pagination: PaginationMeta }> => {
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
  const url = queryString ? `/organizations?${queryString}` : '/organizations'

  const response = await apiClient.get<OrganizationsResponse>(url)
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  }
}

/**
 * Fetch a single organization by ID
 * @param id
 */
export const getOrganization = async (id: number): Promise<Organization> => {
  const response = await apiClient.get<OrganizationResponse>(
    `/organizations/${id}`
  )
  return response.data.data
}

/**
 * Toggle organization status (active/suspended)
 * @param id
 */
export const toggleOrganizationStatus = async (
  id: number
): Promise<Organization> => {
  const response = await apiClient.patch<OrganizationResponse>(
    `/organizations/${id}/status`
  )
  return response.data.data
}

/**
 * Export default object with all service functions
 */
const organizationService = {
  getOrganizations,
  getOrganization,
  toggleOrganizationStatus,
}

export default organizationService
