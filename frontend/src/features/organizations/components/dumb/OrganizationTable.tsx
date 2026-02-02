'use client'

/**
 * Organization Table - Dumb Component
 * Pure presentational table component for displaying organizations
 */

import React from 'react'

import type { Organization, PaginationMeta } from '@/features/organizations/types/organization.types'
import { Button } from '@/shared/components/form'

interface OrganizationTableProps {
  organizations: Organization[]
  pagination: PaginationMeta | null
  loading: boolean
  togglingId: number | null
  onPageChange: (page: number) => void
  onViewDetail: (id: number) => void
  onToggleStatus: (id: number) => void
}

export const OrganizationTable: React.FC<OrganizationTableProps> = ({
  organizations,
  pagination,
  loading,
  togglingId,
  onPageChange,
  onViewDetail,
  onToggleStatus,
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (organizations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <p className="mt-2">No hay organizaciones vinculadas</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organización
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CUIT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuarios
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Eventos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alta
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {organizations.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {org.name}
                    </div>
                    {org.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {org.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {org.cuit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      org.status?.status_code === 'active'
                        ? 'bg-green-100 text-green-800'
                        : org.status?.status_code === 'suspended'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {org.status?.status_name || 'Desconocido'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {org.users?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">
                      {org.events_published}
                    </span>
                    <span className="text-gray-400"> / </span>
                    <span className="text-gray-600">{org.events_total}</span>
                    {org.events_pending > 0 && (
                      <span className="ml-2 text-yellow-600">
                        ({org.events_pending} pendientes)
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(org.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail(org.id)}
                  >
                    Ver
                  </Button>
                  <Button
                    variant={
                      org.status?.status_code === 'active'
                        ? 'danger'
                        : 'primary'
                    }
                    size="sm"
                    loading={togglingId === org.id}
                    onClick={() => onToggleStatus(org.id)}
                  >
                    {org.status?.status_code === 'active'
                      ? 'Suspender'
                      : 'Activar'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando{' '}
              <span className="font-medium">
                {(pagination.current_page - 1) * pagination.per_page + 1}
              </span>{' '}
              a{' '}
              <span className="font-medium">
                {Math.min(
                  pagination.current_page * pagination.per_page,
                  pagination.total
                )}
              </span>{' '}
              de <span className="font-medium">{pagination.total}</span>{' '}
              resultados
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === 1}
                onClick={() => onPageChange(pagination.current_page - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => onPageChange(pagination.current_page + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrganizationTable
