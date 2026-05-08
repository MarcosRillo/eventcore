import axios from 'axios';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import EventDetailPage from '@/features/public-calendar/components/dumb/EventDetailPage';
import publicApiClient from '@/services/publicApiClient';
import { Event } from '@/types/event.types';

export const revalidate = 60;

interface EventPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 *
 * @param root0
 * @param root0.params
 */
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  try {
    // Try to get the event by ID
    const { id } = await params;
    const eventId = parseInt(id) || id;
    const response = await publicApiClient.get<{data: Event}>(`/public/events/${eventId}`);
    const event = response.data.data;

    const eventUrl = `/calendar/${id}`;
    const eventDate = new Date(event.start_date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      title: `${event.title} - eventcore`,
      description: event.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `${event.title} - ${eventDate}`,
      keywords: `demo region, turismo, evento, ${event.title}`,
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
        section: 'Eventos',
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
      title: 'Evento no encontrado - Demo Region Turismo',
      description: 'El evento solicitado no fue encontrado o no está disponible.',
    };
  }
}

/**
 *
 * @param root0
 * @param root0.params
 */
export default async function EventPage({ params }: EventPageProps) {
  try {
    // Try to get the event by ID
    const { id } = await params;
    const eventId = parseInt(id) || id;
    const response = await publicApiClient.get<{data: Event}>(`/public/events/${eventId}`);
    const event = response.data.data;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.title,
      startDate: event.start_date,
      endDate: event.end_date || event.start_date,
      description: event.description?.replace(/<[^>]*>/g, '').substring(0, 500) || '',
      ...(event.featured_image && { image: event.featured_image }),
      ...(event.location && {
        location: {
          '@type': 'Place',
          name: event.location.name,
          ...(event.location.address && {
            address: {
              '@type': 'PostalAddress',
              streetAddress: event.location.address,
            },
          }),
        },
      }),
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
        <EventDetailPage event={event} />
      </>
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      notFound();
    }
    throw error;
  }
}