'use client';

/**
 * EditEventTypeModal Component
 * Uses unified FormModal component for consistent form handling
 *
 * Created: December 2, 2025
 */

import { useEffect, useState } from 'react';

import { IconPicker } from '@/features/event-types/components/dumb/IconPicker';
import {
  updateEventType,
  validateEventTypeData,
} from '@/features/event-types/services/eventType.service';
import { Checkbox, ColorPicker, Input } from '@/shared/components/form';
import { FormModal, FormSubmitHandler, FormValidator } from '@/shared/components/modals';
import { EventType, UpdateEventTypeData } from '@/types/eventType.types';

interface EditEventTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventType: EventType | null;
  onEventTypeUpdated?: () => void;
}

// Form validator using existing validation service
const eventTypeValidator: FormValidator<UpdateEventTypeData> = (data) => {
  return validateEventTypeData(data);
};

const EditEventTypeModal: React.FC<EditEventTypeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  eventType,
  onEventTypeUpdated,
}) => {
  // Track initial data for form reset
  const [initialData, setInitialData] = useState<UpdateEventTypeData>({
    name: '',
    color: '#3B82F6',
    is_active: true,
    icon: null as string | null,
  });

  // Update initial data when eventType changes
  useEffect(() => {
    if (eventType) {
      setInitialData({
        name: eventType.name,
        color: eventType.color,
        is_active: eventType.is_active,
        icon: eventType.icon ?? null,
      });
    }
  }, [eventType]);

  // Submit handler
  // Note: handleSubmit can only be called when form is rendered,
  // and form only renders when eventType is not null (see guard below)
  const handleSubmit: FormSubmitHandler<UpdateEventTypeData> = async (
    formData
  ) => {
    await updateEventType(eventType!.id, {
      name: formData.name?.trim(),
      color: formData.color,
      is_active: formData.is_active,
      icon: formData.icon,
    });

    // Notify parent component
    if (onEventTypeUpdated) {
      onEventTypeUpdated();
    }
  };

  // Success handler
  const handleSuccess = () => {
    onSuccess();
  };

  if (!eventType) {
    return null;
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={handleSuccess}
      title="Editar Tipo de Evento"
      submitButtonText="Guardar Cambios"
      initialData={initialData}
      validator={eventTypeValidator}
      submitHandler={handleSubmit}
      size="md"
      resetOnSuccess={false}
      closeOnSuccess={true}
    >
      {({ formData, errors, isLoading, handleInputChange, handleFieldChange }) => (
        <>
          {/* Name Field */}
          <div>
            <Input
              label="Nombre *"
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="Ej. Conferencias, Congresos, Ferias"
              disabled={isLoading}
              error={errors.name}
              fullWidth
            />
          </div>

          {/* Color Field */}
          <div>
            <ColorPicker
              label="Color"
              value={formData.color || '#3B82F6'}
              onChange={(value) => handleFieldChange('color', value)}
              disabled={isLoading}
            />
          </div>

          {/* Icon Field */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Icono (opcional)
            </label>
            <IconPicker
              value={formData.icon ?? null}
              onChange={(icon) => handleFieldChange('icon', icon)}
              accentColor={formData.color || '#3B82F6'}
            />
          </div>

          {/* Active Status */}
          <div>
            <Checkbox
              id="is_active"
              name="is_active"
              label="Tipo de evento activo"
              checked={formData.is_active ?? false}
              onChange={(checked) => handleFieldChange('is_active', checked)}
              disabled={isLoading}
            />
          </div>
        </>
      )}
    </FormModal>
  );
};

export default EditEventTypeModal;
