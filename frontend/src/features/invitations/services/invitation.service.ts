/**
 * Invitation Service
 * API service functions for invitation management
 */

import apiClient from '@/services/apiClient'
import {
  Invitation,
  InvitationsListResponse,
  InvitationActionResponse,
  SendInvitationData,
  AssignableRole,
  RolesListResponse,
} from '../types/invitation.types'

/**
 * Fetch all pending invitations
 */
export const getInvitations = async (): Promise<Invitation[]> => {
  const response = await apiClient.get<InvitationsListResponse>('/invitations')
  return response.data.data
}

/**
 * Send a new invitation
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
 */
export const resendInvitation = async (id: number): Promise<Invitation> => {
  const response = await apiClient.post<InvitationActionResponse>(
    `/invitations/${id}/resend`
  )
  return response.data.data!
}

/**
 * Cancel/revoke an invitation
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
 * Export default object with all service functions
 */
const invitationService = {
  getInvitations,
  sendInvitation,
  resendInvitation,
  cancelInvitation,
  getAssignableRoles,
}

export default invitationService
