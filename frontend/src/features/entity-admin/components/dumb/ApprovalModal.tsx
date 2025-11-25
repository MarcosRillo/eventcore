/**
 * Approval Modal - Dumb Component
 * Pure presentational modal component for event approval actions
 */

'use client';

import React from 'react';
import { Event } from '@/types/event.types';
import { Modal, Textarea, RadioGroup, Button } from '@/components/ui';

// Action option interface
export interface ApprovalActionOption {
  value: string;
  label: string;
}

// Form data interface
export interface ApprovalFormData {
  action: string;
  comment: string;
}

// Form errors interface
export interface ApprovalFormErrors {
  action?: string;
  comment?: string;
}

interface ApprovalModalProps {
  isOpen: boolean;
  event: Event | null;
  formData: ApprovalFormData;
  errors: ApprovalFormErrors;
  isLoading: boolean;
  availableActions: ApprovalActionOption[];
  submitButtonText: string;
  onClose: () => void;
  onFieldChange: (field: keyof ApprovalFormData, value: string) => void;
  onSubmit: () => void;
  requiresComment: (action: string) => boolean;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  event,
  formData,
  errors,
  isLoading,
  availableActions,
  submitButtonText,
  onClose,
  onFieldChange,
  onSubmit,
  requiresComment
}) => {
  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Acciones de Aprobación"
      size="md"
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            loading={isLoading}
            disabled={!formData.action || (requiresComment(formData.action) && !formData.comment.trim())}
          >
            {submitButtonText}
          </Button>
        </div>
      }
    >
      {/* Información del evento */}
      <div className="p-4 bg-gray-50 rounded-lg mb-6">
        <h4 className="font-medium text-gray-900">{event.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
        <div className="mt-2 text-xs text-gray-500">
          Estado actual: <span className="font-medium">
            {typeof event.status === 'object' ? event.status.status_name || event.status.status_code : event.status}
          </span>
        </div>
      </div>

      {/* Selección de acción */}
      <div>
        <RadioGroup
          label="Seleccionar acción:"
          name="action"
          value={formData.action}
          onChange={(value) => onFieldChange('action', value)}
          options={availableActions}
          error={errors.action}
        />
      </div>

      {/* Comentario */}
      {formData.action && (
        <div>
          <Textarea
            label={`Comentario ${requiresComment(formData.action) ? '*' : ''}`}
            name="comment"
            value={formData.comment}
            onChange={(e) => onFieldChange('comment', e.target.value)}
            rows={3}
            placeholder={requiresComment(formData.action)
              ? "Proporciona detalles sobre los cambios requeridos o la razón del rechazo"
              : "Comentario opcional"}
            disabled={isLoading}
            error={errors.comment}
            fullWidth
          />
        </div>
      )}
    </Modal>
  );
};