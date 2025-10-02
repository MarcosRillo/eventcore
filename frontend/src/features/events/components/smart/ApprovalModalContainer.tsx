/**
 * Approval Modal Container - Smart Component
 * Handles approval form logic, validation, and actions for ApprovalModal
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Event, EVENT_STATUS } from '@/types/event.types';
import {
  ApprovalModal,
  ApprovalActionOption,
  ApprovalFormData,
  ApprovalFormErrors
} from '@/features/events/components/dumb/ApprovalModal';

interface ApprovalModalContainerProps {
  isOpen: boolean;
  event: Event | null;
  onClose: () => void;
  onSuccess: () => void;
  onApproveInternal: (eventId: number) => void;
  onRequestPublic: (eventId: number, comment?: string) => void;
  onApprovePublic: (eventId: number, comment?: string) => void;
  onRequestChanges: (eventId: number, comment: string) => void;
  onReject: (eventId: number, comment: string) => void;
}

export const ApprovalModalContainer: React.FC<ApprovalModalContainerProps> = ({
  isOpen,
  event,
  onClose,
  onSuccess,
  onApproveInternal,
  onRequestPublic,
  onApprovePublic,
  onRequestChanges,
  onReject,
}) => {
  // Form state
  const [formData, setFormData] = useState<ApprovalFormData>({
    action: '',
    comment: '',
  });

  const [errors, setErrors] = useState<ApprovalFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Get available actions based on event status
  const availableActions = useMemo((): ApprovalActionOption[] => {
    if (!event) return [];

    const actions = [];
    const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status;

    switch (statusCode) {
      case EVENT_STATUS.DRAFT:
        actions.push(
          { value: 'approve_internal', label: 'Aprobar Internamente' },
          { value: 'request_changes', label: 'Solicitar Cambios' },
          { value: 'reject', label: 'Rechazar' }
        );
        break;

      case EVENT_STATUS.APPROVED_INTERNAL:
        actions.push(
          { value: 'request_public', label: 'Solicitar Aprobación Pública' }
        );
        break;

      case EVENT_STATUS.PENDING_PUBLIC_APPROVAL:
        actions.push(
          { value: 'approve_public', label: 'Aprobar para Publicación' },
          { value: 'request_changes', label: 'Solicitar Cambios' },
          { value: 'reject', label: 'Rechazar' }
        );
        break;

      case EVENT_STATUS.REQUIRES_CHANGES:
        actions.push(
          { value: 'approve_internal', label: 'Aprobar Internamente' },
          { value: 'request_changes', label: 'Solicitar Más Cambios' },
          { value: 'reject', label: 'Rechazar' }
        );
        break;

      case EVENT_STATUS.PENDING_INTERNAL_APPROVAL:
        actions.push(
          { value: 'approve_internal', label: 'Aprobar Internamente' },
          { value: 'request_changes', label: 'Solicitar Cambios' },
          { value: 'reject', label: 'Rechazar' }
        );
        break;
    }

    return actions;
  }, [event]);

  // Check if comment is required for action
  const requiresComment = (action: string): boolean => {
    return action === 'request_changes' || action === 'reject';
  };

  // Form validation
  const validateForm = (): ApprovalFormErrors => {
    const newErrors: ApprovalFormErrors = {};

    if (!formData.action) {
      newErrors.action = 'Debes seleccionar una acción';
    }

    // Require comment for certain actions
    if (requiresComment(formData.action) && !formData.comment.trim()) {
      newErrors.comment = 'Es necesario proporcionar un comentario para esta acción';
    }

    return newErrors;
  };

  // Handle field changes
  const handleFieldChange = (field: keyof ApprovalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!event) {
      console.error('No hay evento para procesar');
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { action, comment } = formData;

      switch (action) {
        case 'approve_internal':
          onApproveInternal(event.id);
          break;
        case 'request_public':
          onRequestPublic(event.id, comment || undefined);
          break;
        case 'approve_public':
          onApprovePublic(event.id, comment || undefined);
          break;
        case 'request_changes':
          onRequestChanges(event.id, comment);
          break;
        case 'reject':
          onReject(event.id, comment);
          break;
        default:
          throw new Error('Acción no válida');
      }

      // Reset form and close modal on success
      setFormData({ action: '', comment: '' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error processing approval action:', error);
      setErrors({ action: 'Error al procesar la acción. Inténtalo de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isLoading) {
      setFormData({ action: '', comment: '' });
      setErrors({});
      onClose();
    }
  };

  return (
    <ApprovalModal
      isOpen={isOpen}
      event={event}
      formData={formData}
      errors={errors}
      isLoading={isLoading}
      availableActions={availableActions}
      submitButtonText="Confirmar"
      onClose={handleClose}
      onFieldChange={handleFieldChange}
      onSubmit={handleSubmit}
      requiresComment={requiresComment}
    />
  );
};