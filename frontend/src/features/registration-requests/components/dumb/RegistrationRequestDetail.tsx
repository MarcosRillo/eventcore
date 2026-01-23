'use client'

/**
 * Registration Request Detail - Dumb Component
 * Slide-over panel showing full details of a registration request
 */

import { Building2, Check, FileText, User, X, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'

import { Badge,Button, LoadingSpinner } from '@/components/ui'
import { RegistrationRequestDetail as RequestDetail } from '@/features/registration-requests/types/registration-request.types'

interface RegistrationRequestDetailProps {
  request: RequestDetail | null
  loading: boolean
  actionLoading: boolean
  isOpen: boolean
  onClose: () => void
  onApprove: () => void
  onReject: () => void
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', variant: 'warning' as const },
  approved: { label: 'Aprobada', variant: 'success' as const },
  rejected: { label: 'Rechazada', variant: 'danger' as const },
}

/**
 *
 * @param root0
 * @param root0.request
 * @param root0.loading
 * @param root0.actionLoading
 * @param root0.isOpen
 * @param root0.onClose
 * @param root0.onApprove
 * @param root0.onReject
 */
export function RegistrationRequestDetailPanel({
  request,
  loading,
  actionLoading,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: RegistrationRequestDetailProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Detalle de Solicitud</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 rounded-md hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : !request ? (
            <div className="text-center py-12 text-neutral-500">
              No se pudo cargar el detalle
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge variant={STATUS_CONFIG[request.status].variant} size="lg">
                  {STATUS_CONFIG[request.status].label}
                </Badge>
                <span className="text-sm text-neutral-500">
                  Enviada el {formatDate(request.created_at)}
                </span>
              </div>

              {/* Personal Data Section */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-primary-600" />
                  <h3 className="font-semibold text-neutral-900">Datos Personales</h3>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                  <DetailRow label="Nombre completo" value={request.full_name} />
                  <DetailRow label="DNI" value={request.dni} />
                  <DetailRow label="Email" value={request.email} />
                  <DetailRow label="WhatsApp" value={request.whatsapp} />
                </div>
              </section>

              {/* Organization Section */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-primary-600" />
                  <h3 className="font-semibold text-neutral-900">Organización</h3>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                  <DetailRow label="Nombre" value={request.organization_name} />
                  <DetailRow label="Rubro" value={request.organization_sector} />
                  {request.website && (
                    <DetailRow
                      label="Sitio web"
                      value={
                        <a
                          href={request.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          {request.website}
                        </a>
                      }
                    />
                  )}
                </div>
              </section>

              {/* Motivation Section */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <h3 className="font-semibold text-neutral-900">Motivación</h3>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-neutral-700 whitespace-pre-wrap">{request.motivation}</p>
                </div>
              </section>

              {/* Review Info (if already reviewed) */}
              {request.reviewed_at && (
                <section className="border-t pt-4">
                  <h3 className="font-semibold text-neutral-900 mb-3">Información de Revisión</h3>
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                    <DetailRow label="Revisado por" value={request.reviewed_by || 'N/A'} />
                    <DetailRow label="Fecha de revisión" value={formatDate(request.reviewed_at)} />
                    {request.rejection_reason && (
                      <div>
                        <span className="text-sm font-medium text-neutral-500">Motivo del rechazo:</span>
                        <p className="mt-1 text-error-700 bg-error-50 p-3 rounded">
                          {request.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Action Buttons (only for pending) */}
              {request.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={onApprove}
                    disabled={actionLoading}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {actionLoading ? 'Procesando...' : 'Aprobar Solicitud'}
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={onReject}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

interface DetailRowProps {
  label: string
  value: ReactNode
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between">
      <span className="text-sm font-medium text-neutral-500">{label}</span>
      <span className="text-sm text-neutral-900">{value}</span>
    </div>
  )
}

export default RegistrationRequestDetailPanel
