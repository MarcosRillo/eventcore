import {
  Briefcase,
  Calendar,
  ClipboardList,
  Home,
  LayoutGrid,
  Mail,
  MapPin,
  Store,
  Ticket,
  Users,
} from 'lucide-react'

import type { AppShellConfig } from '@/shared/components/layout/types'

interface AdminNavOptions {
  canManageUsers: boolean
}

export function getAdminNavConfig(options: AdminNavOptions): AppShellConfig {
  return {
    brandTitle: 'Tucumán',
    brandSubtitle: 'Turismo',
    headerSubtitle: 'Ente de Turismo de Tucumán - Gestión de eventos',
    collapsible: true,
    showSearch: true,
    showNotifications: true,
    defaultTitle: 'Panel de Administración',
    routeTitles: {
      '/': 'Dashboard',
      '/internal-calendar': 'Calendario Interno',
      '/events': 'Gestión de Eventos',
      '/event-types': 'Gestión de Tipos de Evento',
      '/locations': 'Gestión de Ubicaciones',
      '/sectors': 'Gestión de Sectores',
      '/organizations': 'Gestión de Organizaciones',
      '/users': 'Gestión de Usuarios',
      '/invitations': 'Gestión de Invitaciones',
      '/registration-requests': 'Solicitudes de Registro',
    },
    navSections: [
      {
        name: 'Principal',
        items: [
          { name: 'Dashboard', href: '/', icon: Home },
          {
            name: 'Calendario Interno',
            href: '/internal-calendar',
            icon: Calendar,
          },
        ],
      },
      {
        name: 'Gestión de Eventos',
        items: [
          { name: 'Eventos', href: '/events', icon: Ticket },
          {
            name: 'Tipos de Evento',
            href: '/event-types',
            icon: LayoutGrid,
          },
          { name: 'Ubicaciones', href: '/locations', icon: MapPin },
          { name: 'Sectores', href: '/sectors', icon: Briefcase },
        ],
      },
      {
        name: 'Gestión de Usuarios',
        items: [
          { name: 'Organizaciones', href: '/organizations', icon: Store },
          ...(options.canManageUsers
            ? [{ name: 'Usuarios', href: '/users', icon: Users }]
            : []),
          { name: 'Invitaciones', href: '/invitations', icon: Mail },
          {
            name: 'Solicitudes',
            href: '/registration-requests',
            icon: ClipboardList,
          },
        ],
      },
    ],
  }
}
