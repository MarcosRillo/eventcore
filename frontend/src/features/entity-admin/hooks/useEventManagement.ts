/**
 * useEventManagement Hook
 *
 * Custom hook for managing the event management modal state and approval actions.
 * Coordinates with useApprovalManager to execute approval workflow operations.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { useApprovalManager } from './useApprovalManager';
import type { Event } from '@/types/event.types';
import type { ApprovalAction } from '@/features/entity-admin/types';
import { MIN_COMMENT_LENGTH, STATUS_ACTIONS_MAP } from '@/features/entity-admin/types';

interface UseEventManagementOptions {
  onSuccess?: () => void;
}

interface UseEventManagementReturn {
  // Modal state
  isOpen: boolean;
  selectedEvent: Event | null;

  // Action state
  selectedAction: ApprovalAction | null;
  comment: string;
  commentError: string | null;
  isLoading: boolean;
  error: string | null;

  // Computed
  availableActions: ApprovalAction[];

  // Modal actions
  openModal: (event: Event) => void;
  closeModal: () => void;

  // Action handling
  selectAction: (action: ApprovalAction) => void;
  setComment: (value: string) => void;
  confirmAction: () => Promise<void>;
  cancelAction: () => void;
}

/**
 * Hook for managing event approval modal and actions
 */
export const useEventManagement = (
  options: UseEventManagementOptions = {}
): UseEventManagementReturn => {
  const { onSuccess } = options;

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Action state
  const [selectedAction, setSelectedAction] = useState<ApprovalAction | null>(null);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);

  // Use the approval manager for API calls
  const {
    isLoading,
    error,
    approveInternal,
    requestPublicApproval,
    publishEvent,
    requestChanges,
    rejectEvent,
    getAvailableActions,
  } = useApprovalManager();

  // Compute available actions based on selected event
  const availableActions = useMemo((): ApprovalAction[] => {
    if (!selectedEvent) return [];
    // Backend EventResource returns 'code', type definition expects 'status_code'
    // Support both formats for compatibility
    const statusCode = typeof selectedEvent.status === 'object'
      ? (selectedEvent.status.status_code || (selectedEvent.status as { code?: string }).code || '')
      : selectedEvent.status;
    return STATUS_ACTIONS_MAP[statusCode as EventStatusCode] || [];
  }, [selectedEvent]);

  // Check if the selected action requires a comment
  const actionRequiresComment = useCallback((action: ApprovalAction | null): boolean => {
    return action === 'request_changes' || action === 'reject';
  }, []);

  // Validate comment if required
  const validateComment = useCallback((): boolean => {
    if (!actionRequiresComment(selectedAction)) {
      return true;
    }

    if (comment.trim().length < MIN_COMMENT_LENGTH) {
      setCommentError(`El comentario debe tener al menos ${MIN_COMMENT_LENGTH} caracteres`);
      return false;
    }

    return true;
  }, [selectedAction, comment, actionRequiresComment]);

  // Open modal with event
  const openModal = useCallback((event: Event) => {
    setSelectedEvent(event);
    setIsOpen(true);
    setSelectedAction(null);
    setComment('');
    setCommentError(null);
  }, []);

  // Close modal and reset state
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedEvent(null);
    setSelectedAction(null);
    setComment('');
    setCommentError(null);
  }, []);

  // Select an action
  const selectAction = useCallback((action: ApprovalAction) => {
    setSelectedAction(action);
    setCommentError(null);
  }, []);

  // Handle comment change
  const handleSetComment = useCallback((value: string) => {
    setComment(value);
    // Clear error if comment becomes valid
    if (value.trim().length >= MIN_COMMENT_LENGTH) {
      setCommentError(null);
    }
  }, []);

  // Cancel action selection
  const cancelAction = useCallback(() => {
    setSelectedAction(null);
    setComment('');
    setCommentError(null);
  }, []);

  // Confirm and execute the selected action
  const confirmAction = useCallback(async () => {
    if (!selectedEvent || !selectedAction) return;

    // Validate comment if required
    if (!validateComment()) {
      return;
    }

    let result: Event | null = null;

    switch (selectedAction) {
      case 'approve_internal':
        result = await approveInternal(selectedEvent.id);
        break;
      case 'request_public':
        result = await requestPublicApproval(selectedEvent.id);
        break;
      case 'publish':
        result = await publishEvent(selectedEvent.id);
        break;
      case 'request_changes':
        result = await requestChanges(selectedEvent.id, comment);
        break;
      case 'reject':
        result = await rejectEvent(selectedEvent.id, comment);
        break;
    }

    if (result) {
      closeModal();
      onSuccess?.();
    }
  }, [
    selectedEvent,
    selectedAction,
    comment,
    validateComment,
    approveInternal,
    requestPublicApproval,
    publishEvent,
    requestChanges,
    rejectEvent,
    closeModal,
    onSuccess,
  ]);

  return {
    // Modal state
    isOpen,
    selectedEvent,

    // Action state
    selectedAction,
    comment,
    commentError,
    isLoading,
    error: error?.message ?? null,

    // Computed
    availableActions,

    // Modal actions
    openModal,
    closeModal,

    // Action handling
    selectAction,
    setComment: handleSetComment,
    confirmAction,
    cancelAction,
  };
};

export default useEventManagement;
