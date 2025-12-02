'use client'

/**
 * Organizer Event Detail Page
 *
 * Displays full event details for organizers with action buttons
 * for edit, delete, and submit for review operations.
 */

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { OrganizerEvent } from '@/features/organizer/types/event.types'
import { getEvent } from '@/features/organizer/services/organizer-event.service'
import { EventActionButtonsContainer } from '@/features/organizer/components/smart/EventActionButtonsContainer'
import { Badge, Button } from '@/components/ui'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-200 text-gray-700',
  pending: 'bg-yellow-200 text-yellow-800',
  pending_internal_approval: 'bg-yellow-200 text-yellow-800',
  approved_internal: 'bg-green-200 text-green-800',
  approved: 'bg-green-200 text-green-800',
  rejected: 'bg-red-200 text-red-800',
  published: 'bg-blue-200 text-blue-800',
  requires_changes: 'bg-orange-200 text-orange-800',
  cancelled: 'bg-gray-300 text-gray-700'
}

export default function OrganizerEventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = Number(params.id)

  const [event, setEvent] = useState<OrganizerEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getEvent(eventId)
      setEvent(response.data)
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
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error || 'Evento no encontrado'}</p>
          <Button
            variant="outline"
            onClick={() => router.push('/organizer/dashboard')}
            className="mt-4"
          >
            Volver al dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Extract status info
  const statusCode = typeof event.status === 'object' ? event.status.status_code : event.status
  const statusDisplay = typeof event.status === 'object' ? event.status.status_name : event.status
  const statusColorClass = statusColors[statusCode] || 'bg-gray-200 text-gray-700'

  // Get locations
  const locations = event.locations || []
  const locationNames = locations.map(loc => loc.name).join(', ') || 'Sin ubicación'

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/organizer/dashboard" className="hover:text-gray-700">
          Mis Eventos
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{event.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColorClass}`}>
              {statusDisplay}
            </span>
          </div>
          {event.category && (
            <Badge variant="info" size="sm">
              {event.category.name}
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
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Image */}
        {event.featured_image && (
          <div className="relative h-64 bg-gray-100 rounded-t-lg overflow-hidden">
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
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {event.description || 'Sin descripción'}
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                Fecha de Inicio
              </h3>
              <p className="text-gray-900">
                {event.start_date ? formatDate(event.start_date) : 'No especificada'}
              </p>
            </div>
            {event.end_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Fecha de Fin
                </h3>
                <p className="text-gray-900">{formatDate(event.end_date)}</p>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
              Ubicación
            </h3>
            <p className="text-gray-900">{locationNames}</p>
            {locations[0]?.city && (
              <p className="text-gray-500 text-sm">{locations[0].city}</p>
            )}
            {event.maps_url && (
              <a
                href={event.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm mt-1 inline-block"
              >
                Ver en Google Maps →
              </a>
            )}
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
            {event.origin && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Origen
                </h3>
                <p className="text-gray-900">{event.origin.name}</p>
              </div>
            )}
            {event.theme && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Temática
                </h3>
                <p className="text-gray-900">{event.theme.name}</p>
              </div>
            )}
            {event.frequency && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Frecuencia
                </h3>
                <p className="text-gray-900">{event.frequency.name}</p>
              </div>
            )}
          </div>

          {/* Attendance */}
          {(event.local_attendance || event.national_attendance || event.international_attendance) && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Asistencia Esperada
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {event.local_attendance && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{event.local_attendance}</p>
                    <p className="text-sm text-gray-500">Local</p>
                  </div>
                )}
                {event.national_attendance && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{event.national_attendance}</p>
                    <p className="text-sm text-gray-500">Nacional</p>
                  </div>
                )}
                {event.international_attendance && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{event.international_attendance}</p>
                    <p className="text-sm text-gray-500">Internacional</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Services */}
          {event.services && event.services.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
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
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                Sitio Web del Evento
              </h3>
              <a
                href={event.event_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {event.event_website}
              </a>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">
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
