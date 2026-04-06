'use client'

import Image from 'next/image'
import Link from 'next/link'

import { EventActionButtonsContainer } from '@/features/organizer/components/smart/EventActionButtonsContainer'
import type { OrganizerEvent } from '@/features/organizer/types/event.types'
import { Badge } from '@/shared/components/display'
import { Button } from '@/shared/components/form'

interface OrganizerEventDetailPageProps {
  event: OrganizerEvent
  onBack: () => void
  onEdit: () => void
  onSuccess: () => void
}

const statusBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  draft: 'default',
  pending_internal_approval: 'warning',
  approved_internal: 'success',
  published: 'info',
  rejected: 'danger',
  requires_changes: 'warning',
  cancelled: 'default'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function OrganizerEventDetailPage({
  event,
  onBack,
  onEdit,
  onSuccess,
}: OrganizerEventDetailPageProps) {
  const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status
  const statusDisplay = typeof event.status === 'object' ? event.status.status_name : event.status

  const locations = event.locations || []
  const locationNames = locations.map(loc => loc.name).join(', ') || 'Sin ubicación'

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/organizer/dashboard" className="hover:text-neutral-700">
          Mis Eventos
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-900">{event.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-neutral-900">{event.title}</h1>
            <Badge
              variant={statusBadgeVariant[statusCode as string] || 'default'}
              size="md"
              dot
            >
              {statusDisplay}
            </Badge>
          </div>
          {event.event_type && (
            <Badge variant="info" size="sm">
              {event.event_type.name}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onEdit}>
            Editar
          </Button>
          <EventActionButtonsContainer event={event} onSuccess={onSuccess} />
        </div>
      </div>

      {/* Event Details Card */}
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
        {/* Image */}
        {event.featured_image && (
          <div className="relative h-64 bg-neutral-100 rounded-t-lg overflow-hidden">
            <Image
              src={event.featured_image}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">Descripción</h2>
            <p className="text-neutral-600 whitespace-pre-wrap">
              {event.description || 'Sin descripción'}
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-1">
                Fecha de Inicio
              </h3>
              <p className="text-neutral-900">
                {event.start_date ? formatDate(event.start_date) : 'No especificada'}
              </p>
            </div>
            {event.end_date && (
              <div>
                <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-1">
                  Fecha de Fin
                </h3>
                <p className="text-neutral-900">{formatDate(event.end_date)}</p>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-1">
              Ubicación
            </h3>
            <p className="text-neutral-900">{locationNames}</p>
            {locations[0]?.city && (
              <p className="text-neutral-500 text-sm">{locations[0].city}</p>
            )}
            {event.maps_url && (
              <a
                href={event.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline text-sm mt-1 inline-block"
              >
                Ver en Google Maps →
              </a>
            )}
          </div>

          {/* Attendance */}
          {(event.local_attendance || event.national_attendance || event.international_attendance) && (
            <div className="pt-4 border-t border-neutral-100">
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
                Asistencia Esperada
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {event.local_attendance && (
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-2xl font-bold text-neutral-900">{event.local_attendance}</p>
                    <p className="text-sm text-neutral-500">Local</p>
                  </div>
                )}
                {event.national_attendance && (
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-2xl font-bold text-neutral-900">{event.national_attendance}</p>
                    <p className="text-sm text-neutral-500">Nacional</p>
                  </div>
                )}
                {event.international_attendance && (
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-2xl font-bold text-neutral-900">{event.international_attendance}</p>
                    <p className="text-sm text-neutral-500">Internacional</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Website */}
          {event.event_website && (
            <div className="pt-4 border-t border-neutral-100">
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-1">
                Sitio Web del Evento
              </h3>
              <a
                href={event.event_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                {event.event_website}
              </a>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-neutral-100 text-sm text-neutral-500">
            {event.created_at && (
              <p>Creado: {new Date(event.created_at).toLocaleDateString('es-AR')}</p>
            )}
            {event.updated_at && (
              <p>Última modificación: {new Date(event.updated_at).toLocaleDateString('es-AR')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <Button variant="outline" onClick={onBack}>
          ← Volver al dashboard
        </Button>
      </div>
    </div>
  )
}
