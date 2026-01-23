/**
 * Dashboard Data Hook
 * Manages dashboard summary and events data with caching and error handling
 */

import { useEffect, useMemo,useState } from 'react';

import { 
  DashboardEventsParams, 
  DashboardEventsResponse,
  dashboardService, 
  DashboardSummary} from '@/services/dashboardService';

interface UseDashboardDataReturn {
  summary: DashboardSummary | null;
  events: DashboardEventsResponse | null;
  isLoadingSummary: boolean;
  isLoadingEvents: boolean;
  error: string | null;
  refetchSummary: () => Promise<void>;
  refetchEvents: () => Promise<void>;
}

export const useDashboardData = (params: DashboardEventsParams = {}): UseDashboardDataReturn => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [events, setEvents] = useState<DashboardEventsResponse | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize params to prevent infinite re-renders
  const memoizedParams = useMemo(() => {
    return params;
  }, [params]);

  const fetchSummary = async () => {
    setIsLoadingSummary(true);
    setError(null);

    try {
      const summaryData = await dashboardService.getSummary();
      setSummary(summaryData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard summary';
      setError(errorMessage);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    setError(null);

    try {
      const eventsData = await dashboardService.getEvents(memoizedParams);
      setEvents(eventsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
      setError(errorMessage);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Fetch summary on mount
  useEffect(() => {
    fetchSummary();
  }, []);

  // Fetch events when memoized params change
  useEffect(() => {
    fetchEvents();
  }, [memoizedParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    summary,
    events,
    isLoadingSummary,
    isLoadingEvents,
    error,
    refetchSummary: fetchSummary,
    refetchEvents: fetchEvents,
  };
};