/**
 * InvitationTable - Dumb Component using GenericTable
 * Uses GenericTable with custom column renderers for invitations
 */

'use client';

import { useMemo, useCallback } from 'react';
import { Invitation } from '../../types/invitation.types';
import { GenericTable, TableColumnConfig, TableActionConfig, ConfirmDialogData } from '@/shared/components/tables';
import { ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import InvitationStatusBadge from './InvitationStatusBadge';

interface InvitationTableProps {
  invitations: Invitation[];
  loading?: boolean;
  onResend: (invitation: Invitation) => void;
  onCancel: (invitation: Invitation) => void;
  confirmDialog?: ConfirmDialogData;
  onCloseConfirmDialog?: () => void;
}

export const InvitationTable = ({
  invitations,
  loading = false,
  onResend,
  onCancel,
  confirmDialog,
  onCloseConfirmDialog,
}: InvitationTableProps) => {
  // Date formatting function
  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  }, []);

  // Column configuration with custom renderers
  const columns = useMemo((): TableColumnConfig<Invitation>[] => [
    // Email column
    {
      key: 'email',
      label: 'Email',
      render: (invitation) => (
        <span className="text-sm font-medium text-neutral-900">{invitation.email}</span>
      ),
    },
    // Role column
    {
      key: 'role',
      label: 'Rol',
      render: (invitation) => (
        <span className="text-sm text-neutral-500">{invitation.role}</span>
      ),
    },
    // Invited by column
    {
      key: 'invited_by',
      label: 'Invitado por',
      render: (invitation) => (
        <span className="text-sm text-neutral-500">{invitation.invited_by}</span>
      ),
    },
    // Status column (using existing badge component)
    {
      key: 'status',
      label: 'Estado',
      render: (invitation) => <InvitationStatusBadge invitation={invitation} />,
    },
    // Expires at column
    {
      key: 'expires_at',
      label: 'Expira',
      render: (invitation) => (
        <span className="text-sm text-neutral-500">{formatDate(invitation.expires_at)}</span>
      ),
    },
  ], [formatDate]);

  // Action configuration
  const actions = useMemo((): TableActionConfig<Invitation>[] => [
    {
      key: 'resend',
      label: 'Reenviar',
      icon: <ArrowPathIcon className="w-5 h-5" />,
      variant: 'primary',
      onClick: onResend,
    },
    {
      key: 'cancel',
      label: 'Revocar',
      icon: <TrashIcon className="w-5 h-5" />,
      variant: 'danger',
      onClick: onCancel,
    },
  ], [onResend, onCancel]);

  return (
    <GenericTable<Invitation>
      items={invitations}
      columns={columns}
      actions={actions}
      isLoading={loading}
      emptyMessage="No hay invitaciones. Las invitaciones enviadas aparecerán aquí."
      confirmDialog={confirmDialog}
      onCloseConfirmDialog={onCloseConfirmDialog}
      testId="invitation-table"
    />
  );
};

export default InvitationTable;
