/**
 * ApprovalActionPanel Component
 *
 * Displays approval action buttons and comment input.
 * Dumb component - receives action state via props.
 */

import { CheckCircleIcon, PencilSquareIcon,XCircleIcon } from '@heroicons/react/24/outline';

import type { ApprovalAction } from '@/features/entity-admin/types';
import { ACTION_CONFIG, MAX_COMMENT_LENGTH,MIN_COMMENT_LENGTH } from '@/features/entity-admin/types';
import type { EventStatusCode } from '@/types/event.types';
import { EVENT_STATUS_COLORS,EVENT_STATUS_LABELS } from '@/types/event.types';

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
  approve_internal: <CheckCircleIcon className="w-5 h-5" />,
  request_public: <CheckCircleIcon className="w-5 h-5" />,
  publish: <CheckCircleIcon className="w-5 h-5" />,
  request_changes: <PencilSquareIcon className="w-5 h-5" />,
  reject: <XCircleIcon className="w-5 h-5" />,
};

/**
 * Button style mapping for actions
 */
const actionButtonStyles: Record<ApprovalAction, string> = {
  approve_internal: 'bg-primary-600 hover:bg-primary-700 text-white',
  request_public: 'bg-success-600 hover:bg-success-700 text-white',
  publish: 'bg-success-600 hover:bg-success-700 text-white',
  request_changes: 'border-2 border-warning-600 text-warning-700 hover:bg-warning-50',
  reject: 'border-2 border-error-600 text-error-700 hover:bg-error-50',
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
  const statusColor = EVENT_STATUS_COLORS[currentStatus] || 'bg-neutral-100 text-neutral-800';
  const requiresComment = selectedAction && ACTION_CONFIG[selectedAction]?.requiresComment;

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div>
        <h4 className="text-sm font-medium text-neutral-500 mb-2">Estado Actual</h4>
        <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-medium ${statusColor}`}>
          {statusLabel}
        </span>
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
              const baseStyles = actionButtonStyles[action];

              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => onActionSelect(action)}
                  disabled={isLoading}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    font-medium transition-all duration-150
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${baseStyles}
                    ${isSelected ? 'ring-2 ring-offset-2 ring-primary-500' : ''}
                  `}
                >
                  {actionIcons[action]}
                  <span className="flex-1 text-left">{config.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Comment Input (for request_changes and reject) */}
      {selectedAction && requiresComment && (
        <div>
          <label htmlFor="approval-comment" className="block text-sm font-medium text-neutral-700 mb-2">
            Motivo <span className="text-error-500">*</span>
          </label>
          <textarea
            id="approval-comment"
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Escribe el motivo o feedback para el organizador..."
            rows={4}
            maxLength={MAX_COMMENT_LENGTH}
            disabled={isLoading}
            className={`
              w-full px-3 py-2 rounded-lg border
              text-sm placeholder:text-neutral-400
              focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${commentError ? 'border-error-500' : 'border-neutral-200'}
            `}
          />
          <div className="flex justify-between mt-1">
            {commentError ? (
              <p className="text-sm text-error-600">{commentError}</p>
            ) : (
              <p className="text-xs text-neutral-400">
                Mínimo {MIN_COMMENT_LENGTH} caracteres
              </p>
            )}
            <p className="text-xs text-neutral-400">
              {comment.length}/{MAX_COMMENT_LENGTH}
            </p>
          </div>
        </div>
      )}

      {/* Confirm/Cancel Buttons */}
      {selectedAction && (
        <div className="flex gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="
              flex-1 px-4 py-2.5 rounded-lg
              border border-neutral-200 text-neutral-600
              font-medium text-sm
              hover:bg-neutral-50 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="
              flex-1 px-4 py-2.5 rounded-lg
              bg-primary-600 text-white
              font-medium text-sm
              hover:bg-primary-700 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isLoading ? 'Procesando...' : 'Confirmar'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ApprovalActionPanel;
