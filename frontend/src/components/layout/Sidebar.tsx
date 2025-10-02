'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import {
  HomeIcon,
  CalendarIcon,
  TagIcon,
  TicketIcon,
  UsersIcon,
  BuildingOffice2Icon,
  Cog6ToothIcon,
  ChevronDoubleLeftIcon,
  PaintBrushIcon,
} from '@heroicons/react/24/outline';

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

  const principalItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      name: 'Calendario',
      href: '/calendar',
      icon: <CalendarIcon className="w-5 h-5" />,
    },
  ];

  const sidebarSections: SidebarSection[] = [
    {
      name: 'Principal',
      items: principalItems,
    },
    {
      name: 'Gestión',
      items: [
        {
          name: 'Categorías',
          href: '/categories',
          icon: <TagIcon className="w-5 h-5" />,
        },
        {
          name: 'Eventos',
          href: '/events',
          icon: <TicketIcon className="w-5 h-5" />,
          ...(canAccessEntityDashboard && { badge: '5' }), // Mock badge for dashboard functionality
        },
        {
          name: 'Usuarios',
          href: '/users',
          icon: <UsersIcon className="w-5 h-5" />,
        },
      ],
    },
    {
      name: 'Configuración',
      items: [
        {
          name: 'Organización',
          href: '/organization',
          icon: <BuildingOffice2Icon className="w-5 h-5" />,
        },
        {
          name: 'Apariencia',
          href: '/appearance',
          icon: <PaintBrushIcon className="w-5 h-5" />,
        },
        {
          name: 'Configuración',
          href: '/settings',
          icon: <Cog6ToothIcon className="w-5 h-5" />,
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
    <div className={`bg-primary text-white transition-all duration-300 h-full shadow-2xl ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col`}>
      {/* Logo and toggle button */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-primary-hover bg-primary-hover/20">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <CalendarIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight">Tucumán</span>
              <span className="text-xs text-primary-light leading-tight">Turismo</span>
            </div>
          </div>
        )}
        
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-primary-hover transition-all duration-200 group"
            title={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
          >
            <ChevronDoubleLeftIcon 
              className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-hover scrollbar-track-transparent">
        {sidebarSections.map((section) => (
          <div key={section.name}>
            {!isCollapsed && (
              <h3 className="text-xs font-bold text-primary-light uppercase tracking-wider mb-4 px-3">
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
                      className={`group relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-white text-primary shadow-lg transform scale-[1.02]'
                          : 'text-primary-light hover:bg-primary-hover hover:text-white hover:transform hover:scale-105'
                      }`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      {/* Active indicator */}
                      {active && (
                        <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full" />
                      )}
                      
                      <span className={`flex-shrink-0 transition-transform duration-200 ${
                        active ? 'text-primary' : 'group-hover:scale-110'
                      }`}>
                        {item.icon}
                      </span>
                      
                      {!isCollapsed && (
                        <>
                          <span className="ml-4 flex-1 font-semibold tracking-wide">
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className="ml-2 px-2.5 py-1 text-xs font-bold bg-accent text-white rounded-full shadow-sm">
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
      <div className="border-t border-primary-hover bg-primary-hover/20 p-4">
        {!isCollapsed && (
          <div className="text-center">
            <p className="text-xs text-primary-light font-medium">
              Ente de Turismo de Tucumán
            </p>
            <p className="text-xs text-primary-light/70 mt-1">
              © 2025 • v1.0.0
            </p>
          </div>
        )}
        
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-primary-hover flex items-center justify-center">
              <span className="text-xs font-bold text-primary-light">T</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;