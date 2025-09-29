'use client';

import { useState, useEffect } from 'react';
import { EventFormData, EVENT_TYPE } from '@/types/event.types';
import { useAuth } from '@/context/AuthContext';
import { Category } from '@/types/category.types';
import { Location } from '@/types/location.types';
import { Button, Input, Modal, Textarea, Select } from '@/components/ui';
import { ButtonGroupSelector } from '@/components/ui/ButtonGroupSelector';
import { getActiveCategories } from '../../categories/services/category.service';
import { getActiveLocations } from '../../locations/services/location.service';

interface CreateEventFormProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (formData: EventFormData) => void;
}

// Location type for internal form state
type LocationType = 'structured' | 'free_text';

export const CreateEventForm = ({
  isOpen,
  isLoading,
  onClose,
  onSubmit,
}: CreateEventFormProps) => {
  const { user } = useAuth();
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

  // Load categories and locations when modal opens
  useEffect(() => {
    console.log('🔄 [EFFECT] isOpen changed to:', isOpen);
    if (isOpen) {
      console.log('✅ [EFFECT] Modal opened, calling loadFormData()');
      loadFormData();
    }
  }, [isOpen]);

  const loadFormData = async () => {
    console.log('🔍 [LOAD DATA] Starting to load form data...');
    setIsLoadingData(true);
    try {
      console.log('🔍 [LOAD DATA] Fetching categories and locations...');
      const [categoriesData, locationsData] = await Promise.all([
        getActiveCategories(),
        getActiveLocations(),
      ]);

      console.log('✅ [LOAD DATA] Categories received:', {
        count: categoriesData?.length,
        data: categoriesData
      });
      console.log('✅ [LOAD DATA] Locations received:', {
        count: locationsData?.length,
        data: locationsData
      });

      setCategories(categoriesData);
      setLocations(locationsData);

      console.log('✅ [LOAD DATA] State updated. Current categories:', categoriesData);
    } catch (error) {
      console.error('❌ [LOAD DATA] Error loading data:', error);
      // Set empty arrays as fallback
      setCategories([]);
      setLocations([]);
    } finally {
      setIsLoadingData(false);
      console.log('🏁 [LOAD DATA] Loading complete. isLoadingData now false');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    // Helper functions to map frontend codes to backend IDs
    const getStatusId = (statusCode: string): number => {
      const statusMap: Record<string, number> = {
        'draft': 1
      };
      return statusMap[statusCode] || 1;
    };

    const getTypeId = (typeCode: string): number => {
      const typeMap: Record<string, number> = {
        'single_location': 1, // sede_unica
        'multi_location': 2   // multi_sede
      };
      return typeMap[typeCode] || 1;
    };

    // Prepare clean payload for API - only send defined fields
    const cleanFormData = {
      // Required core fields
      title: formData.title,
      description: formData.description,
      start_date: formData.start_date,
      end_date: formData.end_date,

      // Required ID fields using real database values
      status_id: getStatusId('draft'), // ID 1 = 'draft'
      type_id: getTypeId(formData.type), // ID 1 = 'sede_unica', ID 2 = 'multi_sede'

      // Multi-tenant fields
      entity_id: 1, // Always Ente de Turismo as supervisor (NOT NULL)
      organization_id: user?.organization?.id || null, // External org or null if Ente creates directly

      // Required audit field
      created_by: user?.id || 1, // Use authenticated user ID or fallback to 1

      // Optional fields - only include if they have values
      ...(formData.category_id && { category_id: formData.category_id }),
      ...(formData.max_attendees && { max_attendees: formData.max_attendees }),
      ...(formData.is_featured !== undefined && { is_featured: formData.is_featured }),

      // Location - only one method at a time
      ...(locationType === 'free_text' && formData.location_text && {
        location_text: formData.location_text
      }),
      ...(locationType === 'structured' && formData.location_ids && formData.location_ids.length > 0 && {
        location_ids: formData.location_ids
      }),

      // Metadata if exists
      ...(formData.metadata && Object.keys(formData.metadata).length > 0 && {
        metadata: formData.metadata
      })
    };
    
    onSubmit(cleanFormData);
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

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear Nuevo Evento"
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
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => handleInputChange('is_featured', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
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
            Crear Evento
          </Button>
        </div>
      </form>
    </Modal>
  );
};
