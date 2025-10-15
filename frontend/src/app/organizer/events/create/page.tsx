'use client';

import { useEffect, useState } from 'react';
import { EventForm } from '@/features/organizer/components/EventForm';
import { useEventForm } from '@/features/organizer/hooks/useEventForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import categoryService from '@/features/categories/services/category.service';
import locationService from '@/features/locations/services/location.service';
import type { Category } from '@/types/category.types';
import type { Location } from '@/types/location.types';

export default function CreateEventPage() {
  const { handleSubmit, saving, error } = useEventForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [categories, locations] = await Promise.all([
        categoryService.getActiveCategories(),
        locationService.getActiveLocations()
      ]);
      setCategories(categories);
      setLocations(locations);
    } catch (err: unknown) {
      console.error('Error loading form data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Evento</h1>
        <p className="text-gray-600 mt-1">
          Completa los datos del evento. Los campos marcados con * son obligatorios.
        </p>
      </div>

      <EventForm
        categories={categories}
        locations={locations}
        onSubmit={handleSubmit}
        saving={saving}
        error={error}
      />
    </div>
  );
}
