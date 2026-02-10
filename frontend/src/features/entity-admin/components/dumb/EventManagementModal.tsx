/**
 * EventManagementModal Component
 *
 * Main modal shell for the event management interface.
 * Dumb component - composes EventInfoPanel, ApprovalActionPanel, and ApprovalHistoryTimeline.
 */

'use client';

import { getStatusBadgeVariant } from '@/features/entity-admin/types';
import { Badge } from '@/shared/components/display';
import { Modal } from '@/shared/components/modals';
import type { Event } from '@/types/event.types';
import { EVENT_STATUS_LABELS } from '@/types/event.types';

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

  const statusCode = typeof event.status === 'object' ? (event.status?.status_code ?? 'draft') : (event.status ?? 'draft');
  const statusLabel = EVENT_STATUS_LABELS[statusCode] || statusCode;
  const badgeVariant = getStatusBadgeVariant(statusCode);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title={
        <span className="flex items-center gap-3">
          <span>{event.title}</span>
          <Badge variant={badgeVariant} size="sm">
            {statusLabel}
          </Badge>
        </span>
      }
      showCloseButton={true}
    >
      {/* Modal Content (passed as children for flexibility) */}
      {children}
    </Modal>
  );
};

export default EventManagementModal;
