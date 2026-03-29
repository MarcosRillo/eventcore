/**
 * CreateSectorModal Component
 * Uses unified FormModal component for consistent form handling
 */

import { createSector } from '@/features/sectors/services/sector.service';
import { SectorFormData } from '@/features/sectors/types/sector.types';
import { Input } from '@/shared/components/form';
import { FormModal, FormSubmitHandler, FormValidator } from '@/shared/components/modals';

interface CreateSectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSectorCreated?: () => void;
}

const initialData: SectorFormData = {
  name: '',
  is_active: true,
};

const sectorValidator: FormValidator<SectorFormData> = (data): string[] => {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('El nombre es requerido');
  } else if (data.name.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  } else if (data.name.trim().length > 255) {
    errors.push('El nombre no puede exceder 255 caracteres');
  }

  return errors;
};

const CreateSectorModal: React.FC<CreateSectorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSectorCreated,
}) => {
  const handleSubmit: FormSubmitHandler<SectorFormData> = async (formData) => {
    await createSector({
      name: formData.name?.trim(),
      is_active: formData.is_active,
    });

    if (onSectorCreated) {
      onSectorCreated();
    }
  };

  const handleSuccess = () => {
    onSuccess();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={handleSuccess}
      title="Crear Nuevo Sector"
      submitButtonText="Crear Sector"
      initialData={initialData}
      validator={sectorValidator}
      submitHandler={handleSubmit}
      size="md"
      resetOnSuccess={true}
      closeOnSuccess={true}
    >
      {({ formData, errors, isLoading, handleInputChange }) => (
        <div>
          <Input
            label="Nombre *"
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            placeholder="Ej. Hotel, Restaurante, Turismo"
            disabled={isLoading}
            error={errors.name}
            fullWidth
          />
        </div>
      )}
    </FormModal>
  );
};

export default CreateSectorModal;
