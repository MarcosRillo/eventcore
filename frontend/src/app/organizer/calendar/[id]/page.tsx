/**
 * Organizer Calendar Event Detail Page
 *
 * Dynamic route for displaying full event details for organizers.
 */

import type { Metadata } from 'next'

import { InternalEventDetailPageContainer } from '@/features/internal-calendar/components/smart/InternalEventDetailPageContainer'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  return {
    title: `Evento #${id} - Calendario Organizador`,
    description: 'Detalle del evento en el calendario del organizador',
    robots: { index: false, follow: false }
  }
}

export default async function OrganizerEventDetailPage({ params }: Props) {
  const { id } = await params;
  const eventId = parseInt(id, 10);

  if (isNaN(eventId)) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-error-600">ID de evento inválido</h1>
          <p className="mt-2 text-neutral-600">El ID proporcionado no es válido.</p>
        </div>
      </div>
    );
  }

  return <InternalEventDetailPageContainer eventId={eventId} />;
}
