/**
 * Invitation Service
 * API service functions for invitation management
 */

import {
  Invitation,
  InvitationsListResponse,
  InvitationActionResponse,
  SendInvitationData,
  AssignableRole,
  RolesListResponse,
  ValidateInvitationResponse,
  AcceptInvitationData,
  AcceptInvitationResponse,
} from '@/features/invitations/types/invitation.types'
import apiClient from '@/services/apiClient'

/**
 * Fetch all pending invitations
 */
export const getInvitations = async (): Promise<Invitation[]> => {
  const response = await apiClient.get<InvitationsListResponse>('/invitations')
  return response.data.data
}

/**
 * Send a new invitation
 * @param data
 */
export const sendInvitation = async (
  data: SendInvitationData
): Promise<Invitation> => {
  const response = await apiClient.post<InvitationActionResponse>(
    '/invitations',
    data
  )
  return response.data.data!
}

/**
 * Resend an invitation with a new token
 * @param id
 */
export const resendInvitation = async (id: number): Promise<Invitation> => {
  const response = await apiClient.post<InvitationActionResponse>(
    `/invitations/${id}/resend`
  )
  return response.data.data!
}

/**
 * Cancel/revoke an invitation
 * @param id
 */
export const cancelInvitation = async (id: number): Promise<void> => {
  await apiClient.delete(`/invitations/${id}`)
}

/**
 * Get roles that the current user can assign to invitations
 */
export const getAssignableRoles = async (): Promise<AssignableRole[]> => {
  const response = await apiClient.get<RolesListResponse>('/roles/assignable')
  return response.data.data
}

/**
 * Validate an invitation token (public endpoint)
 * @param token
 */
export const validateInvitationToken = async (
  token: string
): Promise<ValidateInvitationResponse['data']> => {
  const response = await apiClient.get<ValidateInvitationResponse>(
    `/auth/invitations/validate/${token}`
  )
  return response.data.data
}

/**
 * Accept an invitation and create account (public endpoint)
 * @param data
 */
export const acceptInvitation = async (
  data: AcceptInvitationData
): Promise<AcceptInvitationResponse['data']> => {
  const response = await apiClient.post<AcceptInvitationResponse>(
    '/auth/invitations/accept',
    data
  )
  return response.data.data
}

/**
 * Export default object with all service functions
 */
const invitationService = {
  getInvitations,
  sendInvitation,
  resendInvitation,
  cancelInvitation,
  getAssignableRoles,
  validateInvitationToken,
  acceptInvitation,
}

export default invitationService
