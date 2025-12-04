/**
 * EventManagementModalContainer - Smart Component
 *
 * Composes the event management modal with all panels.
 * Uses useEventManagement hook to coordinate state and actions.
 */

'use client';

import { useEventManagement } from '@/features/entity-admin/hooks/useEventManagement';
import { EventManagementModal } from '@/features/entity-admin/components/dumb/EventManagementModal';
import { EventInfoPanel } from '@/features/entity-admin/components/dumb/EventInfoPanel';
import { ApprovalActionPanel } from '@/features/entity-admin/components/dumb/ApprovalActionPanel';
import { ApprovalHistoryTimeline } from '@/features/entity-admin/components/dumb/ApprovalHistoryTimeline';
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
    openModal,
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
      {/* Two-panel layout: Info left, Actions right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Event Information */}
        <div className="space-y-4">
          <EventInfoPanel event={selectedEvent} />

          {/* Approval History */}
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
