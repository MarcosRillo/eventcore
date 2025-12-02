/**
 * LocationTableContainer - Smart Component
 * Uses GenericTable with custom column renderers for locations
 * Handles business logic, state management, and configuration
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { Location } from '@/types/location.types';
import { PaginationMeta } from '@/types/api-response.types';
import { GenericTable, TableColumnConfig, TableActionConfig, ConfirmDialogData } from '@/shared/components/tables';
import { PencilIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface LocationTableContainerProps {
  locations: Location[];
  pagination: PaginationMeta | null;
  loading: boolean;
  onEdit: (location: Location) => void;
  onDelete: (locationId: number) => Promise<void>;
  onPageChange: (page: number) => void;
}

export function LocationTableContainer({
  locations,
  pagination,
  loading,
  onEdit,
  onDelete,
  onPageChange,
}: LocationTableContainerProps) {
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Delete location handler with confirmation
  const handleDeleteClick = useCallback((location: Location) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Ubicación',
      message: `¿Estás seguro de que deseas eliminar "${location.name}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        await onDelete(location.id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  }, [onDelete]);

  // Close confirm dialog handler
  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Column configuration - simplified for Tucumán Tourism
  const columns = useMemo((): TableColumnConfig<Location>[] => [
    // Name and description
    {
      key: 'name',
      label: 'Ubicación',
      render: (location) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-neutral-400" aria-hidden="true" />
            <span className="font-medium text-neutral-900">{location.name}</span>
          </div>
          {location.description && (
            <span className="text-sm text-neutral-500 line-clamp-1 ml-6">
              {location.description}
            </span>
          )}
        </div>
      ),
    },
    // Address column
    {
      key: 'address',
      label: 'Dirección',
      render: (location) => (
        <div className="flex flex-col">
          <span className="text-sm text-neutral-900">{location.address}</span>
          <span className="text-xs text-neutral-500">
            {location.city}, {location.state || 'Tucumán'}
          </span>
        </div>
      ),
    },
  ], []);

  // Action configuration
  const actions = useMemo((): TableActionConfig<Location>[] => [
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
      onClick: handleDeleteClick,
    },
  ], [onEdit, handleDeleteClick]);

  return (
    <GenericTable<Location>
      items={locations}
      columns={columns}
      actions={actions}
      isLoading={loading}
      emptyMessage="No hay ubicaciones disponibles"
      pagination={pagination}
      onPageChange={onPageChange}
      confirmDialog={confirmDialog}
      onCloseConfirmDialog={handleCloseConfirmDialog}
      testId="location-table"
    />
  );
}
