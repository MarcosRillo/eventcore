/**
 * CreateEventSubtypeModal Component
 * Uses unified FormModal component for consistent form handling
 *
 * Created: December 2, 2025
 */

import {
  Checkbox,
  FormModal,
  FormSubmitHandler,
  FormValidator,
  Input,
} from '@/components/ui';
import {
  createEventSubtype,
  validateEventSubtypeData,
} from '@/features/event-types/services/eventSubtype.service';
import { CreateEventSubtypeData, EventSubtype } from '@/types/eventType.types';

interface CreateEventSubtypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventTypeId: number;
  eventTypeName: string;
  onSubtypeCreated?: () => void;
  onCreateSubtype?: (
    typeId: number,
    data: CreateEventSubtypeData
  ) => Promise<EventSubtype>;
}

// Initial form data
const initialData: CreateEventSubtypeData = {
  name: '',
  is_active: true,
};

// Form validator using existing validation service
const subtypeValidator: FormValidator<CreateEventSubtypeData> = (data) => {
  return validateEventSubtypeData(data);
};

const CreateEventSubtypeModal: React.FC<CreateEventSubtypeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  eventTypeId,
  eventTypeName,
  onSubtypeCreated,
  onCreateSubtype,
}) => {
  // Submit handler
  const handleSubmit: FormSubmitHandler<CreateEventSubtypeData> = async (
    formData
  ) => {
    const data: CreateEventSubtypeData = {
      name: formData.name?.trim() || '',
      is_active: formData.is_active,
    };

    if (onCreateSubtype) {
      // Use parent's handler (updates cache automatically)
      await onCreateSubtype(eventTypeId, data);
    } else {
      // Fallback for standalone usage
      await createEventSubtype(eventTypeId, data);
      onSubtypeCreated?.();
    }
  };

  // Success handler
  const handleSuccess = () => {
    onSuccess();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={handleSuccess}
      title={`Crear Subtipo para "${eventTypeName}"`}
      submitButtonText="Crear Subtipo"
      initialData={initialData}
      validator={subtypeValidator}
      submitHandler={handleSubmit}
      size="md"
      resetOnSuccess={true}
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

export default CreateEventSubtypeModal;
