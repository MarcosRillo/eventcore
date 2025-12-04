/**
 * AdminQuickFilters Component
 *
 * Displays quick filter tabs for the event table.
 * Dumb component - receives data via props, no business logic.
 */

import type { EventStatusCode } from '@/types/event.types';
import { QUICK_FILTERS } from '@/features/entity-admin/types';

interface AdminQuickFiltersProps {
  activeFilter: EventStatusCode | null;
  onFilterChange: (status: EventStatusCode | null) => void;
  counts?: Record<string, number>;
}

export const AdminQuickFilters = ({
  activeFilter,
  onFilterChange,
  counts,
}: AdminQuickFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {QUICK_FILTERS.map((filter) => {
        const isActive = activeFilter === filter.status;
        const count = counts?.[filter.status || 'all'];

        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onFilterChange(filter.status)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium
              transition-all duration-150
              ${isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }
            `}
          >
            {filter.label}
            {count !== undefined && (
              <span className={`ml-1 ${isActive ? 'text-primary-100' : 'text-neutral-400'}`}>
                ({count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AdminQuickFilters;
