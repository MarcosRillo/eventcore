/**
 * Tests for EventFiltersBar Component
 *
 * Tests filter inputs, expandable sections, and filter management.
 */

import { fireEvent,render, screen } from '@testing-library/react'

import { EventFiltersBar } from '@/features/events/components/EventFiltersBar'
import { EVENT_TYPE,EventFilters } from '@/types/event.types'

// Mock UI components
jest.mock('@/shared/components/form', () => ({
  Button: ({ children, onClick, variant, size }: {
    children: React.ReactNode
    onClick?: () => void
    variant?: string
    size?: string
  }) => (
    <button onClick={onClick} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
  Input: ({ label, value, onChange, type, placeholder }: {
    label: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    type: string
    placeholder?: string
  }) => (
    <div>
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={label}
      />
    </div>
  ),
  Select: ({ label, value, onChange, options, placeholder }: {
    label: string
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
    placeholder?: string
  }) => (
    <div>
      <label>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}))

describe('EventFiltersBar', () => {
  const mockOnFiltersChange = jest.fn()
  const mockOnClearFilters = jest.fn()

  const emptyFilters: EventFilters = {
    page: 1,
    per_page: 10
  }

  const activeFilters: EventFilters = {
    page: 1,
    per_page: 10,
    search: 'test',
    status: 'published'
  }

  const defaultProps = {
    sections: [],
    filters: emptyFilters,
    onFiltersChange: mockOnFiltersChange,
    onClearFilters: mockOnClearFilters
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    test('should render filters title', () => {
      render(<EventFiltersBar {...defaultProps} />)

      expect(screen.getByText('Filtros')).toBeInTheDocument()
    })

    test('should render basic filter inputs', () => {
      render(<EventFiltersBar {...defaultProps} />)

      expect(screen.getByLabelText('Buscar')).toBeInTheDocument()
      expect(screen.getByLabelText('Estado')).toBeInTheDocument()
      expect(screen.getByLabelText('Tipo')).toBeInTheDocument()
    })

    test('should render toggle button for advanced filters', () => {
      render(<EventFiltersBar {...defaultProps} />)

      expect(screen.getByText(/mostrar filtros avanzados/i)).toBeInTheDocument()
    })
  })

  describe('basic filters', () => {
    test('should render search input with empty value', () => {
      render(<EventFiltersBar {...defaultProps} />)

      const searchInput = screen.getByLabelText('Buscar')
      expect(searchInput).toHaveValue('')
    })

    test('should call onFiltersChange when search input changes', () => {
      render(<EventFiltersBar {...defaultProps} />)

      const searchInput = screen.getByLabelText('Buscar')
      fireEvent.change(searchInput, { target: { value: 'test search' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'test search',
          page: 1
        })
      )
    })

    test('should render status select', () => {
      render(<EventFiltersBar {...defaultProps} />)

      const statusSelect = screen.getByLabelText('Estado')
      expect(statusSelect).toBeInTheDocument()
    })

    test('should call onFiltersChange when status changes', () => {
      render(<EventFiltersBar {...defaultProps} />)

      const statusSelect = screen.getByLabelText('Estado')
      fireEvent.change(statusSelect, { target: { value: 'published' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'published',
          page: 1
        })
      )
    })

    test('should render type select', () => {
      render(<EventFiltersBar {...defaultProps} />)

      const typeSelect = screen.getByLabelText('Tipo')
      expect(typeSelect).toBeInTheDocument()
    })

    test('should call onFiltersChange when type changes', () => {
      render(<EventFiltersBar {...defaultProps} />)

      const typeSelect = screen.getByLabelText('Tipo')
      fireEvent.change(typeSelect, { target: { value: EVENT_TYPE.SINGLE_LOCATION } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: EVENT_TYPE.SINGLE_LOCATION,
          page: 1
        })
      )
    })
  })

  describe('advanced filters', () => {
    test('should not show advanced filters by default', () => {
      render(<EventFiltersBar {...defaultProps} />)

      expect(screen.queryByLabelText('Categoría')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Fecha desde')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Fecha hasta')).not.toBeInTheDocument()
    })

    test('should show advanced filters when toggle is clicked', () => {
      render(<EventFiltersBar {...defaultProps} />)

      const toggleButton = screen.getByText(/mostrar filtros avanzados/i)
      fireEvent.click(toggleButton)

      // Category filter was removed from UI, only date filters remain
      expect(screen.getByLabelText('Fecha desde')).toBeInTheDocument()
      expect(screen.getByLabelText('Fecha hasta')).toBeInTheDocument()
    })

    test('should change toggle text when expanded', () => {
      render(<EventFiltersBar {...defaultProps} />)

      const toggleButton = screen.getByText(/mostrar filtros avanzados/i)
      fireEvent.click(toggleButton)

      expect(screen.getByText(/ocultar filtros avanzados/i)).toBeInTheDocument()
    })

    test('should hide advanced filters when toggle is clicked again', () => {
      render(<EventFiltersBar {...defaultProps} />)

      const toggleButton = screen.getByText(/mostrar filtros avanzados/i)
      fireEvent.click(toggleButton)
      fireEvent.click(screen.getByText(/ocultar filtros avanzados/i))

      // Verify date filters are hidden (category filter was removed from UI)
      expect(screen.queryByLabelText('Fecha desde')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Fecha hasta')).not.toBeInTheDocument()
    })
  })

  describe('date filters', () => {
    test('should render date inputs when expanded', () => {
      render(<EventFiltersBar {...defaultProps} />)

      const toggleButton = screen.getByText(/mostrar filtros avanzados/i)
      fireEvent.click(toggleButton)

      expect(screen.getByLabelText('Fecha desde')).toBeInTheDocument()
      expect(screen.getByLabelText('Fecha hasta')).toBeInTheDocument()
    })

    test('should call onFiltersChange when start date changes', () => {
      render(<EventFiltersBar {...defaultProps} />)

      const toggleButton = screen.getByText(/mostrar filtros avanzados/i)
      fireEvent.click(toggleButton)

      const startDateInput = screen.getByLabelText('Fecha desde')
      fireEvent.change(startDateInput, { target: { value: '2025-01-01' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          start_date: '2025-01-01',
          page: 1
        })
      )
    })

    test('should call onFiltersChange when end date changes', () => {
      render(<EventFiltersBar {...defaultProps} />)

      const toggleButton = screen.getByText(/mostrar filtros avanzados/i)
      fireEvent.click(toggleButton)

      const endDateInput = screen.getByLabelText('Fecha hasta')
      fireEvent.change(endDateInput, { target: { value: '2025-12-31' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          end_date: '2025-12-31',
          page: 1
        })
      )
    })
  })

  describe('clear filters', () => {
    test('should not show clear button when no filters are active', () => {
      render(<EventFiltersBar {...defaultProps} />)

      expect(screen.queryByText('Limpiar filtros')).not.toBeInTheDocument()
    })

    test('should show clear button when filters are active', () => {
      render(<EventFiltersBar {...defaultProps} filters={activeFilters} />)

      expect(screen.getByText('Limpiar filtros')).toBeInTheDocument()
    })

    test('should call onClearFilters when clear button is clicked', () => {
      render(<EventFiltersBar {...defaultProps} filters={activeFilters} />)

      const clearButton = screen.getByText('Limpiar filtros')
      fireEvent.click(clearButton)

      expect(mockOnClearFilters).toHaveBeenCalledTimes(1)
    })
  })

  describe('active filters indicator', () => {
    test('should not show indicator when no filters are active', () => {
      render(<EventFiltersBar {...defaultProps} />)

      expect(screen.queryByText(/filtros activos/i)).not.toBeInTheDocument()
    })

    test('should show indicator when filters are active', () => {
      render(<EventFiltersBar {...defaultProps} filters={activeFilters} />)

      expect(screen.getByText(/filtros activos/i)).toBeInTheDocument()
    })

    test('should show correct count of active filters', () => {
      const filtersWithMultiple: EventFilters = {
        page: 1,
        per_page: 10,
        search: 'test',
        status: 'published',
        type: EVENT_TYPE.SINGLE_LOCATION
      }

      render(<EventFiltersBar {...defaultProps} filters={filtersWithMultiple} />)

      // The component counts all non-empty, non-page values
      expect(screen.getByText(/aplicados/i)).toBeInTheDocument()
    })
  })

  describe('filter values display', () => {
    test('should display current search value', () => {
      render(<EventFiltersBar {...defaultProps} filters={activeFilters} />)

      const searchInput = screen.getByLabelText('Buscar')
      expect(searchInput).toHaveValue('test')
    })

    test('should display current status value', () => {
      render(<EventFiltersBar {...defaultProps} filters={activeFilters} />)

      const statusSelect = screen.getByLabelText('Estado')
      expect(statusSelect).toHaveValue('published')
    })
  })

  describe('empty value handling', () => {
    test('should clear search when emptied', () => {
      render(<EventFiltersBar {...defaultProps} filters={activeFilters} />)

      const searchInput = screen.getByLabelText('Buscar')
      fireEvent.change(searchInput, { target: { value: '' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          search: undefined,
          page: 1
        })
      )
    })

    test('should clear status when emptied', () => {
      render(<EventFiltersBar {...defaultProps} filters={activeFilters} />)

      const statusSelect = screen.getByLabelText('Estado')
      fireEvent.change(statusSelect, { target: { value: '' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          status: undefined,
          page: 1
        })
      )
    })
  })

  describe('page reset', () => {
    test('should reset page to 1 when filter changes', () => {
      const filtersWithPage: EventFilters = {
        page: 5,
        per_page: 10,
        search: 'test'
      }

      render(<EventFiltersBar {...defaultProps} filters={filtersWithPage} />)

      const searchInput = screen.getByLabelText('Buscar')
      fireEvent.change(searchInput, { target: { value: 'new search' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1
        })
      )
    })
  })

  describe('edge cases', () => {
    test('should handle filters with only page and per_page', () => {
      render(<EventFiltersBar {...defaultProps} />)

      // Should not show active filters indicator
      expect(screen.queryByText(/filtros activos/i)).not.toBeInTheDocument()
    })
  })
})
