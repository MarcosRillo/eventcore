'use client'

/**
 * Organization Detail Modal - Dumb Component
 * Shows organization details including users and event metrics
 */

import React from 'react'

import { Modal, Button } from '@/components/ui'
import type { Organization } from '@/features/organizations/types/organization.types'

interface OrganizationDetailModalProps {
  organization: Organization | null
  isOpen: boolean
  loading: boolean
  togglingStatus: boolean
  onClose: () => void
  onToggleStatus: () => void
}

export const OrganizationDetailModal: React.FC<OrganizationDetailModalProps> = ({
  organization,
  isOpen,
  loading,
  togglingStatus,
  onClose,
  onToggleStatus,
}) => {
  if (!organization && !loading) return null

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={loading ? 'Cargando...' : organization?.name || 'Detalle'}
      size="lg"
      footer={
        organization && (
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button
              variant={
                organization.status?.status_code === 'active'
                  ? 'danger'
                  : 'primary'
              }
              loading={togglingStatus}
              onClick={onToggleStatus}
            >
              {organization.status?.status_code === 'active'
                ? 'Suspender organización'
                : 'Activar organización'}
            </Button>
          </div>
        )
      }
    >
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      ) : organization ? (
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Información básica
            </h4>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-500">CUIT</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {organization.cuit}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Estado</dt>
                <dd>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      organization.status?.status_code === 'active'
                        ? 'bg-green-100 text-green-800'
                        : organization.status?.status_code === 'suspended'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {organization.status?.status_name || 'Desconocido'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Tipo</dt>
                <dd className="text-sm text-gray-900">
                  {organization.type?.type_name || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Fecha de alta</dt>
                <dd className="text-sm text-gray-900">
                  {formatDate(organization.created_at)}
                </dd>
              </div>
            </dl>
            {organization.description && (
              <div className="mt-4">
                <dt className="text-xs text-gray-500">Descripción</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {organization.description}
                </dd>
              </div>
            )}
          </div>

          {/* Event Metrics */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Métricas de eventos
            </h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {organization.events_total}
                </div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {organization.events_published}
                </div>
                <div className="text-xs text-gray-500">Publicados</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {organization.events_pending}
                </div>
                <div className="text-xs text-gray-500">Pendientes</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {organization.events_rejected}
                </div>
                <div className="text-xs text-gray-500">Rechazados</div>
              </div>
            </div>
          </div>

          {/* Users */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Usuarios ({organization.users?.length || 0})
            </h4>
            {organization.users && organization.users.length > 0 ? (
              <ul className="divide-y divide-gray-200 border rounded-lg">
                {organization.users.map((user) => (
                  <li
                    key={user.id}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    {user.role && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role.role_name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No hay usuarios registrados
              </p>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  )
}

export default OrganizationDetailModal
