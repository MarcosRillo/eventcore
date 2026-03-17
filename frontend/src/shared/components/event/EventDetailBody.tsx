'use client';

import { format, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

import { SafeImage } from '@/shared/components/display';
import ImagePlaceholder from '@/shared/components/display/ImagePlaceholder';
import type { EventDetailBodyProps } from '@/shared/components/event/EventDetailBody.types';
import { useSanitizedHTML } from '@/shared/hooks/useSanitizedHTML';

const formatDate = (dateString: string): string => {
  return format(parseISO(dateString), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es });
};

const formatTime = (dateString: string): string => {
  return format(parseISO(dateString), 'HH:mm', { locale: es });
};

const formatDateRange = (startDate: string, endDate?: string): string => {
  const start = parseISO(startDate);
  const end = endDate ? parseISO(endDate) : start;

  if (isSameDay(start, end)) {
    return `${formatDate(startDate)} de ${formatTime(startDate)} a ${formatTime(endDate || startDate)}`;
  } else {
    return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatDate(endDate || startDate)} ${formatTime(endDate || startDate)}`;
  }
};

/**
 * EventDetailBody - Shared presentational component for event detail views.
 *
 * Renders the event body: image, title, dates, location, contact, description, links.
 * Consumers wrap it with page chrome and inject role-specific actions via slot props.
 */
export function EventDetailBody({
  event,
  headerActions,
  footerActions,
  descriptionMode = 'html',
  imagePriority = false,
  className,
}: EventDetailBodyProps) {
  const sanitizedDescription = useSanitizedHTML(event.description || '');

  const getLocation = (): string => {
    if (event.locations && event.locations.length > 0) {
      return event.locations.map(loc => loc.name).join(', ');
    }
    if (event.location_text) {
      return event.location_text;
    }
    if (event.virtual_link) {
      return 'Evento Virtual';
    }
    return 'Ubicación no especificada';
  };

  const getLocationAddress = (): string | undefined => {
    if (event.locations && event.locations.length > 0) {
      return event.locations[0].address;
    }
    return undefined;
  };

  return (
    <div className={className}>
      {/* Featured Image */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg mb-8">
        {event.featured_image ? (
          <SafeImage
            src={event.featured_image}
            alt={event.title}
            fill
            priority={imagePriority}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 768px, 896px"
            className="object-cover"
            fallback={<ImagePlaceholder />}
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      {/* Event Header */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              {event.title}
            </h1>
            {headerActions}
          </div>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Date and Time */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 text-primary-600 mt-1" aria-hidden="true" />
              <div>
                <h3 className="font-semibold text-neutral-900">Fecha y hora</h3>
                <p className="text-neutral-600">{formatDateRange(event.start_date, event.end_date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
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
                    <div className="flex items-center gap-2">
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
                    <div className="flex items-center gap-2">
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

        {/* Footer Actions Slot */}
        {footerActions && (
          <div className="border-t border-neutral-100 pt-6">
            {footerActions}
          </div>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Descripción</h2>
          {descriptionMode === 'html' ? (
            <div
              className="prose prose-lg max-w-none text-neutral-700"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          ) : (
            <p className="text-neutral-700 whitespace-pre-wrap">{event.description}</p>
          )}
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
  );
}
