/**
 * Event Table Container - Smart Component
 * Uses GenericTable with custom column renderers for events
 * Handles business logic, state management, and view mode configurations
 */

'use client';

import { useMemo, useState, useCallback } from 'react';
import { Event, EventStatus, EVENT_STATUS } from '@/types/event.types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { GenericTable, TableColumnConfig, TableActionConfig, ConfirmDialogData } from '@/shared/components/tables';
import {
  getStatusConfig,
  BADGE_BASE_CLASSES
} from '@/features/events/constants';
import {
  EyeIcon,
  PencilIcon,
  StarIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// View mode types
export type EventTableViewMode = 'admin' | 'organizer' | 'public';

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
}

// Helper function to extract status code from status object or string
// Supports both 'status_code' (type definition) and 'code' (API response from EventResource)
function getEventStatusCode(status: EventStatus): string {
  if (typeof status === 'string') return status;
  // Backend EventResource returns 'code', type definition expects 'status_code'
  return status.status_code || (status as { code?: string }).code || '';
}


export const EventTableContainer = ({
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
}: EventTableContainerProps) => {
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Date formatting function
  const formatDate = useCallback((dateString: string): string => {
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return dateString;
    }
  }, []);

  // Delete event handler with confirmation
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

  // Column configuration with custom renderers
  const columns = useMemo((): TableColumnConfig<Event>[] => {
    const baseColumns: TableColumnConfig<Event>[] = [
      // Event title with featured badge
      {
        key: 'title',
        label: 'Evento',
        render: (event) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-900">{event.title}</span>
              {event.is_featured && (
                <StarIconSolid className="w-4 h-4 text-warning-500" aria-label="Destacado" />
              )}
            </div>
          </div>
        ),
      },
      // Date column
      {
        key: 'date',
        label: 'Fecha',
        render: (event) => (
          <div className="flex flex-col">
            <span className="text-sm text-neutral-900">
              {formatDate(event.start_date)}
            </span>
            {event.end_date && event.start_date !== event.end_date && (
              <span className="text-xs text-neutral-500">
                hasta {formatDate(event.end_date)}
              </span>
            )}
          </div>
        ),
      },
      // Type column
      {
        key: 'type',
        label: 'Tipo',
        render: (event) => {
          // Use event_type.name directly from backend (3NF structure)
          const typeName = event.event_type?.name || 'Sin tipo';
          return (
            <span className={`${BADGE_BASE_CLASSES} bg-primary-100 text-primary-700`}>
              {typeName}
            </span>
          );
        },
      },
      // Status column
      {
        key: 'status',
        label: 'Estado',
        render: (event) => {
          const statusCode = getEventStatusCode(event.status);
          const statusConfig = getStatusConfig(statusCode);
          return (
            <span className={`${BADGE_BASE_CLASSES} ${statusConfig.className}`}>
              {statusConfig.label}
            </span>
          );
        },
      },
    ];

    // Filter columns based on view mode
    if (viewMode === 'public') {
      return baseColumns.filter(col =>
        ['title', 'date', 'category'].includes(String(col.key))
      );
    }

    if (viewMode === 'organizer') {
      return baseColumns.filter(col =>
        ['title', 'date', 'status', 'category'].includes(String(col.key))
      );
    }

    // Admin view - all columns
    return baseColumns;
  }, [viewMode, formatDate]);

  // Action configuration based on view mode
  const actions = useMemo((): TableActionConfig<Event>[] => {
    const baseActions: TableActionConfig<Event>[] = [];

    switch (viewMode) {
      case 'admin':
        if (onSelectEvent) {
          baseActions.push({
            key: 'view',
            label: 'Ver Detalle',
            icon: <EyeIcon className="w-5 h-5" />,
            variant: 'secondary',
            onClick: onSelectEvent,
          });
        }

        if (onEditEvent) {
          baseActions.push({
            key: 'edit',
            label: 'Editar',
            icon: <PencilIcon className="w-5 h-5" />,
            variant: 'secondary',
            onClick: onEditEvent,
          });
        }

        if (onApprovalAction) {
          baseActions.push({
            key: 'approve',
            label: 'Gestionar Aprobación',
            icon: <EyeIcon className="w-5 h-5" />,
            variant: 'primary',
            // No condition - entity_admin/entity_staff can manage ALL events regardless of status
            onClick: onApprovalAction,
          });
        }

        if (onToggleFeatured) {
          baseActions.push({
            key: 'featured',
            label: 'Destacar/Quitar',
            icon: <StarIcon className="w-5 h-5" />,
            variant: 'secondary',
            onClick: onToggleFeatured,
          });
        }

        if (onDuplicateEvent) {
          baseActions.push({
            key: 'duplicate',
            label: 'Duplicar',
            icon: <DocumentDuplicateIcon className="w-5 h-5" />,
            variant: 'secondary',
            onClick: onDuplicateEvent,
          });
        }

        if (onDeleteEvent) {
          baseActions.push({
            key: 'delete',
            label: 'Eliminar',
            icon: <TrashIcon className="w-5 h-5" />,
            variant: 'danger',
            onClick: handleDeleteEvent,
          });
        }
        break;

      case 'organizer':
        if (onSelectEvent) {
          baseActions.push({
            key: 'view',
            label: 'Ver Detalle',
            icon: <EyeIcon className="w-5 h-5" />,
            variant: 'secondary',
            onClick: onSelectEvent,
          });
        }

        if (onEditEvent) {
          baseActions.push({
            key: 'edit',
            label: 'Editar',
            icon: <PencilIcon className="w-5 h-5" />,
            variant: 'secondary',
            condition: (event) => {
              const status = getEventStatusCode(event.status);
              return status === EVENT_STATUS.DRAFT || status === EVENT_STATUS.REQUIRES_CHANGES;
            },
            onClick: onEditEvent,
          });
        }

        if (onRequestApproval) {
          baseActions.push({
            key: 'request_approval',
            label: 'Solicitar Aprobación',
            icon: <PaperAirplaneIcon className="w-5 h-5" />,
            variant: 'primary',
            condition: (event) => {
              const status = getEventStatusCode(event.status);
              return status === EVENT_STATUS.DRAFT;
            },
            onClick: onRequestApproval,
          });
        }

        if (onViewComments) {
          baseActions.push({
            key: 'comments',
            label: 'Ver Comentarios',
            icon: <ChatBubbleLeftIcon className="w-5 h-5" />,
            variant: 'secondary',
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
            icon: <ShareIcon className="w-5 h-5" />,
            variant: 'secondary',
            onClick: onShareEvent,
          });
        }

        if (onExportToCalendar) {
          baseActions.push({
            key: 'calendar',
            label: 'Agregar a Calendario',
            icon: <CalendarIcon className="w-5 h-5" />,
            variant: 'primary',
            onClick: onExportToCalendar,
          });
        }
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
    handleDeleteEvent,
  ]);

  // Close confirm dialog handler
  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <GenericTable<Event>
      items={events}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No hay eventos disponibles"
      confirmDialog={confirmDialog}
      onCloseConfirmDialog={handleCloseConfirmDialog}
      testId="event-table"
    />
  );
};
