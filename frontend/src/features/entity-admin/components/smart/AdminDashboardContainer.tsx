/**
 * AdminDashboardContainer - Smart Component
 *
 * Composes the admin dashboard with stats, filters, and event list.
 * Uses useEventManager for events and useEventManagement for modal.
 * Accepts optional initialStats from server-side fetch to avoid waterfall.
 *
 * Redesigned UI/UX with:
 * - Compact stats bar (AdminStatsSummary)
 * - Unified filters (AdminEventFilters)
 * - Event cards (AdminEventList)
 */

'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';

import { AdminDashboard } from '@/features/entity-admin/components/dumb/AdminDashboard';
import { ApprovalActionPanel } from '@/features/entity-admin/components/dumb/ApprovalActionPanel';
import { ApprovalHistoryTimeline } from '@/features/entity-admin/components/dumb/ApprovalHistoryTimeline';
import { EventInfoPanel } from '@/features/entity-admin/components/dumb/EventInfoPanel';
import { useAdminStats } from '@/features/entity-admin/hooks/useAdminStats';
import { useEventManagement } from '@/features/entity-admin/hooks/useEventManagement';
import type { AdminApprovalStats } from '@/features/entity-admin/types';
import { useActiveEventTypes } from '@/features/event-types/hooks/useActiveEventTypes';
import { useEventManager } from '@/features/events/hooks/useEventManager';
import type { ApprovalHistoryEntry } from '@/types/event.types';
import type { Event, EventStatusCode } from '@/types/event.types';

const EMPTY_HISTORY: ApprovalHistoryEntry[] = [];

// Lazy load modal - only loaded when needed
const EventManagementModal = dynamic(
  () => import('@/features/entity-admin/components/dumb/EventManagementModal').then(mod => ({ default: mod.EventManagementModal })),
  { ssr: false }
);

/**
 * Get status code from event object.
 * Supports both 'status_code' (type definition) and 'code' (API response from EventResource)
 */
function getStatusCode(event: Event | null): EventStatusCode {
  if (!event) return 'draft';
  if (typeof event.status === 'string') return event.status;
  return (event.status?.status_code || (event.status as { code?: string })?.code || 'draft') as EventStatusCode;
}

interface AdminDashboardContainerProps {
  initialStats?: AdminApprovalStats | null;
}

export const AdminDashboardContainer = ({ initialStats }: AdminDashboardContainerProps) => {
  const [activeFilter, setActiveFilter] = useState<EventStatusCode | null>(null);
  const [timeScope, setTimeScope] = useState<'upcoming' | 'past'>('upcoming');
  const [searchValue, setSearchValue] = useState('');
  const [selectedEventTypeId, setSelectedEventTypeId] = useState<number | null>(null);

  // Fetch event types for filter dropdown (shared hook, 60s dedup)
  const { eventTypes } = useActiveEventTypes();

  const {
    stats,
    statusCounts,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useAdminStats({ initialStats, showPast: timeScope === 'past' });

  // Use event manager for events list
  const {
    events,
    pagination,
    isLoading: eventsLoading,
    error: eventsError,
    updateFilters,
    changePage,
    refreshData,
  } = useEventManager();

  // Event management modal
  const {
    isOpen,
    selectedEvent,
    selectedAction,
    comment,
    commentError,
    availableActions,
    isLoading: actionLoading,
    openModal,
    closeModal,
    selectAction,
    setComment,
    confirmAction,
    cancelAction,
    toggleFeatured,
    updateSelectedEvent,
  } = useEventManagement({
    onSuccess: () => {
      refetchStats();
      refreshData();
    },
  });

  // Handle toggle featured
  const handleToggleFeatured = useCallback(async () => {
    if (!selectedEvent) return;
    const result = await toggleFeatured(selectedEvent.id);
    if (result) {
      updateSelectedEvent(result);
      refetchStats();
      refreshData();
    }
  }, [selectedEvent, toggleFeatured, updateSelectedEvent, refetchStats, refreshData]);

  // Handle filter change from stats bar or filter pills
  const handleFilterChange = useCallback((status: EventStatusCode | null) => {
    setActiveFilter(status);
    const showPast = timeScope === 'past';
    if (status) {
      updateFilters({ status, show_past: showPast ? '1' : undefined });
    } else {
      updateFilters({ status: undefined, show_past: showPast ? '1' : undefined });
    }
  }, [updateFilters, timeScope]);

  // Handle time scope toggle
  const handleTimeScopeChange = useCallback((scope: 'upcoming' | 'past') => {
    setTimeScope(scope);
    updateFilters({
      status: activeFilter || undefined,
      show_past: scope === 'past' ? '1' : undefined,
    });
  }, [updateFilters, activeFilter]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    changePage(page);
  }, [changePage]);

  // Handle manage event (open modal)
  const handleManageEvent = useCallback((event: Event) => {
    openModal(event);
  }, [openModal]);

  // Handle retry
  const handleRetry = useCallback(() => {
    refreshData();
  }, [refreshData]);

  // Handle search change
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    updateFilters({ search: value || undefined });
  }, [updateFilters]);

  // Handle event type filter change
  const handleEventTypeChange = useCallback((eventTypeId: number | null) => {
    setSelectedEventTypeId(eventTypeId);
    updateFilters({ event_type_id: eventTypeId || undefined });
  }, [updateFilters]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setActiveFilter(null);
    setTimeScope('upcoming');
    setSearchValue('');
    setSelectedEventTypeId(null);
    updateFilters({ status: undefined, show_past: undefined, search: undefined, event_type_id: undefined });
  }, [updateFilters]);

  return (
    <AdminDashboard
      // Stats
      stats={stats}
      statsLoading={statsLoading}

      // Events
      events={events}
      eventsLoading={eventsLoading}
      eventsError={eventsError ?? null}

      // Filters
      activeStatusFilter={activeFilter}
      timeScope={timeScope}
      statusCounts={statusCounts}

      // Pagination
      pagination={pagination}

      // Search & type filter
      searchValue={searchValue}
      onSearchChange={handleSearchChange}
      eventTypes={eventTypes}
      selectedEventTypeId={selectedEventTypeId}
      onEventTypeChange={handleEventTypeChange}

      // Handlers
      onStatClick={handleFilterChange}
      onStatusFilterChange={handleFilterChange}
      onTimeScopeChange={handleTimeScopeChange}
      onPageChange={handlePageChange}
      onManageEvent={handleManageEvent}
      onRetry={handleRetry}
      onClearFilters={handleClearFilters}
    >
      {/* Event Management Modal */}
      {isOpen && selectedEvent && (
        <EventManagementModal
          isOpen={isOpen}
          event={selectedEvent}
          onClose={closeModal}
        >
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Panel: Event Information (3/5) */}
            <div className="lg:col-span-3 space-y-6">
              <EventInfoPanel event={selectedEvent} />
              <ApprovalHistoryTimeline
                history={selectedEvent.approval_history || EMPTY_HISTORY}
              />
            </div>

            {/* Right Panel: Approval Actions (2/5) */}
            <div className="lg:col-span-2 lg:sticky lg:top-0 lg:self-start">
              <ApprovalActionPanel
                availableActions={availableActions}
                selectedAction={selectedAction}
                comment={comment}
                commentError={commentError}
                isLoading={actionLoading}
                currentStatus={getStatusCode(selectedEvent)}
                onActionSelect={selectAction}
                onCommentChange={setComment}
                onConfirm={confirmAction}
                onCancel={cancelAction}
                isFeatured={selectedEvent.is_featured}
                onToggleFeatured={handleToggleFeatured}
              />
            </div>
          </div>
        </EventManagementModal>
      )}
    </AdminDashboard>
  );
};

export default AdminDashboardContainer;
