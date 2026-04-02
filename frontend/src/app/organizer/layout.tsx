'use client'

import { useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import { organizerNavConfig } from '@/app/organizer/organizerNavConfig'
import { useAuth } from '@/context/AuthContext'
import { LoadingSpinner } from '@/shared/components/feedback'
import { AppShell } from '@/shared/components/layout'

const PageLoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner size="lg" text="Cargando contenido..." />
  </div>
)

interface OrganizerLayoutProps {
  children: React.ReactNode
}

export default function OrganizerLayout({ children }: OrganizerLayoutProps) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando..." />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirigiendo..." />
      </div>
    )
  }

  return (
    <AppShell config={organizerNavConfig} user={user} onLogout={logout}>
      <Suspense fallback={<PageLoadingFallback />}>{children}</Suspense>
    </AppShell>
  )
}
