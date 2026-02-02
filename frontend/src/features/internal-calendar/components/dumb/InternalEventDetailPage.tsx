/**
 * InternalEventDetailPage - Dumb Component
 *
 * Full-page display for event details.
 * Migrated from EventDetailModal to dedicated page.
 */

'use client';

import { format } from 'date-fns';
import Image from 'next/image';

import { EventStatusBadge } from '@/features/internal-calendar/components/dumb/EventStatusBadge';
import { InternalShareButtons } from '@/features/internal-calendar/components/dumb/InternalShareButtons';
import type { InternalCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types';

export interface InternalEventDetailPageProps {
  event: InternalCalendarEvent;
  onBack: () => void;
}

/**
 *
 * @param root0
 * @param root0.event
 * @param root0.onBack
 */
export function InternalEventDetailPage({
  event,
  onBack,
}: InternalEventDetailPageProps) {
  const startDate = format(new Date(event.start_date), 'MMMM dd, yyyy');
  const startTime = format(new Date(event.start_date), 'HH:mm');
  const endDate = format(new Date(event.end_date), 'MMMM dd, yyyy');
  const endTime = format(new Date(event.end_date), 'HH:mm');

  const isSameDay = event.start_date.split('T')[0] === event.end_date.split('T')[0];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver al calendario
        </button>

        {/* Event Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Featured Image (if available) */}
          {event.featured_image && (
            <div className="w-full h-64 bg-neutral-200 relative">
              <Image
                src={event.featured_image}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            {/* Header with Title and Status */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl font-bold text-neutral-900">
                  {event.title}
                </h1>
                <EventStatusBadge statusCode={event.status.status_code} />
              </div>

              {/* Event Type */}
              {event.event_type && (
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: event.event_type.color }}
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

            {/* Description */}
            {event.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">
                  Descripción
                </h2>
                <p className="text-neutral-700 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Date & Time */}
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">
                  Fecha y Hora
                </h2>
                <div className="space-y-1">
                  {isSameDay ? (
                    <>
                      <p className="text-neutral-700">{startDate}</p>
                      <p className="text-neutral-600">
                        {startTime} - {endTime}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-neutral-700">
                        <span className="font-medium">Inicio:</span> {startDate} a las {startTime}
                      </p>
                      <p className="text-neutral-700">
                        <span className="font-medium">Fin:</span> {endDate} a las {endTime}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Organization */}
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">
                  Organización
                </h2>
                <p className="text-neutral-700">{event.organization.name}</p>
              </div>
            </div>

            {/* Locations */}
            {event.locations && event.locations.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">
                  Ubicaci{event.locations.length > 1 ? 'ones' : 'ón'}
                </h2>
                <div className="space-y-2">
                  {event.locations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-start gap-2 text-neutral-700"
                    >
                      <svg
                        className="w-5 h-5 mt-0.5 text-neutral-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <div>
                        <p className="font-medium">{location.name}</p>
                        <p className="text-sm text-neutral-600">{location.city}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="pt-6 border-t border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900 mb-3">
                Compartir evento
              </h2>
              <InternalShareButtons
                eventId={event.id}
                eventTitle={event.title}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
