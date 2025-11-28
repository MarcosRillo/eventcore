/**
 * Event Approval Service
 * API calls for event approval, rejection, and change requests
 */

import apiClient from '@/services/apiClient';

// Types for approval actions
export type ApprovalAction = 'approve' | 'reject' | 'request_changes';

export interface ApprovalRequest {
  action: ApprovalAction;
  comments?: string;
  reason?: string;
}

export interface EventStatusHistoryItem {
  id: number;
  status_code: string;
  status_name: string;
  changed_at: string;
  changed_by: {
    id: number;
    name: string;
    role: string;
  };
  comments?: string;
  reason?: string;
}

export interface EventLocation {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  capacity?: number;
  accessibility_features?: string[];
}

export interface EventOrganization {
  id: number;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  legal_type: string;
  registration_number?: string;
  contact_person: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface EventDetailResponse {
  id: number;
  title: string;
  description: string;
  category: {
    id: number;
    name: string;
    color: string;
  };
  event_type: {
    code: string;
    name: string;
  };
  status: {
    code: string;
    name: string;
  };
  organization: EventOrganization;
  locations: EventLocation[];
  event_dates: Array<{
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    is_main_date: boolean;
  }>;
  target_audience: string;
  expected_attendance: number;
  registration_required: boolean;
  registration_url?: string;
  cost_type: 'free' | 'paid' | 'donation';
  cost_amount?: number;
  accessibility_features: string[];
  special_requirements?: string;
  contact_email: string;
  contact_phone?: string;
  website_url?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  created_at: string;
  updated_at: string;
  submitted_at: string;
  status_history: EventStatusHistoryItem[];
  current_status_duration: {
    days: number;
    hours: number;
    minutes: number;
  };
  can_approve: boolean;
  can_reject: boolean;
  can_request_changes: boolean;
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  event: {
    id: number;
    status: {
      code: string;
      name: string;
    };
    updated_at: string;
  };
}

class EventApprovalService {
  /**
   * Get complete event details for approval review
   */
  async getEventDetail(eventId: number): Promise<EventDetailResponse> {
    try {
      const response = await apiClient.get<EventDetailResponse>(`/events/${eventId}/detail`);
      return response.data;
    } catch (error) {
      // Temporary fallback: If endpoint doesn't exist, throw meaningful error
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('La funcionalidad de detalles de eventos está en desarrollo. Por favor, contacte al administrador.');
      }
      throw error;
    }
  }

  /**
   * Approve an event
   */
  async approveEvent(eventId: number, comments?: string): Promise<ApprovalResponse> {
    try {
      const response = await apiClient.post<ApprovalResponse>(`/events/${eventId}/approve`, {
        comments,
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('La funcionalidad de aprobación de eventos está en desarrollo. Por favor, contacte al administrador.');
      }
      throw error;
    }
  }

  /**
   * Reject an event
   */
  async rejectEvent(eventId: number, reason: string, comments?: string): Promise<ApprovalResponse> {
    try {
      const response = await apiClient.post<ApprovalResponse>(`/events/${eventId}/reject`, {
        reason,
        comments,
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('La funcionalidad de rechazo de eventos está en desarrollo. Por favor, contacte al administrador.');
      }
      throw error;
    }
  }

  /**
   * Request changes to an event
   */
  async requestChanges(eventId: number, reason: string, comments?: string): Promise<ApprovalResponse> {
    try {
      const response = await apiClient.post<ApprovalResponse>(`/events/${eventId}/request-changes`, {
        reason,
        comments,
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('La funcionalidad de solicitud de cambios está en desarrollo. Por favor, contacte al administrador.');
      }
      throw error;
    }
  }

  /**
   * Generic approval action handler
   */
  async performAction(eventId: number, request: ApprovalRequest): Promise<ApprovalResponse> {
    switch (request.action) {
      case 'approve':
        return this.approveEvent(eventId, request.comments);
      
      case 'reject':
        if (!request.reason) {
          throw new Error('Reason is required for rejection');
        }
        return this.rejectEvent(eventId, request.reason, request.comments);
      
      case 'request_changes':
        if (!request.reason) {
          throw new Error('Reason is required for requesting changes');
        }
        return this.requestChanges(eventId, request.reason, request.comments);
      
      default:
        throw new Error(`Invalid action: ${request.action}`);
    }
  }

  /**
   * Validate approval request based on business rules
   */
  validateApprovalRequest(action: ApprovalAction, reason?: string): string[] {
    const errors: string[] = [];

    switch (action) {
      case 'reject':
        if (!reason || reason.trim().length < 10) {
          errors.push('La razón de rechazo debe tener al menos 10 caracteres');
        }
        break;

      case 'request_changes':
        if (!reason || reason.trim().length < 20) {
          errors.push('La descripción de cambios solicitados debe tener al menos 20 caracteres');
        }
        break;

      case 'approve':
        // Approval can be done with or without comments
        break;

      default:
        errors.push('Acción no válida');
    }

    return errors;
  }

  /**
   * Get formatted status duration text
   */
  getStatusDurationText(duration: { days: number; hours: number; minutes: number }): string {
    if (duration.days > 0) {
      return `${duration.days} día${duration.days > 1 ? 's' : ''}`;
    } else if (duration.hours > 0) {
      return `${duration.hours} hora${duration.hours > 1 ? 's' : ''}`;
    } else {
      return `${duration.minutes} minuto${duration.minutes > 1 ? 's' : ''}`;
    }
  }

  /**
   * Get action button configuration based on event status and permissions
   */
  getAvailableActions(event: EventDetailResponse): Array<{
    action: ApprovalAction;
    label: string;
    color: 'green' | 'red' | 'yellow';
    enabled: boolean;
  }> {
    return [
      {
        action: 'approve' as ApprovalAction,
        label: 'Aprobar',
        color: 'green' as const,
        enabled: event.can_approve,
      },
      {
        action: 'reject' as ApprovalAction,
        label: 'Rechazar',
        color: 'red' as const,
        enabled: event.can_reject,
      },
      {
        action: 'request_changes' as ApprovalAction,
        label: 'Solicitar Cambios',
        color: 'yellow' as const,
        enabled: event.can_request_changes,
      },
    ];
  }
}

// Export singleton instance
export const eventApprovalService = new EventApprovalService();

// Export class for testing
export { EventApprovalService };