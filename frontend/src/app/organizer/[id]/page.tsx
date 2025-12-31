/**
 * Organizer Event Detail Page
 * Server Component with dynamic metadata for SEO
 */

import { Metadata } from 'next'

import { OrganizerEventDetailContainer } from '@/features/organizer/components/smart/OrganizerEventDetailContainer'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  return {
    title: `Evento #${id} | Mis Eventos`,
    description: 'Detalle del evento - Panel de organizador',
  }
}

export default async function OrganizerEventDetailPage({ params }: Props) {
  const { id } = await params

  return <OrganizerEventDetailContainer eventId={Number(id)} />
}
