/**
 * EditLocationModal Component
 * Simplified modal for editing existing locations in Tucumán
 */

'use client';

import { updateLocation } from '@/features/locations/services/location.service';
import { Location, LocationFormData, LocationPayload } from '@/types/location.types';
import { FormModal, FormSubmitHandler, FormValidator, Input, Textarea } from '@/components/ui';

interface EditLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  location: Location | null;
  onLocationUpdated?: () => void;
}

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

export function EditLocationModal({
  isOpen,
  onClose,
  onSuccess,
  location,
  onLocationUpdated,
}: EditLocationModalProps) {
  // Create initial data from location
  const getInitialData = (): LocationFormData => {
    if (!location) {
      return {
        name: '',
        address: '',
        city: '',
        description: '',
      };
    }

    return {
      name: location.name,
      address: location.address,
      city: location.city,
      description: location.description || '',
    };
  };

  // Submit handler - send clean payload with defaults
  const handleSubmit: FormSubmitHandler<LocationFormData> = async (formData) => {
    if (!location) {
      throw new Error('No se encontró la ubicación a editar');
    }

    const locationPayload: LocationPayload = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      description: formData.description?.trim() || undefined,
      state: 'Tucumán',
      country: 'Argentina',
      is_active: true,
    };

    await updateLocation(location.id, locationPayload);

    if (onLocationUpdated) {
      onLocationUpdated();
    }
  };

  const handleSuccess = () => {
    onSuccess();
  };

  if (!location) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={handleSuccess}
      title={`Editar: ${location.name}`}
      submitButtonText="Actualizar Ubicación"
      initialData={getInitialData()}
      validator={locationValidator}
      submitHandler={handleSubmit}
      size="md"
      resetOnSuccess={false}
      closeOnSuccess={true}
      key={location.id}
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
            placeholder="Ej. Centro de Convenciones Tucumán"
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
            placeholder="Ej. San Miguel de Tucumán"
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
