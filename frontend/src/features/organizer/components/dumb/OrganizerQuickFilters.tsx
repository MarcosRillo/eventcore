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
    { label: 'Todos', value: null },
    { label: 'Borrador', value: 'draft' },
    { label: 'Pendiente', value: 'pending_internal_approval' },
    { label: 'Aprobado', value: 'approved_internal' },
    { label: 'Publicado', value: 'published' },
    { label: 'Requiere Cambios', value: 'requires_changes' },
    { label: 'Rechazado', value: 'rejected' }
  ]

  return (
    <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filtrar eventos por estado">
      {filters.map(filter => (
        <button
          key={filter.label}
          onClick={() => onFilterChange(filter.value)}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${activeFilter === filter.value
              ? 'bg-primary-600 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-300'
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
