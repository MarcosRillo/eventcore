import { Metadata } from 'next'
import { PublicCalendarContainer } from '@/features/public-calendar/components/smart/PublicCalendarContainer'

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

export default function CalendarPage() {
  return <PublicCalendarContainer />
}