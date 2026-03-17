/**
 * Event Approval Service
 *
 * Handles all event approval workflow operations for the frontend.
 * Connects to the backend approval endpoints to manage event state transitions.
 */

import apiClient from '@/services/apiClient';
import { Event } from '@/types/event.types';

interface ApprovalResponse {
  message: string;
  data: Event;
}

/**
 * Service for managing event approval workflow - Double Level Approval
 */
export const approvalService = {
  /**
   * Approve event internally (pending_internal_approval → approved_internal)
   * This approves the event for internal calendar use
   * @param eventId
   * @param comment
   */
  approveInternal: async (eventId: number, comment?: string): Promise<Event> => {
    const response = await apiClient.patch<ApprovalResponse>(`/events/${eventId}/approve`, {
      comment: comment || ''
    });
    return response.data.data;
  },

  /**
   * Request public approval (approved_internal → pending_public_approval)
   * This submits the internally approved event for public calendar review
   * @param eventId
   * @param comment
   */
  requestPublicApproval: async (eventId: number, comment?: string): Promise<Event> => {
    const response = await apiClient.patch<ApprovalResponse>(`/events/${eventId}/request-public`, {
      comment: comment || ''
    });
    return response.data.data;
  },

  /**
   * Publish event (pending_public_approval → published)
   * This publishes the event to the public calendar
   * @param eventId
   */
  publishEvent: async (eventId: number): Promise<Event> => {
    const response = await apiClient.patch<ApprovalResponse>(`/events/${eventId}/publish`);
    return response.data.data;
  },

  /**
   * Request changes to event (any_state → requires_changes)
   * @param eventId
   * @param reason
   */
  requestChanges: async (eventId: number, reason: string): Promise<Event> => {
    const response = await apiClient.patch<ApprovalResponse>(`/events/${eventId}/request-changes`, {
      reason
    });
    return response.data.data;
  },

  /**
   * Approve and publish event in one step (pending_internal_approval → published)
   * Atomic backend operation: approve_internal + request_public + publish
   * @param eventId
   * @param comment
   */
  approveAndPublish: async (eventId: number, comment?: string): Promise<Event> => {
    const response = await apiClient.patch<ApprovalResponse>(`/events/${eventId}/approve-and-publish`, {
      comment: comment || ''
    });
    return response.data.data;
  },

  /**
   * Reject event (any_state → rejected)
   * @param eventId
   * @param reason
   */
  rejectEvent: async (eventId: number, reason: string): Promise<Event> => {
    const response = await apiClient.patch<ApprovalResponse>(`/events/${eventId}/reject`, {
      reason
    });
    return response.data.data;
  },

  /**
   * Toggle featured status of event
   * @param eventId
   */
  toggleFeatured: async (eventId: number): Promise<Event> => {
    const response = await apiClient.patch<ApprovalResponse>(`/events/${eventId}/toggle-featured`);
    return response.data.data;
  },

  // Legacy method for backward compatibility
  approveEvent: async (eventId: number, comment?: string): Promise<Event> => {
    return approvalService.approveInternal(eventId, comment);
  },
};

/**
 * Helper functions for validation - Double Level Workflow
 */
export const approvalValidation = {
  /**
   * Check if an event can be approved internally (pending_internal_approval → approved_internal)
   * @param event
   */
  canApproveInternal: (event: Event): boolean => {
    const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status;
    return statusCode === 'pending_internal_approval';
  },

  /**
   * Check if an internally approved event can request public approval (approved_internal → pending_public_approval)
   * @param event
   */
  canRequestPublicApproval: (event: Event): boolean => {
    const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status;
    return statusCode === 'approved_internal';
  },

  /**
   * Check if an event pending public approval can be published (pending_public_approval → published)
   * @param event
   */
  canPublish: (event: Event): boolean => {
    const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status;
    return statusCode === 'pending_public_approval';
  },

  /**
   * Check if changes can be requested (available for most states)
   * @param event
   */
  canRequestChanges: (event: Event): boolean => {
    const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status;
    // Cannot request changes on already rejected or published events
    return !['rejected', 'published', 'cancelled'].includes(statusCode);
  },

  /**
   * Check if an event can be rejected (available for most states)
   * @param event
   */
  canReject: (event: Event): boolean => {
    const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status;
    // Cannot reject already rejected, published, or cancelled events
    return !['rejected', 'published', 'cancelled'].includes(statusCode);
  },

  /**
   * Check if event is internally approved (available in internal calendar)
   * @param event
   */
  isInternallyApproved: (event: Event): boolean => {
    const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status;
    return ['approved_internal', 'pending_public_approval', 'published'].includes(statusCode);
  },

  /**
   * Check if event is published (available in public calendar)
   * @param event
   */
  isPublished: (event: Event): boolean => {
    const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status;
    return statusCode === 'published';
  },

  /**
   * Get workflow stage description
   * @param event
   */
  getWorkflowStage: (event: Event): string => {
    const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status;
    switch (statusCode) {
      case 'draft':
        return 'Borrador';
      case 'pending_internal_approval':
        return 'Pendiente aprobación interna';
      case 'approved_internal':
        return 'Aprobado para calendario interno';
      case 'pending_public_approval':
        return 'Pendiente aprobación pública';
      case 'published':
        return 'Publicado en calendario público';
      case 'requires_changes':
        return 'Requiere cambios';
      case 'rejected':
        return 'Rechazado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Estado desconocido';
    }
  },

  /**
   * Get available actions for an event based on its current state
   * @param event
   */
  getAvailableActions: (event: Event): string[] => {
    const actions: string[] = [];

    if (approvalValidation.canApproveInternal(event)) {
      actions.push('approve_internal');
    }

    if (approvalValidation.canRequestPublicApproval(event)) {
      actions.push('request_public');
    }

    if (approvalValidation.canPublish(event)) {
      actions.push('publish');
    }

    if (approvalValidation.canRequestChanges(event)) {
      actions.push('request_changes');
    }

    if (approvalValidation.canReject(event)) {
      actions.push('reject');
    }

    return actions;
  },

  // Legacy methods for backward compatibility
  canApprove: (event: Event): boolean => {
    return approvalValidation.canApproveInternal(event);
  }
};

export default approvalService;