/**
 * Header Component - Tucumán Turismo Theme
 * Professional header for the admin layout with institutional design system
 */

'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { User } from '@/types/auth.types';

interface HeaderProps {
  title?: string;
  user?: User;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
}

const Header = ({
  title,
  user,
  onLogout,
  onToggleSidebar,
}: HeaderProps) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();

  // Get dynamic page title based on current route
  const getPageTitle = (): string => {
    if (title) return title;

    const routeTitles: Record<string, string> = {
      '/': 'Dashboard',
      '/event-types': 'Gestión de Tipos de Evento',
      '/event-types/subtypes': 'Gestión de Subtipos',
      '/calendar': 'Calendario de Eventos',
      '/events': 'Gestión de Eventos',
      '/organizations': 'Gestión de Organizaciones',
      '/locations': 'Gestión de Ubicaciones',
      '/users': 'Gestión de Usuarios',
      '/invitations': 'Gestión de Invitaciones',
      '/registration-requests': 'Solicitudes de Registro',
      '/appearance': 'Personalización de Apariencia',
    };

    return routeTitles[pathname] || 'Panel de Administración';
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleClickOutside = () => {
    setIsUserMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  return (
    <header className="bg-background border-b border-border shadow-sm relative z-10">
      <div className="h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-full">
          {/* Left side - Title and breadcrumbs */}
          <div className="flex items-center space-x-4">
            {/* Mobile sidebar toggle */}
            <button
              onClick={onToggleSidebar}
              className="p-2 text-muted hover:text-foreground hover:bg-surface rounded-lg transition-all duration-200 lg:hidden group"
              title="Abrir menú de navegación"
            >
              <Bars3Icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </button>

            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-muted hidden sm:block font-medium">
                Ente de Turismo de Tucumán - Gestión de eventos
              </p>
            </div>
          </div>

          {/* Right side - Actions and user menu */}
          <div className="flex items-center space-x-3">
            {/* Quick actions */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Search button */}
              <button 
                className="p-2.5 text-muted hover:text-foreground hover:bg-surface rounded-lg transition-all duration-200 group shadow-sm hover:shadow-md"
                title="Buscar eventos y contenido"
              >
                <MagnifyingGlassIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              </button>

              {/* Notifications */}
              <button 
                className="p-2.5 text-muted hover:text-foreground hover:bg-surface rounded-lg transition-all duration-200 relative group shadow-sm hover:shadow-md"
                title="Ver notificaciones"
              >
                <BellIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                {/* Notification badge */}
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent border-2 border-background rounded-full animate-pulse shadow-sm"></span>
              </button>
            </div>

            {/* User menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                  className="flex items-center space-x-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 p-2.5 hover:bg-surface transition-all duration-200 group shadow-sm hover:shadow-md"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {getUserInitials(user.name)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-foreground leading-tight">{user.name}</p>
                    <p className="text-xs text-muted font-medium capitalize leading-tight">
                      {user.role?.role_code === 'entity_admin' ? 'Administrador' : user.role?.role_name || 'Usuario'}
                    </p>
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-muted group-hover:text-foreground transition-all duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-background rounded-xl shadow-2xl ring-1 ring-border border border-border z-50 overflow-hidden">
                    <div className="py-2">
                      {/* User info header */}
                      <div className="px-4 py-4 border-b border-border bg-surface/30">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md">
                            {getUserInitials(user.name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{user.name}</p>
                            <p className="text-xs text-muted font-medium">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-2">
                        <button className="w-full flex items-center px-4 py-3 text-sm text-foreground hover:bg-surface transition-all duration-200 group">
                          <UserIcon className="w-4 h-4 mr-3 text-muted group-hover:text-primary transition-colors duration-200" />
                          <span className="font-medium">Mi Perfil</span>
                        </button>
                        
                        <button className="w-full flex items-center px-4 py-3 text-sm text-foreground hover:bg-surface transition-all duration-200 group">
                          <Cog6ToothIcon className="w-4 h-4 mr-3 text-muted group-hover:text-primary transition-colors duration-200" />
                          <span className="font-medium">Configuración</span>
                        </button>

                        <button className="w-full flex items-center px-4 py-3 text-sm text-foreground hover:bg-surface transition-all duration-200 group">
                          <QuestionMarkCircleIcon className="w-4 h-4 mr-3 text-muted group-hover:text-primary transition-colors duration-200" />
                          <span className="font-medium">Ayuda y Soporte</span>
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-border py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-3 text-sm text-danger hover:bg-danger-light/10 transition-all duration-200 group"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                          <span className="font-semibold">Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;