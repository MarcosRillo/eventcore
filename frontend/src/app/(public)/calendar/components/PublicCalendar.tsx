'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import '../calendar.css';
import { Event } from '@/types/event.types';
import { apiClient } from '@/lib/api';

moment.locale('es');
const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Event;
}

interface PublicCalendarProps {
  initialEvents?: Event[];
  selectedDate?: Date;
  onEventSelect?: (event: Event) => void;
  filters?: {
    category_id?: number;
    search?: string;
  };
}

export default function PublicCalendar({
  initialEvents = [],
  selectedDate = new Date(),
  onEventSelect,
  filters = {}
}: PublicCalendarProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [currentView, setCurrentView] = useState<View>('month');

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start_date),
      end: new Date(event.end_date || event.start_date),
      resource: event,
    }));
  }, [events]);

  const fetchEvents = async (date: Date) => {
    setLoading(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const response = await apiClient.get<{events: Event[]}>(`/public/events/calendar/${year}/${month}`);
      setEvents(response.events);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(currentDate);
  }, [currentDate, filters]);

  const handleSelectEvent = (calendarEvent: CalendarEvent) => {
    if (onEventSelect) {
      onEventSelect(calendarEvent.resource);
    }
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const eventData = event.resource;
    const backgroundColor = eventData.category?.color || '#228B22';
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500'
      }
    };
  };

  const dayPropGetter = (date: Date) => {
    const isToday = moment(date).isSame(moment(), 'day');
    
    if (isToday) {
      return {
        className: 'today-highlight',
        style: {
          backgroundColor: '#f0f9ff'
        }
      };
    }
    
    return {};
  };

  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay eventos en este rango',
    showMore: (total: number) => `+${total} más`
  };

  return (
    <div className="h-[600px] w-full">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      )}
      
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleSelectEvent}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        view={currentView}
        date={currentDate}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        messages={messages}
        popup
        showMultiDayTimes
        step={60}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        className="bg-white rounded-lg shadow-sm"
        formats={{
          monthHeaderFormat: 'MMMM YYYY',
          dayHeaderFormat: 'dddd DD/MM',
          weekdayFormat: 'ddd',
          dayFormat: 'DD',
          timeGutterFormat: 'HH:mm',
          eventTimeRangeFormat: ({ start, end }) => 
            `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
          agendaDateFormat: 'ddd DD/MM/YYYY',
          agendaTimeFormat: 'HH:mm',
          agendaTimeRangeFormat: ({ start, end }) =>
            `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
        }}
      />
    </div>
  );
}