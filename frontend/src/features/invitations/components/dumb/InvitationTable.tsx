'use client';

/**
 * InvitationTable - Dumb Component using GenericTable
 * Uses GenericTable with custom column renderers for invitations
 */

'use client';

import { RefreshCw, Trash2 } from 'lucide-react';
import { useCallback,useMemo } from 'react';

import InvitationStatusBadge from '@/features/invitations/components/dumb/InvitationStatusBadge';
import { Invitation } from '@/features/invitations/types/invitation.types';
import { ConfirmDialogData,GenericTable, TableActionConfig, TableColumnConfig } from '@/shared/components/tables';

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
      icon: <RefreshCw className="w-5 h-5" />,
      variant: 'primary',
      onClick: onResend,
    },
    {
      key: 'cancel',
      label: 'Revocar',
      icon: <Trash2 className="w-5 h-5" />,
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
