import { useMemo } from 'react';
import useSWR from 'swr';

import { apiFetcher, dashboardKeys } from '@/lib/swr';
import type {
  DashboardEventsParams,
  DashboardEventsResponse,
  DashboardSummary,
} from '@/services/dashboardService';

interface DashboardSummaryResponse {
  success: boolean;
  data: DashboardSummary;
  message: string;
}

interface DashboardEventsApiResponse {
  success: boolean;
  data: DashboardEventsResponse['data'];
  pagination: DashboardEventsResponse['pagination'];
  message: string;
}

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
  const eventsKey = useMemo(() => {
    const searchParams = new URLSearchParams();
    if (params.tab) searchParams.set('tab', params.tab);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.search) searchParams.set('search', params.search);
    return dashboardKeys.events(searchParams.toString());
  }, [params.tab, params.page, params.search]);

  const {
    data: summaryData,
    error: summaryError,
    isLoading: isLoadingSummary,
    mutate: mutateSummary,
  } = useSWR<DashboardSummaryResponse>(dashboardKeys.summary, apiFetcher);

  const {
    data: eventsData,
    error: eventsError,
    isLoading: isLoadingEvents,
    mutate: mutateEvents,
  } = useSWR<DashboardEventsApiResponse>(eventsKey, apiFetcher);

  const events: DashboardEventsResponse | null = eventsData
    ? { data: eventsData.data, pagination: eventsData.pagination }
    : null;

  const error = summaryError?.message ?? eventsError?.message ?? null;

  return {
    summary: summaryData?.data ?? null,
    events,
    isLoadingSummary,
    isLoadingEvents,
    error,
    refetchSummary: async () => { await mutateSummary(); },
    refetchEvents: async () => { await mutateEvents(); },
  };
};
