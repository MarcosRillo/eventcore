/**
 * Events Filter Tabs Component
 * Tab navigation with dynamic counters for dashboard filtering
 * Adapted from dashboard for consolidated events view with role-based visibility
 */

'use client';

import { useAuth } from '@/context/AuthContext';

export type DashboardTab = 'requires-action' | 'pending' | 'published' | 'historic';

interface EventsFilterTabsProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  counters: Record<DashboardTab, number>;
  isLoading?: boolean;
}

interface TabConfig {
  key: DashboardTab;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  adminOnly?: boolean; // Only show for entity_admin/entity_staff
}

const TAB_CONFIGS: TabConfig[] = [
  {
    key: 'requires-action',
    label: 'Requiere mi Acción',
    description: 'Eventos que necesitan aprobación urgente',
    color: 'bg-red-100 text-red-800 border-red-200',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
    adminOnly: true,
  },
  {
    key: 'pending',
    label: 'Pendientes',
    description: 'Aprobados internamente, esperando acción',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    adminOnly: true,
  },
  {
    key: 'published',
    label: 'Publicados',
    description: 'Eventos aprobados y visibles al público',
    color: 'bg-green-100 text-green-800 border-green-200',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
  },
  {
    key: 'historic',
    label: 'Histórico',
    description: 'Eventos rechazados, cancelados o finalizados',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
  },
];

export const EventsFilterTabs = ({ activeTab, onTabChange, counters, isLoading = false }: EventsFilterTabsProps) => {
  const { user } = useAuth();

  // Filter tabs based on user role
  const availableTabs = TAB_CONFIGS.filter(tab => {
    if (!tab.adminOnly) return true;

    // Only show admin-only tabs for entity_admin or entity_staff
    const userRole = user?.role?.role_code;
    return userRole === 'entity_admin' || userRole === 'entity_staff';
  });

  return (
    <div className="border-b border-gray-200">
      {/* Mobile Tab Selector */}
      <div className="sm:hidden">
        <label htmlFor="tab-select" className="sr-only">
          Seleccionar pestaña
        </label>
        <select
          id="tab-select"
          name="tab-select"
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value as DashboardTab)}
          className="block w-full rounded-md border-gray-300 focus:border-[#228B22] focus:ring-[#228B22]"
        >
          {availableTabs.map((tab) => (
            <option key={tab.key} value={tab.key}>
              {tab.label} ({counters[tab.key]})
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Tab Navigation */}
      <nav className="hidden sm:flex space-x-8" aria-label="Tabs">
        {availableTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = counters[tab.key];

          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`
                group relative min-w-0 flex-1 overflow-hidden py-4 px-1 text-center text-sm font-medium hover:text-gray-700 focus:z-10 focus:outline-none transition-all duration-200
                ${isActive
                  ? 'text-[#228B22] border-b-2 border-[#228B22]'
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
              title={tab.description}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="truncate">{tab.label}</span>

                {/* Counter Badge */}
                <span
                  className={`
                    inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full min-w-[1.5rem] h-6
                    ${isActive
                      ? 'bg-[#228B22] text-white'
                      : count > 0
                      ? tab.color
                      : 'bg-gray-100 text-gray-600'
                    }
                    transition-all duration-200
                  `}
                >
                  {isLoading ? (
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    count
                  )}
                </span>
              </div>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#228B22]" />
              )}

              {/* Hover Effect */}
              <div
                className={`
                  absolute inset-x-0 bottom-0 h-0.5 bg-gray-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200
                  ${isActive ? 'opacity-0' : 'opacity-100'}
                `}
              />
            </button>
          );
        })}
      </nav>

      {/* Description for Active Tab */}
      <div className="mt-2 mb-4 sm:hidden">
        <p className="text-xs text-gray-500 text-center">
          {availableTabs.find(tab => tab.key === activeTab)?.description}
        </p>
      </div>
    </div>
  );
};
