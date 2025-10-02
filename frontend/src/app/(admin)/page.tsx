/**
 * Admin Dashboard Page
 * Main admin dashboard with overview and quick actions
 */

'use client';

import { Button } from '@/components/ui';
import Link from 'next/link';

const AdminDashboard: React.FC = () => {
  const quickActions = [
    {
      name: 'Crear Categoría',
      description: 'Añade una nueva categoría para eventos',
      href: '/categories',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'Crear Evento',
      description: 'Programa un nuevo evento',
      href: '/admin/events',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: 'Gestionar Usuarios',
      description: 'Administra usuarios y permisos',
      href: '/admin/users',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  const stats = [
    { name: 'Total Eventos', value: '0', change: '+0%', icon: '📅' },
    { name: 'Categorías Activas', value: '0', change: '+0%', icon: '🏷️' },
    { name: 'Usuarios', value: '1', change: '+0%', icon: '👥' },
    { name: 'Eventos Hoy', value: '0', change: '+0%', icon: '⚡' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="mt-2 text-gray-600">
            Bienvenido al panel de administración de tu plataforma de calendario
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="text-2xl">{stat.icon}</div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-1">desde el mes pasado</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Acciones Rápidas</h2>
            <p className="mt-1 text-gray-600">Accede rápidamente a las funciones más utilizadas</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Link key={action.name} href={action.href}>
                  <div className={`${action.color} text-white rounded-lg p-6 cursor-pointer transition-colors duration-150`}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {action.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold">{action.name}</h3>
                        <p className="text-sm opacity-90">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Actividad Reciente</h2>
            <p className="mt-1 text-gray-600">Últimas actividades en tu plataforma</p>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No hay actividad reciente</h3>
              <p className="mt-2 text-gray-500">
                Cuando comiences a usar la plataforma, aquí verás la actividad reciente.
              </p>
              <div className="mt-6">
                <Button variant="outline">
                  Ver Historial Completo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
