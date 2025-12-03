'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';
import moment from 'moment';
import { Event } from '@/types/event.types';
import { eventPublicExportService } from '@/features/events/services/eventPublicService';
import { ShareButtons } from '@/features/public-calendar/components/dumb/ShareButtons';
import { Button } from '@/components/ui';

interface EventDetailPageProps {
  event: Event;
}

export default function EventDetailPage({ event }: EventDetailPageProps) {
  const formatDate = (dateString: string) => {
    return moment(dateString).format('dddd, DD [de] MMMM [de] YYYY');
  };

  const formatTime = (dateString: string) => {
    return moment(dateString).format('HH:mm');
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = moment(startDate);
    const end = endDate ? moment(endDate) : start;

    if (start.isSame(end, 'day')) {
      return `${formatDate(startDate)} de ${formatTime(startDate)} a ${formatTime(endDate || startDate)}`;
    } else {
      return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatDate(endDate || startDate)} ${formatTime(endDate || startDate)}`;
    }
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

  const handleAddToGoogleCalendar = () => {
    const url = eventPublicExportService.getGoogleCalendarUrl(event);
    window.open(url, '_blank');
  };

  const handleAddToOutlookCalendar = () => {
    const url = eventPublicExportService.getOutlookCalendarUrl(event);
    window.open(url, '_blank');
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
          {/* Featured Image */}
          {event.featured_image && (
            <div className="mb-8">
              <Image
                src={event.featured_image}
                alt={event.title}
                width={800}
                height={320}
                className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Event Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                  {event.title}
                </h1>
                {event.is_featured && (
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-accent-100 text-accent-800 rounded-full">
                    Evento Destacado
                  </span>
                )}
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Date and Time */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-6 h-6 text-primary-600 mt-1" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-neutral-900">Fecha y hora</h3>
                    <p className="text-neutral-600">{formatDateRange(event.start_date, event.end_date)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-6 h-6 text-primary-600 mt-1" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-neutral-900">Ubicación</h3>
                    <p className="text-neutral-600">{getLocation()}</p>
                    {getLocationAddress() && (
                      <p className="text-sm text-neutral-500">{getLocationAddress()}</p>
                    )}
                    {event.virtual_link && (
                      <a
                        href={event.virtual_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-primary-600 hover:text-primary-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" aria-hidden="true" />
                        Unirse al evento virtual
                        <span className="sr-only"> (abre en nueva ventana)</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                {(event.contact_email || event.contact_phone) && (
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-2">Información de contacto</h3>
                    <div className="space-y-2">
                      {event.contact_email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-5 h-5 text-neutral-500" aria-hidden="true" />
                          <a
                            href={`mailto:${event.contact_email}`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            {event.contact_email}
                          </a>
                        </div>
                      )}
                      {event.contact_phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-5 h-5 text-neutral-500" aria-hidden="true" />
                          <a
                            href={`tel:${event.contact_phone}`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            {event.contact_phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-neutral-100 pt-6">
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
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Descripción</h2>
              <div
                className="prose prose-lg max-w-none text-neutral-700"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>
          )}

          {/* Website and CTA */}
          {(event.website_url || (event.cta_text && event.cta_link)) && (
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">Enlaces relacionados</h2>
              <div className="space-y-4">
                {event.website_url && (
                  <a
                    href={event.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" aria-hidden="true" />
                    Sitio web oficial
                    <span className="sr-only"> (abre en nueva ventana)</span>
                  </a>
                )}
                {event.cta_text && event.cta_link && (
                  <div>
                    <a
                      href={event.cta_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-11 px-5 text-base gap-2 font-medium rounded-md bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500/40 shadow-sm hover:shadow transition-all duration-150 ease-in-out"
                    >
                      {event.cta_text}
                      <ExternalLink className="w-5 h-5" aria-hidden="true" />
                      <span className="sr-only"> (abre en nueva ventana)</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
