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
 * Response from validating an invitation token (public endpoint)
 */
export interface ValidateInvitationResponse {
  success: boolean
  data: {
    email: string
    role: string
    invited_by: string
    expires_at: string
  }
}

/**
 * Data required to accept an invitation
 */
export interface AcceptInvitationData {
  token: string
  name: string
  dni: string
  password: string
  password_confirmation: string
}

/**
 * Response from accepting an invitation
 */
export interface AcceptInvitationResponse {
  success: boolean
  message: string
  data: {
    user: {
      id: number
      name: string
      email: string
    }
    access_token: string
    refresh_token: string
    expires_at: string
  }
}

/**
 * Checks if an invitation is expired based on expires_at
 * @param invitation
 */
export const isInvitationExpired = (invitation: Invitation): boolean => {
  return new Date(invitation.expires_at) < new Date()
}

/**
 * Gets the display status of an invitation
 * @param invitation
 */
export const getInvitationStatus = (invitation: Invitation): InvitationStatus => {
  if (isInvitationExpired(invitation)) {
    return 'expired'
  }
  return 'pending'
}
