/**
 * EventForm Component
 * Reusable form for creating and editing events
 */

'use client';

import { useEffect, useState } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import type { Event } from '@/types/event.types';
import type { Category } from '@/types/category.types';
import type { Location } from '@/types/location.types';
import type { CreateEventDto } from '@/features/organizer/types/organizerTypes';

interface EventFormProps {
  event?: Event | null;
  categories: Category[];
  locations: Location[];
  onSubmit: (data: CreateEventDto) => void;
  saving: boolean;
  error?: string | null;
}

export const EventForm = ({
  event,
  categories,
  locations,
  onSubmit,
  saving,
  error
}: EventFormProps) => {
  const [formData, setFormData] = useState<CreateEventDto>({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    category_id: 0,
    location_ids: [],
    type_id: 1,
    max_attendees: undefined,
    virtual_link: '',
    cta_link: '',
    cta_text: '',
    featured_image: ''
  });

  // Load event data if editing
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        start_date: event.start_date?.split('T')[0] || '',
        end_date: event.end_date?.split('T')[0] || '',
        category_id: event.category_id || 0,
        location_ids: event.locations?.map((l) => l.id) || [],
        type_id: typeof event.type === 'object' && 'id' in event.type ? event.type.id : 1,
        max_attendees: event.max_attendees,
        virtual_link: event.virtual_link || '',
        cta_link: event.cta_link || '',
        cta_text: event.cta_text || '',
        featured_image: event.featured_image || ''
      });
    }
  }, [event]);

  const handleChange = (field: keyof CreateEventDto, value: string | number | number[] | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationToggle = (locationId: number) => {
    setFormData(prev => {
      const currentIds = prev.location_ids || [];
      const newIds = currentIds.includes(locationId)
        ? currentIds.filter(id => id !== locationId)
        : [...currentIds, locationId];
      return { ...prev, location_ids: newIds };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clean empty strings to undefined
    const cleanData = {
      ...formData,
      virtual_link: formData.virtual_link || undefined,
      cta_link: formData.cta_link || undefined,
      cta_text: formData.cta_text || undefined,
      featured_image: formData.featured_image || undefined,
      end_date: formData.end_date || undefined
    };

    // Ensure required fields
    if (!cleanData.title || !cleanData.description || !cleanData.start_date ||
        !cleanData.category_id || !cleanData.location_ids || cleanData.location_ids.length === 0) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    onSubmit(cleanData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-600 rounded-sm p-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Información Básica</h2>

        <Input
          label="Título del Evento *"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('title', e.target.value)}
          required
          maxLength={255}
          placeholder="Ej: Festival de Jazz 2025"
        />

        <Textarea
          label="Descripción *"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('description', e.target.value)}
          required
          rows={5}
          placeholder="Describe el evento..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Categoría *"
            value={formData.category_id?.toString() || '0'}
            onChange={(value: string | number) => handleChange('category_id', Number(value))}
            required
            options={[
              { value: '0', label: 'Seleccionar categoría' },
              ...categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-2">
              Ubicaciones * (selecciona al menos una)
            </label>
            <div className="border border-neutral-300 bg-neutral-50 rounded-sm p-3 space-y-2 max-h-40 overflow-y-auto">
              {locations.map(loc => (
                <label key={loc.id} className="flex items-center space-x-2 cursor-pointer hover:bg-white rounded px-2 py-1 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.location_ids?.includes(loc.id) || false}
                    onChange={() => handleLocationToggle(loc.id)}
                    className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-neutral-900">{loc.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Fecha</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Fecha de Inicio *"
            value={formData.start_date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('start_date', e.target.value)}
            required
          />

          <Input
            type="date"
            label="Fecha de Fin"
            value={formData.end_date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('end_date', e.target.value)}
            min={formData.start_date}
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Información Adicional</h2>

        <Input
          type="url"
          label="Enlace Virtual"
          value={formData.virtual_link}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('virtual_link', e.target.value)}
          placeholder="https://..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="url"
            label="Enlace CTA"
            value={formData.cta_link}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('cta_link', e.target.value)}
            placeholder="https://..."
          />

          <Input
            label="Texto CTA"
            value={formData.cta_text}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('cta_text', e.target.value)}
            maxLength={255}
            placeholder="Comprar Entradas"
          />
        </div>

        <Input
          type="url"
          label="URL de Imagen Destacada"
          value={formData.featured_image}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('featured_image', e.target.value)}
          placeholder="https://..."
        />

        <Input
          type="number"
          label="Capacidad Máxima"
          value={formData.max_attendees?.toString() || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('max_attendees', e.target.value ? Number(e.target.value) : undefined)}
          min={1}
          placeholder="100"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={saving}
        >
          {saving ? 'Guardando...' : event ? 'Actualizar Evento' : 'Crear Evento'}
        </Button>
      </div>
    </form>
  );
};
