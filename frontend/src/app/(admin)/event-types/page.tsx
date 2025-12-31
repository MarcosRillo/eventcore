/**
 * Event Types Page
 * Server Component with static metadata for SEO
 */

import { Metadata } from 'next'

import { EventTypesPageContainer } from '@/features/event-types/components/smart/EventTypesPageContainer'

export const metadata: Metadata = {
  title: 'Tipos de Evento | Admin',
  description: 'Gestión de tipos de eventos - Panel de administración',
}

export default function EventTypesPage() {
  return <EventTypesPageContainer />
}
