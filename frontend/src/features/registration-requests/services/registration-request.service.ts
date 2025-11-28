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
} from '../types/registration-request.types'

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
  getAll: getRegistrationRequests,
  getById: getRegistrationRequestById,
  approve: approveRegistrationRequest,
  reject: rejectRegistrationRequest,
  suspend: suspendRegistrationRequest,
  unsuspend: unsuspendRegistrationRequest,
  delete: deleteRegistrationRequest,
}

export default registrationRequestService
