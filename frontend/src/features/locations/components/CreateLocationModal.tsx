/**
 * CreateLocationModal Component
 * Modal for creating new locations using FormModal pattern
 */

'use client';

import { createLocation } from '@/features/locations/services/location.service';
import { LocationFormData } from '@/types/location.types';
import { FormModal, FormSubmitHandler, FormValidator, Input, Textarea, Checkbox } from '@/components/ui';

interface CreateLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onLocationCreated?: () => void;
}

// Initial form data
const initialData: LocationFormData = {
  name: '',
  description: '',
  address: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'Argentina',
  latitude: undefined,
  longitude: undefined,
  max_capacity: undefined,
  features: [],
  contact_email: '',
  contact_phone: '',
  website_url: '',
  is_active: true,
  notes: '',
};

// Form validation - returns string[] for FormModal compatibility
const locationValidator: FormValidator<LocationFormData> = (data): string[] => {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('El campo name es requerido');
  }

  if (!data.address?.trim()) {
    errors.push('El campo address es requerido');
  }

  if (!data.city?.trim()) {
    errors.push('El campo city es requerido');
  }

  if (!data.country?.trim()) {
    errors.push('El campo country es requerido');
  }

  if (data.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact_email)) {
    errors.push('El campo contact_email no es válido');
  }

  if (data.max_capacity !== undefined && data.max_capacity < 0) {
    errors.push('El campo max_capacity debe ser un número positivo');
  }

  return errors;
};

export function CreateLocationModal({
  isOpen,
  onClose,
  onSuccess,
  onLocationCreated,
}: CreateLocationModalProps) {
  // Submit handler
  const handleSubmit: FormSubmitHandler<LocationFormData> = async (formData) => {
    // Server assigns entity_id based on authenticated user
    const locationData = {
      ...formData,
      name: formData.name.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      country: formData.country.trim(),
      description: formData.description?.trim() || undefined,
      state: formData.state?.trim() || undefined,
      postal_code: formData.postal_code?.trim() || undefined,
      contact_email: formData.contact_email?.trim() || undefined,
      contact_phone: formData.contact_phone?.trim() || undefined,
      website_url: formData.website_url?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
    };

    await createLocation(locationData as Parameters<typeof createLocation>[0]);

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
      size="lg"
      resetOnSuccess={true}
      closeOnSuccess={true}
    >
      {({ formData, errors, isLoading, handleInputChange, handleFieldChange }) => (
        <div className="space-y-4">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre *"
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej. Centro de Convenciones"
                disabled={isLoading}
                error={errors.name}
                fullWidth
              />
              <Input
                label="Capacidad Máxima"
                type="number"
                id="max_capacity"
                name="max_capacity"
                value={formData.max_capacity ?? ''}
                onChange={handleInputChange}
                placeholder="Ej. 500"
                disabled={isLoading}
                error={errors.max_capacity}
                fullWidth
              />
            </div>
            <div className="mt-4">
              <Textarea
                label="Descripción"
                id="description"
                name="description"
                value={formData.description ?? ''}
                onChange={handleInputChange}
                rows={2}
                placeholder="Descripción del lugar..."
                disabled={isLoading}
                error={errors.description}
                fullWidth
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Dirección</h3>
            <div className="space-y-4">
              <Input
                label="Dirección *"
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Ej. Av. Principal 123"
                disabled={isLoading}
                error={errors.address}
                fullWidth
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Input
                  label="Provincia/Estado"
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state ?? ''}
                  onChange={handleInputChange}
                  placeholder="Ej. Tucumán"
                  disabled={isLoading}
                  error={errors.state}
                  fullWidth
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Código Postal"
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code ?? ''}
                  onChange={handleInputChange}
                  placeholder="Ej. 4000"
                  disabled={isLoading}
                  error={errors.postal_code}
                  fullWidth
                />
                <Input
                  label="País *"
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Ej. Argentina"
                  disabled={isLoading}
                  error={errors.country}
                  fullWidth
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email de Contacto"
                type="email"
                id="contact_email"
                name="contact_email"
                value={formData.contact_email ?? ''}
                onChange={handleInputChange}
                placeholder="contacto@ejemplo.com"
                disabled={isLoading}
                error={errors.contact_email}
                fullWidth
              />
              <Input
                label="Teléfono de Contacto"
                type="tel"
                id="contact_phone"
                name="contact_phone"
                value={formData.contact_phone ?? ''}
                onChange={handleInputChange}
                placeholder="+54 381 1234567"
                disabled={isLoading}
                error={errors.contact_phone}
                fullWidth
              />
            </div>
            <div className="mt-4">
              <Input
                label="Sitio Web"
                type="url"
                id="website_url"
                name="website_url"
                value={formData.website_url ?? ''}
                onChange={handleInputChange}
                placeholder="https://www.ejemplo.com"
                disabled={isLoading}
                error={errors.website_url}
                fullWidth
              />
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Información Adicional</h3>
            <Textarea
              label="Notas"
              id="notes"
              name="notes"
              value={formData.notes ?? ''}
              onChange={handleInputChange}
              rows={2}
              placeholder="Notas adicionales sobre la ubicación..."
              disabled={isLoading}
              error={errors.notes}
              fullWidth
            />
            <div className="mt-4">
              <Checkbox
                id="is_active"
                name="is_active"
                label="Ubicación activa"
                checked={formData.is_active ?? true}
                onChange={(checked) => handleFieldChange('is_active', checked)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </FormModal>
  );
}
