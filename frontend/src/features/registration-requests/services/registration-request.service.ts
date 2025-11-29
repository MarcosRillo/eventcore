/**
 * Registration Request Service
 * API calls for managing registration requests (admin)
 */

import apiClient from '@/services/apiClient'
import {
  RegistrationRequest,
  RegistrationRequestDetail,
  RegistrationRequestFilters,
  ApprovalResult,
  RegistrationRequestsResponse,
  RegistrationRequestDetailResponse,
  ApprovalResultResponse,
  RejectResultResponse,
  SuspendResultResponse,
  DeleteResultResponse,
  CreateRegistrationRequestData,
  CreateRequestResponse,
  DisplayStatusFilter,
} from '../types/registration-request.types'

// ============================================
// Public Endpoints (No Auth Required)
// ============================================

/**
 * Submit a new registration request (public form)
 * Uses FormData to handle file uploads
 */
export const createRegistrationRequest = async (
  data: CreateRegistrationRequestData
): Promise<CreateRequestResponse['data']> => {
  const formData = new FormData()

  // Append all required text fields
  formData.append('dni', data.dni)
  formData.append('first_name', data.first_name)
  formData.append('last_name', data.last_name)
  formData.append('email', data.email)
  formData.append('whatsapp', data.whatsapp)
  formData.append('organization_name', data.organization_name)
  formData.append('organization_cuit', data.organization_cuit)
  formData.append('organization_sector', data.organization_sector)
  formData.append('motivation', data.motivation)

  // Append optional fields
  if (data.website) {
    formData.append('website', data.website)
  }

  // Append files if provided
  if (data.profile_photo) {
    formData.append('profile_photo', data.profile_photo)
  }
  if (data.organization_logo) {
    formData.append('organization_logo', data.organization_logo)
  }

  const response = await apiClient.post<CreateRequestResponse>(
    '/auth/register-request',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data.data
}

// ============================================
// Admin Endpoints (Auth Required)
// ============================================

/**
 * Get all registration requests with optional status filter
 */
export const getRegistrationRequests = async (
  filters?: RegistrationRequestFilters
): Promise<RegistrationRequest[]> => {
  const params = new URLSearchParams()

  if (filters?.status) {
    params.append('status', filters.status)
  }

  const queryString = params.toString()
  const url = queryString ? `/registration-requests?${queryString}` : '/registration-requests'

  const response = await apiClient.get<RegistrationRequestsResponse>(url)
  return response.data.data
}

/**
 * Get a single registration request by ID
 */
export const getRegistrationRequestById = async (
  id: number
): Promise<RegistrationRequestDetail> => {
  const response = await apiClient.get<RegistrationRequestDetailResponse>(
    `/registration-requests/${id}`
  )
  return response.data.data
}

/**
 * Approve a registration request (creates User + Organization)
 */
export const approveRegistrationRequest = async (
  id: number
): Promise<ApprovalResult> => {
  const response = await apiClient.post<ApprovalResultResponse>(
    `/registration-requests/${id}/approve`
  )
  return response.data.data
}

/**
 * Reject a registration request with a reason
 */
export const rejectRegistrationRequest = async (
  id: number,
  reason: string
): Promise<void> => {
  await apiClient.post<RejectResultResponse>(
    `/registration-requests/${id}/reject`,
    { reason }
  )
}

/**
 * Suspend an approved registration request (user + organization)
 */
export const suspendRegistrationRequest = async (
  id: number
): Promise<RegistrationRequest> => {
  const response = await apiClient.post<SuspendResultResponse>(
    `/registration-requests/${id}/suspend`
  )
  return response.data.data
}

/**
 * Unsuspend (reactivate) a suspended registration request
 */
export const unsuspendRegistrationRequest = async (
  id: number
): Promise<RegistrationRequest> => {
  const response = await apiClient.post<SuspendResultResponse>(
    `/registration-requests/${id}/unsuspend`
  )
  return response.data.data
}

/**
 * Delete a suspended registration request (user + organization)
 */
export const deleteRegistrationRequest = async (
  id: number
): Promise<void> => {
  await apiClient.delete<DeleteResultResponse>(
    `/registration-requests/${id}`
  )
}

const registrationRequestService = {
  // Public
  create: createRegistrationRequest,
  // Admin
  getAll: getRegistrationRequests,
  getById: getRegistrationRequestById,
  approve: approveRegistrationRequest,
  reject: rejectRegistrationRequest,
  suspend: suspendRegistrationRequest,
  unsuspend: unsuspendRegistrationRequest,
  delete: deleteRegistrationRequest,
}

export default registrationRequestService
