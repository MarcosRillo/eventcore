/**
 * CreateEventTypeModal Component
 * Uses unified FormModal component for consistent form handling
 *
 * Created: December 2, 2025
 */

import { IconPicker } from '@/features/event-types/components/dumb/IconPicker';
import {
  createEventType,
  validateEventTypeData,
} from '@/features/event-types/services/eventType.service';
import { Checkbox, ColorPicker, Input } from '@/shared/components/form';
import { FormModal, FormSubmitHandler, FormValidator } from '@/shared/components/modals';
import { CreateEventTypeData } from '@/types/eventType.types';

interface CreateEventTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onEventTypeCreated?: () => void;
}

// Initial form data
const initialData: CreateEventTypeData = {
  name: '',
  color: '#3B82F6',
  is_active: true,
  icon: null as string | null,
};

// Form validator using existing validation service
const eventTypeValidator: FormValidator<CreateEventTypeData> = (data) => {
  return validateEventTypeData(data);
};

const CreateEventTypeModal: React.FC<CreateEventTypeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onEventTypeCreated,
}) => {
  // Submit handler
  const handleSubmit: FormSubmitHandler<CreateEventTypeData> = async (
    formData
  ) => {
    await createEventType({
      name: formData.name?.trim(),
      color: formData.color,
      is_active: formData.is_active,
      icon: formData.icon ?? null,
    });

    // Notify parent component
    if (onEventTypeCreated) {
      onEventTypeCreated();
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
      title="Crear Nuevo Tipo de Evento"
      submitButtonText="Crear Tipo"
      initialData={initialData}
      validator={eventTypeValidator}
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

export default CreateEventTypeModal;
