/**
 * Edit Event Page
 * Server Component with dynamic metadata for SEO
 */

import { Metadata } from 'next'

import { OrganizerEventEditContainer } from '@/features/organizer/components/smart/OrganizerEventEditContainer'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  return {
    title: `Editar Evento #${id} | Mis Eventos`,
    description: 'Editar evento existente - Panel de organizador',
  }
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params

  return <OrganizerEventEditContainer eventId={Number(id)} />
}
