/**
 * Event Table - Dumb Component
 * Pure presentational table component that receives all data and handlers as props
 */

'use client';

import React from 'react';
import { Event, EventStatus, EventType } from '@/types/event.types';
import { Permission } from '@/types/auth.types';
import { Button, LoadingSpinner, ConfirmDialog } from '@/components/ui';
import { PermissionGate } from '@/components/auth/PermissionGate';

// View mode types
export type EventTableViewMode = 'admin' | 'organizer' | 'public';

// Column configuration
export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  className?: string;
}

// Action configuration
export interface ActionConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  className: string;
  condition?: (event: Event) => boolean;
  permission?: Permission;
  onClick: (event: Event) => void;
}

// Confirm dialog data
export interface ConfirmDialogData {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

interface EventTableProps {
  events: Event[];
  isLoading: boolean;
  columns: ColumnConfig[];
  actions: ActionConfig[];
  confirmDialog: ConfirmDialogData;
  statusLabels: Record<string, { label: string; className: string }>;
  typeLabels: Record<string, string>;
  compactView?: boolean;
  onFormatDate: (dateString: string) => string;
  onCloseConfirmDialog: () => void;
}

export const EventTable: React.FC<EventTableProps> = ({
  events,
  isLoading,
  columns,
  actions,
  confirmDialog,
  statusLabels,
  typeLabels,
  compactView = false,
  onFormatDate,
  onCloseConfirmDialog
}) => {
  // Helper functions to handle 3NF objects
  const getEventStatusCode = (status: EventStatus): string => {
    return typeof status === 'object' ? status.status_code : status;
  };

  const getEventTypeCode = (type: EventType): string => {
    return typeof type === 'object' ? type.type_code : type;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay eventos disponibles</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.filter(col => col.visible).map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                {columns.filter(col => col.visible).map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {renderTableCell(
                      column,
                      event,
                      actions,
                      statusLabels,
                      typeLabels,
                      compactView,
                      onFormatDate,
                      getEventStatusCode,
                      getEventTypeCode
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
};

// Helper function to render table cells
function renderTableCell(
  column: ColumnConfig,
  event: Event,
  actions: ActionConfig[],
  statusLabels: Record<string, { label: string; className: string }>,
  typeLabels: Record<string, string>,
  compactView: boolean,
  onFormatDate: (dateString: string) => string,
  getEventStatusCode: (status: EventStatus) => string,
  getEventTypeCode: (type: EventType) => string
): React.ReactNode {
  switch (column.key) {
    case 'event':
      return (
        <div className="flex flex-col">
          <div className="font-medium text-gray-900">
            {event.title}
            {event.is_featured && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Destacado
              </span>
            )}
          </div>
          {!compactView && event.description && (
            <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
              {event.description}
            </div>
          )}
        </div>
      );

    case 'date':
      return (
        <div className="flex flex-col">
          <div className="text-sm font-medium text-gray-900">
            {onFormatDate(event.start_date)}
          </div>
          {event.end_date && event.start_date !== event.end_date && (
            <div className="text-xs text-gray-500">
              hasta {onFormatDate(event.end_date)}
            </div>
          )}
        </div>
      );

    case 'location':
      const locationText = event.location?.name || event.location_text || 'No especificada';
      return (
        <div className="text-sm text-gray-900">
          {locationText}
          {event.locations && event.locations.length > 1 && (
            <span className="ml-1 text-xs text-gray-500">
              (+{event.locations.length - 1} más)
            </span>
          )}
        </div>
      );

    case 'type':
      const typeCode = getEventTypeCode(event.type);
      const typeLabel = typeLabels[typeCode] || typeCode;
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {typeLabel}
        </span>
      );

    case 'status':
      const statusCode = getEventStatusCode(event.status);
      const statusInfo = statusLabels[statusCode] || { label: statusCode, className: 'bg-gray-100 text-gray-800' };
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      );

    case 'category':
      return event.category ? (
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: event.category.color || '#gray-300' }}
        >
          {event.category.name}
        </span>
      ) : (
        <span className="text-gray-400">Sin categoría</span>
      );

    case 'organizer':
      return event.organizer ? (
        <div className="text-sm text-gray-900">
          {event.organizer.name}
          {event.organizer.organization && (
            <div className="text-xs text-gray-500">
              {event.organizer.organization}
            </div>
          )}
        </div>
      ) : (
        <span className="text-gray-400">No especificado</span>
      );

    case 'created':
      return (
        <div className="text-sm text-gray-500">
          {onFormatDate(event.created_at)}
        </div>
      );

    case 'feedback':
      const hasComments = event.approval_comments && event.approval_comments.trim().length > 0;
      return hasComments ? (
        <div className="text-sm text-gray-900">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Con comentarios
          </span>
        </div>
      ) : (
        <span className="text-gray-400">Sin comentarios</span>
      );

    case 'actions':
    case 'compartir': // For public view
      const availableActions = actions.filter(action =>
        !action.condition || action.condition(event)
      );

      return (
        <div className="flex items-center space-x-2">
          {availableActions.map((action) =>
            action.permission ? (
              <PermissionGate key={action.key} permission={action.permission}>
                <Button
                  variant="secondary"
                  size="sm"
                  className={action.className}
                  onClick={() => action.onClick(event)}
                >
                  {action.icon}
                  <span className="sr-only">{action.label}</span>
                </Button>
              </PermissionGate>
            ) : (
              <Button
                key={action.key}
                variant="secondary"
                size="sm"
                className={action.className}
                onClick={() => action.onClick(event)}
              >
                {action.icon}
                <span className="sr-only">{action.label}</span>
              </Button>
            )
          )}
        </div>
      );

    default:
      return null;
  }
}