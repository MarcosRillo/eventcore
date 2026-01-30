'use client';

import {
  Calendar,
  ChevronsLeft,
  ClipboardList,
  Home,
  LayoutGrid,
  Mail,
  MapPin,
  Paintbrush,
  Store,
  Ticket,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { usePermissions } from '@/hooks/usePermissions';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface SidebarSection {
  name: string;
  items: SidebarItem[];
}

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const pathname = usePathname();
  const { hasRole } = usePermissions();

  // Check if user can access entity dashboard
  const canAccessEntityDashboard = hasRole('entity_admin') || hasRole('entity_staff');

  // Check if user can manage team users (entity_staff)
  const canManageUsers = hasRole('entity_admin') || hasRole('platform_admin');

  const sidebarSections: SidebarSection[] = [
    {
      name: 'Principal',
      items: [
        {
          name: 'Dashboard',
          href: '/',
          icon: <Home className="w-5 h-5" />,
        },
        {
          name: 'Calendario Interno',
          href: '/internal-calendar',
          icon: <Calendar className="w-5 h-5" />,
        },
      ],
    },
    {
      name: 'Gestión de Eventos',
      items: [
        {
          name: 'Eventos',
          href: '/events',
          icon: <Ticket className="w-5 h-5" />,
          ...(canAccessEntityDashboard && { badge: '5' }),
        },
        {
          name: 'Tipos de Evento',
          href: '/event-types',
          icon: <LayoutGrid className="w-5 h-5" />,
        },
        {
          name: 'Ubicaciones',
          href: '/locations',
          icon: <MapPin className="w-5 h-5" />,
        },
      ],
    },
    {
      name: 'Gestión de Usuarios',
      items: [
        {
          name: 'Organizaciones',
          href: '/organizations',
          icon: <Store className="w-5 h-5" />,
        },
        ...(canManageUsers ? [{
          name: 'Usuarios',
          href: '/users',
          icon: <Users className="w-5 h-5" />,
        }] : []),
        {
          name: 'Invitaciones',
          href: '/invitations',
          icon: <Mail className="w-5 h-5" />,
        },
        {
          name: 'Solicitudes',
          href: '/registration-requests',
          icon: <ClipboardList className="w-5 h-5" />,
        },
      ],
    },
    {
      name: 'Configuración',
      items: [
        {
          name: 'Apariencia',
          href: '/appearance',
          icon: <Paintbrush className="w-5 h-5" />,
        },
      ],
    },
  ];

  const isActiveLink = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={`bg-white border-r border-neutral-200 transition-all duration-150 h-full ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col`}>
      {/* Logo and toggle button */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <Calendar className="w-10 h-10 text-primary-500" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-neutral-900 leading-tight">Tucumán</span>
              <span className="text-xs text-neutral-500 leading-tight">Turismo</span>
            </div>
          </div>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            title={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
          >
            <ChevronsLeft
              className={`w-5 h-5 transition-transform duration-150 ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
        {sidebarSections.map((section) => (
          <div key={section.name}>
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 px-3">
                {section.name}
              </h3>
            )}

            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = isActiveLink(item.href);

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
                      <span className={`flex-shrink-0 ${active ? 'text-primary-600' : 'text-neutral-500'}`}>
                        {item.icon}
                      </span>

                      {!isCollapsed && (
                        <>
                          <span className="ml-3 flex-1 font-medium">
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-primary-100 text-primary-700 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-200 bg-neutral-50 p-4">
        {!isCollapsed && (
          <div className="text-center">
            <p className="text-xs text-neutral-600 font-medium">
              Ente de Turismo de Tucumán
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              © 2025 • v1.0.0
            </p>
          </div>
        )}

        {isCollapsed && (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-neutral-600">T</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
