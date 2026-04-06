'use client'

/**
 * Organizer Event Detail Container
 *
 * Displays full event details for organizers with action buttons
 * for edit, delete, and submit for review operations.
 */

import { useRouter } from 'next/navigation'

import { OrganizerEventDetailPage } from '@/features/organizer/components/dumb/OrganizerEventDetailPage'
import { useOrganizerEventDetail } from '@/features/organizer/hooks/useOrganizerEventDetail'
import { EmptyState, EmptyStateIcons, LoadingSpinner } from '@/shared/components/feedback'
import { Button } from '@/shared/components/form'

interface OrganizerEventDetailContainerProps {
  eventId: number
}

export function OrganizerEventDetailContainer({ eventId }: OrganizerEventDetailContainerProps) {
  const router = useRouter()

  const { event, loading, error, refetch } = useOrganizerEventDetail(eventId)

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

  return (
    <OrganizerEventDetailPage
      event={event}
      onBack={() => router.push('/organizer/dashboard')}
      onEdit={() => router.push(`/organizer/${eventId}/edit`)}
      onSuccess={refetch}
    />
  )
}
