/**
 * EditEventTypeModal Component
 * Uses unified FormModal component for consistent form handling
 *
 * Created: December 2, 2025
 */

import { useEffect, useState } from 'react';

import {
  Checkbox,
  FormModal,
  FormSubmitHandler,
  FormValidator,
  Input,
} from '@/components/ui';
import {
  updateEventType,
  validateEventTypeData,
} from '@/features/event-types/services/eventType.service';
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
    is_active: true,
  });

  // Update initial data when eventType changes
  useEffect(() => {
    if (eventType) {
      setInitialData({
        name: eventType.name,
        is_active: eventType.is_active,
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
      is_active: formData.is_active,
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
