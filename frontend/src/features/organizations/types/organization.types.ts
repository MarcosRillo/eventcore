/**
 * Organization types for the organizations feature
 */

export interface OrganizationStatus {
  id: number
  status_code: string
  status_name: string
  description: string
  can_create_events: boolean
}

export interface OrganizationType {
  id: number
  type_code: string
  type_name: string
  description: string
  hierarchy_level: number
}

export interface OrganizationUser {
  id: number
  name: string
  email: string
  role?: {
    id: number
    role_code: string
    role_name: string
  }
}

export interface Organization {
  id: number
  name: string
  cuit: string
  description: string | null
  slug: string
  trust_level: number
  parent_id: number | null
  status_id: number
  type_id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  // Metrics
  events_total: number
  events_published: number
  events_pending: number
  events_rejected: number
  // Relations
  status: OrganizationStatus
  type: OrganizationType
  users: OrganizationUser[]
}

export interface OrganizationFilters {
  search?: string
  status?: 'all' | 'active' | 'suspended'
  per_page?: number
  page?: number
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface OrganizationsResponse {
  success: boolean
  message: string
  data: Organization[]
  pagination: PaginationMeta
}

export interface OrganizationResponse {
  success: boolean
  message: string
  data: Organization
}

/**
 * Helper to check if organization is active
 */
export const isOrganizationActive = (org: Organization): boolean => {
  return org.status?.status_code === 'active'
}

/**
 * Helper to get status badge color
 */
export const getStatusColor = (statusCode: string): string => {
  switch (statusCode) {
    case 'active':
      return 'green'
    case 'suspended':
      return 'red'
    case 'pending':
      return 'yellow'
    default:
      return 'gray'
  }
}
