/**
 * Internal Calendar Event Detail Page
 *
 * Dynamic route for displaying full event details.
 * Migrated from EventDetailModal to dedicated page.
 */

import { InternalEventDetailPageContainer } from '@/features/internal-calendar/components/smart/InternalEventDetailPageContainer';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
