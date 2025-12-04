/**
 * EventInfoPanel Component
 *
 * Displays complete event information in the management modal.
 * Dumb component - receives event data via props.
 */

import {
  CalendarIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  UserIcon,
  StarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
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
  return `${hours.toFixed(1)}h`;
};

export const EventInfoPanel = ({ event }: EventInfoPanelProps) => {
  return (
    <div className="space-y-6">
      {/* Title and Featured Badge */}
      <div>
        <div className="flex items-start gap-2">
          <h3 className="text-xl font-bold text-neutral-900 flex-1">
            {event.title}
          </h3>
          {event.is_featured && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-700">
              <StarIcon className="w-3 h-3" />
              Destacado
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <div>
          <h4 className="text-sm font-medium text-neutral-500 mb-2">Descripción</h4>
          <p className="text-neutral-700 whitespace-pre-wrap text-sm">
            {event.description}
          </p>
        </div>
      )}

      {/* Date and Time */}
      <div>
        <h4 className="text-sm font-medium text-neutral-500 mb-2 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
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
        <div>
          <h4 className="text-sm font-medium text-neutral-500 mb-2 flex items-center gap-2">
            <MapPinIcon className="w-4 h-4" />
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
        <div>
          <h4 className="text-sm font-medium text-neutral-500 mb-2 flex items-center gap-2">
            <TagIcon className="w-4 h-4" />
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
                <span className="text-neutral-400">›</span>
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
        <div>
          <h4 className="text-sm font-medium text-neutral-500 mb-2">Contacto</h4>
          <div className="space-y-1">
            {event.contact_email && (
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <EnvelopeIcon className="w-4 h-4 text-neutral-400" />
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
                <PhoneIcon className="w-4 h-4 text-neutral-400" />
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
                <GlobeAltIcon className="w-4 h-4 text-neutral-400" />
                <a
                  href={event.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 transition-colors"
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
        <div>
          <h4 className="text-sm font-medium text-neutral-500 mb-2 flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
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
