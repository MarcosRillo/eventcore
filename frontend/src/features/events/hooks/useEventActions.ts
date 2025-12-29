/**
 * Event Actions Hook
 * Generates action data based on event state and user permissions
 */

import { useMemo } from 'react';

import { Event } from '@/types/event.types';

interface EventActionsProps {
  event: Event;
  onViewDetail: (eventId: number) => void;
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (eventId: number) => void;
  onApproveInternal?: (event: Event) => void;
  onRequestPublicApproval?: (event: Event) => void;
  onPublishEvent?: (event: Event) => void;
  onRequestChanges?: (event: Event) => void;
  onApproveEvent?: (event: Event) => void; // Legacy compatibility
  canApproveInternal: () => boolean;
  canRequestPublicApproval: () => boolean;
  canPublish: () => boolean;
  canRequestChanges: () => boolean;
}

export const useEventActions = ({
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
}: EventActionsProps) => {
  const actions = useMemo(() => {
    const actionList = [];

    // View detail button (always available)
    actionList.push({
      key: 'view',
      label: 'Ver Detalle',
      variant: 'secondary' as const,
      onClick: () => onViewDetail(event.id)
    });

    // Double-level workflow actions
    if (canApproveInternal() && onApproveInternal) {
      actionList.push({
        key: 'approve-internal',
        label: 'Aprobar Interno',
        variant: 'primary' as const,
        onClick: () => onApproveInternal(event)
      });
    }

    if (canRequestPublicApproval() && onRequestPublicApproval) {
      actionList.push({
        key: 'request-public',
        label: 'Solicitar Publicación',
        variant: 'primary' as const,
        onClick: () => onRequestPublicApproval(event)
      });
    }

    if (canPublish() && onPublishEvent) {
      actionList.push({
        key: 'publish',
        label: 'Publicar',
        variant: 'primary' as const,
        onClick: () => onPublishEvent(event)
      });
    }

    if (canRequestChanges() && onRequestChanges) {
      actionList.push({
        key: 'request-changes',
        label: 'Solicitar Cambios',
        variant: 'danger' as const,
        onClick: () => onRequestChanges(event)
      });
    }

    // Legacy compatibility
    if (onApproveEvent && !onApproveInternal) {
      actionList.push({
        key: 'approve-legacy',
        label: 'Aprobar',
        variant: 'primary' as const,
        onClick: () => onApproveEvent(event)
      });
    }

    // Edit and delete actions
    if (onEditEvent) {
      actionList.push({
        key: 'edit',
        label: 'Editar',
        variant: 'secondary' as const,
        onClick: () => onEditEvent(event)
      });
    }

    if (onDeleteEvent) {
      actionList.push({
        key: 'delete',
        label: 'Eliminar',
        variant: 'danger' as const,
        onClick: () => onDeleteEvent(event.id)
      });
    }

    return actionList;
  }, [
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
  ]);

  return { actions };
};