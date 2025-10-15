/**
 * useOrganizerEvents Hook
 * Custom hook for managing organizer events data and state with filters
 */

import { useState, useEffect } from 'react';
import { organizerService } from '../services/organizerService';
import type { OrganizerEvent, OrganizerEventFilters } from '../types/organizerTypes';

export const useOrganizerEvents = () => {
  const [events, setEvents] = useState<OrganizerEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0
  });

  const [filters, setFilters] = useState<OrganizerEventFilters>({
    page: 1,
    per_page: 10,
    status: undefined,
    search: undefined
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await organizerService.getEvents(filters);

      // Laravel pagination response has data directly in response
      setEvents(response.data || []);
      setPagination({
        currentPage: response.current_page || 1,
        lastPage: response.last_page || 1,
        perPage: response.per_page || 10,
        total: response.total || 0
      });
    } catch (err) {
      console.error('Error fetching organizer events:', err);
      setError('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const updateFilters = (newFilters: Partial<OrganizerEventFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const changePage = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const changePerPage = (perPage: number) => {
    setFilters(prev => ({ ...prev, per_page: perPage, page: 1 }));
  };

  return {
    events,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    changePerPage,
    refetch: fetchEvents
  };
};
