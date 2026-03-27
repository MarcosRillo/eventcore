/**
 * EventDetailModal - Unified Component
 * Consolidated EventDetailModal supporting multiple contexts: public, admin, dashboard
 * Replaces 3 duplicate implementations with a single, flexible component
 */

'use client';

import { format, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  Star,
} from 'lucide-react';
import { useState } from 'react';

import { eventPublicExportService } from '@/features/events/services/eventPublicService';
import { Button } from '@/shared/components/form';
import ConfirmDialog from '@/shared/components/modals/ConfirmDialog';
import Modal from '@/shared/components/modals/Modal';
import { Event } from '@/types/event.types';

// Context-specific configuration
export type EventDetailContext = 'public' | 'admin' | 'dashboard';

export interface EventDetailModalProps {
  // Core props
  isOpen: boolean;
  event: Event | null;
  onClose: () => void;

  // Context configuration
  context?: EventDetailContext;

  // Admin/Dashboard actions
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: number) => void;

  // Double-Level Workflow Actions (admin context)
  onApproveInternal?: (event: Event) => void;
  onRequestPublicApproval?: (event: Event) => void;
  onPublishEvent?: (event: Event) => void;
  onRequestChanges?: (event: Event) => void;
  onReject?: (event: Event) => void;

  // Legacy compatibility
  onApprove?: (event: Event) => void;

  // Dashboard specific
  eventId?: number; // For dashboard context
  onActionComplete?: () => void;

  // Public context features
  showSharing?: boolean;
  showExport?: boolean;
}

// Share buttons component for public context
const ShareButtons = ({ event }: { event: Event }) => {
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `${event.title} - ${event.description}`;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    };

    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="text-blue-600 border-blue-600 hover:bg-blue-50"
      >
        Facebook
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="text-sky-600 border-sky-600 hover:bg-sky-50"
      >
        Twitter
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('whatsapp')}
        className="text-green-600 border-green-600 hover:bg-green-50"
      >
        WhatsApp
      </Button>
    </div>
  );
};

export const EventDetailModal = ({
  isOpen,
  event,
  onClose,
  context = 'public',
  onEdit,
  onDelete,
  onApproveInternal,
  onRequestPublicApproval,
  onPublishEvent,
  onRequestChanges,
  onReject,
  onApprove,
  onActionComplete,
  showSharing = context === 'public',
  showExport = context === 'public',
}: EventDetailModalProps) => {
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'info' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
    onConfirm: () => {},
  });

  if (!event) return null;

  // Helper functions
  const ENTE_TURISMO_ORG_ID = 1;
  const isEnteEvent = event.organizer?.id === ENTE_TURISMO_ORG_ID;

  // Date formatting (unified for all contexts)
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es });
  };

  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), 'HH:mm', { locale: es });
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = parseISO(startDate);
    const end = endDate ? parseISO(endDate) : start;

    if (isSameDay(start, end)) {
      return `${formatDate(startDate)} de ${formatTime(startDate)} a ${formatTime(endDate || startDate)}`;
    } else {
      return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatDate(endDate || startDate)} ${formatTime(endDate || startDate)}`;
    }
  };

  const getDuration = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  };

  // Location helpers
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

  // Export handlers
  const handleAddToGoogleCalendar = () => {
    const url = eventPublicExportService.getGoogleCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAddToOutlookCalendar = () => {
    const url = eventPublicExportService.getOutlookCalendarUrl(event);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadICS = async () => {
    try {
      await eventPublicExportService.downloadICalFile();
    } catch {
    }
  };

  // Action handlers with confirmations
  const handleDelete = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Evento',
      message: '¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.',
      variant: 'danger',
      onConfirm: () => {
        onDelete?.(event.id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        onActionComplete?.();
        onClose();
      },
    });
  };

  const handleReject = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Rechazar Evento',
      message: '¿Estás seguro de que quieres rechazar este evento?',
      variant: 'warning',
      onConfirm: () => {
        onReject?.(event);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        onActionComplete?.();
      },
    });
  };

  // Status display helper
  const getStatusDisplay = () => {
    if (typeof event.status === 'object' && event.status?.status_name) {
      return event.status.status_name;
    }
    return typeof event.status === 'string' ? event.status : 'Estado desconocido';
  };

  // Context-specific action buttons
  const renderActionButtons = () => {
    if (context === 'public') {
      return (
        <div className="flex flex-col sm:flex-row gap-3">
          {showExport && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToGoogleCalendar}
                leftIcon={<Calendar className="w-4 h-4" />}
              >
                Google Calendar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddToOutlookCalendar}
                leftIcon={<Calendar className="w-4 h-4" />}
              >
                Outlook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadICS}
              >
                Descargar ICS
              </Button>
            </div>
          )}
          {showSharing && <ShareButtons event={event} />}
        </div>
      );
    }

    if (context === 'admin' || context === 'dashboard') {
      return (
        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(event)}
            >
              Editar
            </Button>
          )}
          {onApproveInternal && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onApproveInternal(event)}
            >
              Aprobar Internamente
            </Button>
          )}
          {onRequestPublicApproval && (
            <Button
              variant="warning"
              size="sm"
              onClick={() => onRequestPublicApproval(event)}
            >
              Solicitar Aprobación Pública
            </Button>
          )}
          {onPublishEvent && (
            <Button
              variant="success"
              size="sm"
              onClick={() => onPublishEvent(event)}
            >
              Publicar
            </Button>
          )}
          {onRequestChanges && (
            <Button
              variant="warning"
              size="sm"
              onClick={() => onRequestChanges(event)}
            >
              Solicitar Cambios
            </Button>
          )}
          {onReject && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
            >
              Rechazar
            </Button>
          )}
          {onApprove && (
            <Button
              variant="success"
              size="sm"
              onClick={() => onApprove(event)}
            >
              Aprobar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          )}
        </div>
      );
    }

    return null;
  };

  const titleContent = (
    <div>
      <div className="flex items-center gap-3">
        <span>{event.title}</span>
        {event.is_featured && (
          <Star className="w-6 h-6 text-warning-500 flex-shrink-0 fill-warning-500" />
        )}
      </div>
      {(context === 'admin' || context === 'dashboard') && (
        <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
          {getStatusDisplay()}
        </span>
      )}
      {context === 'admin' && event.organizer && (
        <div className="mt-2 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-neutral-500" />
          <span className="text-sm text-neutral-600">{event.organizer.organization || event.organizer.name}</span>
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
            isEnteEvent ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-700'
          }`}>
            {isEnteEvent ? 'Interno' : 'Externo'}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={titleContent}
        size="full"
        showCloseButton={true}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {event.description && (
              <div>
                <h4 className="text-lg font-medium text-neutral-900 mb-3">Descripción</h4>
                <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            {/* Virtual link */}
            {event.virtual_link && (
              <div>
                <h4 className="text-lg font-medium text-neutral-900 mb-3">Enlace Virtual</h4>
                <a
                  href={event.virtual_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Unirse al evento virtual
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4">
              {renderActionButtons()}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Date and time */}
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-neutral-500" />
                <h4 className="font-medium text-neutral-900">Fecha y hora</h4>
              </div>
              <p className="text-neutral-700 text-sm leading-relaxed">
                {formatDateRange(event.start_date, event.end_date)}
              </p>
              {event.start_date && event.end_date && (
                <p className="text-neutral-500 text-sm mt-1">
                  Duración: {getDuration(new Date(event.start_date), new Date(event.end_date))}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-neutral-500" />
                <h4 className="font-medium text-neutral-900">Ubicación</h4>
              </div>
              <p className="text-neutral-700 text-sm">
                {getLocation()}
              </p>
              {getLocationAddress() && (
                <p className="text-neutral-500 text-sm mt-1">
                  {getLocationAddress()}
                </p>
              )}
            </div>

            {/* Capacity */}
            {event.max_attendees && (
              <div className="bg-neutral-50 rounded-lg p-4">
                <h4 className="font-medium text-neutral-900 mb-3">Capacidad</h4>
                <p className="text-neutral-700 text-sm">
                  Máximo {event.max_attendees} asistentes
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
};

export default EventDetailModal;
