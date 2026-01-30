'use client'

/**
 * Create Event Container
 *
 * Handles navigation callbacks for the event creation form.
 * Wraps OrganizerEventFormContainer with router logic.
 */

import { useRouter } from 'next/navigation'

import { OrganizerEventFormContainer } from '@/features/organizer/components/smart/OrganizerEventFormContainer'
import { useToast } from '@/shared/context'

export function OrganizerEventCreateContainer() {
  const router = useRouter()
  const { addToast } = useToast()

  const handleSuccess = () => {
    addToast({
      message: 'Evento creado correctamente como borrador.',
      type: 'success',
      duration: 5000
    })
    router.push('/organizer/dashboard')
  }

  const handleError = (message: string) => {
    addToast({
      message,
      type: 'error',
      duration: 5000
    })
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
        onError={handleError}
        onCancel={handleCancel}
      />
    </div>
  )
}
