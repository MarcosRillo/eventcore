/**
 * InternalCalendarPageContainer - Smart Component
 *
 * Main container for internal calendar page.
 * Orchestrates StatsBar, view toggle (grid/calendar), and event display.
 *
 * Created following TDD methodology.
 */

'use client';

import { useState } from 'react';
import { InternalCalendarGridContainer } from '@/features/internal-calendar/components/smart/InternalCalendarGridContainer';
import { InternalCalendarViewContainer } from '@/features/internal-calendar/components/smart/InternalCalendarViewContainer';
import type { ViewMode } from '@/features/internal-calendar/types/internal-calendar.types';
// import { StatsBarContainer } from '@/features/internal-calendar/components/smart/StatsBarContainer';

export function InternalCalendarPageContainer() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Stats Bar - temporarily commented out until backend endpoint is verified */}
      {/* <StatsBarContainer /> */}

      {/* View Toggle */}
      <div className="container mx-auto px-4 py-6">
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
          <InternalCalendarGridContainer />
        ) : (
          <InternalCalendarViewContainer />
        )}
      </div>
    </div>
  );
}
