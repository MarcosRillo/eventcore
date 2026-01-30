/**
 * EventType Table Container - Smart Component
 * Uses ExpandableTable with inline subtypes display
 * Handles business logic, state management, and configuration
 *
 * Created: December 2, 2025
 * Updated: January 2026 - Migrated to ExpandableTable with subtypes
 */

'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { SubtypeRowsContent } from '@/features/event-types/components/dumb/SubtypeRowsContent';
import {
  ConfirmDialogData,
  ExpandableTable,
  TableActionConfig,
  TableColumnConfig,
} from '@/shared/components/tables';
import { PaginationMeta } from '@/types/api-response.types';
import { EventSubtype, EventType } from '@/types/eventType.types';

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

  // Expansion props
  expandedTypeIds: Set<number>;
  onToggleExpand: (typeId: number) => void;
  loadingSubtypes: Set<number>;
  subtypesByType: Map<number, EventSubtype[]>;

  // Subtype handlers
  onEditSubtype: (subtype: EventSubtype) => void;
  onDeleteSubtype: (subtype: EventSubtype) => void;
  onCreateSubtype: (eventType: EventType) => void;
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
  expandedTypeIds,
  onToggleExpand,
  loadingSubtypes,
  subtypesByType,
  onEditSubtype,
  onDeleteSubtype,
  onCreateSubtype,
}: EventTypeTableContainerProps) => {
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
            <span className="font-medium text-neutral-900">
              {eventType.name}
            </span>
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

  // Action configuration - removed "Ver Subtipos" since expansion handles it
  const actions = useMemo(
    (): TableActionConfig<EventType>[] => [
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
        onClick: handleDeleteEventType,
      },
    ],
    [onEdit, handleDeleteEventType]
  );

  // Close confirm dialog handler
  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Get item ID for expandable table
  const getItemId = useCallback((eventType: EventType) => eventType.id, []);

  // Handle toggle expand with number type
  const handleToggleExpand = useCallback(
    (id: string | number) => {
      onToggleExpand(typeof id === 'string' ? parseInt(id, 10) : id);
    },
    [onToggleExpand]
  );

  // Render expanded content for an event type
  const renderExpandedContent = useCallback(
    (eventType: EventType) => {
      const subtypes = subtypesByType.get(eventType.id) || [];
      const isLoadingSubtypes = loadingSubtypes.has(eventType.id);

      return (
        <SubtypeRowsContent
          subtypes={subtypes}
          isLoading={isLoadingSubtypes}
          onEdit={onEditSubtype}
          onDelete={onDeleteSubtype}
          onCreateNew={() => onCreateSubtype(eventType)}
        />
      );
    },
    [subtypesByType, loadingSubtypes, onEditSubtype, onDeleteSubtype, onCreateSubtype]
  );

  // Convert number Set to string | number Set for ExpandableTable
  const expandedIdsAsGeneric = useMemo(
    () => expandedTypeIds as Set<string | number>,
    [expandedTypeIds]
  );

  const loadingSubtypesAsGeneric = useMemo(
    () => loadingSubtypes as Set<string | number>,
    [loadingSubtypes]
  );

  return (
    <ExpandableTable<EventType>
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
      getItemId={getItemId}
      renderExpandedContent={renderExpandedContent}
      expandedIds={expandedIdsAsGeneric}
      onToggleExpand={handleToggleExpand}
      loadingExpandedIds={loadingSubtypesAsGeneric}
    />
  );
};
