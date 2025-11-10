/**
 * Quick Filters Component
 *
 * Status filter buttons for event list.
 */

interface OrganizerQuickFiltersProps {
  activeFilter: string | null
  onFilterChange: (status: string | null) => void
}

export const OrganizerQuickFilters = ({
  activeFilter,
  onFilterChange
}: OrganizerQuickFiltersProps) => {
  const filters = [
    { label: 'All', value: null },
    { label: 'Draft', value: 'draft' },
    { label: 'Pending', value: 'pending' },
    { label: 'Published', value: 'published' }
  ]

  return (
    <div className="flex gap-2 mb-4" role="group" aria-label="Filter events by status">
      {filters.map(filter => (
        <button
          key={filter.label}
          onClick={() => onFilterChange(filter.value)}
          className={`
            px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${activeFilter === filter.value
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }
          `}
          aria-pressed={activeFilter === filter.value}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
