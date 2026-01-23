'use client'

/**
 * Create Event Container
 *
 * Handles navigation callbacks for the event creation form.
 * Wraps OrganizerEventFormContainer with router logic.
 */

import { useRouter } from 'next/navigation'

import { OrganizerEventFormContainer } from '@/features/organizer/components/smart/OrganizerEventFormContainer'

export function OrganizerEventCreateContainer() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/organizer/dashboard')
  }

  const handleCancel = () => {
    router.push('/organizer/dashboard')
  }

  return (
    <div className="container mx-auto px-4 max-w-4xl py-6">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Crear Nuevo Evento</h1>
      <OrganizerEventFormContainer
        mode="create"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}
