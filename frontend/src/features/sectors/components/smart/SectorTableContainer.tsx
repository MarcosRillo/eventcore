'use client';

/**
 * SectorTableContainer - Smart Component
 * Uses GenericTable with custom column renderers for sectors
 * Handles business logic, state management, and configuration
 */

import { Pencil, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Sector } from '@/features/sectors/types/sector.types';
import { ConfirmDialogData, GenericTable, TableActionConfig, TableColumnConfig } from '@/shared/components/tables';
import { PaginationMeta } from '@/types/api-response.types';

const BADGE_BASE_CLASSES =
  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

interface SectorTableContainerProps {
  sectors: Sector[];
  pagination: PaginationMeta | null;
  loading: boolean;
  onEdit: (sector: Sector) => void;
  onDelete: (sectorId: number) => Promise<void>;
  onPageChange: (page: number) => void;
}

export function SectorTableContainer({
  sectors,
  pagination,
  loading,
  onEdit,
  onDelete,
  onPageChange,
}: SectorTableContainerProps) {
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Delete handler with confirmation
  const handleDeleteClick = useCallback(
    (sector: Sector) => {
      setConfirmDialog({
        isOpen: true,
        title: 'Eliminar Sector',
        message: `¿Estás seguro de que deseas eliminar "${sector.name}"? Esta acción no se puede deshacer.`,
        onConfirm: async () => {
          await onDelete(sector.id);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        },
      });
    },
    [onDelete]
  );

  // Close confirm dialog handler
  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Column configuration
  const columns = useMemo(
    (): TableColumnConfig<Sector>[] => [
      {
        key: 'name',
        label: 'Nombre',
        render: (sector) => (
          <span className="font-medium text-neutral-900">{sector.name}</span>
        ),
      },
      {
        key: 'is_active',
        label: 'Estado',
        render: (sector) => (
          <span
            className={`${BADGE_BASE_CLASSES} ${
              sector.is_active
                ? 'bg-success-100 text-success-800'
                : 'bg-neutral-100 text-neutral-800'
            }`}
          >
            {sector.is_active ? 'Activo' : 'Inactivo'}
          </span>
        ),
      },
    ],
    []
  );

  // Action configuration
  const actions = useMemo(
    (): TableActionConfig<Sector>[] => [
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
        onClick: handleDeleteClick,
      },
    ],
    [onEdit, handleDeleteClick]
  );

  return (
    <GenericTable<Sector>
      items={sectors}
      columns={columns}
      actions={actions}
      isLoading={loading}
      emptyMessage="No hay sectores disponibles"
      pagination={pagination}
      onPageChange={onPageChange}
      confirmDialog={confirmDialog}
      onCloseConfirmDialog={handleCloseConfirmDialog}
      testId="sector-table"
    />
  );
}
