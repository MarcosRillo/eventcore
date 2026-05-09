import { Metadata } from 'next'

import { LandingContainer } from '@/features/landing/components/smart/LandingContainer'

export const revalidate = 60
import * as cachedEvents from '@/features/public-calendar/services/public-events.cached'

export const metadata: Metadata = {
  title: 'eventcore - Turismo y Cultura',
  description:
    'Descubrí los mejores eventos turísticos y culturales de Tucumán. Música, arte, gastronomía, festivales y mucho más. Plataforma oficial de eventos.',
  keywords:
    'demo region, turismo, eventos, calendario, festivales, cultura, actividades, argentina, noroeste argentino',
  openGraph: {
    title: 'eventcore - Turismo y Cultura',
    description:
      'Descubrí los mejores eventos turísticos y culturales de Tucumán',
    type: 'website',
    locale: 'es_AR',
    siteName: 'eventcore',
    images: ['https://res.cloudinary.com/dgosruiim/image/upload/v1774742936/events/seed/seed_1.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'eventcore - Turismo y Cultura',
    description:
      'Descubrí los mejores eventos turísticos y culturales de Tucumán'
  },
  alternates: {
    canonical: '/'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

export default async function HomePage() {
  // Fetch data server-side (parallel) with React.cache for request deduplication
  const [featuredResponse, eventTypesResponse] = await Promise.all([
    cachedEvents.getFeatured().catch(() => ({ data: [] })),
    cachedEvents.getEventTypes().catch(() => ({ data: [] }))
  ])

  return (
    <LandingContainer
      initialFeaturedEvents={featuredResponse.data}
      initialEventTypes={eventTypesResponse.data}
    />
  )
}
