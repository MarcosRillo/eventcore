'use client'

import { useParams } from 'next/navigation'
import { OrganizerEventFormContainer } from '@/features/organizer/components/smart/OrganizerEventFormContainer'

export default function EditEventPage() {
  const params = useParams()
  const eventId = Number(params.id)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Edit Event</h1>
      <OrganizerEventFormContainer eventId={eventId} />
    </div>
  )
}
