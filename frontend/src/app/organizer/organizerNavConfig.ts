import { Calendar, Home, PlusCircle } from 'lucide-react'

import type { AppShellConfig } from '@/shared/components/layout/types'

export const organizerNavConfig: AppShellConfig = {
  brandTitle: 'Demo Region',
  brandSubtitle: 'Organizador',
  headerSubtitle: 'Panel de Organizador',
  collapsible: false,
  showSearch: false,
  showNotifications: false,
  defaultTitle: 'Panel Organizador',
  routeTitles: {
    '/organizer/dashboard': 'Dashboard',
    '/organizer/calendar': 'Mi Calendario',
    '/organizer/create': 'Crear Evento',
  },
  navSections: [
    {
      name: 'Principal',
      items: [
        { name: 'Dashboard', href: '/organizer/dashboard', icon: Home },
        {
          name: 'Mi Calendario',
          href: '/organizer/calendar',
          icon: Calendar,
        },
        { name: 'Crear Evento', href: '/organizer/create', icon: PlusCircle },
      ],
    },
  ],
}
