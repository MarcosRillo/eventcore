'use client';

/**
 * InternalEventDetailPageContainer - Smart Component
 *
 * Container for event detail page that fetches event by ID.
 * Handles loading, error, and not found states.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect,useState } from 'react';

import { InternalEventDetailPage } from '@/features/internal-calendar/components/dumb/InternalEventDetailPage';
import { internalCalendarService } from '@/features/internal-calendar/services/internalCalendar.service';
import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';
import { LoadingSpinner } from '@/shared/components/feedback';

export interface InternalEventDetailPageContainerProps {
  eventId: number;
  basePath: string;
}

/**
 *
 * @param root0
 * @param root0.eventId
 * @param root0.basePath
 */
export function InternalEventDetailPageContainer({
  eventId,
  basePath,
}: InternalEventDetailPageContainerProps) {
  const router = useRouter();
  const [event, setEvent] = useState<InternalCalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);

      try {
        const foundEvent = await internalCalendarService.getEventById(eventId);

        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          setError('Evento no encontrado');
        }
      } catch {
        setError('Error al cargar el evento');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleBack = () => {
    router.push(basePath);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
        <p className="text-center mt-4 text-neutral-600">Cargando evento...</p>
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-error-600">{error || 'Evento no encontrado'}</h1>
          <p className="mt-2 text-neutral-600">
            No se pudo cargar la información del evento.
          </p>
          <button
            onClick={handleBack}
            className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Volver al calendario
          </button>
        </div>
      </div>
    );
  }

  // Success state
  return <InternalEventDetailPage event={event} onBack={handleBack} />;
}
