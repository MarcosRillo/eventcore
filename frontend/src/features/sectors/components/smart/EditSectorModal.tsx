'use client';

/**
 * EditSectorModal Component
 * Uses unified FormModal component for consistent form handling
 */

import { useEffect, useState } from 'react';

import { updateSector } from '@/features/sectors/services/sector.service';
import { Sector, SectorFormData } from '@/features/sectors/types/sector.types';
import { Checkbox, Input } from '@/shared/components/form';
import { FormModal, FormSubmitHandler, FormValidator } from '@/shared/components/modals';

interface EditSectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sector: Sector | null;
  onSectorUpdated?: () => void;
}

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

const EditSectorModal: React.FC<EditSectorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  sector,
  onSectorUpdated,
}) => {
  const [initialData, setInitialData] = useState<SectorFormData>({
    name: '',
    is_active: true,
  });

  useEffect(() => {
    if (sector) {
      setInitialData({
        name: sector.name,
        is_active: sector.is_active,
      });
    }
  }, [sector]);

  const handleSubmit: FormSubmitHandler<SectorFormData> = async (formData) => {
    await updateSector(sector!.id, {
      name: formData.name?.trim(),
      is_active: formData.is_active,
    });

    if (onSectorUpdated) {
      onSectorUpdated();
    }
  };

  const handleSuccess = () => {
    onSuccess();
  };

  if (!sector) {
    return null;
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={handleSuccess}
      title="Editar Sector"
      submitButtonText="Guardar Cambios"
      initialData={initialData}
      validator={sectorValidator}
      submitHandler={handleSubmit}
      size="md"
      resetOnSuccess={false}
      closeOnSuccess={true}
      key={sector.id}
    >
      {({ formData, errors, isLoading, handleInputChange, handleFieldChange }) => (
        <>
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

          <div>
            <Checkbox
              id="is_active"
              name="is_active"
              label="Sector activo"
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

export default EditSectorModal;
