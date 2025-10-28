'use client'

import { OrganizerEventFormContainer } from '@/features/organizer/components/smart/OrganizerEventFormContainer'

export default function CreateEventPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Event</h1>
      <OrganizerEventFormContainer />
    </div>
  )
}
