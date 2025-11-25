/**
 * Event Detail Hook
 * Manages fetching and caching of complete event details for approval review
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  eventApprovalService, 
  EventDetailResponse 
} from '@/services/eventApprovalService';

interface UseEventDetailReturn {
  event: EventDetailResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseEventDetailOptions {
  enabled?: boolean;
}

export const useEventDetail = (
  eventId: number | null,
  options: UseEventDetailOptions = {}
): UseEventDetailReturn => {
  const { enabled = true } = options;
  
  const [event, setEvent] = useState<EventDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEventDetail = useCallback(async () => {
    if (!eventId || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const eventData = await eventApprovalService.getEventDetail(eventId);
      setEvent(eventData);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al cargar los detalles del evento';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, enabled]);

  // Fetch event detail when eventId changes
  useEffect(() => {
    if (eventId && enabled) {
      fetchEventDetail();
    } else {
      // Clear data when eventId is null or disabled
      setEvent(null);
      setError(null);
      setIsLoading(false);
    }
  }, [eventId, enabled, fetchEventDetail]);

  // Reset state when eventId changes
  useEffect(() => {
    if (eventId !== event?.id) {
      setEvent(null);
      setError(null);
    }
  }, [eventId, event?.id]);

  return {
    event,
    isLoading,
    error,
    refetch: fetchEventDetail,
  };
};