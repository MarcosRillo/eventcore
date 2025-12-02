/**
 * Location Table - Dumb Component
 * Simplified table for displaying locations
 */

import { Location } from '@/types/location.types';
import { PaginationMeta } from '@/hooks/usePaginatedData';
import { Button, Pagination, ConfirmDialog } from '@/components/ui';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface LocationTableProps {
  locations: Location[];
  pagination: PaginationMeta | null;
  loading: boolean;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
  onPageChange: (page: number) => void;
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  };
  onCloseConfirmDialog: () => void;
}

export function LocationTable({
  locations,
  pagination,
  loading,
  onEdit,
  onDelete,
  onPageChange,
  confirmDialog,
  onCloseConfirmDialog,
}: LocationTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-neutral-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8 text-neutral-500">
          <p>No hay ubicaciones disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Ciudad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {locations.map((location) => (
                <tr key={location.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-neutral-900">
                        {location.name}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {location.address}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">{location.city}</div>
                    <div className="text-sm text-neutral-500">{location.state || 'Tucumán'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-600 line-clamp-2">
                      {location.description || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(location)}
                        title="Editar"
                        aria-label={`Editar ${location.name}`}
                      >
                        <PencilIcon className="w-4 h-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(location)}
                        title="Eliminar"
                        aria-label={`Eliminar ${location.name}`}
                      >
                        <TrashIcon className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="bg-white px-4 py-3 border-t border-neutral-200">
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.last_page}
              onPageChange={onPageChange}
              showInfo={true}
              totalItems={pagination.total}
            />
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={onCloseConfirmDialog}
      />
    </>
  );
}
