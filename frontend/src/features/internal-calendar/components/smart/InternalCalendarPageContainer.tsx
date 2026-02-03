/**
 * InternalCalendarPageContainer - Smart Component
 *
 * Main container for internal calendar page.
 * Orchestrates StatsBar, filters, view toggle (grid/calendar), and event display.
 *
 * Created following TDD methodology.
 */

'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { getEventTypes } from '@/features/event-types/services/eventType.service';
import { InternalCalendarFilterBar } from '@/features/internal-calendar/components/dumb/InternalCalendarFilterBar';
import { InternalCalendarGridContainer } from '@/features/internal-calendar/components/smart/InternalCalendarGridContainer';
import { InternalCalendarViewContainer } from '@/features/internal-calendar/components/smart/InternalCalendarViewContainer';
import { StatsBarContainer } from '@/features/internal-calendar/components/smart/StatsBarContainer';
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';
import type {
  InternalCalendarFilters,
  ViewMode,
} from '@/features/internal-calendar/types/internal-calendar.types';
import type { EventType } from '@/types/eventType.types';

interface InternalCalendarPageContainerProps {
  basePath: string;
}

/**
 *
 */
export function InternalCalendarPageContainer({ basePath }: InternalCalendarPageContainerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [filters, setFilters] = useState<InternalCalendarFilters>({});
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [eventTypesLoading, setEventTypesLoading] = useState(false);
  const { token } = useAuth();

  // Fetch events at page level for export functionality
  const { events, loading: eventsLoading, error: eventsError } = useInternalCalendarEvents(filters);

  // Fetch event types for filter dropdown
  useEffect(() => {
    const fetchEventTypes = async () => {
      setEventTypesLoading(true);
      try {
        const data = await getEventTypes({ active: true, per_page: 100 });
        setEventTypes(data.data);
      } catch {
        // Silently fail - filter will show empty dropdown
        setEventTypes([]);
      } finally {
        setEventTypesLoading(false);
      }
    };

    fetchEventTypes();
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
          onFiltersChange={setFilters}
          eventTypes={eventTypes}
          eventTypesLoading={eventTypesLoading}
          events={events}
        />

        <div className="bg-neutral-100 rounded-lg p-1 inline-flex mb-6">
          <button
            onClick={() => setViewMode('grid')}
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
            onClick={() => setViewMode('calendar')}
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
