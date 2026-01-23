/**
 * useApprovalManager Hook
 *
 * Custom React hook for managing event approval workflow operations.
 * Uses React 19 useTransition for loading states.
 * Provides functions to handle event state transitions with error handling.
 */

import { useCallback, useState, useTransition } from 'react';

import { approvalService, approvalValidation } from '@/features/events/services/approvalService';
import { ApiError } from '@/types/api-response.types';
import { Event } from '@/types/event.types';

interface ApprovalError {
  message: string;
  details?: string;
}

interface UseApprovalManagerReturn {
  // State - isPending from useTransition replaces isLoading
  isLoading: boolean;
  error: ApprovalError | null;

  // Double-Level Workflow Actions
  approveInternal: (eventId: number, comment?: string) => Promise<Event | null>;
  requestPublicApproval: (eventId: number, comment?: string) => Promise<Event | null>;
  publishEvent: (eventId: number) => Promise<Event | null>;
  requestChanges: (eventId: number, feedback: string) => Promise<Event | null>;
  rejectEvent: (eventId: number, reason: string) => Promise<Event | null>;
  toggleFeatured: (eventId: number) => Promise<Event | null>;

  // Validation helpers - Double Level
  canApproveInternal: (event: Event) => boolean;
  canRequestPublicApproval: (event: Event) => boolean;
  canPublish: (event: Event) => boolean;
  canRequestChanges: (event: Event) => boolean;
  canReject: (event: Event) => boolean;
  isInternallyApproved: (event: Event) => boolean;
  isPublished: (event: Event) => boolean;
  getWorkflowStage: (event: Event) => string;
  getAvailableActions: (event: Event) => string[];

  // Legacy methods for backward compatibility
  approveEvent: (eventId: number, comment?: string) => Promise<Event | null>;
  canApprove: (event: Event) => boolean;

  // Utility
  clearError: () => void;
}

/**
 * Hook for managing event approval workflow
 * Uses React 19 useTransition for automatic loading state management
 */
export const useApprovalManager = (): UseApprovalManagerReturn => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<ApprovalError | null>(null);

  /**
   * Generic error handler for approval operations
   */
  const handleError = useCallback((error: ApiError | Error | unknown): ApprovalError => {
    // Handle API errors with proper type guards
    if (error && typeof error === 'object' && 'message' in error) {
      const apiError = error as unknown as ApiError;
      if (apiError.message) {
        return {
          message: apiError.message,
          details: apiError.details ? JSON.stringify(apiError.details) : undefined
        };
      }
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      return { message: error.message };
    }

    return { message: 'Ha ocurrido un error inesperado' };
  }, []);

  /**
   * Generic approval operation wrapper using useTransition
   */
  const executeApprovalOperation = useCallback(async <T extends unknown[]>(
    operation: (...args: T) => Promise<Event>,
    ...args: T
  ): Promise<Event | null> => {
    setError(null);

    return new Promise((resolve) => {
      startTransition(async () => {
        try {
          const updatedEvent = await operation(...args);
          resolve(updatedEvent);
        } catch (err) {
          const approvalError = handleError(err);
          setError(approvalError);
          resolve(null);
        }
      });
    });
  }, [handleError, startTransition]);

  /**
   * Approve event internally (pending_internal_approval → approved_internal)
   */
  const approveInternal = useCallback(async (eventId: number, comment?: string): Promise<Event | null> => {
    return executeApprovalOperation(
      (id: number, comment?: string) => approvalService.approveInternal(id, comment),
      eventId,
      comment
    );
  }, [executeApprovalOperation]);

  /**
   * Request public approval (approved_internal → pending_public_approval)
   */
  const requestPublicApproval = useCallback(async (eventId: number, comment?: string): Promise<Event | null> => {
    return executeApprovalOperation(
      (id: number, comment?: string) => approvalService.requestPublicApproval(id, comment),
      eventId,
      comment
    );
  }, [executeApprovalOperation]);

  /**
   * Publish event to public calendar (pending_public_approval → published)
   */
  const publishEvent = useCallback(async (eventId: number): Promise<Event | null> => {
    return executeApprovalOperation(
      (id: number) => approvalService.publishEvent(id),
      eventId
    );
  }, [executeApprovalOperation]);

  /**
   * Request changes to event
   */
  const requestChanges = useCallback(async (eventId: number, feedback: string): Promise<Event | null> => {
    if (!feedback || feedback.trim().length < 5) {
      setError({ message: 'El feedback debe tener al menos 5 caracteres' });
      return null;
    }

    return executeApprovalOperation(
      (id: number, feedback: string) => approvalService.requestChanges(id, feedback),
      eventId,
      feedback
    );
  }, [executeApprovalOperation]);

  /**
   * Reject event
   */
  const rejectEvent = useCallback(async (eventId: number, reason: string): Promise<Event | null> => {
    if (!reason || reason.trim().length < 5) {
      setError({ message: 'El motivo del rechazo debe tener al menos 5 caracteres' });
      return null;
    }

    return executeApprovalOperation(
      (id: number, reason: string) => approvalService.rejectEvent(id, reason),
      eventId,
      reason
    );
  }, [executeApprovalOperation]);

  /**
   * Toggle featured status
   */
  const toggleFeatured = useCallback(async (eventId: number): Promise<Event | null> => {
    return executeApprovalOperation(
      (id: number) => approvalService.toggleFeatured(id),
      eventId
    );
  }, [executeApprovalOperation]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Legacy approve method for backward compatibility
   */
  const approveEvent = useCallback(async (eventId: number, comment?: string): Promise<Event | null> => {
    return approveInternal(eventId, comment);
  }, [approveInternal]);

  return {
    // State - isPending from useTransition replaces manual isLoading
    isLoading: isPending,
    error,

    // Double-Level Workflow Actions
    approveInternal,
    requestPublicApproval,
    publishEvent,
    requestChanges,
    rejectEvent,
    toggleFeatured,

    // Validation helpers - pass through from service
    canApproveInternal: approvalValidation.canApproveInternal,
    canRequestPublicApproval: approvalValidation.canRequestPublicApproval,
    canPublish: approvalValidation.canPublish,
    canRequestChanges: approvalValidation.canRequestChanges,
    canReject: approvalValidation.canReject,
    isInternallyApproved: approvalValidation.isInternallyApproved,
    isPublished: approvalValidation.isPublished,
    getWorkflowStage: approvalValidation.getWorkflowStage,
    getAvailableActions: approvalValidation.getAvailableActions,

    // Legacy methods for backward compatibility
    approveEvent,
    canApprove: approvalValidation.canApprove,

    // Utility
    clearError,
  };
};

export default useApprovalManager;