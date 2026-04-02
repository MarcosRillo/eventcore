'use client'

import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useMemo } from 'react'

import { getAdminNavConfig } from '@/app/(admin)/adminNavConfig'
import { useAuth } from '@/context/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { LoadingSpinner } from '@/shared/components/feedback'
import { AppShell } from '@/shared/components/layout'

const PageLoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner size="lg" text="Cargando contenido..." />
  </div>
)

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, isLoading, logout } = useAuth()
  const { hasRole } = usePermissions()
  const router = useRouter()

  const config = useMemo(() => {
    const canManageUsers =
      hasRole('entity_admin') || hasRole('platform_admin')

    return getAdminNavConfig({ canManageUsers })
  }, [hasRole])

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
    <AppShell config={config} user={user} onLogout={logout}>
      <Suspense fallback={<PageLoadingFallback />}>{children}</Suspense>
    </AppShell>
  )
}

export default AdminLayout
