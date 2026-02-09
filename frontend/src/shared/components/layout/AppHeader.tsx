'use client'

import { Bell, Menu, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { memo } from 'react'

import type { AppShellConfig } from '@/shared/components/layout/types'
import { UserMenu } from '@/shared/components/layout/UserMenu'
import type { User } from '@/types/auth.types'

interface AppHeaderProps {
  config: Pick<
    AppShellConfig,
    | 'routeTitles'
    | 'defaultTitle'
    | 'headerSubtitle'
    | 'showSearch'
    | 'showNotifications'
  >
  user: User
  onLogout: () => void
  onToggleSidebar: () => void
}

const AppHeader = memo(function AppHeader({
  config,
  user,
  onLogout,
  onToggleSidebar,
}: AppHeaderProps) {
  const pathname = usePathname()

  const pageTitle = config.routeTitles[pathname] ?? config.defaultTitle

  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm relative z-10">
      <div className="h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-full">
          {/* Left side - Title */}
          <div className="flex items-center gap-4">
            {/* Mobile sidebar toggle */}
            <button
              onClick={onToggleSidebar}
              className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-150 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
              aria-label="Abrir menu de navegacion"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>

            <div>
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                {pageTitle}
              </h1>
              {config.headerSubtitle ? (
                <p className="text-sm text-neutral-500 hidden sm:block font-medium">
                  {config.headerSubtitle}
                </p>
              ) : null}
            </div>
          </div>

          {/* Right side - Actions and user menu */}
          <div className="flex items-center gap-3">
            {/* Quick actions */}
            <div className="hidden md:flex items-center gap-2">
              {config.showSearch ? (
                <button
                  className="p-2.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-150 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                  aria-label="Buscar"
                >
                  <Search className="w-5 h-5" aria-hidden="true" />
                </button>
              ) : null}

              {config.showNotifications ? (
                <button
                  className="p-2.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all duration-150 relative shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                  aria-label="Ver notificaciones"
                >
                  <Bell className="w-5 h-5" aria-hidden="true" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-error-500 border-2 border-white rounded-full animate-pulse shadow-sm" />
                </button>
              ) : null}
            </div>

            <UserMenu user={user} onLogout={onLogout} />
          </div>
        </div>
      </div>
    </header>
  )
})

export { AppHeader }
