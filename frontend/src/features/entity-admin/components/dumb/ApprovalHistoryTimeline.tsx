/**
 * ApprovalHistoryTimeline Component
 *
 * Displays a collapsible timeline of approval history.
 * Dumb component - receives history data via props.
 */

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import type { ApprovalHistoryEntry } from '@/types/event.types';

interface ApprovalHistoryTimelineProps {
  history: ApprovalHistoryEntry[];
  isExpanded?: boolean;
}

/**
 * Format timestamp for display
 */
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Map action codes to display labels
 */
const ACTION_LABELS: Record<string, string> = {
  approve_internal: 'Aprobación Interna',
  request_public: 'Solicitud Pública',
  publish: 'Publicación',
  request_changes: 'Cambios Solicitados',
  reject: 'Rechazado',
  submit: 'Enviado a Revisión',
};

/**
 * Map action codes to colors
 */
const ACTION_COLORS: Record<string, string> = {
  approve_internal: 'bg-primary-100 text-primary-700',
  request_public: 'bg-success-100 text-success-700',
  publish: 'bg-success-100 text-success-700',
  request_changes: 'bg-warning-100 text-warning-700',
  reject: 'bg-error-100 text-error-700',
  submit: 'bg-neutral-100 text-neutral-700',
};

export const ApprovalHistoryTimeline = ({
  history,
  isExpanded: initialExpanded = false,
}: ApprovalHistoryTimelineProps) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  if (history.length === 0) {
    return (
      <div className="text-sm text-neutral-400 italic">
        Sin historial de aprobación.
      </div>
    );
  }

  return (
    <div className="border-t border-neutral-200 pt-4">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="
          w-full flex items-center justify-between
          text-sm font-medium text-neutral-600
          hover:text-neutral-800 transition-colors
        "
      >
        <span className="flex items-center gap-2">
          Historial de Aprobación
          <span className="text-neutral-400">({history.length})</span>
        </span>
        {isExpanded ? (
          <ChevronUpIcon className="w-4 h-4" />
        ) : (
          <ChevronDownIcon className="w-4 h-4" />
        )}
      </button>

      {/* Timeline Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {history.map((entry, index) => {
            const actionLabel = ACTION_LABELS[entry.action] || entry.action;
            const actionColor = ACTION_COLORS[entry.action] || 'bg-neutral-100 text-neutral-700';

            return (
              <div key={index} className="relative pl-6">
                {/* Timeline connector */}
                {index < history.length - 1 && (
                  <div className="absolute left-2 top-6 bottom-0 w-px bg-neutral-200" />
                )}

                {/* Timeline dot */}
                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-neutral-200 border-2 border-white" />

                {/* Entry content */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${actionColor}`}>
                      {actionLabel}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  {entry.comment && (
                    <p className="text-sm text-neutral-600 mt-1">
                      {entry.comment}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApprovalHistoryTimeline;
