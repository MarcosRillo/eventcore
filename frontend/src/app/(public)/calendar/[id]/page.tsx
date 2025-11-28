import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import apiClient from '@/services/apiClient';
import { Event } from '@/types/event.types';
import EventDetailPage from './EventDetailPage';

interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  try {
    // Try to get the event by ID
    const { id } = await params;
    const eventId = parseInt(id) || id;
    const response = await apiClient.get<{data: Event}>(`/public/events/${eventId}`);
    const event = response.data.data;

    const eventUrl = `/calendar/${id}`;
    const eventDate = new Date(event.start_date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      title: `${event.title} - Eventos Tucumán`,
      description: event.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `${event.title} - ${eventDate}`,
      keywords: `tucuman, turismo, evento, ${event.title}, ${event.category?.name}`,
      openGraph: {
        title: event.title,
        description: event.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `${event.title} - ${eventDate}`,
        type: 'article',
        locale: 'es_AR',
        publishedTime: event.created_at,
        modifiedTime: event.updated_at,
        images: event.featured_image ? [
          {
            url: event.featured_image,
            width: 1200,
            height: 630,
            alt: event.title,
          }
        ] : [],
        section: event.category?.name || 'Eventos',
      },
      twitter: {
        card: 'summary_large_image',
        title: event.title,
        description: event.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `${event.title} - ${eventDate}`,
        images: event.featured_image ? [event.featured_image] : [],
      },
      alternates: {
        canonical: eventUrl
      },
      other: {
        'event:start_time': event.start_date,
        'event:end_time': event.end_date || event.start_date,
        'event:location': event.location?.name || event.location_text || '',
      }
    };
  } catch {
    return {
      title: 'Evento no encontrado - Tucumán Turismo',
      description: 'El evento solicitado no fue encontrado o no está disponible.',
    };
  }
}

export default async function EventPage({ params }: EventPageProps) {
  try {
    // Try to get the event by ID
    const { id } = await params;
    const eventId = parseInt(id) || id;
    const response = await apiClient.get<{data: Event}>(`/public/events/${eventId}`);
    const event = response.data.data;

    return <EventDetailPage event={event} />;
  } catch {
    notFound();
  }
}