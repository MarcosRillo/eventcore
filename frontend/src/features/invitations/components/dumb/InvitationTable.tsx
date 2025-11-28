'use client'

import { RefreshCw, Trash2, Mail } from 'lucide-react'
import { Invitation, isInvitationExpired } from '../../types/invitation.types'
import InvitationStatusBadge from './InvitationStatusBadge'

interface InvitationTableProps {
  invitations: Invitation[]
  onResend: (id: number) => void
  onCancel: (id: number) => void
  resendingId: number | null
  cancellingId: number | null
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const InvitationTable = ({
  invitations,
  onResend,
  onCancel,
  resendingId,
  cancellingId,
}: InvitationTableProps) => {
  if (invitations.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-state">
        <Mail className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay invitaciones</h3>
        <p className="mt-1 text-sm text-gray-500">
          Las invitaciones enviadas aparecerán aquí.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200" data-testid="invitation-table">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invitado por
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expira
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invitations.map((invitation) => {
            const expired = isInvitationExpired(invitation)
            const isResending = resendingId === invitation.id
            const isCancelling = cancellingId === invitation.id

            return (
              <tr key={invitation.id} data-testid={`invitation-row-${invitation.id}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{invitation.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{invitation.role}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{invitation.invited_by}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <InvitationStatusBadge invitation={invitation} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(invitation.expires_at)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onResend(invitation.id)}
                      disabled={isResending || isCancelling}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${
                        expired
                          ? 'text-white bg-blue-600 hover:bg-blue-700'
                          : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={expired ? 'Reenviar (token expirado)' : 'Reenviar invitación'}
                      data-testid={`resend-button-${invitation.id}`}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${isResending ? 'animate-spin' : ''}`} />
                      {isResending ? 'Reenviando...' : 'Reenviar'}
                    </button>
                    <button
                      onClick={() => onCancel(invitation.id)}
                      disabled={isResending || isCancelling}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Revocar invitación"
                      data-testid={`cancel-button-${invitation.id}`}
                    >
                      <Trash2 className={`h-4 w-4 mr-1 ${isCancelling ? 'animate-pulse' : ''}`} />
                      {isCancelling ? 'Revocando...' : 'Revocar'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default InvitationTable
