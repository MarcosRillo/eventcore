/**
 * Event Table Container - Smart Component
 * Handles business logic, state management, and configuration for EventTable
 */

'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Event, EVENT_STATUS, EVENT_TYPE } from '@/types/event.types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  EventTable,
  EventTableViewMode,
  ColumnConfig,
  ActionConfig,
  ConfirmDialogData
} from '@/features/entity-admin/components/dumb/EventTable';

interface EventTableContainerProps {
  events: Event[];
  isLoading: boolean;
  viewMode?: EventTableViewMode;
  onSelectEvent?: (event: Event) => void;
  onEditEvent?: (event: Event) => void;
  onDeleteEvent?: (eventId: number) => void;
  onDuplicateEvent?: (event: Event) => void;
  onApprovalAction?: (event: Event) => void;
  onToggleFeatured?: (event: Event) => void;
  onRequestApproval?: (event: Event) => void;
  onShareEvent?: (event: Event) => void;
  onExportToCalendar?: (event: Event) => void;
  onViewComments?: (event: Event) => void;
  // Backward compatibility
  showActions?: boolean;
  compactView?: boolean;
}

export const EventTableContainer: React.FC<EventTableContainerProps> = ({
  events,
  isLoading,
  viewMode = 'admin',
  onSelectEvent,
  onEditEvent,
  onDeleteEvent,
  onDuplicateEvent,
  onApprovalAction,
  onToggleFeatured,
  onRequestApproval,
  onShareEvent,
  onExportToCalendar,
  onViewComments,
  showActions = true,
  compactView = false,
}) => {
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Status labels configuration
  const statusLabels = useMemo(() => ({
    [EVENT_STATUS.DRAFT]: { label: 'Borrador', className: 'bg-gray-100 text-gray-800' },
    [EVENT_STATUS.PENDING_INTERNAL_APPROVAL]: { label: 'Pendiente Aprobación Interna', className: 'bg-yellow-100 text-yellow-800' },
    [EVENT_STATUS.APPROVED_INTERNAL]: { label: 'Aprobado Internamente', className: 'bg-blue-100 text-blue-800' },
    [EVENT_STATUS.PENDING_PUBLIC_APPROVAL]: { label: 'Pendiente Aprobación Pública', className: 'bg-orange-100 text-orange-800' },
    [EVENT_STATUS.PUBLISHED]: { label: 'Publicado', className: 'bg-green-100 text-green-800' },
    [EVENT_STATUS.REQUIRES_CHANGES]: { label: 'Requiere Cambios', className: 'bg-red-100 text-red-800' },
    [EVENT_STATUS.REJECTED]: { label: 'Rechazado', className: 'bg-red-100 text-red-800' },
    [EVENT_STATUS.CANCELLED]: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800' },
  }), []);

  // Type labels configuration
  const typeLabels = useMemo(() => ({
    [EVENT_TYPE.SINGLE_LOCATION]: 'Sede Única',
    [EVENT_TYPE.MULTI_LOCATION]: 'Multi-Sede',
  }), []);

  // Date formatting function
  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), compactView ? 'dd/MM/yy' : 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return dateString;
    }
  };

  // Delete event handler with confirmation (defined before useMemo)
  const handleDeleteEvent = useCallback((event: Event) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar el evento "${event.title}"? Esta acción no se puede deshacer.`,
      onConfirm: () => {
        if (onDeleteEvent) {
          onDeleteEvent(event.id);
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  }, [onDeleteEvent]);

  // Column configuration based on view mode
  const columns = useMemo((): ColumnConfig[] => {
    const baseColumns: ColumnConfig[] = [
      { key: 'event', label: 'Evento', visible: true },
      { key: 'date', label: 'Fecha y Hora', visible: true },
      { key: 'location', label: 'Ubicación', visible: true },
    ];

    switch (viewMode) {
      case 'admin':
        return [
          ...baseColumns,
          { key: 'type', label: 'Tipo', visible: true },
          { key: 'status', label: 'Estado', visible: true },
          { key: 'category', label: 'Categoría', visible: true },
          { key: 'organizer', label: 'Organizador', visible: true },
          { key: 'created', label: 'Creado', visible: !compactView },
          { key: 'actions', label: 'Acciones', visible: showActions, className: 'text-right' },
        ];

      case 'organizer':
        return [
          ...baseColumns,
          { key: 'type', label: 'Tipo', visible: !compactView },
          { key: 'status', label: 'Estado', visible: true },
          { key: 'category', label: 'Categoría', visible: true },
          { key: 'feedback', label: 'Comentarios', visible: true },
          { key: 'actions', label: 'Acciones', visible: showActions, className: 'text-right' },
        ];

      case 'public':
        return [
          ...baseColumns,
          { key: 'category', label: 'Categoría', visible: true },
          { key: 'type', label: 'Tipo', visible: !compactView },
          { key: 'actions', label: 'Compartir', visible: showActions, className: 'text-right' },
        ];

      default:
        return baseColumns;
    }
  }, [viewMode, showActions, compactView]);

  // Action configuration based on view mode
  const actions = useMemo((): ActionConfig[] => {
    const baseActions: ActionConfig[] = [];

    switch (viewMode) {
      case 'admin':
        if (onSelectEvent) {
          baseActions.push({
            key: 'view',
            label: 'Ver Detalle',
            icon: '👁️',
            className: 'text-blue-600 hover:text-blue-800',
            onClick: onSelectEvent,
          });
        }

        if (onEditEvent) {
          baseActions.push({
            key: 'edit',
            label: 'Editar',
            icon: '✏️',
            className: 'text-indigo-600 hover:text-indigo-800',
            onClick: onEditEvent,
            permission: 'manage_entity_events',
          });
        }

        if (onApprovalAction) {
          baseActions.push({
            key: 'approve',
            label: 'Gestionar Aprobación',
            icon: '✅',
            className: 'text-green-600 hover:text-green-800',
            condition: (event) => {
              const status = typeof event.status === 'string' ? event.status : event.status?.status_code;
              return status === EVENT_STATUS.PENDING_INTERNAL_APPROVAL || status === EVENT_STATUS.PENDING_PUBLIC_APPROVAL;
            },
            onClick: onApprovalAction,
            permission: 'approve_events',
          });
        }

        if (onToggleFeatured) {
          baseActions.push({
            key: 'featured',
            label: 'Destacar/Quitar',
            icon: '⭐',
            className: 'text-yellow-600 hover:text-yellow-800',
            onClick: onToggleFeatured,
            permission: 'manage_entity_events',
          });
        }

        if (onDuplicateEvent) {
          baseActions.push({
            key: 'duplicate',
            label: 'Duplicar',
            icon: '📋',
            className: 'text-purple-600 hover:text-purple-800',
            onClick: onDuplicateEvent,
            permission: 'create_events',
          });
        }

        if (onDeleteEvent) {
          baseActions.push({
            key: 'delete',
            label: 'Eliminar',
            icon: '🗑️',
            className: 'text-red-600 hover:text-red-800',
            onClick: (event) => handleDeleteEvent(event),
            permission: 'manage_entity_events',
          });
        }
        break;

      case 'organizer':
        if (onSelectEvent) {
          baseActions.push({
            key: 'view',
            label: 'Ver Detalle',
            icon: '👁️',
            className: 'text-blue-600 hover:text-blue-800',
            onClick: onSelectEvent,
          });
        }

        if (onEditEvent) {
          baseActions.push({
            key: 'edit',
            label: 'Editar',
            icon: '✏️',
            className: 'text-indigo-600 hover:text-indigo-800',
            condition: (event) => {
              const status = typeof event.status === 'string' ? event.status : event.status?.status_code;
              return status === EVENT_STATUS.DRAFT || status === EVENT_STATUS.REQUIRES_CHANGES;
            },
            onClick: onEditEvent,
          });
        }

        if (onRequestApproval) {
          baseActions.push({
            key: 'request_approval',
            label: 'Solicitar Aprobación',
            icon: '📨',
            className: 'text-green-600 hover:text-green-800',
            condition: (event) => {
              const status = typeof event.status === 'string' ? event.status : event.status?.status_code;
              return status === EVENT_STATUS.DRAFT;
            },
            onClick: onRequestApproval,
          });
        }

        if (onViewComments) {
          baseActions.push({
            key: 'comments',
            label: 'Ver Comentarios',
            icon: '💬',
            className: 'text-orange-600 hover:text-orange-800',
            condition: (event) => !!(event.approval_comments && event.approval_comments.trim()),
            onClick: onViewComments,
          });
        }
        break;

      case 'public':
        if (onShareEvent) {
          baseActions.push({
            key: 'share',
            label: 'Compartir',
            icon: '📤',
            className: 'text-blue-600 hover:text-blue-800',
            onClick: onShareEvent,
          });
        }

        if (onExportToCalendar) {
          baseActions.push({
            key: 'calendar',
            label: 'Agregar a Calendario',
            icon: '📅',
            className: 'text-green-600 hover:text-green-800',
            onClick: onExportToCalendar,
          });
        }
        break;

      default:
        break;
    }

    return baseActions;
  }, [
    viewMode,
    onSelectEvent,
    onEditEvent,
    onDeleteEvent,
    onDuplicateEvent,
    onApprovalAction,
    onToggleFeatured,
    onRequestApproval,
    onShareEvent,
    onExportToCalendar,
    onViewComments,
    handleDeleteEvent
  ]);

  // Close confirm dialog handler
  const handleCloseConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <EventTable
      events={events}
      isLoading={isLoading}
      columns={columns}
      actions={actions}
      confirmDialog={confirmDialog}
      statusLabels={statusLabels}
      typeLabels={typeLabels}
      compactView={compactView}
      onFormatDate={formatDate}
      onCloseConfirmDialog={handleCloseConfirmDialog}
    />
  );
};