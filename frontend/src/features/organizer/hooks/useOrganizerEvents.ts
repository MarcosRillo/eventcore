/**
 * useOrganizerEvents Hook
 * Custom hook for managing organizer events data and state
 */

import { useState, useEffect, useCallback } from 'react';
import { organizerService } from '../services/organizerService';
import type { OrganizerEvent, OrganizerEventFilters } from '../types/organizerTypes';

export const useOrganizerEvents = () => {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  const fetchEvents = useCallback(async (params?: OrganizerEventFilters) => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizerService.getEvents(params);

      setEvents(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      });
    } catch (err) {
      setError('Error al cargar eventos');
      console.error('Error fetching organizer events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    pagination,
    fetchEvents,
  };
};
