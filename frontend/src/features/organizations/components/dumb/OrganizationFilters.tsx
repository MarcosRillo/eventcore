'use client'

import { Button, Input } from '@/shared/components/form'

interface OrganizationFiltersProps {
  searchInput: string
  filterStatus: 'all' | 'active' | 'suspended'
  hasActiveSearch: boolean
  onSearchInputChange: (value: string) => void
  onSearchSubmit: () => void
  onSearchKeyPress: (e: React.KeyboardEvent) => void
  onClearSearch: () => void
  onStatusFilter: (status: 'all' | 'active' | 'suspended') => void
}

export function OrganizationFilters({
  searchInput,
  filterStatus,
  hasActiveSearch,
  onSearchInputChange,
  onSearchSubmit,
  onSearchKeyPress,
  onClearSearch,
  onStatusFilter,
}: OrganizationFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 flex gap-2">
          <Input
            type="text"
            placeholder="Buscar por nombre o CUIT..."
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={onSearchKeyPress}
            fullWidth
          />
          <Button variant="primary" onClick={onSearchSubmit}>
            Buscar
          </Button>
          {hasActiveSearch && (
            <Button variant="outline" onClick={onClearSearch}>
              Limpiar
            </Button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onStatusFilter('all')}
          >
            Todos
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onStatusFilter('active')}
          >
            Activos
          </Button>
          <Button
            variant={filterStatus === 'suspended' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onStatusFilter('suspended')}
          >
            Suspendidos
          </Button>
        </div>
      </div>
    </div>
  )
}
