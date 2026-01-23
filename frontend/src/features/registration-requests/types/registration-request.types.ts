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

// ============================================
// Public Form Types
// ============================================

/**
 * Data for creating a new registration request (public form)
 */
export interface CreateRegistrationRequestData {
  dni: string
  first_name: string
  last_name: string
  email: string
  whatsapp: string
  profile_photo?: File
  organization_name: string
  organization_cuit: string
  organization_sector: string
  organization_logo?: File
  website?: string
  motivation: string
}

/**
 * Form data state (string values for controlled inputs)
 */
export interface RegistrationRequestFormData {
  dni: string
  first_name: string
  last_name: string
  email: string
  whatsapp: string
  profile_photo: File | null
  organization_name: string
  organization_cuit: string
  organization_sector: string
  organization_logo: File | null
  website: string
  motivation: string
  accepted_terms: boolean
}

/**
 * Form validation errors
 */
export interface RegistrationRequestFormErrors {
  dni?: string
  first_name?: string
  last_name?: string
  email?: string
  whatsapp?: string
  profile_photo?: string
  organization_name?: string
  organization_cuit?: string
  organization_sector?: string
  organization_logo?: string
  website?: string
  motivation?: string
  accepted_terms?: string
  general?: string
}

/**
 * Data for rejecting a request
 */
export interface RejectRequestData {
  reason: string
}

/**
 * API Response for creating a request
 */
export interface CreateRequestResponse {
  success: boolean
  message: string
  data: {
    id: number
    email: string
    status: RegistrationRequestStatus
  }
}

/**
 * Initial form data state
 */
export const initialFormData: RegistrationRequestFormData = {
  dni: '',
  first_name: '',
  last_name: '',
  email: '',
  whatsapp: '',
  profile_photo: null,
  organization_name: '',
  organization_cuit: '',
  organization_sector: '',
  organization_logo: null,
  website: '',
  motivation: '',
  accepted_terms: false,
}

// ============================================
// Helper Functions
// ============================================

/**
 * Check if request is pending
 * @param request
 */
export const isRequestPending = (request: RegistrationRequest): boolean => {
  return request.status === 'pending'
}

/**
 * Check if request is approved
 * @param request
 */
export const isRequestApproved = (request: RegistrationRequest): boolean => {
  return request.status === 'approved'
}

/**
 * Check if request is rejected
 * @param request
 */
export const isRequestRejected = (request: RegistrationRequest): boolean => {
  return request.status === 'rejected'
}

/**
 * Check if user/org is suspended (only for approved requests)
 * @param request
 */
export const isRequestSuspended = (request: RegistrationRequest): boolean => {
  return request.status === 'approved' && request.user_status === 'suspended'
}

/**
 * Get display status text
 * @param request
 */
export const getStatusText = (request: RegistrationRequest): string => {
  if (isRequestSuspended(request)) {
    return 'Suspendido'
  }
  switch (request.status) {
    case 'pending':
      return 'Pendiente'
    case 'approved':
      return 'Aprobado'
    case 'rejected':
      return 'Rechazado'
    default:
      return 'Desconocido'
  }
}
