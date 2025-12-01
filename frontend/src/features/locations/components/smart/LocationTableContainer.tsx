/**
 * LocationTableContainer - Smart Component
 * Connects LocationTable with state management and business logic
 */

'use client';

import { useState, useCallback } from 'react';
import { Location } from '@/types/location.types';
import { PaginationMeta } from '@/hooks/usePaginatedData';
import { LocationTable } from '@/features/locations/components/dumb/LocationTable';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

interface LocationTableContainerProps {
  locations: Location[];
  pagination: PaginationMeta | null;
  loading: boolean;
  onEdit: (location: Location) => void;
  onDelete: (locationId: number) => Promise<void>;
  onPageChange: (page: number) => void;
}

const initialConfirmDialog: ConfirmDialogState = {
  isOpen: false,
  title: '',
  message: '',
  onConfirm: () => {},
};

export function LocationTableContainer({
  locations,
  pagination,
  loading,
  onEdit,
  onDelete,
  onPageChange,
}: LocationTableContainerProps) {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>(initialConfirmDialog);

  const handleDeleteClick = useCallback((location: Location) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Ubicación',
      message: `¿Estás seguro de que deseas eliminar "${location.name}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        await onDelete(location.id);
        setConfirmDialog(initialConfirmDialog);
      },
    });
  }, [onDelete]);

  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog(initialConfirmDialog);
  }, []);

  return (
    <LocationTable
      locations={locations}
      pagination={pagination}
      loading={loading}
      onEdit={onEdit}
      onDelete={handleDeleteClick}
      onPageChange={onPageChange}
      confirmDialog={confirmDialog}
      onCloseConfirmDialog={handleCloseConfirmDialog}
    />
  );
}
