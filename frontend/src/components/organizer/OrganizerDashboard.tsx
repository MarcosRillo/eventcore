/**
 * OrganizerDashboard Component
 * Main dashboard view showing organizer event statistics
 */

'use client';

import { useEffect, useState } from 'react';
import { organizerService } from '@/features/organizer/services/organizerService';
import type { OrganizerDashboardStats } from '@/features/organizer/types/organizerTypes';

export function OrganizerDashboard() {
  const [stats, setStats] = useState<OrganizerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await organizerService.getDashboardStats();
        setStats(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-12">
        Error al cargar estadísticas
      </div>
    );
  }

  const statCards = [
    { label: 'Total Eventos', value: stats.total_events, color: 'bg-blue-500' },
    { label: 'Borradores', value: stats.draft, color: 'bg-gray-500' },
    { label: 'Pendiente Aprobación', value: stats.pending_approval, color: 'bg-yellow-500' },
    { label: 'Aprobados', value: stats.approved_internal, color: 'bg-green-500' },
    { label: 'Publicados', value: stats.published, color: 'bg-emerald-500' },
    { label: 'Requieren Cambios', value: stats.requires_changes, color: 'bg-orange-500' },
    { label: 'Rechazados', value: stats.rejected, color: 'bg-red-500' },
    { label: 'Archivados', value: stats.archived, color: 'bg-gray-400' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-full`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
