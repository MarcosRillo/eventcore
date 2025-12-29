'use client';

import { ArrowPathIcon, UserPlusIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useCallback } from 'react';

import { Button } from '@/components/ui';
import InvitationTable from '@/features/invitations/components/dumb/InvitationTable';
import { CreateInvitationModalContainer } from '@/features/invitations/components/smart/CreateInvitationModalContainer';
import { useInvitations } from '@/features/invitations/hooks/useInvitations';
import type { Invitation } from '@/features/invitations/types/invitation.types';
import { ConfirmDialogData } from '@/shared/components/tables';

export const InvitationTableContainer = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    invitations,
    roles,
    loading,
    creating,
    error,
    fetchInvitations,
    handleCreate,
    handleResend,
    handleCancel,
    clearError,
  } = useInvitations();

  // Confirm dialog state for cancel
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogData>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Handle resend with Invitation object
  const onResend = useCallback(async (invitation: Invitation) => {
    await handleResend(invitation.id);
  }, [handleResend]);

  // Handle cancel with confirmation
  const onCancelClick = useCallback((invitation: Invitation) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Revocar Invitación',
      message: `¿Estás seguro de que deseas revocar la invitación a "${invitation.email}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        await handleCancel(invitation.id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  }, [handleCancel]);

  // Close confirm dialog handler
  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div
          className="bg-error-50 border border-error-200 rounded-md p-4 flex items-center justify-between"
          data-testid="error-state"
        >
          <div className="flex items-center">
            <XCircleIcon className="h-5 w-5 text-error-400 mr-2" aria-hidden="true" />
            <span className="text-sm text-error-700">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-error-600 hover:text-error-800"
            type="button"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchInvitations}
          disabled={loading}
          data-testid="refresh-button"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          data-testid="create-invitation-button"
        >
          <UserPlusIcon className="h-4 w-4 mr-1" />
          Nueva invitación
        </Button>
      </div>

      {/* Table */}
      <InvitationTable
        invitations={invitations}
        loading={loading && invitations.length === 0}
        onResend={onResend}
        onCancel={onCancelClick}
        confirmDialog={confirmDialog}
        onCloseConfirmDialog={handleCloseConfirmDialog}
      />

      {/* Create Modal */}
      <CreateInvitationModalContainer
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        roles={roles}
        isLoading={creating}
      />
    </div>
  );
};

export default InvitationTableContainer;
