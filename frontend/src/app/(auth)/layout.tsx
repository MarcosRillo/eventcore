/**
 * Auth Layout - Minimalist Design System
 * Layout wrapper for authentication pages (login, register, etc.)
 * Includes PublicHeader and Footer for consistent navigation
 */

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { Footer,PublicHeader } from '@/features/landing/components/dumb'

export const metadata: Metadata = {
  title: {
    template: '%s | Eventos Tucumán',
    default: 'Autenticación | Eventos Tucumán',
  },
  description: 'Accedé a tu cuenta para gestionar eventos turísticos',
  robots: {
    index: false,
    follow: false,
  },
}

interface AuthLayoutProps {
  children: ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 bg-neutral-50">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default AuthLayout
