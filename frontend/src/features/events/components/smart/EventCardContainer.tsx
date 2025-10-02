/**
 * Event Card Container - Smart Component
 * Orchestrates multiple hooks to provide data and logic to EventCard
 */

'use client';

import React from 'react';
import { Event } from '@/types/event.types';
import { EventCard } from '@/features/events/components/dumb/EventCard';
import { Button } from '@/components/ui';
import { ClockIcon } from '@heroicons/react/24/outline';
import { useEventCardLogic } from '@/features/events/hooks/useEventCardLogic';
import { useEventUrgency } from '@/features/events/hooks/useEventUrgency';
import { useEventActions } from '@/features/events/hooks/useEventActions';

interface EventCardContainerProps {
  event: Event;
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

export const EventCardContainer: React.FC<EventCardContainerProps> = ({
  event,
  onViewDetail,
  onEditEvent,
  onDeleteEvent,
  onApproveInternal,
  onRequestPublicApproval,
  onPublishEvent,
  onRequestChanges,
  onApproveEvent
}) => {
  // Extract business logic into specialized hooks
  const {
    formattedDate,
    statusColor,
    canApproveInternal,
    canRequestPublicApproval,
    canPublish,
    canRequestChanges
  } = useEventCardLogic(event);

  const { urgencyData } = useEventUrgency(event);

  const { actions } = useEventActions({
    event,
    onViewDetail,
    onEditEvent,
    onDeleteEvent,
    onApproveInternal,
    onRequestPublicApproval,
    onPublishEvent,
    onRequestChanges,
    onApproveEvent,
    canApproveInternal,
    canRequestPublicApproval,
    canPublish,
    canRequestChanges
  });

  // Create JSX components from hook data
  const urgencyIndicator = urgencyData ? (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${urgencyData.className}`}>
      {urgencyData.showIcon && <ClockIcon className="w-3 h-3 mr-1" />}
      {urgencyData.showPulse && <div className="w-2 h-2 bg-blue-600 rounded-full mr-1 animate-pulse" />}
      {urgencyData.text}
    </div>
  ) : null;

  const actionButtons = (
    <div className="flex flex-wrap gap-2">
      {actions.map(action => (
        <Button
          key={action.key}
          variant={action.variant}
          size="sm"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );

  return (
    <EventCard
      event={event}
      formattedDate={formattedDate}
      statusColor={statusColor}
      urgencyIndicator={urgencyIndicator}
      actionButtons={actionButtons}
      onViewDetail={() => onViewDetail(event.id)}
    />
  );
};