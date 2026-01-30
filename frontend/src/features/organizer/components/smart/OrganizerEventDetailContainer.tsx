'use client'

/**
 * Organizer Event Detail Container
 *
 * Displays full event details for organizers with action buttons
 * for edit, delete, and submit for review operations.
 */

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback,useEffect, useState } from 'react'

import Badge from '@/components/ui/Badge'
import EmptyState, { EmptyStateIcons } from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { EventActionButtonsContainer } from '@/features/organizer/components/smart/EventActionButtonsContainer'
import { getEvent } from '@/features/organizer/services/organizer-event.service'
import { OrganizerEvent } from '@/features/organizer/types/event.types'
import { Button } from '@/shared/components/form'

interface OrganizerEventDetailContainerProps {
  eventId: number
}

export function OrganizerEventDetailContainer({ eventId }: OrganizerEventDetailContainerProps) {
  const router = useRouter()

  const [event, setEvent] = useState<OrganizerEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const eventData = await getEvent(eventId)
      setEvent(eventData)
    } catch {
      setError('Error al cargar el evento')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    if (eventId) {
      fetchEvent()
    }
  }, [eventId, fetchEvent])

  const handleSuccess = () => {
    fetchEvent()
  }

  const formatDate = (dateString: string): string => {
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" text="Cargando evento..." />
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
          <EmptyState
            icon={EmptyStateIcons.document}
            title={error ? "Error al cargar" : "Evento no encontrado"}
            description={error || "El evento que buscas no existe o fue eliminado"}
            size="lg"
            className="py-16"
            action={
              <Button
                variant="primary"
                onClick={() => router.push('/organizer/dashboard')}
              >
                ← Volver al dashboard
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  // Extract status info
  const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status
  const statusDisplay = typeof event.status === 'object' ? event.status.status_name : event.status

  // Map status code to Badge variant
  const statusBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    draft: 'default',
    pending_internal_approval: 'warning',
    approved_internal: 'success',
    published: 'info',
    rejected: 'danger',
    requires_changes: 'warning',
    cancelled: 'default'
  }

  // Get locations
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
          <Button
            variant="outline"
            onClick={() => router.push(`/organizer/${eventId}/edit`)}
          >
            Editar
          </Button>
          <EventActionButtonsContainer
            event={event}
            onSuccess={handleSuccess}
          />
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

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-neutral-100">
            {event.origin && (
              <div>
                <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-1">
                  Origen
                </h3>
                <p className="text-neutral-900">{event.origin.name}</p>
              </div>
            )}
            {event.theme && (
              <div>
                <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-1">
                  Temática
                </h3>
                <p className="text-neutral-900">{event.theme.name}</p>
              </div>
            )}
            {event.frequency && (
              <div>
                <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-1">
                  Frecuencia
                </h3>
                <p className="text-neutral-900">{event.frequency.name}</p>
              </div>
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

          {/* Services */}
          {event.services && event.services.length > 0 && (
            <div className="pt-4 border-t border-neutral-100">
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-2">
                Servicios Incluidos
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.services.map(service => (
                  <Badge key={service.id} variant="default" size="sm">
                    {service.name}
                  </Badge>
                ))}
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
        <Button
          variant="outline"
          onClick={() => router.push('/organizer/dashboard')}
        >
          ← Volver al dashboard
        </Button>
      </div>
    </div>
  )
}
