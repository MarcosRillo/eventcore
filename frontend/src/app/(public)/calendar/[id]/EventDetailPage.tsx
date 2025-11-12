'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft,
  Calendar,
  // Clock,
  MapPin,
  // User,
  Phone,
  Mail,
  ExternalLink,
  // Share2,
  // Download
} from 'lucide-react';
import moment from 'moment';
import { Event } from '@/types/event.types';
import { eventPublicExportService } from '@/features/events/services/eventPublicService';
import ShareButtons from '../components/ShareButtons';

interface EventDetailPageProps {
  event: Event;
}

export default function EventDetailPage({ event }: EventDetailPageProps) {
  useEffect(() => {
    // Note: Related events and view tracking removed as no public endpoints are available
  }, [event.id]);

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

  const handleDownloadICal = async () => {
    try {
      const iCalUrl = eventPublicExportService.getEventICalUrl(event.id);
      const link = document.createElement('a');
      link.href = iCalUrl;
      link.download = `evento-${event.id}.ics`;
      link.click();
    } catch (error) {
      console.error('Error downloading iCal:', error);
    }
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
      url: event.cta_link || window.location.href,
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

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/calendar"
              className="inline-flex items-center text-green-600 hover:text-green-700"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
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
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {event.title}
                </h1>
                {event.is_featured && (
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    Evento Destacado
                  </span>
                )}
              </div>
              <div
                className="w-6 h-6 rounded-full flex-shrink-0"
                style={{ backgroundColor: event.category?.color || '#228B22' }}
                title={event.category?.name}
              />
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Date and Time */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Fecha y hora</h3>
                    <p className="text-gray-600">{formatDateRange(event.start_date, event.end_date)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Ubicación</h3>
                    <p className="text-gray-600">{getLocation()}</p>
                    {getLocationAddress() && (
                      <p className="text-sm text-gray-500">{getLocationAddress()}</p>
                    )}
                    {event.virtual_link && (
                      <a
                        href={event.virtual_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-green-600 hover:text-green-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Unirse al evento virtual
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Category and Contact */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div
                    className="w-6 h-6 rounded-full mt-1"
                    style={{ backgroundColor: event.category?.color || '#228B22' }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">Categoría</h3>
                    <p className="text-gray-600">{event.category?.name}</p>
                  </div>
                </div>

                {(event.contact_email || event.contact_phone) && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Información de contacto</h3>
                    <div className="space-y-2">
                      {event.contact_email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-5 h-5 text-gray-500" />
                          <a
                            href={`mailto:${event.contact_email}`}
                            className="text-green-600 hover:text-green-700"
                          >
                            {event.contact_email}
                          </a>
                        </div>
                      )}
                      {event.contact_phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-5 h-5 text-gray-500" />
                          <a
                            href={`tel:${event.contact_phone}`}
                            className="text-green-600 hover:text-green-700"
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
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add to Calendar */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Añadir a mi calendario</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleAddToGoogleCalendar}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Google Calendar
                    </button>
                    <button
                      onClick={handleAddToOutlookCalendar}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Outlook
                    </button>
                    <button
                      onClick={handleDownloadICal}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Descargar iCal
                    </button>
                  </div>
                </div>

                {/* Share */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Compartir evento</h4>
                  <ShareButtons event={event} />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción</h2>
              <div
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>
          )}

          {/* Website and CTA */}
          {(event.website_url || (event.cta_text && event.cta_link)) && (
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Enlaces relacionados</h2>
              <div className="space-y-4">
                {event.website_url && (
                  <a
                    href={event.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-green-600 hover:text-green-700"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Sitio web oficial
                  </a>
                )}
                {event.cta_text && event.cta_link && (
                  <div>
                    <a
                      href={event.cta_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      {event.cta_text}
                      <ExternalLink className="w-5 h-5 ml-2" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Related Events section removed - no public endpoint available */}
        </div>
      </div>
    </>
  );
}