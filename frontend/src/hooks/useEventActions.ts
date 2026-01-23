/**
 * Event Actions Hook
 * Manages approval, rejection, and change request actions with loading states
 */

import { useCallback,useState } from 'react';

import {
  ApprovalRequest,
  ApprovalResponse,
  eventApprovalService} from '@/services/eventApprovalService';

interface UseEventActionsReturn {
  isPerformingAction: boolean;
  actionError: string | null;
  performAction: (eventId: number, request: ApprovalRequest) => Promise<ApprovalResponse | null>;
  clearError: () => void;
}

export const useEventActions = (): UseEventActionsReturn => {
  const [isPerformingAction, setIsPerformingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const performAction = useCallback(async (
    eventId: number, 
    request: ApprovalRequest
  ): Promise<ApprovalResponse | null> => {
    // Clear any previous errors
    setActionError(null);
    
    // Validate the request before making API call
    const validationErrors = eventApprovalService.validateApprovalRequest(
      request.action,
      request.reason
    );

    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join('. ');
      setActionError(errorMessage);
      return null;
    }

    setIsPerformingAction(true);

    try {
      const result = await eventApprovalService.performAction(eventId, request);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al realizar la acción. Por favor, intente nuevamente.';
      setActionError(errorMessage);
      return null;
    } finally {
      setIsPerformingAction(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setActionError(null);
  }, []);

  return {
    isPerformingAction,
    actionError,
    performAction,
    clearError,
  };
};