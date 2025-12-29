'use client'

/**
 * Edit Event Page
 *
 * Full-page form for editing existing events.
 */

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { useToast } from '@/components/ui/Toast'
import { OrganizerEventFormContainer } from '@/features/organizer/components/smart/OrganizerEventFormContainer'

/**
 *
 */
export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = Number(params.id)
  const { addToast } = useToast()

  const handleSuccess = () => {
    addToast({
      message: 'Evento actualizado correctamente. Si estaba publicado o aprobado, ahora está en revisión para ser re-aprobado.',
      type: 'success',
      duration: 6000
    })
    router.push(`/organizer/${eventId}`)
  }

  const handleCancel = () => {
    router.push(`/organizer/${eventId}`)
  }

  return (
    <div className="container mx-auto px-4 max-w-4xl py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/organizer/dashboard" className="hover:text-neutral-700 transition-colors">
          Mis Eventos
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/organizer/${eventId}`} className="hover:text-neutral-700 transition-colors">
          Detalle
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-900">Editar</span>
      </nav>

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
