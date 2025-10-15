'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { EventForm } from '@/features/organizer/components/EventForm';
import { useEventForm } from '@/features/organizer/hooks/useEventForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import categoryService from '@/features/categories/services/category.service';
import locationService from '@/features/locations/services/location.service';
import type { Category } from '@/types/category.types';
import type { Location } from '@/types/location.types';

export default function EditEventPage() {
  const params = useParams();
  const eventId = Number(params.id);

  const { event, loading, handleSubmit, saving, error } = useEventForm({ eventId });
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

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Evento no encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar Evento</h1>
        <p className="text-gray-600 mt-1">
          Modifica los datos del evento &quot;{event.title}&quot;
        </p>
      </div>

      <EventForm
        event={event}
        categories={categories}
        locations={locations}
        onSubmit={handleSubmit}
        saving={saving}
        error={error}
      />
    </div>
  );
}
