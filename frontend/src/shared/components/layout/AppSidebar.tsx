'use client'

import { Calendar, ChevronsLeft } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo } from 'react'

import type { AppShellConfig } from '@/shared/components/layout/types'

interface AppSidebarProps {
  config: Pick<
    AppShellConfig,
    'brandTitle' | 'brandSubtitle' | 'navSections' | 'collapsible'
  >
  isCollapsed: boolean
  onToggleCollapse: () => void
}

function isActiveLink(href: string, pathname: string): boolean {
  if (href === '/' || href === '/organizer/dashboard') {
    return pathname === href
  }
  return pathname.startsWith(href)
}

const AppSidebar = memo(function AppSidebar({
  config,
  isCollapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={`bg-white border-r border-neutral-200 transition-all duration-150 h-full ${
        isCollapsed ? 'w-16' : 'w-64'
      } flex flex-col`}
    >
      {/* Logo and toggle button */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
        {isCollapsed ? null : (
          <div className="flex items-center gap-3">
            <Calendar className="w-10 h-10 text-primary-500" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-neutral-900 leading-tight">
                {config.brandTitle}
              </span>
              {config.brandSubtitle ? (
                <span className="text-xs text-neutral-500 leading-tight">
                  {config.brandSubtitle}
                </span>
              ) : null}
            </div>
          </div>
        )}

        {config.collapsible ? (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
          >
            <ChevronsLeft
              className={`w-5 h-5 transition-transform duration-150 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>

      {/* Navigation */}
      <nav
        aria-label="Navegacion principal"
        className="flex-1 px-3 py-6 space-y-6 overflow-y-auto"
      >
        {config.navSections.map((section) => {
          if (section.items.length === 0) {
            return null
          }

          return (
            <div key={section.name}>
              {isCollapsed ? null : (
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 px-3">
                  {section.name}
                </h3>
              )}

              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = isActiveLink(item.href, pathname)
                  const Icon = item.icon

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                          active
                            ? 'bg-primary-50 text-primary-600 border-l-2 border-primary-500'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }`}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <span
                          className={`flex-shrink-0 ${
                            active ? 'text-primary-600' : 'text-neutral-500'
                          }`}
                        >
                          <Icon className="w-5 h-5" aria-hidden="true" />
                        </span>

                        {isCollapsed ? null : (
                          <>
                            <span className="ml-3 flex-1 font-medium">
                              {item.name}
                            </span>
                            {item.badge ? (
                              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-primary-100 text-primary-700 rounded-full">
                                {item.badge}
                              </span>
                            ) : null}
                          </>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-200 bg-neutral-50 p-4">
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-neutral-600">T</span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs text-neutral-600 font-medium">
              Demo Organization
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              © 2025 • v1.0.0
            </p>
          </div>
        )}
      </div>
    </div>
  )
})

export { AppSidebar }
