/**
 * Registration Request Types
 * Types for the admin panel to manage organization registration requests
 */

export type RegistrationRequestStatus = 'pending' | 'approved' | 'rejected'
export type UserStatus = 'active' | 'suspended'
export type OrganizationStatus = 'active' | 'inactive' | 'suspended'

/**
 * Filter for the consolidated display status.
 * Used for filtering the table view.
 */
export type DisplayStatusFilter =
  | 'default'     // Pendientes + Activos
  | 'pending'     // Solo pendientes
  | 'active'      // Solo activos
  | 'suspended'   // Solo suspendidos
  | 'rejected'    // Solo rechazadas
  | 'deleted'     // Solo eliminadas

export interface RegistrationRequest {
  id: number
  dni: string
  full_name: string
  email: string
  whatsapp: string
  organization_name: string
  organization_sector: string
  website: string | null
  motivation: string
  status: RegistrationRequestStatus
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
  user_id: number | null
  organization_id: number | null
  user_status: UserStatus | null
  organization_status: OrganizationStatus | null
  is_deleted: boolean
}

export interface RegistrationRequestDetail extends RegistrationRequest {
  first_name: string
  last_name: string
  profile_photo: string | null
  organization_cuit: string
  organization_logo: string | null
}

export interface RegistrationRequestFilters {
  status?: RegistrationRequestStatus | null
}

export interface ApprovalResult {
  user_id: number
  organization_id: number
}

export interface RegistrationRequestsResponse {
  success: boolean
  data: RegistrationRequest[]
}

export interface RegistrationRequestDetailResponse {
  success: boolean
  data: RegistrationRequestDetail
}

export interface ApprovalResultResponse {
  success: boolean
  message: string
  data: ApprovalResult
}

export interface RejectResultResponse {
  success: boolean
  message: string
}

export interface SuspendResultResponse {
  success: boolean
  message: string
  data: RegistrationRequest
}

export interface DeleteResultResponse {
  success: boolean
  message: string
}
