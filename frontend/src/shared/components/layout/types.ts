import type React from 'react'

export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

export interface NavSection {
  name: string
  items: NavItem[]
}

export interface AppShellConfig {
  brandTitle: string
  brandSubtitle?: string
  navSections: NavSection[]
  routeTitles: Record<string, string>
  defaultTitle: string
  headerSubtitle?: string
  collapsible?: boolean
  showSearch?: boolean
  showNotifications?: boolean
}
