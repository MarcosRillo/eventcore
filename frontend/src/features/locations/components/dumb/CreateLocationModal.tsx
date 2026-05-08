/**
 * CreateLocationModal Component
 * Simplified modal for creating new locations in Demo Region
 */

'use client';

import { createLocation } from '@/features/locations/services/location.service';
import { Input, Textarea } from '@/shared/components/form';
import { FormModal, FormSubmitHandler, FormValidator } from '@/shared/components/modals';
import { LocationFormData, LocationPayload } from '@/types/location.types';

interface CreateLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onLocationCreated?: () => void;
}

// Initial form data - simplified to 4 fields
const initialData: LocationFormData = {
  name: '',
  address: '',
  city: '',
  description: '',
};

// Form validation - only 3 required fields
const locationValidator: FormValidator<LocationFormData> = (data): string[] => {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('El nombre es requerido');
  }

  if (!data.address?.trim()) {
    errors.push('La dirección es requerida');
  }

  if (!data.city?.trim()) {
    errors.push('La ciudad es requerida');
  }

  return errors;
};

/**
 *
 * @param root0
 * @param root0.isOpen
 * @param root0.onClose
 * @param root0.onSuccess
 * @param root0.onLocationCreated
 */
export function CreateLocationModal({
  isOpen,
  onClose,
  onSuccess,
  onLocationCreated,
}: CreateLocationModalProps) {
  // Submit handler - send clean payload with defaults
  const handleSubmit: FormSubmitHandler<LocationFormData> = async (formData) => {
    const locationPayload: LocationPayload = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      description: formData.description?.trim() || undefined,
      state: 'Demo State',
      country: 'Argentina',
      is_active: true,
    };

    await createLocation(locationPayload);

    if (onLocationCreated) {
      onLocationCreated();
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
      title="Crear Nueva Ubicación"
      submitButtonText="Crear Ubicación"
      initialData={initialData}
      validator={locationValidator}
      submitHandler={handleSubmit}
      size="md"
      resetOnSuccess={true}
      closeOnSuccess={true}
    >
      {({ formData, errors, isLoading, handleInputChange }) => (
        <div className="space-y-4">
          <Input
            label="Nombre del lugar *"
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ej. Centro de Convenciones Demo Region"
            disabled={isLoading}
            error={errors.name}
            fullWidth
          />

          <Input
            label="Dirección *"
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Ej. Av. Soldati 330"
            disabled={isLoading}
            error={errors.address}
            fullWidth
          />

          <Input
            label="Ciudad *"
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Ej. Demo City"
            disabled={isLoading}
            error={errors.city}
            fullWidth
          />

          <Textarea
            label="Descripción"
            id="description"
            name="description"
            value={formData.description ?? ''}
            onChange={handleInputChange}
            rows={3}
            placeholder="Descripción opcional del lugar..."
            disabled={isLoading}
            error={errors.description}
            fullWidth
          />
        </div>
      )}
    </FormModal>
  );
}
