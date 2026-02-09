/**
 * EventManagementModalContainer - Smart Component
 *
 * Composes the event management modal with all panels.
 * Uses useEventManagement hook to coordinate state and actions.
 */

'use client';

import { ApprovalActionPanel } from '@/features/entity-admin/components/dumb/ApprovalActionPanel';
import { ApprovalHistoryTimeline } from '@/features/entity-admin/components/dumb/ApprovalHistoryTimeline';
import { EventInfoPanel } from '@/features/entity-admin/components/dumb/EventInfoPanel';
import { EventManagementModal } from '@/features/entity-admin/components/dumb/EventManagementModal';
import { useEventManagement } from '@/features/entity-admin/hooks/useEventManagement';
import type { Event, EventStatusCode } from '@/types/event.types';

interface EventManagementModalContainerProps {
  onActionSuccess: () => void;
}

export const EventManagementModalContainer = ({
  onActionSuccess,
}: EventManagementModalContainerProps) => {
  const {
    isOpen,
    selectedEvent,
    selectedAction,
    comment,
    commentError,
    availableActions,
    isLoading,
    closeModal,
    selectAction,
    setComment,
    confirmAction,
    cancelAction,
  } = useEventManagement({
    onSuccess: onActionSuccess,
  });

  // Get status code from event (handles both object and string formats)
  const getStatusCode = (event: Event | null): EventStatusCode => {
    if (!event) return 'draft';
    return typeof event.status === 'object' ? event.status.status_code : event.status;
  };

  // If not open or no event, don't render
  if (!isOpen || !selectedEvent) {
    return null;
  }

  const currentStatus = getStatusCode(selectedEvent);

  return (
    <EventManagementModal
      isOpen={isOpen}
      event={selectedEvent}
      onClose={closeModal}
    >
      {/* Two-panel layout: Info left (3/5), Actions right (2/5) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Panel: Event Information */}
        <div className="lg:col-span-3 space-y-6">
          <EventInfoPanel event={selectedEvent} />

          {/* Approval History */}
          <ApprovalHistoryTimeline
            history={selectedEvent.approval_history || []}
          />
        </div>

        {/* Right Panel: Approval Actions */}
        <div className="lg:col-span-2">
          <ApprovalActionPanel
            availableActions={availableActions}
            selectedAction={selectedAction}
            comment={comment}
            commentError={commentError}
            isLoading={isLoading}
            currentStatus={currentStatus}
            onActionSelect={selectAction}
            onCommentChange={setComment}
            onConfirm={confirmAction}
            onCancel={cancelAction}
          />
        </div>
      </div>
    </EventManagementModal>
  );
};

// Export openModal type for external use
export type { Event };
export { EventManagementModalContainer as default };
