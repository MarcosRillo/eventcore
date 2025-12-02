/**
 * EditEventSubtypeModal Component
 * Uses unified FormModal component for consistent form handling
 *
 * Created: December 2, 2025
 */

import { useEffect, useState } from 'react';
import {
  updateEventSubtype,
  validateEventSubtypeData,
} from '@/features/event-types/services/eventSubtype.service';
import { EventSubtype, UpdateEventSubtypeData } from '@/types/eventType.types';
import {
  FormModal,
  FormSubmitHandler,
  FormValidator,
  Input,
  Checkbox,
} from '@/components/ui';

interface EditEventSubtypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventSubtype: EventSubtype | null;
  onSubtypeUpdated?: () => void;
}

// Form validator using existing validation service
const subtypeValidator: FormValidator<UpdateEventSubtypeData> = (data) => {
  return validateEventSubtypeData(data);
};

const EditEventSubtypeModal: React.FC<EditEventSubtypeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  eventSubtype,
  onSubtypeUpdated,
}) => {
  // Track initial data for form reset
  const [initialData, setInitialData] = useState<UpdateEventSubtypeData>({
    name: '',
    is_active: true,
  });

  // Update initial data when eventSubtype changes
  useEffect(() => {
    if (eventSubtype) {
      setInitialData({
        name: eventSubtype.name,
        is_active: eventSubtype.is_active,
      });
    }
  }, [eventSubtype]);

  // Submit handler
  // Note: handleSubmit can only be called when form is rendered,
  // and form only renders when eventSubtype is not null (see guard below)
  const handleSubmit: FormSubmitHandler<UpdateEventSubtypeData> = async (
    formData
  ) => {
    await updateEventSubtype(eventSubtype!.id, {
      name: formData.name?.trim(),
      is_active: formData.is_active,
    });

    // Notify parent component
    if (onSubtypeUpdated) {
      onSubtypeUpdated();
    }
  };

  // Success handler
  const handleSuccess = () => {
    onSuccess();
  };

  if (!eventSubtype) {
    return null;
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={handleSuccess}
      title="Editar Subtipo de Evento"
      submitButtonText="Guardar Cambios"
      initialData={initialData}
      validator={subtypeValidator}
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
              label="Nombre del Subtipo *"
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="Ej. Mesa Redonda, Taller, Exposición"
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
              label="Subtipo activo"
              checked={formData.is_active}
              onChange={(checked) => handleFieldChange('is_active', checked)}
              disabled={isLoading}
            />
          </div>
        </>
      )}
    </FormModal>
  );
};

export default EditEventSubtypeModal;
