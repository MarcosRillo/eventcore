'use client'

/**
 * Public Event Filters - Minimalist Design System
 *
 * Filter controls for public calendar with search, category, month, and year filters.
 * Uses semantic design tokens and Badge component for active filters.
 */

import { useState, useEffect } from 'react'
import { Category } from '@/types/category.types'
import { Badge, Button } from '@/components/ui'
import apiClient from '@/services/apiClient'

export interface PublicEventFiltersState {
  search: string
  category_id: number | undefined
  month: string
  year: string
}

interface PublicEventFiltersProps {
  filters: PublicEventFiltersState
  onFiltersChange: (filters: PublicEventFiltersState) => void
}

export default function PublicEventFilters({
  filters,
  onFiltersChange
}: PublicEventFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<{categories: Category[]}>('/public/categories')
        const categoriesData = response.data.categories
        setCategories(categoriesData)
      } catch {
        // Silent fail - categories will be empty
      }
    }

    fetchCategories()
  }, [])

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleCategoryChange = (categoryId: string) => {
    onFiltersChange({
      ...filters,
      category_id: categoryId === '' ? undefined : Number(categoryId)
    })
  }

  const handleMonthChange = (month: string) => {
    onFiltersChange({ ...filters, month })
  }

  const handleYearChange = (year: string) => {
    onFiltersChange({ ...filters, year })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      category_id: undefined,
      month: '',
      year: ''
    })
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i - 1)
  const months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ]

  const hasActiveFilters = filters.search || filters.category_id || filters.month || filters.year

  // Common select styles using design tokens
  const selectClasses = `
    w-full h-10 px-3 py-2
    bg-white border border-neutral-200 rounded-md
    text-sm text-neutral-900
    transition-all duration-150
    focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10
    hover:border-neutral-300
  `

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="
              w-full h-10 pl-10 pr-4
              bg-white border border-neutral-200 rounded-md
              text-sm text-neutral-900 placeholder:text-neutral-400
              transition-all duration-150
              focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10
              hover:border-neutral-300
            "
          />
        </div>

        {/* Toggle Filters Button (Mobile) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="
            lg:hidden flex items-center justify-center gap-2
            h-10 px-4
            border border-neutral-200 rounded-md
            text-sm text-neutral-700
            hover:bg-neutral-50 hover:border-neutral-300
            transition-all duration-150
          "
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Filtros
        </button>
      </div>

      {/* Advanced Filters */}
      <div className={`${showFilters ? 'block' : 'hidden'} lg:block mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`}>
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Categoría
          </label>
          <select
            value={filters.category_id || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={selectClasses}
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Mes
          </label>
          <select
            value={filters.month}
            onChange={(e) => handleMonthChange(e.target.value)}
            className={selectClasses}
          >
            <option value="">Todos los meses</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Año
          </label>
          <select
            value={filters.year}
            onChange={(e) => handleYearChange(e.target.value)}
            className={selectClasses}
          >
            <option value="">Todos los años</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="default" size="sm">
              Búsqueda: &quot;{filters.search}&quot;
            </Badge>
          )}
          {filters.category_id && (
            <Badge variant="info" size="sm">
              Categoría: {categories.find(c => c.id === filters.category_id)?.name}
            </Badge>
          )}
          {filters.month && (
            <Badge variant="info" size="sm">
              Mes: {months.find(m => m.value === filters.month)?.label}
            </Badge>
          )}
          {filters.year && (
            <Badge variant="info" size="sm">
              Año: {filters.year}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}