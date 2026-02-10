/**
 * ApprovalHistoryTimeline Component
 *
 * Displays a collapsible timeline of approval history.
 * Dumb component - receives history data via props.
 */

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { getActionBadgeVariant } from '@/features/entity-admin/types';
import { Badge } from '@/shared/components/display';
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
 * Map action codes to timeline dot colors
 */
const DOT_COLORS: Record<string, string> = {
  approve_internal: 'bg-primary-400',
  request_public: 'bg-success-400',
  publish: 'bg-success-400',
  request_changes: 'bg-warning-400',
  reject: 'bg-error-400',
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
        aria-expanded={isExpanded}
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
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Timeline Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {history.map((entry) => {
            const actionLabel = ACTION_LABELS[entry.action] || entry.action;
            const dotColor = DOT_COLORS[entry.action] || 'bg-neutral-300';
            const entryKey = `${entry.action}-${entry.timestamp}-${entry.user_id}`;

            return (
              <div key={entryKey} className="relative pl-6">
                {/* Timeline connector */}
                <div className="absolute left-2 top-6 bottom-0 w-px bg-neutral-200" />

                {/* Timeline dot */}
                <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white ${dotColor}`} />

                {/* Entry content */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getActionBadgeVariant(entry.action)} size="sm">
                      {actionLabel}
                    </Badge>
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
