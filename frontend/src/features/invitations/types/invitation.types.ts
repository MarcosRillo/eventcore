/**
 * Invitation types for the invitations feature
 */

export interface InvitationRole {
  id: number
  role_name: string
  role_code: string
}

/**
 * Role available for assignment in invitations
 */
export interface AssignableRole {
  id: number
  role_code: string
  role_name: string
}

export interface RolesListResponse {
  success: boolean
  data: AssignableRole[]
}

export interface InvitationInviter {
  id: number
  name: string
}

export interface Invitation {
  id: number
  email: string
  role: string
  invited_by: string
  expires_at: string
  created_at: string
}

export interface InvitationDetails extends Invitation {
  role_data?: InvitationRole
  inviter_data?: InvitationInviter
}

export type InvitationStatus = 'pending' | 'expired' | 'accepted'

export interface InvitationFilters {
  status?: InvitationStatus | 'all'
}

export interface SendInvitationData {
  email: string
  role_id: number
}

export interface InvitationResponse {
  success: boolean
  message?: string
  data: Invitation
}

export interface InvitationsListResponse {
  success: boolean
  data: Invitation[]
}

export interface InvitationActionResponse {
  success: boolean
  message: string
  data?: Invitation
}

/**
 * Checks if an invitation is expired based on expires_at
 */
export const isInvitationExpired = (invitation: Invitation): boolean => {
  return new Date(invitation.expires_at) < new Date()
}

/**
 * Gets the display status of an invitation
 */
export const getInvitationStatus = (invitation: Invitation): InvitationStatus => {
  if (isInvitationExpired(invitation)) {
    return 'expired'
  }
  return 'pending'
}
