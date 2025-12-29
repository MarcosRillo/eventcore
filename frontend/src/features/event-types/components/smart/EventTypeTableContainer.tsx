/**
 * EventType Table Container - Smart Component
 * Uses GenericTable with custom column renderers for event types
 * Handles business logic, state management, and configuration
 *
 * Created: December 2, 2025
 */

'use client';

import { PencilIcon, TrashIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useCallback } from 'react';

import {
  GenericTable,
  TableColumnConfig,
  TableActionConfig,
  ConfirmDialogData,
} from '@/shared/components/tables';
import { PaginationMeta } from '@/types/api-response.types';
import { EventType } from '@/types/eventType.types';


// Re-export types for backward compatibility
export type EventTypeColumnConfig = TableColumnConfig<EventType>;
export type EventTypeActionConfig = TableActionConfig<EventType>;
export type EventTypeConfirmDialogData = ConfirmDialogData;

interface EventTypeTableContainerProps {
  eventTypes: EventType[];
  pagination: PaginationMeta | null;
  onEdit: (eventType: EventType) => void;
  onDelete: (eventTypeId: number, eventTypeName: string) => void;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const BADGE_BASE_CLASSES =
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

export const EventTypeTableContainer = ({
  eventTypes,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
  loading = false,
}: EventTypeTableContainerProps) => {
  const router = useRouter();

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
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }, []);

  // Navigate to subtypes page
  const handleViewSubtypes = useCallback(
    (eventType: EventType) => {
      router.push(`/event-types/${eventType.id}/subtypes`);
    },
    [router]
  );

  // Delete event type handler with confirmation
  const handleDeleteEventType = useCallback(
    (eventType: EventType) => {
      // Check if has subtypes
      if (eventType.subtypes_count && eventType.subtypes_count > 0) {
        setConfirmDialog({
          isOpen: true,
          title: 'No se puede eliminar',
          message: `El tipo de evento "${eventType.name}" tiene ${eventType.subtypes_count} subtipo(s) asociado(s). Debe eliminar los subtipos primero.`,
          onConfirm: () => {
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          },
        });
        return;
      }

      setConfirmDialog({
        isOpen: true,
        title: 'Confirmar Eliminación',
        message: `¿Estás seguro de que quieres eliminar el tipo de evento "${eventType.name}"? Esta acción no se puede deshacer.`,
        onConfirm: () => {
          onDelete(eventType.id, eventType.name);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        },
      });
    },
    [onDelete]
  );

  // Column configuration with custom renderers
  const columns = useMemo(
    (): TableColumnConfig<EventType>[] => [
      // Event type name
      {
        key: 'name',
        label: 'Tipo de Evento',
        render: (eventType) => (
          <div className="flex flex-col">
            <span className="font-medium text-neutral-900">{eventType.name}</span>
          </div>
        ),
      },
      // Subtypes count column
      {
        key: 'subtypes_count',
        label: 'Subtipos',
        render: (eventType) => (
          <span className="text-sm text-neutral-600">
            {eventType.subtypes_count ?? 0}
          </span>
        ),
      },
      // Status column
      {
        key: 'is_active',
        label: 'Estado',
        render: (eventType) => (
          <span
            className={`${BADGE_BASE_CLASSES} ${
              eventType.is_active
                ? 'bg-success-100 text-success-800'
                : 'bg-neutral-100 text-neutral-800'
            }`}
          >
            {eventType.is_active ? 'Activo' : 'Inactivo'}
          </span>
        ),
      },
      // Created date column
      {
        key: 'created_at',
        label: 'Creado',
        render: (eventType) => (
          <span className="text-sm text-neutral-500">
            {formatDate(eventType.created_at)}
          </span>
        ),
      },
    ],
    [formatDate]
  );

  // Action configuration
  const actions = useMemo(
    (): TableActionConfig<EventType>[] => [
      {
        key: 'subtypes',
        label: 'Subtipos',
        icon: <ListBulletIcon className="w-5 h-5" />,
        variant: 'secondary',
        onClick: handleViewSubtypes,
      },
      {
        key: 'edit',
        label: 'Editar',
        icon: <PencilIcon className="w-5 h-5" />,
        variant: 'secondary',
        onClick: onEdit,
      },
      {
        key: 'delete',
        label: 'Eliminar',
        icon: <TrashIcon className="w-5 h-5" />,
        variant: 'danger',
        onClick: handleDeleteEventType,
      },
    ],
    [onEdit, handleDeleteEventType, handleViewSubtypes]
  );

  // Close confirm dialog handler
  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <GenericTable<EventType>
      items={eventTypes}
      columns={columns}
      actions={actions}
      isLoading={loading}
      emptyMessage="No hay tipos de evento disponibles"
      pagination={pagination}
      onPageChange={onPageChange}
      confirmDialog={confirmDialog}
      onCloseConfirmDialog={handleCloseConfirmDialog}
      testId="event-type-table"
    />
  );
};
