/**
 * Approval Service
 *
 * Handles API calls for approval actions.
 */

import apiClient from '@/services/apiClient'
import { Event } from '@/features/approval/types/approval.types'

export const approvalService = {
  /**
   * Approve an event (change status to approved_internal)
   */
  approve: async (eventId: number): Promise<Event> => {
    return apiClient.patch(`/events/${eventId}/approve`)
  },

  /**
   * Reject an event with reason
   */
  reject: async (eventId: number, reason: string): Promise<Event> => {
    return apiClient.patch(`/events/${eventId}/reject`, { reason })
  },

  /**
   * Request changes to an event
   */
  requestChanges: async (eventId: number, comments: string): Promise<Event> => {
    return apiClient.patch(`/events/${eventId}/request-changes`, { comments })
  },

  /**
   * Publish event to public calendar
   */
  publish: async (eventId: number): Promise<Event> => {
    return apiClient.patch(`/events/${eventId}/publish`)
  }
}
