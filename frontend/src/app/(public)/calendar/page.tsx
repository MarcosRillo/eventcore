import { endOfMonth,format, startOfMonth } from 'date-fns'
import { Metadata } from 'next'

import { CalendarPageContainer } from '@/features/public-calendar/components/smart/CalendarPageContainer'

export const revalidate = 30
import * as cachedEvents from '@/features/public-calendar/services/public-events.cached'
import { publicEventsService } from '@/features/public-calendar/services/public-events.service'

export const metadata: Metadata = {
  title: 'Eventos en Tucumán - Calendario Turístico',
  description:
    'Descubrí los mejores eventos turísticos y culturales de Tucumán. Música, arte, gastronomía y más.',
  keywords: 'tucuman, turismo, eventos, calendario, festivales, cultura, actividades',
  openGraph: {
    title: 'Eventos en Tucumán',
    description: 'Calendario de eventos turísticos y culturales',
    type: 'website',
    locale: 'es_AR'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eventos en Tucumán',
    description: 'Calendario de eventos turísticos y culturales'
  },
  alternates: {
    canonical: '/calendar'
  }
}

/**
 * Public Calendar Page
 * Server Component - fetches data server-side for SEO and performance
 */
export default async function CalendarPage() {
  const now = new Date()

  // Fetch all data server-side in parallel with React.cache for request deduplication
  const [statsResponse, eventsResponse, eventTypesResponse, locationsResponse] =
    await Promise.all([
      cachedEvents.getStats().catch(() => ({ data: null })),
      publicEventsService
        .getAll({
          start_date: format(startOfMonth(now), 'yyyy-MM-dd'),
          end_date: format(endOfMonth(now), 'yyyy-MM-dd'),
        })
        .catch(() => ({ data: [] })),
      cachedEvents.getEventTypes().catch(() => ({ data: [] })),
      cachedEvents.getLocations().catch(() => ({ data: [] })),
    ])

  return (
    <CalendarPageContainer
      initialStats={statsResponse.data}
      initialEvents={eventsResponse.data}
      initialEventTypes={eventTypesResponse.data}
      initialLocations={locationsResponse.data}
    />
  )
}