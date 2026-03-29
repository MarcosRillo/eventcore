'use client';

/**
 * InternalCalendarPageContainer - Smart Component
 *
 * Main container for internal calendar page.
 * Orchestrates StatsBar, filters, view toggle (grid/calendar), and event display.
 *
 * Created following TDD methodology.
 */

'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { getEventTypes } from '@/features/event-types/services/eventType.service';
import { InternalCalendarFilterBar } from '@/features/internal-calendar/components/dumb/InternalCalendarFilterBar';
import { InternalCalendarGridContainer } from '@/features/internal-calendar/components/smart/InternalCalendarGridContainer';
import { InternalCalendarViewContainer } from '@/features/internal-calendar/components/smart/InternalCalendarViewContainer';
import { StatsBarContainer } from '@/features/internal-calendar/components/smart/StatsBarContainer';
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';
import { internalCalendarService } from '@/features/internal-calendar/services/internalCalendar.service';
import type {
  EventType,
  InternalCalendarFilters,
  InternalCalendarStatusCode,
  ViewMode,
} from '@/features/internal-calendar/types/internal-calendar.types';

interface InternalCalendarPageContainerProps {
  basePath: string;
}

/**
 *
 */
export function InternalCalendarPageContainer({ basePath }: InternalCalendarPageContainerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse initial filters from URL
  const initialFilters: InternalCalendarFilters = useMemo(() => ({
    status: (searchParams.get('status') as InternalCalendarStatusCode) || undefined,
    event_type_id: searchParams.get('event_type_id') ? Number(searchParams.get('event_type_id')) : undefined,
    start_date: searchParams.get('start_date') || undefined,
    end_date: searchParams.get('end_date') || undefined,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const initialViewMode = (searchParams.get('view') as ViewMode) || 'calendar';

  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [filters, setFilters] = useState<InternalCalendarFilters>(initialFilters);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [eventTypesLoading, setEventTypesLoading] = useState(false);
  const [statuses, setStatuses] = useState<InternalCalendarStatusCode[]>([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const { token } = useAuth();

  // Fetch events at page level for export functionality
  const { events, loading: eventsLoading, error: eventsError } = useInternalCalendarEvents(filters);

  // Sync filters to URL
  const handleFiltersChange = useCallback((newFilters: InternalCalendarFilters) => {
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.status) params.set('status', newFilters.status);
    if (newFilters.event_type_id) params.set('event_type_id', String(newFilters.event_type_id));
    if (newFilters.start_date) params.set('start_date', newFilters.start_date);
    if (newFilters.end_date) params.set('end_date', newFilters.end_date);
    if (viewMode !== 'calendar') params.set('view', viewMode);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router, viewMode]);

  const handleViewModeChange = useCallback((newViewMode: ViewMode) => {
    setViewMode(newViewMode);
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.event_type_id) params.set('event_type_id', String(filters.event_type_id));
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (newViewMode !== 'calendar') params.set('view', newViewMode);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router, filters]);

  // Fetch event types and statuses in parallel
  useEffect(() => {
    const fetchEventTypes = async () => {
      setEventTypesLoading(true);
      try {
        const data = await getEventTypes({ active: true, per_page: 100 });
        setEventTypes(data.data);
      } catch {
        setEventTypes([]);
      } finally {
        setEventTypesLoading(false);
      }
    };

    const fetchStatuses = async () => {
      setStatusesLoading(true);
      try {
        const data = await internalCalendarService.getAvailableStatuses();
        setStatuses(data);
      } catch {
        setStatuses([]);
      } finally {
        setStatusesLoading(false);
      }
    };

    fetchEventTypes();
    fetchStatuses();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Stats Bar */}
      <StatsBarContainer token={token || ''} />

      {/* View Toggle and Filters */}
      <div className="container mx-auto px-4 py-6">
        {/* Filter Bar */}
        <InternalCalendarFilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          eventTypes={eventTypes}
          eventTypesLoading={eventTypesLoading}
          statuses={statuses}
          statusesLoading={statusesLoading}
          events={events}
        />

        <div className="bg-neutral-100 rounded-lg p-1 inline-flex mb-6">
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`
              px-4 py-2 rounded-md font-medium text-sm transition-all
              ${viewMode === 'grid'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'}
            `}
            aria-pressed={viewMode === 'grid'}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Vista Grid
          </button>
          <button
            onClick={() => handleViewModeChange('calendar')}
            className={`
              px-4 py-2 rounded-md font-medium text-sm transition-all
              ${viewMode === 'calendar'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'}
            `}
            aria-pressed={viewMode === 'calendar'}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Vista Calendario
          </button>
        </div>

        {/* Conditional View Rendering */}
        {viewMode === 'grid' ? (
          <InternalCalendarGridContainer
            events={events}
            loading={eventsLoading}
            error={eventsError}
            basePath={basePath}
          />
        ) : (
          <InternalCalendarViewContainer
            events={events}
            loading={eventsLoading}
            error={eventsError}
            basePath={basePath}
          />
        )}
      </div>
    </div>
  );
}
