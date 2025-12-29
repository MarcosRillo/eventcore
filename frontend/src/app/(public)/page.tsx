import { Metadata } from 'next'

import { LandingContainer } from '@/features/landing/components/smart/LandingContainer'

export const metadata: Metadata = {
  title: 'Eventos Tucumán - Turismo y Cultura',
  description:
    'Descubrí los mejores eventos turísticos y culturales de Tucumán. Música, arte, gastronomía, festivales y mucho más. Plataforma oficial de eventos.',
  keywords:
    'tucuman, turismo, eventos, calendario, festivales, cultura, actividades, argentina, noroeste argentino',
  openGraph: {
    title: 'Eventos Tucumán - Turismo y Cultura',
    description:
      'Descubrí los mejores eventos turísticos y culturales de Tucumán',
    type: 'website',
    locale: 'es_AR',
    siteName: 'Eventos Tucumán'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eventos Tucumán - Turismo y Cultura',
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

/**
 *
 */
export default function HomePage() {
  return <LandingContainer />
}
