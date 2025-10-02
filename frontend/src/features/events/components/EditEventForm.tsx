'use client';

import { useState, useEffect } from 'react';
import { Event, EventFormData, EVENT_TYPE } from '@/types/event.types';
import { Category } from '@/types/category.types';
import { Location } from '@/types/location.types';
import { Button, Input, Modal, Textarea, Select } from '@/components/ui';
import { ButtonGroupSelector } from '@/components/ui/ButtonGroupSelector';
import { getActiveCategories } from '@/features/categories/services/category.service';
import { getActiveLocations } from '@/features/locations/services/location.service';

interface EditEventFormProps {
  isOpen: boolean;
  isLoading: boolean;
  event: Event | null;
  onClose: () => void;
  onSubmit: (eventId: number, formData: Partial<EventFormData>) => void;
}

// Location type for internal form state
type LocationType = 'structured' | 'free_text';

export const EditEventForm = ({
  isOpen,
  isLoading,
  event,
  onClose,
  onSubmit,
}: EditEventFormProps) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    type: EVENT_TYPE.SINGLE_LOCATION,
    category_id: undefined,
    location_text: '',
    location_ids: [],
    max_attendees: undefined,
    is_featured: false,
    metadata: {},
  });

  const [locationType, setLocationType] = useState<LocationType>('structured');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load form data when event changes
  useEffect(() => {
    if (isOpen && event) {
      loadFormData();
      populateFormWithEvent(event);
    }
  }, [isOpen, event]);

  const populateFormWithEvent = (eventData: Event) => {
    // Determine location type based on existing event data
    const hasStructuredLocations = eventData.locations && eventData.locations.length > 0;
    const hasFreeTextLocation = eventData.location_text && eventData.location_text.trim() !== '';
    
    let initialLocationType: LocationType = 'structured';
    
    if (hasFreeTextLocation && !hasStructuredLocations) {
      initialLocationType = 'free_text';
    } else if (hasStructuredLocations && !hasFreeTextLocation) {
      initialLocationType = 'structured';
    } else if (hasFreeTextLocation) {
      // If both exist (edge case), prioritize free text
      initialLocationType = 'free_text';
    }
    
    setLocationType(initialLocationType);
    
    setFormData({
      title: eventData.title,
      description: eventData.description,
      start_date: eventData.start_date ? eventData.start_date.slice(0, 16) : '', // Format for datetime-local
      end_date: eventData.end_date ? eventData.end_date.slice(0, 16) : '',
      type: typeof eventData.type === 'object' ? eventData.type.type_code : eventData.type,
      status: typeof eventData.status === 'object' ? eventData.status.status_code : eventData.status,
      category_id: eventData.category_id,
      location_text: eventData.location_text || '',
      location_ids: eventData.locations ? eventData.locations.map(loc => loc.id) : [],
      max_attendees: eventData.max_attendees,
      is_featured: eventData.is_featured,
      metadata: {},
    });
  };

  const loadFormData = async () => {
    setIsLoadingData(true);
    try {
      const [categoriesData, locationsData] = await Promise.all([
        getActiveCategories(),
        getActiveLocations(),
      ]);

      setCategories(categoriesData);
      setLocations(locationsData);
    } catch {
      setCategories([]);
      setLocations([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event) return;
    
    // Validación básica
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'La fecha de inicio es obligatoria';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'La categoría es obligatoria';
    }

    // Validación de ubicación flexible
    if (locationType === 'structured') {
      if (!formData.location_ids || formData.location_ids.length === 0) {
        newErrors.location_ids = 'Debe seleccionar al menos una ubicación';
      }
    } else if (locationType === 'free_text') {
      if (!formData.location_text?.trim()) {
        newErrors.location_text = 'Debe introducir una ubicación';
      }
    }
    
    if (formData.end_date && formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});

    // Prepare clean payload for API - only send defined fields
    const cleanFormData: Partial<EventFormData> = {
      // Required core fields
      title: formData.title,
      description: formData.description,
      start_date: formData.start_date,
      end_date: formData.end_date,
      type: formData.type,

      // Optional fields
      ...(formData.category_id && { category_id: formData.category_id }),
      ...(formData.max_attendees && { max_attendees: formData.max_attendees }),

      // Location - only one method at a time
      ...(locationType === 'free_text' && formData.location_text && {
        location_text: formData.location_text
      }),
      ...(locationType === 'structured' && formData.location_ids && formData.location_ids.length > 0 && {
        location_ids: formData.location_ids
      }),

      // Contact information
      ...(formData.contact_email && { contact_email: formData.contact_email }),
      ...(formData.contact_phone && { contact_phone: formData.contact_phone }),
      ...(formData.website_url && { website_url: formData.website_url }),

      // Media
      ...(formData.featured_image && { featured_image: formData.featured_image }),

      // CTA
      ...(formData.cta_text && { cta_text: formData.cta_text }),
      ...(formData.cta_link && { cta_link: formData.cta_link }),
    };

    onSubmit(event.id, cleanFormData);
  };

  const handleInputChange = <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K]
  ) => {
    setFormData((prev: EventFormData) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando se modifica
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  const handleLocationTypeChange = (newType: string) => {
    const locationType = newType as LocationType;
    setLocationType(locationType);
    
    // Clear the other location field to prevent conflicts
    if (locationType === 'structured') {
      setFormData(prev => ({ ...prev, location_text: '', location_ids: [] }));
    } else {
      setFormData(prev => ({ ...prev, location_ids: [], location_text: '' }));
    }
    
    // Clear location-related errors
    setErrors(prev => ({
      ...prev,
      location_text: '',
      location_ids: '',
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      type: EVENT_TYPE.SINGLE_LOCATION,
      category_id: undefined,
      location_text: '',
      location_ids: [],
      max_attendees: undefined,
      is_featured: false,
      metadata: {},
    });
    setLocationType('structured');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Evento"
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          {/* Título */}
          <div>
            <Input
              label="Título *"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Título del evento"
              error={errors.title}
              fullWidth
            />
          </div>

          {/* Descripción */}
          <div>
            <Textarea
              label="Descripción *"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              placeholder="Descripción del evento"
              error={errors.description}
              fullWidth
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Fecha de Inicio *"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                error={errors.start_date}
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Fecha de Fin"
                type="datetime-local"
                value={formData.end_date || ''}
                onChange={(e) => handleInputChange('end_date', e.target.value || undefined)}
                error={errors.end_date}
                fullWidth
              />
            </div>
          </div>

          {/* Tipo */}
          <div>
            <Select
              label="Tipo de Evento"
              value={formData.type || ''}
              onChange={(value) => handleInputChange('type', value as EventFormData['type'])}
              options={[
                { value: EVENT_TYPE.SINGLE_LOCATION, label: 'Sede Única' },
                { value: EVENT_TYPE.MULTI_LOCATION, label: 'Multi-Sede' }
              ]}
              placeholder="Seleccionar tipo de evento"
              fullWidth
            />
          </div>

          {/* Categoría */}
          <div>
            <Select
              label="Categoría"
              required
              value={formData.category_id || ''}
              onChange={(value) => handleInputChange('category_id', value ? Number(value) : undefined)}
              placeholder={isLoadingData ? "Cargando categorías..." : "Seleccionar categoría"}
              options={(categories || []).map(category => ({
                value: category.id,
                label: category.name
              }))}
              error={errors.category_id}
              fullWidth
              disabled={isLoadingData}
            />
          </div>

          {/* Tipo de Ubicación */}
          <ButtonGroupSelector
            label="Tipo de Ubicación"
            required
            options={[
              {
                value: 'structured',
                label: 'Usar Ubicación Guardada',
                description: 'Seleccionar de ubicaciones predefinidas'
              },
              {
                value: 'free_text',
                label: 'Introducir Dirección Manualmente',
                description: 'Escribir ubicación como texto libre'
              }
            ]}
            selectedValue={locationType}
            onSelect={handleLocationTypeChange}
            layout="horizontal"
            size="md"
          />

          {/* Ubicación Condicional */}
          {locationType === 'structured' ? (
            <div>
              <Select
                label="Ubicaciones"
                required
                value={formData.location_ids?.[0] || ''}
                onChange={(value) => {
                  const selectedId = value ? Number(value) : undefined;
                  handleInputChange('location_ids', selectedId ? [selectedId] : []);
                }}
                placeholder={isLoadingData ? "Cargando ubicaciones..." : "Seleccionar ubicación"}
                options={(locations || []).map(location => ({
                  value: location.id,
                  label: `${location.name} - ${location.address}, ${location.city}`
                }))}
                error={errors.location_ids}
                fullWidth
                disabled={isLoadingData}
              />
              <p className="text-xs text-gray-500 mt-1">
                Selecciona una ubicación de las predefinidas en el sistema
              </p>
            </div>
          ) : (
            <div>
              <Textarea
                label="Dirección de la Ubicación *"
                value={formData.location_text || ''}
                onChange={(e) => handleInputChange('location_text', e.target.value)}
                rows={2}
                placeholder="Ej: Sala de Conferencias A, Edificio Principal, Av. Corrientes 1234, Buenos Aires"
                error={errors.location_text}
                fullWidth
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe la ubicación del evento de forma libre
              </p>
            </div>
          )}

          {/* Capacidad */}
          <div>
            <Input
              label="Capacidad Máxima"
              type="number"
              min="1"
              value={formData.max_attendees || ''}
              onChange={(e) => handleInputChange('max_attendees', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Número máximo de asistentes"
              fullWidth
            />
          </div>

          {/* Evento destacado */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_featured_edit"
              checked={formData.is_featured}
              onChange={(e) => handleInputChange('is_featured', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_featured_edit" className="ml-2 block text-sm text-gray-900">
              Marcar como evento destacado
            </label>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading || isLoadingData}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || isLoadingData}
            loading={isLoading}
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
};
