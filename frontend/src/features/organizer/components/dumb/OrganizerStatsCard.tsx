import { StatCardData } from '@/features/organizer/types/organizerStats.types';

interface OrganizerStatsCardProps {
  stats: StatCardData[];
  totalEvents: number;
}

export const OrganizerStatsCard = ({ stats, totalEvents }: OrganizerStatsCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mis Eventos</h2>
        <p className="text-gray-600 mt-1">
          Total: <span className="font-semibold text-blue-600">{totalEvents}</span> eventos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`p-4 rounded-lg border-2 ${getColorClasses(stat.color)}`}
          >
            <div className="text-sm font-medium text-gray-600 mb-1">
              {stat.label}
            </div>
            <div className={`text-3xl font-bold ${getTextColor(stat.color)}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper functions
const getColorClasses = (color: StatCardData['color']): string => {
  const colors = {
    blue: 'border-blue-200 bg-blue-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    green: 'border-green-200 bg-green-50',
    orange: 'border-orange-200 bg-orange-50',
    red: 'border-red-200 bg-red-50',
    gray: 'border-gray-200 bg-gray-50',
  };
  return colors[color] || colors.gray;
};

const getTextColor = (color: StatCardData['color']): string => {
  const colors = {
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
  };
  return colors[color] || colors.gray;
};
