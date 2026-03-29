/**
 * Dashboard Mode View Component
 * Conditional dashboard functionality for entity_admin/entity_staff users
 * Integrates workflow-based filtering with the stable events base
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { DashboardTab,EventsFilterTabs, EventsList } from '@/features/events/components';
import { Event } from '@/types/event.types';

interface DashboardModeViewProps {
  events: Event[];
  isLoading?: boolean;
  onViewDetail: (eventId: number) => void;
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (eventId: number) => void;
  // Double-Level Workflow Actions
  onApproveInternal?: (event: Event) => void;
  onRequestPublicApproval?: (event: Event) => void;
  onPublishEvent?: (event: Event) => void;
  onRequestChanges?: (event: Event) => void;
  onRejectEvent?: (event: Event) => void;
  // Legacy compatibility
  onApproveEvent?: (event: Event) => void;
}

interface TabCounters {
  'requires-action': number;
  'pending': number;
  'published': number;
  'historic': number;
}

export const DashboardModeView = ({
  events,
  isLoading = false,
  onViewDetail,
  onEditEvent,
  onDeleteEvent,
  onApproveInternal,
  onRequestPublicApproval,
  onPublishEvent,
  onRequestChanges,
  onRejectEvent,
  // Legacy compatibility
  onApproveEvent
}: DashboardModeViewProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('requires-action');
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [counters, setCounters] = useState<TabCounters>({
    'requires-action': 0,
    'pending': 0,
    'published': 0,
    'historic': 0,
  });


  // Check if user should see dashboard mode
  const shouldShowDashboardMode = useCallback(() => {
    const userRole = user?.role?.role_code;
    return userRole === 'entity_admin' || userRole === 'entity_staff';
  }, [user?.role?.role_code]);

  /**
   * Single-pass grouping: iterates events once to build all tab buckets
   * and counters simultaneously, avoiding 5 separate array passes.
   */
  const { grouped, counters: computedCounters } = useMemo(() => {
    const now = new Date();
    const grouped: Record<DashboardTab, Event[]> = {
      'requires-action': [],
      'pending': [],
      'published': [],
      'historic': [],
    };

    if (events) {
      for (const event of events) {
        const statusCode = typeof event.status === 'string' ? event.status : event.status?.status_code;

        if (
          statusCode === 'pending_internal_approval' ||
          statusCode === 'pending_public_approval' ||
          statusCode === 'requires_changes'
        ) {
          grouped['requires-action'].push(event);
        } else if (statusCode === 'approved_internal' || statusCode === 'draft') {
          grouped['pending'].push(event);
        } else if (statusCode === 'published') {
          grouped['published'].push(event);
        }

        // Historic: rejected/cancelled OR has ended (can overlap with other buckets)
        const isRejectedOrCancelled = statusCode === 'rejected' || statusCode === 'cancelled';
        const hasEnded = new Date(event.end_date) < now;
        if (isRejectedOrCancelled || hasEnded) {
          grouped['historic'].push(event);
        }
      }
    }

    const counters: TabCounters = {
      'requires-action': grouped['requires-action'].length,
      'pending': grouped['pending'].length,
      'published': grouped['published'].length,
      'historic': grouped['historic'].length,
    };

    return { grouped, counters };
  }, [events]);

  // Handler functions for event actions - pass through to parent handlers
  const handleApproveInternal = useCallback((event: Event) => {
    onApproveInternal?.(event);
  }, [onApproveInternal]);

  const handleRequestPublicApproval = useCallback((event: Event) => {
    onRequestPublicApproval?.(event);
  }, [onRequestPublicApproval]);

  const handlePublishEvent = useCallback((event: Event) => {
    onPublishEvent?.(event);
  }, [onPublishEvent]);

  const handleRequestChanges = useCallback((event: Event) => {
    onRequestChanges?.(event);
  }, [onRequestChanges]);

  const handleRejectEvent = useCallback((event: Event) => {
    onRejectEvent?.(event);
  }, [onRejectEvent]);

  // Legacy handler for backward compatibility
  const handleApproveEvent = useCallback((event: Event) => {
    if (onApproveEvent) {
      onApproveEvent(event);
    } else if (onApproveInternal) {
      onApproveInternal(event);
    }
  }, [onApproveEvent, onApproveInternal]);

  // Update filtered events and counters when events or activeTab changes
  useEffect(() => {
    if (events) {
      setFilteredEvents(grouped[activeTab]);
      setCounters(computedCounters);
    }
  }, [events, activeTab, grouped, computedCounters]);

  // Set initial tab based on user role and available events
  useEffect(() => {
    if (shouldShowDashboardMode() && events && events.length > 0) {
      const newCounters = computedCounters;

      // Default to tab with highest priority that has events
      if (newCounters['requires-action'] > 0) {
        setActiveTab('requires-action');
      } else if (newCounters['pending'] > 0) {
        setActiveTab('pending');
      } else if (newCounters['published'] > 0) {
        setActiveTab('published');
      } else {
        setActiveTab('historic');
      }
    } else {
      // For non-admin users, default to published events
      setActiveTab('published');
    }
  }, [events, user, computedCounters, shouldShowDashboardMode]);

  // If not dashboard mode, show all events (fallback for users without admin roles or when auth is not loaded)
  if (!shouldShowDashboardMode()) {
    // For debugging purposes, show all events if user is not authenticated yet
    const displayEvents = events || [];

    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          <h1 className="text-lg font-medium text-neutral-900">
            {user ? 'Eventos Publicados' : 'Todos los Eventos'}
          </h1>
          <p className="text-sm text-neutral-600">
            {user
              ? 'Eventos aprobados y visibles al público'
              : 'Vista de todos los eventos (modo de prueba)'
            }
          </p>
        </div>

        <EventsList
          events={displayEvents}
          isLoading={isLoading}
          onViewDetail={onViewDetail}
          onEditEvent={onEditEvent}
          onDeleteEvent={onDeleteEvent}
          onApproveInternal={handleApproveInternal}
          onRequestPublicApproval={handleRequestPublicApproval}
          onPublishEvent={handlePublishEvent}
          onRequestChanges={handleRequestChanges}
          onRejectEvent={handleRejectEvent}
          // Legacy compatibility
          onApproveEvent={handleApproveEvent}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <EventsFilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counters={counters}
          isLoading={isLoading}
        />
      </div>

      {/* Events Grid */}
      <EventsList
        events={filteredEvents}
        isLoading={isLoading}
        onViewDetail={onViewDetail}
        onEditEvent={onEditEvent}
        onDeleteEvent={onDeleteEvent}
        onApproveInternal={handleApproveInternal}
        onRequestPublicApproval={handleRequestPublicApproval}
        onPublishEvent={handlePublishEvent}
        onRequestChanges={handleRequestChanges}
        onRejectEvent={handleRejectEvent}
        // Legacy compatibility
        onApproveEvent={handleApproveEvent}
      />

      {/* Tab-specific empty states */}
      {!isLoading && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-neutral-400 mb-4">
            {activeTab === 'requires-action' && (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
            {activeTab === 'pending' && (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {activeTab === 'published' && (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {activeTab === 'historic' && (
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            {activeTab === 'requires-action' && 'No hay eventos que requieran acción'}
            {activeTab === 'pending' && 'No hay eventos pendientes'}
            {activeTab === 'published' && 'No hay eventos publicados'}
            {activeTab === 'historic' && 'No hay eventos históricos'}
          </h3>

          <p className="text-neutral-500">
            {activeTab === 'requires-action' && 'Todos los eventos están en un estado que no requiere tu intervención inmediata. Aquí aparecerán eventos pendientes de aprobación interna, pública o que requieran cambios.'}
            {activeTab === 'pending' && 'No hay eventos en estado intermedio. Aquí aparecerán eventos aprobados internamente pero aún no solicitados para el calendario público.'}
            {activeTab === 'published' && 'No hay eventos publicados en el calendario público en este momento.'}
            {activeTab === 'historic' && 'No hay eventos finalizados, rechazados o cancelados.'}
          </p>
        </div>
      )}
    </div>
  );
};
