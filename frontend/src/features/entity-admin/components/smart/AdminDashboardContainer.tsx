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
import { useEventManager } from '@/features/events/hooks/useEventManager';
import type { Event, EventStatusCode } from '@/types/event.types';

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
  return (event.status.status_code || (event.status as { code?: string }).code || 'draft') as EventStatusCode;
}

interface AdminDashboardContainerProps {
  initialStats?: AdminApprovalStats | null;
}

export const AdminDashboardContainer = ({ initialStats }: AdminDashboardContainerProps) => {
  const [activeFilter, setActiveFilter] = useState<EventStatusCode | null>(null);
  const [timeScope, setTimeScope] = useState<'upcoming' | 'past'>('upcoming');

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
  } = useEventManagement({
    onSuccess: () => {
      refetchStats();
      refreshData();
    },
  });

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

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setActiveFilter(null);
    setTimeScope('upcoming');
    updateFilters({ status: undefined, show_past: undefined });
  }, [updateFilters]);

  return (
    <AdminDashboard
      // Stats
      stats={stats}
      statsLoading={statsLoading}

      // Events
      events={events}
      eventsLoading={eventsLoading}
      eventsError={eventsError?.message ?? null}

      // Filters
      activeStatusFilter={activeFilter}
      timeScope={timeScope}
      statusCounts={statusCounts}

      // Pagination
      pagination={pagination}

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel: Event Information */}
            <div className="space-y-4">
              <EventInfoPanel event={selectedEvent} />
              <ApprovalHistoryTimeline
                history={selectedEvent.approval_history || []}
              />
            </div>

            {/* Right Panel: Approval Actions */}
            <div className="lg:border-l lg:border-neutral-200 lg:pl-6">
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
              />
            </div>
          </div>
        </EventManagementModal>
      )}
    </AdminDashboard>
  );
};

export default AdminDashboardContainer;
