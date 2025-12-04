/**
 * Approval Service
 *
 * Handles API calls for approval actions.
 * Synchronized with backend ApprovalController (3NF schema)
 */

import apiClient from '@/services/apiClient'
import { Event } from '@/features/approval/types/approval.types'

export interface ApproveOptions {
  comments?: string
}

export interface PublishOptions {
  scheduledAt?: string // ISO 8601 format
}

export interface RequestChangesOptions {
  validate?: boolean // Default: true
}

export const approvalService = {
  /**
   * Approve an event (change status to approved_internal)
   * @param eventId - Event ID to approve
   * @param options - Optional comments (max 1000 chars)
   */
  approve: async (
    eventId: number,
    options?: ApproveOptions
  ): Promise<Event> => {
    // Client-side validation
    if (options?.comments && options.comments.length > 1000) {
      throw new Error('Los comentarios no pueden exceder 1000 caracteres')
    }

    return apiClient.patch(`/events/${eventId}/approve`, {
      comments: options?.comments
    })
  },

  /**
   * Reject an event with reason
   * @param eventId - Event ID to reject
   * @param reason - Rejection reason (min 10, max 1000 chars)
   */
  reject: async (eventId: number, reason: string): Promise<Event> => {
    // Client-side validation (backend enforces same rules)
    if (!reason || reason.trim().length < 10) {
      throw new Error('La razón debe tener al menos 10 caracteres')
    }
    if (reason.length > 1000) {
      throw new Error('La razón no puede exceder 1000 caracteres')
    }

    return apiClient.patch(`/events/${eventId}/reject`, { reason })
  },

  /**
   * Request changes to an event
   * @param eventId - Event ID
   * @param reason - Reason for changes (min 10, max 1000 chars)
   * @param options - Validation options
   */
  requestChanges: async (
    eventId: number,
    reason: string,
    options?: RequestChangesOptions
  ): Promise<Event> => {
    // Client-side validation (can be disabled for tests)
    if (options?.validate !== false) {
      if (!reason || reason.trim().length < 10) {
        throw new Error('La razón debe tener al menos 10 caracteres')
      }
      if (reason.length > 1000) {
        throw new Error('La razón no puede exceder 1000 caracteres')
      }
    }

    return apiClient.patch(`/events/${eventId}/request-changes`, { reason })
  },

  /**
   * Request public approval for internally approved event
   * Transitions: approved_internal → pending_public_approval
   * @param eventId - Event ID
   */
  requestPublicApproval: async (eventId: number): Promise<Event> => {
    return apiClient.patch(`/events/${eventId}/request-public`)
  },

  /**
   * Publish event to public calendar
   * @param eventId - Event ID to publish
   * @param options - Optional scheduled publish date
   */
  publish: async (
    eventId: number,
    options?: PublishOptions
  ): Promise<Event> => {
    // Client-side validation for optional scheduled_at
    if (options?.scheduledAt) {
      const scheduledDate = new Date(options.scheduledAt)
      const now = new Date()

      if (isNaN(scheduledDate.getTime())) {
        throw new Error('La fecha programada debe ser válida')
      }
      if (scheduledDate <= now) {
        throw new Error('La fecha programada debe ser futura')
      }
    }

    return apiClient.patch(`/events/${eventId}/publish`, {
      scheduled_at: options?.scheduledAt
    })
  }
}
