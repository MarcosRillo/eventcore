/**
 * Event Subtypes Page
 * Server Component with dynamic metadata for SEO
 */

import { Metadata } from 'next'

import { EventSubtypesPageContainer } from '@/features/event-types/components/smart/EventSubtypesPageContainer'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  return {
    title: `Subtipos de Evento #${id} | Admin`,
    description: 'Gestión de subtipos de eventos - Panel de administración',
  }
}

export default async function EventSubtypesPage({ params }: Props) {
  const { id } = await params

  return <EventSubtypesPageContainer eventTypeId={Number(id)} />
}
