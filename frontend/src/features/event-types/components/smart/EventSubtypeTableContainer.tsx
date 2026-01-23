/**
 * EventSubtype Table Container - Smart Component
 * Uses GenericTable with custom column renderers for event subtypes
 * Handles business logic, state management, and configuration
 *
 * Created: December 2, 2025
 */

'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useCallback,useMemo, useState } from 'react';

import {
  ConfirmDialogData,
  GenericTable,
  TableActionConfig,
  TableColumnConfig,
} from '@/shared/components/tables';
import { PaginationMeta } from '@/types/api-response.types';
import { EventSubtype } from '@/types/eventType.types';

// Re-export types for backward compatibility
export type EventSubtypeColumnConfig = TableColumnConfig<EventSubtype>;
export type EventSubtypeActionConfig = TableActionConfig<EventSubtype>;
export type EventSubtypeConfirmDialogData = ConfirmDialogData;

interface EventSubtypeTableContainerProps {
  eventSubtypes: EventSubtype[];
  pagination: PaginationMeta | null;
  onEdit: (eventSubtype: EventSubtype) => void;
  onDelete: (subtypeId: number, subtypeName: string) => void;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const BADGE_BASE_CLASSES =
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

export const EventSubtypeTableContainer = ({
  eventSubtypes,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
  loading = false,
}: EventSubtypeTableContainerProps) => {
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

  // Delete event subtype handler with confirmation
  const handleDeleteEventSubtype = useCallback(
    (eventSubtype: EventSubtype) => {
      setConfirmDialog({
        isOpen: true,
        title: 'Confirmar Eliminación',
        message: `¿Estás seguro de que quieres eliminar el subtipo "${eventSubtype.name}"? Esta acción no se puede deshacer.`,
        onConfirm: () => {
          onDelete(eventSubtype.id, eventSubtype.name);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        },
      });
    },
    [onDelete]
  );

  // Column configuration with custom renderers
  const columns = useMemo(
    (): TableColumnConfig<EventSubtype>[] => [
      // Subtype name
      {
        key: 'name',
        label: 'Subtipo',
        render: (subtype) => (
          <div className="flex flex-col">
            <span className="font-medium text-neutral-900">{subtype.name}</span>
          </div>
        ),
      },
      // Status column
      {
        key: 'is_active',
        label: 'Estado',
        render: (subtype) => (
          <span
            className={`${BADGE_BASE_CLASSES} ${
              subtype.is_active
                ? 'bg-success-100 text-success-800'
                : 'bg-neutral-100 text-neutral-800'
            }`}
          >
            {subtype.is_active ? 'Activo' : 'Inactivo'}
          </span>
        ),
      },
      // Created date column
      {
        key: 'created_at',
        label: 'Creado',
        render: (subtype) => (
          <span className="text-sm text-neutral-500">
            {formatDate(subtype.created_at)}
          </span>
        ),
      },
    ],
    [formatDate]
  );

  // Action configuration
  const actions = useMemo(
    (): TableActionConfig<EventSubtype>[] => [
      {
        key: 'edit',
        label: 'Editar',
        icon: <Pencil className="w-5 h-5" />,
        variant: 'secondary',
        onClick: onEdit,
      },
      {
        key: 'delete',
        label: 'Eliminar',
        icon: <Trash2 className="w-5 h-5" />,
        variant: 'danger',
        onClick: handleDeleteEventSubtype,
      },
    ],
    [onEdit, handleDeleteEventSubtype]
  );

  // Close confirm dialog handler
  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <GenericTable<EventSubtype>
      items={eventSubtypes}
      columns={columns}
      actions={actions}
      isLoading={loading}
      emptyMessage="No hay subtipos disponibles para este tipo de evento"
      pagination={pagination}
      onPageChange={onPageChange}
      confirmDialog={confirmDialog}
      onCloseConfirmDialog={handleCloseConfirmDialog}
      testId="event-subtype-table"
    />
  );
};
