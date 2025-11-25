'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Share2, Download } from 'lucide-react';
import PublicCalendar from './components/PublicCalendar';
import PublicEventFilters, { PublicEventFiltersState } from './components/PublicEventFilters';
import { EventDetailModal } from '@/components/ui';
import { Event } from '@/types/event.types';
import { eventPublicExportService } from '@/features/events/services/eventPublicService';
import { useToast } from '@/components/ui';

export default function CalendarPageClient() {
  const { addToast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<PublicEventFiltersState>({
    search: '',
    category_id: undefined,
    month: '',
    year: ''
  });
  // Event state managed by PublicCalendar component
  // const [events, setEvents] = useState<Event[]>([]);
  // const [loading, setLoading] = useState(false);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleFiltersChange = (newFilters: PublicEventFiltersState) => {
    setFilters(newFilters);
  };

  const handleExportIcal = async () => {
    try {
      const filterParams = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
      );
      
      const blob = await eventPublicExportService.downloadICalFile(filterParams);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'eventos-tucuman.ics';
      link.click();
      
      window.URL.revokeObjectURL(url);
    } catch {
      // Silent fail - download error
    }
  };

  const handleShareCalendar = async () => {
    const url = window.location.href;
    const text = 'Calendario de Eventos de Tucumán - Descubre todos los eventos turísticos y culturales';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Calendario de Eventos - Tucumán',
          text,
          url
        });
      } catch {
        // Silent fail - share cancelled or failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        addToast({
          message: 'Enlace copiado al portapapeles',
          type: 'success',
          duration: 3000,
        });
      } catch {
        addToast({
          message: 'Error al copiar el enlace',
          type: 'error',
          duration: 5000,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <CalendarIcon className="w-12 h-12 mr-4" />
              <h1 className="text-4xl font-bold">Calendario de Eventos</h1>
            </div>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Descubre todos los eventos turísticos y culturales de Tucumán. 
              Filtra por fecha, categoría y encuentra la actividad perfecta para ti.
            </p>
            <div className="flex items-center justify-center mt-6 space-x-4">
              <button
                onClick={handleShareCalendar}
                className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Compartir calendario
              </button>
              <button
                onClick={handleExportIcal}
                className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all"
              >
                <Download className="w-5 h-5 mr-2" />
                Descargar calendario
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <PublicEventFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <PublicCalendar
            onEventSelect={handleEventSelect}
            filters={filters}
          />
        </div>

        {/* Stats or Featured Events could go here */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">500+</div>
            <div className="text-gray-600">Eventos este año</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">50+</div>
            <div className="text-gray-600">Categorías de eventos</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">24/7</div>
            <div className="text-gray-600">Información actualizada</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Cómo usar el calendario
          </h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Haz clic en cualquier evento para ver más detalles</li>
            <li>• Usa los filtros para encontrar eventos específicos</li>
            <li>• Cambia entre vista mensual, semanal y diaria</li>
            <li>• Comparte eventos en redes sociales</li>
            <li>• Descarga eventos a tu calendario personal</li>
          </ul>
        </div>
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        context="public"
        showSharing={true}
        showExport={true}
      />
    </div>
  );
}