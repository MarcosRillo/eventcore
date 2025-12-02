/**
 * CreateEventSubtypeModal Component
 * Uses unified FormModal component for consistent form handling
 *
 * Created: December 2, 2025
 */

import {
  createEventSubtype,
  validateEventSubtypeData,
} from '@/features/event-types/services/eventSubtype.service';
import { CreateEventSubtypeData } from '@/types/eventType.types';
import {
  FormModal,
  FormSubmitHandler,
  FormValidator,
  Input,
  Checkbox,
} from '@/components/ui';

interface CreateEventSubtypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventTypeId: number;
  eventTypeName: string;
  onSubtypeCreated?: () => void;
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
}) => {
  // Submit handler
  const handleSubmit: FormSubmitHandler<CreateEventSubtypeData> = async (
    formData
  ) => {
    await createEventSubtype(eventTypeId, {
      name: formData.name?.trim(),
      is_active: formData.is_active,
    });

    // Notify parent component
    if (onSubtypeCreated) {
      onSubtypeCreated();
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

export default CreateEventSubtypeModal;
