"use client"
import { useOrganizerStats } from '@/features/organizer/hooks/useOrganizerStats';
import { OrganizerStatsCard } from '@/features/organizer/components/dumb/OrganizerStatsCard';
import { StatCardData } from '@/features/organizer/types/organizerStats.types';

export const OrganizerStatsWidget = () => {
  const { stats, loading, error, refetch } = useOrganizerStats();

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600">
          <p className="font-semibold">Error al cargar estadísticas</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!stats) {
    return null;
  }

  // Transform stats to StatCardData format
  const statCards: StatCardData[] = [
    {
      label: 'Pendiente Interno',
      value: stats.pending_internal,
      color: 'yellow',
    },
    {
      label: 'Aprobado Interno',
      value: stats.approved_internal,
      color: 'blue',
    },
    {
      label: 'Pendiente Público',
      value: stats.pending_public,
      color: 'orange',
    },
    {
      label: 'Publicado',
      value: stats.published,
      color: 'green',
    },
    {
      label: 'Requiere Cambios',
      value: stats.requires_changes,
      color: 'orange',
    },
    {
      label: 'Rechazado',
      value: stats.rejected,
      color: 'red',
    },
  ];

  return <OrganizerStatsCard stats={statCards} totalEvents={stats.total_events} />;
};
