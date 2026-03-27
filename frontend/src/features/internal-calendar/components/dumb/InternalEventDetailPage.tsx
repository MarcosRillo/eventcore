/**
 * InternalEventDetailPage - Dumb Component
 *
 * Full-page display for event details using shared EventDetailBody.
 * Used by both internal-calendar and organizer routes.
 */

'use client';

import { ArrowLeft } from 'lucide-react';

import { EventStatusBadge } from '@/features/internal-calendar/components/dumb/EventStatusBadge';
import { InternalShareButtons } from '@/features/internal-calendar/components/dumb/InternalShareButtons';
import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';
import type { EventDetailData } from '@/shared/components/event';
import { EventDetailBody } from '@/shared/components/event';

export interface InternalEventDetailPageProps {
  event: InternalCalendarEvent;
  onBack: () => void;
}

function toEventDetailData(event: InternalCalendarEvent): EventDetailData {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    start_date: event.start_date,
    end_date: event.end_date,
    featured_image: event.featured_image,
    locations: event.locations?.map(l => ({ id: l.id, name: l.name, city: l.city })),
    event_type: event.event_type,
    event_subtype: event.event_subtype,
    organizer: { name: event.organization.name },
  };
}

/**
 * @param root0
 * @param root0.event
 * @param root0.onBack
 */
export function InternalEventDetailPage({
  event,
  onBack,
}: InternalEventDetailPageProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
          Volver al calendario
        </button>

        <EventDetailBody
          event={toEventDetailData(event)}
          descriptionMode="text"
          headerActions={
            <div className="flex items-center gap-3 flex-wrap">
              <EventStatusBadge statusCode={event.status.status_code} />
              {event.event_type && (
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: event.event_type.color }}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-neutral-600">
                    {event.event_type.name}
                  </span>
                  {event.event_subtype && (
                    <span className="text-sm text-neutral-500">
                      • {event.event_subtype.name}
                    </span>
                  )}
                </div>
              )}
            </div>
          }
          footerActions={
            <div>
              <h4 className="font-medium text-neutral-900 mb-3">Compartir evento</h4>
              <InternalShareButtons
                eventId={event.id}
                eventTitle={event.title}
              />
            </div>
          }
        />
      </div>
    </div>
  );
}
