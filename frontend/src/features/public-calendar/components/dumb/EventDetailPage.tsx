'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { eventPublicExportService } from '@/features/events/services/eventPublicService';
import { ShareButtons } from '@/features/public-calendar/components/dumb/ShareButtons';
import { EventDetailBody } from '@/shared/components/event';
import { Button } from '@/shared/components/form';
import { Event } from '@/types/event.types';

interface EventDetailPageProps {
  event: Event;
}

/**
 * Public event detail page.
 * Uses shared EventDetailBody with public-specific chrome (breadcrumb, calendar export, share).
 */
export default function EventDetailPage({ event }: EventDetailPageProps) {
  const handleAddToGoogleCalendar = () => {
    const url = eventPublicExportService.getGoogleCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAddToOutlookCalendar = () => {
    const url = eventPublicExportService.getOutlookCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getLocation = () => {
    if (event.locations && event.locations.length > 0) {
      return event.locations.map(loc => loc.name).join(', ');
    }
    if (event.location) {
      return event.location.name;
    }
    if (event.location_text) {
      return event.location_text;
    }
    if (event.virtual_link) {
      return 'Evento Virtual';
    }
    return 'Ubicación no especificada';
  };

  const getLocationAddress = () => {
    if (event.locations && event.locations.length > 0) {
      return event.locations[0].address;
    }
    if (event.location) {
      return event.location.address;
    }
    return null;
  };

  // Structured data for search engines
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description?.replace(/<[^>]*>/g, ''),
    startDate: event.start_date,
    endDate: event.end_date || event.start_date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: event.virtual_link ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
    location: event.virtual_link ? {
      "@type": "VirtualLocation",
      url: event.virtual_link
    } : {
      "@type": "Place",
      name: getLocation(),
      address: getLocationAddress()
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer?.organization || "Ente de Turismo de Tucumán"
    },
    image: event.featured_image,
    offers: event.registration_required ? {
      "@type": "Offer",
      url: event.cta_link || `/calendar/${event.id}`,
      price: "0",
      priceCurrency: "ARS",
      availability: "https://schema.org/InStock"
    } : undefined
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />

      <div className="bg-neutral-50">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/calendar"
              className="inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="w-5 h-5 mr-2" aria-hidden="true" />
              Volver al calendario
            </Link>
          </div>
        </div>

        {/* Event Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EventDetailBody
            event={event}
            descriptionMode="html"
            imagePriority={true}
            headerActions={
              event.is_featured ? (
                <span className="inline-block px-3 py-1 text-sm font-medium bg-accent-100 text-accent-800 rounded-full">
                  Evento Destacado
                </span>
              ) : undefined
            }
            footerActions={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add to Calendar */}
                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Añadir a mi calendario</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleAddToGoogleCalendar}
                    >
                      Google Calendar
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleAddToOutlookCalendar}
                    >
                      Outlook
                    </Button>
                  </div>
                </div>

                {/* Share */}
                <div>
                  <h4 className="font-medium text-neutral-900 mb-3">Compartir evento</h4>
                  <ShareButtons event={event} />
                </div>
              </div>
            }
          />
        </div>
      </div>
    </>
  );
}
