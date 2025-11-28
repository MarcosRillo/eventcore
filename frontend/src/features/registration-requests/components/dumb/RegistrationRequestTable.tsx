'use client'

/**
 * Registration Request Table - Dumb Component
 * Displays a table of registration requests with filters and actions
 */

import { Eye, Check, X, Pause, Play, Trash2 } from 'lucide-react'
import { Button, LoadingSpinner, Badge } from '@/components/ui'
import {
  RegistrationRequest,
  DisplayStatusFilter,
} from '../../types/registration-request.types'

interface RegistrationRequestTableProps {
  requests: RegistrationRequest[]
  loading: boolean
  displayFilter: DisplayStatusFilter
  onDisplayFilterChange: (filter: DisplayStatusFilter) => void
  onViewDetail: (request: RegistrationRequest) => void
  onApprove: (request: RegistrationRequest) => void
  onReject: (request: RegistrationRequest) => void
  onSuspend: (request: RegistrationRequest) => void
  onUnsuspend: (request: RegistrationRequest) => void
  onDelete: (request: RegistrationRequest) => void
}

/**
 * Determines the consolidated display status for a registration request.
 * Shows a single status that represents the current state of the request.
 */
const getDisplayStatus = (
  request: RegistrationRequest
): { label: string; variant: 'warning' | 'success' | 'danger' } => {
  if (request.status === 'pending') {
    return { label: 'Pendiente', variant: 'warning' }
  }
  if (request.status === 'rejected') {
    return { label: 'Rechazada', variant: 'danger' }
  }
  // Status === 'approved'
  if (request.is_deleted) {
    return { label: 'Eliminado', variant: 'danger' }
  }
  if (request.user_status === 'suspended') {
    return { label: 'Suspendido', variant: 'warning' }
  }
  return { label: 'Activo', variant: 'success' }
}

const FILTER_OPTIONS: Array<{ value: DisplayStatusFilter; label: string }> = [
  { value: 'default', label: 'Principales' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'active', label: 'Activos' },
  { value: 'suspended', label: 'Suspendidos' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'deleted', label: 'Eliminadas' },
]

/**
 * Priority order for sorting requests by status.
 */
const STATUS_PRIORITY: Record<string, number> = {
  Pendiente: 1,
  Activo: 2,
  Suspendido: 3,
  Rechazada: 4,
  Eliminado: 5,
}

/**
 * Filters requests based on the selected display filter.
 */
const filterRequests = (
  requests: RegistrationRequest[],
  filter: DisplayStatusFilter
): RegistrationRequest[] => {
  return requests.filter((req) => {
    const displayStatus = getDisplayStatus(req).label

    switch (filter) {
      case 'default':
        return displayStatus === 'Pendiente' || displayStatus === 'Activo'
      case 'pending':
        return displayStatus === 'Pendiente'
      case 'active':
        return displayStatus === 'Activo'
      case 'suspended':
        return displayStatus === 'Suspendido'
      case 'rejected':
        return displayStatus === 'Rechazada'
      case 'deleted':
        return displayStatus === 'Eliminado'
      default:
        return true
    }
  })
}

/**
 * Sorts requests by status priority, then by date (newest first).
 */
const sortRequests = (requests: RegistrationRequest[]): RegistrationRequest[] => {
  return [...requests].sort((a, b) => {
    const statusA = getDisplayStatus(a).label
    const statusB = getDisplayStatus(b).label

    // First by status priority
    const priorityDiff = STATUS_PRIORITY[statusA] - STATUS_PRIORITY[statusB]
    if (priorityDiff !== 0) return priorityDiff

    // Then by date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function RegistrationRequestTable({
  requests,
  loading,
  displayFilter,
  onDisplayFilterChange,
  onViewDetail,
  onApprove,
  onReject,
  onSuspend,
  onUnsuspend,
  onDelete,
}: RegistrationRequestTableProps) {
  // Apply sorting and filtering
  const processedRequests = filterRequests(sortRequests(requests), displayFilter)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Filtrar:</span>
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onDisplayFilterChange(option.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              displayFilter === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {processedRequests.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <p className="text-lg">No hay solicitudes</p>
          <p className="text-sm mt-1">
            {displayFilter !== 'default'
              ? 'No hay solicitudes con este estado'
              : 'No se han recibido solicitudes aún'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {request.full_name}
                      </span>
                      <span className="text-sm text-gray-500">{request.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {request.organization_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {request.organization_sector}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(request.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const displayStatus = getDisplayStatus(request)
                      return (
                        <Badge variant={displayStatus.variant}>
                          {displayStatus.label}
                        </Badge>
                      )
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onViewDetail(request)}
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onApprove(request)}
                            title="Aprobar"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onReject(request)}
                            title="Rechazar"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {request.status === 'approved' && request.user_status === 'active' && (
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => onSuspend(request)}
                          title="Suspender"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      {request.status === 'approved' && request.user_status === 'suspended' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onUnsuspend(request)}
                            title="Reactivar"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(request)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default RegistrationRequestTable
