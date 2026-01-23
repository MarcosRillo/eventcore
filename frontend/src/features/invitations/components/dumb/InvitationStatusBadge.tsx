import { getInvitationStatus, Invitation, InvitationStatus } from '@/features/invitations/types/invitation.types'

interface InvitationStatusBadgeProps {
  invitation: Invitation
}

const statusConfig: Record<InvitationStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pendiente',
    className: 'bg-yellow-100 text-yellow-800',
  },
  expired: {
    label: 'Expirada',
    className: 'bg-red-100 text-red-800',
  },
  accepted: {
    label: 'Aceptada',
    className: 'bg-green-100 text-green-800',
  },
}

export const InvitationStatusBadge = ({ invitation }: InvitationStatusBadgeProps) => {
  const status = getInvitationStatus(invitation)
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      data-testid="invitation-status-badge"
    >
      {config.label}
    </span>
  )
}

export default InvitationStatusBadge
