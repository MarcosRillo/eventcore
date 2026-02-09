/**
 * EventInfoPanel Component
 *
 * Displays complete event information in the management modal.
 * Dumb component - receives event data via props.
 */

import {
  Calendar,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star,
  Tag,
  User,
} from 'lucide-react';

import { Badge, ImagePlaceholder, SafeImage } from '@/shared/components/display';
import type { Event } from '@/types/event.types';

interface EventInfoPanelProps {
  event: Event;
}

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time for display
 */
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate duration in hours
 */
const calculateDuration = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded}\u00A0h`;
};

const imagePlaceholder = <ImagePlaceholder />;

export const EventInfoPanel = ({ event }: EventInfoPanelProps) => {
  return (
    <div className="divide-y divide-neutral-100">
      {/* Event Image */}
      <div className="pb-5">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-neutral-100">
          {event.featured_image ? (
            <SafeImage
              src={event.featured_image}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-cover"
              loading="lazy"
              fallback={imagePlaceholder}
            />
          ) : (
            imagePlaceholder
          )}
          {event.is_featured && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="warning" size="sm" dot>
                <Star className="w-3 h-3 mr-1" />
                Destacado
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <div className="pt-5">
          <h4 className="text-sm font-medium text-neutral-500 mb-2">Descripción</h4>
          <p className="text-neutral-700 whitespace-pre-wrap text-sm">
            {event.description}
          </p>
        </div>
      )}

      {/* Date and Time */}
      <div className="pt-5">
        <h4 className="text-sm font-medium text-neutral-500 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Fecha y Hora
        </h4>
        <div className="text-neutral-700 text-sm">
          <p className="font-medium">{formatDate(event.start_date)}</p>
          <p>
            {formatTime(event.start_date)}
            {event.end_date && (
              <>
                {' - '}
                {formatTime(event.end_date)}
                <span className="text-neutral-400 ml-2">
                  ({calculateDuration(event.start_date, event.end_date)})
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Locations */}
      {event.locations && event.locations.length > 0 && (
        <div className="pt-5">
          <h4 className="text-sm font-medium text-neutral-500 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Ubicación{event.locations.length > 1 ? 'es' : ''}
          </h4>
          <div className="space-y-2">
            {event.locations.map((location) => (
              <div key={location.id} className="text-sm">
                <p className="font-medium text-neutral-700">{location.name}</p>
                {location.address && (
                  <p className="text-neutral-500">
                    {location.address}
                    {location.city && `, ${location.city}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Type */}
      {(event.event_type || event.event_subtype) && (
        <div className="pt-5">
          <h4 className="text-sm font-medium text-neutral-500 mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Tipo de Evento
          </h4>
          <div className="flex items-center gap-2">
            {event.event_type && (
              <span className="px-2 py-1 rounded-md text-sm bg-neutral-100 text-neutral-700">
                {event.event_type.name}
              </span>
            )}
            {event.event_subtype && (
              <>
                <span className="text-neutral-400">&rsaquo;</span>
                <span className="px-2 py-1 rounded-md text-sm bg-neutral-100 text-neutral-700">
                  {event.event_subtype.name}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Contact Information */}
      {(event.contact_email || event.contact_phone || event.website_url) && (
        <div className="pt-5">
          <h4 className="text-sm font-medium text-neutral-500 mb-2">Contacto</h4>
          <div className="space-y-1">
            {event.contact_email && (
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Mail className="w-4 h-4 text-neutral-400" />
                <a
                  href={`mailto:${event.contact_email}`}
                  className="hover:text-primary-600 transition-colors"
                >
                  {event.contact_email}
                </a>
              </div>
            )}
            {event.contact_phone && (
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Phone className="w-4 h-4 text-neutral-400" />
                <a
                  href={`tel:${event.contact_phone}`}
                  className="hover:text-primary-600 transition-colors"
                >
                  {event.contact_phone}
                </a>
              </div>
            )}
            {event.website_url && (
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Globe className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <a
                  href={event.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 transition-colors truncate max-w-xs"
                >
                  {event.website_url}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Organizer */}
      {event.organizer && (
        <div className="pt-5">
          <h4 className="text-sm font-medium text-neutral-500 mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            Organizador
          </h4>
          <div className="text-sm">
            <p className="font-medium text-neutral-700">{event.organizer.name}</p>
            {event.organizer.organization && (
              <p className="text-neutral-500">{event.organizer.organization}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventInfoPanel;
