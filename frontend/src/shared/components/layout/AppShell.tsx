'use client'

import { type ReactNode, useCallback, useState } from 'react'

import { AppHeader } from '@/shared/components/layout/AppHeader'
import { AppSidebar } from '@/shared/components/layout/AppSidebar'
import type { AppShellConfig } from '@/shared/components/layout/types'
import type { User } from '@/types/auth.types'

interface AppShellProps {
  config: AppShellConfig
  user: User
  onLogout: () => void
  children: ReactNode
}

function AppShell({ config, user, onLogout, children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={handleToggleSidebar}
          role="presentation"
        >
          <div className="absolute inset-0 bg-neutral-600 opacity-75" />
        </div>
      ) : null}

      <div className="flex h-screen">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            isSidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <AppSidebar
            config={{
              brandTitle: config.brandTitle,
              brandSubtitle: config.brandSubtitle,
              navSections: config.navSections,
              collapsible: config.collapsible,
            }}
            isCollapsed={false}
            onToggleCollapse={handleToggleSidebar}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AppHeader
            config={{
              routeTitles: config.routeTitles,
              defaultTitle: config.defaultTitle,
              headerSubtitle: config.headerSubtitle,
              showSearch: config.showSearch,
              showNotifications: config.showNotifications,
            }}
            user={user}
            onLogout={onLogout}
            onToggleSidebar={handleToggleSidebar}
          />

          <main
            className="flex-1 relative overflow-y-auto"
            role="main"
          >
            <div className="py-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}

export { AppShell }
