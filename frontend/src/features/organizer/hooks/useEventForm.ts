/**
 * useEventForm Hook
 * Form logic for creating and editing events
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { organizerService } from '../services/organizerService';
import type { Event } from '@/types/event.types';
import type { CreateEventDto } from '../types/organizerTypes';

interface UseEventFormProps {
  eventId?: number;
}

export const useEventForm = ({ eventId }: UseEventFormProps = {}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);

  const isEditMode = !!eventId;

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizerService.getEvent(eventId!);
      setEvent(data);
    } catch (err) {
      console.error('Error loading event:', err);
      setError('Error al cargar evento');
    } finally {
      setLoading(false);
    }
  };

  // Load event if editing
  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleSubmit = async (data: CreateEventDto) => {
    try {
      setSaving(true);
      setError(null);

      if (isEditMode) {
        await organizerService.updateEvent(eventId!, data);
      } else {
        await organizerService.createEvent(data);
      }

      // Redirect to events list
      router.push('/organizer/events');
    } catch (err: unknown) {
      console.error('Error saving event:', err);

      // Extract validation errors if present
      const error = err as { response?: { data?: { errors?: Record<string, string[]>; error?: string } }; message?: string };
      if (error.response?.data?.errors) {
        const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
        setError(validationErrors);
      } else {
        setError(error.response?.data?.error || error.message || 'Error al guardar evento');
      }
    } finally {
      setSaving(false);
    }
  };

  return {
    event,
    loading,
    saving,
    error,
    isEditMode,
    handleSubmit
  };
};
