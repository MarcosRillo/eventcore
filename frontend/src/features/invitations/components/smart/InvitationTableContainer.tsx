'use client'

import { useEffect } from 'react'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { useInvitations } from '../../hooks/useInvitations'
import InvitationTable from '../dumb/InvitationTable'

export const InvitationTableContainer = () => {
  const {
    invitations,
    loading,
    error,
    resendingId,
    cancellingId,
    fetchInvitations,
    handleResend,
    handleCancel,
    clearError,
  } = useInvitations()

  const onResend = async (id: number) => {
    const success = await handleResend(id)
    if (success) {
      // Could show toast here
    }
  }

  const onCancel = async (id: number) => {
    const success = await handleCancel(id)
    if (success) {
      // Could show toast here
    }
  }

  if (loading && invitations.length === 0) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="loading-state">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando invitaciones...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center justify-between"
          data-testid="error-state"
        >
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={fetchInvitations}
          disabled={loading}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          data-testid="refresh-button"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <InvitationTable
          invitations={invitations}
          onResend={onResend}
          onCancel={onCancel}
          resendingId={resendingId}
          cancellingId={cancellingId}
        />
      </div>
    </div>
  )
}

export default InvitationTableContainer
