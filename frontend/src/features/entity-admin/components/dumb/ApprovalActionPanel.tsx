/**
 * ApprovalActionPanel Component
 *
 * Displays approval action buttons and comment input.
 * Dumb component - receives action state via props.
 */

import { CheckCircle, PenSquare, XCircle } from 'lucide-react';

import type { ApprovalAction } from '@/features/entity-admin/types';
import {
  ACTION_CONFIG,
  getActionButtonVariant,
  getStatusBadgeVariant,
  MAX_COMMENT_LENGTH,
  MIN_COMMENT_LENGTH,
} from '@/features/entity-admin/types';
import { Badge } from '@/shared/components/display';
import { Button } from '@/shared/components/form';
import { Textarea } from '@/shared/components/form';
import type { EventStatusCode } from '@/types/event.types';
import { EVENT_STATUS_LABELS } from '@/types/event.types';

interface ApprovalActionPanelProps {
  availableActions: ApprovalAction[];
  selectedAction: ApprovalAction | null;
  comment: string;
  commentError: string | null;
  isLoading: boolean;
  currentStatus: EventStatusCode;
  onActionSelect: (action: ApprovalAction) => void;
  onCommentChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Icon mapping for actions
 */
const actionIcons: Record<ApprovalAction, React.ReactNode> = {
  approve_internal: <CheckCircle className="w-5 h-5" />,
  request_public: <CheckCircle className="w-5 h-5" />,
  publish: <CheckCircle className="w-5 h-5" />,
  request_changes: <PenSquare className="w-5 h-5" />,
  reject: <XCircle className="w-5 h-5" />,
};

/**
 * Selected state styles per action (subtle colored borders + backgrounds)
 */
const selectedStyles: Record<ApprovalAction, string> = {
  approve_internal: 'border-primary-300 bg-primary-50 text-primary-700 ring-primary-200',
  request_public: 'border-success-300 bg-success-50 text-success-700 ring-success-200',
  publish: 'border-success-300 bg-success-50 text-success-700 ring-success-200',
  request_changes: 'border-warning-300 bg-warning-50 text-warning-700 ring-warning-200',
  reject: 'border-error-300 bg-error-50 text-error-700 ring-error-200',
};

export const ApprovalActionPanel = ({
  availableActions,
  selectedAction,
  comment,
  commentError,
  isLoading,
  currentStatus,
  onActionSelect,
  onCommentChange,
  onConfirm,
  onCancel,
}: ApprovalActionPanelProps) => {
  const statusLabel = EVENT_STATUS_LABELS[currentStatus] || currentStatus;
  const requiresComment = selectedAction && ACTION_CONFIG[selectedAction]?.requiresComment;

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div>
        <h4 className="text-sm font-medium text-neutral-500 mb-2">Estado Actual</h4>
        <Badge variant={getStatusBadgeVariant(currentStatus)} size="lg" dot>
          {statusLabel}
        </Badge>
      </div>

      {/* Available Actions */}
      <div>
        <h4 className="text-sm font-medium text-neutral-500 mb-3">Acciones Disponibles</h4>

        {availableActions.length === 0 ? (
          <p className="text-sm text-neutral-400 italic">
            No hay acciones disponibles para este estado.
          </p>
        ) : (
          <div className="space-y-2">
            {availableActions.map((action) => {
              const config = ACTION_CONFIG[action];
              const isSelected = selectedAction === action;

              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => onActionSelect(action)}
                  disabled={isLoading}
                  aria-pressed={isSelected}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    text-left text-sm font-medium
                    border transition-colors duration-150
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20
                    ${isSelected
                      ? `${selectedStyles[action]} ring-2 ring-offset-1`
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
                    }
                  `}
                >
                  <span className={`flex-shrink-0 ${isSelected ? '' : 'text-neutral-400'}`}>
                    {actionIcons[action]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p>{config.label}</p>
                    <p className={`text-xs font-normal mt-0.5 ${isSelected ? 'opacity-80' : 'text-neutral-400'}`}>
                      {config.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Contextual description callout */}
      {selectedAction && !requiresComment && (
        <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-4 py-3">
          <p className="text-sm text-neutral-600">
            {ACTION_CONFIG[selectedAction].description}
          </p>
        </div>
      )}

      {/* Comment Input (for request_changes and reject) */}
      {selectedAction && requiresComment && (
        <div>
          <Textarea
            label="Motivo"
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Escribe el motivo o feedback para el organizador..."
            rows={4}
            maxLength={MAX_COMMENT_LENGTH}
            disabled={isLoading}
            error={commentError || undefined}
            helperText={`Mínimo ${MIN_COMMENT_LENGTH} caracteres`}
            required
          />
          <p className="text-xs text-neutral-400 text-right mt-1 tabular-nums">
            {comment.length}/{MAX_COMMENT_LENGTH}
          </p>
        </div>
      )}

      {/* Confirm/Cancel Buttons */}
      {selectedAction && (
        <div className="flex gap-3 pt-4 border-t border-neutral-100">
          <Button
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={isLoading}
            fullWidth
          >
            Cancelar
          </Button>
          <Button
            variant={getActionButtonVariant(selectedAction)}
            size="md"
            onClick={onConfirm}
            loading={isLoading}
            leftIcon={actionIcons[selectedAction]}
            fullWidth
          >
            {ACTION_CONFIG[selectedAction].label}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ApprovalActionPanel;
