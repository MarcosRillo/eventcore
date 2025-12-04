/**
 * EventManagementModal Component
 *
 * Main modal shell for the event management interface.
 * Dumb component - composes EventInfoPanel, ApprovalActionPanel, and ApprovalHistoryTimeline.
 */

'use client';

import Modal from '@/components/ui/Modal';
import type { Event } from '@/types/event.types';
import { EVENT_STATUS_LABELS, EVENT_STATUS_COLORS } from '@/types/event.types';

interface EventManagementModalProps {
  isOpen: boolean;
  event: Event | null;
  children: React.ReactNode;
  onClose: () => void;
}

export const EventManagementModal = ({
  isOpen,
  event,
  children,
  onClose,
}: EventManagementModalProps) => {
  // Don't render if no event
  if (!event) return null;

  const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status;
  const statusLabel = EVENT_STATUS_LABELS[statusCode] || statusCode;
  const statusColor = EVENT_STATUS_COLORS[statusCode] || 'bg-neutral-100 text-neutral-800';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title="Gestionar Evento"
      showCloseButton={true}
    >
      {/* Header with event title and status */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-neutral-100">
        <h3 className="text-lg font-semibold text-neutral-900 flex-1 pr-4">
          {event.title}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {/* Modal Content (passed as children for flexibility) */}
      {children}
    </Modal>
  );
};

export default EventManagementModal;
