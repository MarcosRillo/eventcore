/**
 * Public Layout
 * Wraps all public-facing pages with consistent header and footer
 */

import type { Metadata } from 'next'

import { PublicHeader, Footer } from '@/features/landing/components/dumb'

export const metadata: Metadata = {
  title: {
    template: '%s | Eventos Tucumán',
    default: 'Eventos Tucumán - Calendario Turístico',
  },
  description: 'Descubrí los mejores eventos turísticos y culturales de Tucumán',
}

interface PublicLayoutProps {
  children: React.ReactNode
}

/**
 *
 * @param root0
 * @param root0.children
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
