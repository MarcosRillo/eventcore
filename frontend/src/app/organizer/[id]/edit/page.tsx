'use client'

/**
 * Edit Event Page
 *
 * Full-page form for editing existing events.
 */

import { useParams, useRouter } from 'next/navigation'
import { OrganizerEventFormContainer } from '@/features/organizer/components/smart/OrganizerEventFormContainer'

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = Number(params.id)

  const handleSuccess = () => {
    router.push(`/organizer/${eventId}`)
  }

  const handleCancel = () => {
    router.push(`/organizer/${eventId}`)
  }

  return (
    <div className="container mx-auto px-4 max-w-4xl py-6">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Editar Evento</h1>
      <OrganizerEventFormContainer
        eventId={eventId}
        mode="edit"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}
