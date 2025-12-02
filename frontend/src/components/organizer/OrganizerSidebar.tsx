/**
 * OrganizerSidebar Component
 * Green-themed sidebar navigation for organizer panel
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/organizer/dashboard', icon: HomeIcon },
  { name: 'Crear Evento', href: '/organizer/create', icon: PlusCircleIcon },
];

export function OrganizerSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="w-64 bg-gradient-to-b from-primary-600 to-primary-800 text-white">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Panel Organizador</h2>
        <p className="text-primary-100 text-sm mt-1">Gestiona tus eventos</p>
      </div>

      <nav className="mt-6 px-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 mb-2 rounded-lg transition-colors
                ${isActive
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-100 hover:bg-primary-700/50'
                }
              `}
            >
              <item.icon className="w-5 h-5 mr-3" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-primary-700">
        <button
          className="w-full text-left px-3 py-2 text-primary-100 hover:bg-primary-700/50 rounded-lg transition-colors"
          onClick={logout}
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
