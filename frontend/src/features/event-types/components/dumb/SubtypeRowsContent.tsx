/**
 * SubtypeRowsContent Component (Dumb/Presentational)
 * Renders subtypes within an expanded event type row
 * Memoized to prevent unnecessary re-renders
 *
 * Created: January 2026
 */

'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { memo, useCallback } from 'react';

import { Button, LoadingSpinner } from '@/components/ui';
import { EventSubtype } from '@/types/eventType.types';

const BADGE_BASE_CLASSES =
  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';

interface SubtypeRowsContentProps {
  subtypes: EventSubtype[];
  isLoading: boolean;
  onEdit: (subtype: EventSubtype) => void;
  onDelete: (subtype: EventSubtype) => void;
  onCreateNew: () => void;
}

/**
 * Single subtype row component
 */
const SubtypeRow = memo(function SubtypeRow({
  subtype,
  onEdit,
  onDelete,
}: {
  subtype: EventSubtype;
  onEdit: (subtype: EventSubtype) => void;
  onDelete: (subtype: EventSubtype) => void;
}) {
  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(subtype);
    },
    [subtype, onEdit]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(subtype);
    },
    [subtype, onDelete]
  );

  return (
    <tr
      className="hover:bg-neutral-100 transition-colors"
      data-testid={`subtype-row-${subtype.id}`}
    >
      {/* Indentation + tree connector */}
      <td className="pl-8 pr-2 py-3 w-12">
        <span className="text-neutral-400">└─</span>
      </td>

      {/* Subtype name */}
      <td className="px-4 py-3 text-sm text-neutral-700">{subtype.name}</td>

      {/* Empty column to align with parent's subtypes count */}
      <td className="px-4 py-3" />

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={`${BADGE_BASE_CLASSES} ${
            subtype.is_active
              ? 'bg-success-100 text-success-800'
              : 'bg-neutral-100 text-neutral-800'
          }`}
        >
          {subtype.is_active ? 'Activo' : 'Inactivo'}
        </span>
      </td>

      {/* Empty column to align with parent's created date */}
      <td className="px-4 py-3" />

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5 rounded text-neutral-600 hover:text-neutral-800 hover:bg-neutral-200"
            onClick={handleEdit}
            title="Editar subtipo"
            aria-label="Editar subtipo"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5 rounded text-error-600 hover:text-error-800 hover:bg-error-100"
            onClick={handleDelete}
            title="Eliminar subtipo"
            aria-label="Eliminar subtipo"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
});

/**
 * SubtypeRowsContent - Renders subtypes in a table format within expanded row
 * Memoized to avoid re-renders when parent table updates
 */
export const SubtypeRowsContent = memo(function SubtypeRowsContent({
  subtypes,
  isLoading,
  onEdit,
  onDelete,
  onCreateNew,
}: SubtypeRowsContentProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="py-6 flex justify-center">
        <LoadingSpinner size="sm" text="Cargando subtipos..." />
      </div>
    );
  }

  return (
    <div className="border-l-2 border-primary-200 ml-6 my-2">
      <table className="min-w-full">
        <tbody className="divide-y divide-neutral-100">
          {/* Render subtypes */}
          {subtypes.map((subtype) => (
            <SubtypeRow
              key={subtype.id}
              subtype={subtype}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}

          {/* Empty state with create button */}
          {subtypes.length === 0 && (
            <tr>
              <td colSpan={6} className="py-4 px-8">
                <p className="text-sm text-neutral-500 text-center">
                  No hay subtipos definidos para este tipo de evento
                </p>
              </td>
            </tr>
          )}

          {/* Add new subtype row */}
          <tr className="bg-neutral-50">
            <td colSpan={6} className="py-3 px-8">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-600 hover:text-primary-800 hover:bg-primary-50"
                onClick={onCreateNew}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Agregar subtipo
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});
