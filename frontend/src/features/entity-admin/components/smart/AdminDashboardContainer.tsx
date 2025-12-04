/**
 * AdminDashboardContainer - Smart Component
 *
 * Composes the admin dashboard with stats and quick filters.
 * Uses useEventManager for events and useEventManagement for modal.
 */

'use client';

import { useState, useCallback } from 'react';
import { useAdminStats } from '@/features/entity-admin/hooks/useAdminStats';
import { useEventManagement } from '@/features/entity-admin/hooks/useEventManagement';
import { useEventManager } from '@/features/events/hooks/useEventManager';
import { AdminStatsGrid } from '@/features/entity-admin/components/dumb/AdminStatsGrid';
import { AdminQuickFilters } from '@/features/entity-admin/components/dumb/AdminQuickFilters';
import { EventTableContainer } from '@/features/entity-admin/components/smart/EventTableContainer';
import { EventManagementModal } from '@/features/entity-admin/components/dumb/EventManagementModal';
import { EventInfoPanel } from '@/features/entity-admin/components/dumb/EventInfoPanel';
import { ApprovalActionPanel } from '@/features/entity-admin/components/dumb/ApprovalActionPanel';
import { ApprovalHistoryTimeline } from '@/features/entity-admin/components/dumb/ApprovalHistoryTimeline';
import { Pagination } from '@/components/ui';
import type { Event, EventStatusCode } from '@/types/event.types';

export const AdminDashboardContainer = () => {
  const [activeFilter, setActiveFilter] = useState<EventStatusCode | null>(null);

  const { cardData, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useAdminStats();

  // Use event manager for events list
  const {
    events,
    pagination,
    isLoading: eventsLoading,
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

  // Handle filter change
  const handleFilterChange = useCallback((status: EventStatusCode | null) => {
    setActiveFilter(status);
    if (status) {
      updateFilters({ status });
    } else {
      updateFilters({ status: undefined });
    }
  }, [updateFilters]);

  // Handle opening modal from event table
  const handleApprovalAction = useCallback((event: Event) => {
    openModal(event);
  }, [openModal]);

  // Get status code from event
  // Supports both 'status_code' (type definition) and 'code' (API response from EventResource)
  const getStatusCode = (event: Event | null): EventStatusCode => {
    if (!event) return 'draft';
    if (typeof event.status === 'string') return event.status;
    // Backend EventResource returns 'code', type definition expects 'status_code'
    return (event.status.status_code || (event.status as { code?: string }).code || 'draft') as EventStatusCode;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Panel de Administración</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Gestiona y aprueba eventos del calendario
        </p>
      </div>

      {/* Stats Grid */}
      {statsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-neutral-500">Cargando estadísticas...</div>
        </div>
      ) : statsError ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-error-600">Error al cargar estadísticas</div>
        </div>
      ) : (
        <AdminStatsGrid cardData={cardData} />
      )}

      {/* Quick Filters */}
      <AdminQuickFilters
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Event Table */}
      <div className="bg-white shadow-sm rounded-lg">
        <EventTableContainer
          events={events}
          isLoading={eventsLoading}
          onApprovalAction={handleApprovalAction}
        />

        {/* Pagination */}
        {pagination && (
          <div className="border-t border-neutral-200 px-6">
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.last_page}
              onPageChange={changePage}
              showInfo={true}
              totalItems={pagination.total}
              itemsFrom={pagination.from ?? undefined}
              itemsTo={pagination.to ?? undefined}
            />
          </div>
        )}
      </div>

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
    </div>
  );
};

export default AdminDashboardContainer;
