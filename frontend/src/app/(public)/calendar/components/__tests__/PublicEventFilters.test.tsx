import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PublicEventFilters, { PublicEventFiltersState } from '../PublicEventFilters'
import { apiClient } from '@/lib/api'

// Mock apiClient
jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
  },
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
}))

describe('PublicEventFilters', () => {
  const mockOnFiltersChange = jest.fn()

  const defaultFilters: PublicEventFiltersState = {
    search: '',
    category_id: undefined,
    month: '',
    year: '',
  }

  const mockCategories = [
    { id: 1, name: 'Música', color: '#FF0000' },
    { id: 2, name: 'Deportes', color: '#00FF00' },
    { id: 3, name: 'Arte', color: '#0000FF' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(apiClient.get as jest.Mock).mockResolvedValue({
      categories: mockCategories,
    })
  })

  describe('Rendering', () => {
    it('should render search input', async () => {
      render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      expect(screen.getByPlaceholderText('Buscar eventos...')).toBeInTheDocument()
    })

    it('should render filter toggle button on mobile', async () => {
      render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      expect(screen.getByText('Filtros')).toBeInTheDocument()
    })

    it('should fetch categories on mount', async () => {
      render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/public/categories')
      })
    })

    it('should render all filter selects', async () => {
      render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Categoría')).toBeInTheDocument()
        expect(screen.getByText('Mes')).toBeInTheDocument()
        expect(screen.getByText('Año')).toBeInTheDocument()
      })
    })

    it('should render categories from API', async () => {
      render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Música')).toBeInTheDocument()
        expect(screen.getByText('Deportes')).toBeInTheDocument()
        expect(screen.getByText('Arte')).toBeInTheDocument()
      })
    })

    it('should render all months', async () => {
      render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      expect(screen.getByText('Enero')).toBeInTheDocument()
      expect(screen.getByText('Diciembre')).toBeInTheDocument()
    })

    it('should render year options', async () => {
      const currentYear = new Date().getFullYear()

      render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      expect(screen.getByText(String(currentYear - 1))).toBeInTheDocument()
      expect(screen.getByText(String(currentYear))).toBeInTheDocument()
      expect(screen.getByText(String(currentYear + 1))).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('should call onFiltersChange when search input changes', async () => {
      render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      const searchInput = screen.getByPlaceholderText('Buscar eventos...')
      fireEvent.change(searchInput, { target: { value: 'Festival' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        search: 'Festival',
      })
    })

    it('should display current search value', async () => {
      render(
        <PublicEventFilters
          filters={{ ...defaultFilters, search: 'Concierto' }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      const searchInput = screen.getByPlaceholderText('Buscar eventos...') as HTMLInputElement
      expect(searchInput.value).toBe('Concierto')
    })

    it('should handle empty search', async () => {
      render(
        <PublicEventFilters
          filters={{ ...defaultFilters, search: 'test' }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      const searchInput = screen.getByPlaceholderText('Buscar eventos...')
      fireEvent.change(searchInput, { target: { value: '' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        search: '',
      })
    })
  })

  describe('Category Filter', () => {
    it('should call onFiltersChange when category is selected', async () => {
      const { container } = render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Música')).toBeInTheDocument()
      })

      const categorySelect = container.querySelector('select') as HTMLSelectElement
      fireEvent.change(categorySelect, { target: { value: '1' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        category_id: 1,
      })
    })

    it('should handle clearing category filter', async () => {
      const { container } = render(
        <PublicEventFilters
          filters={{ ...defaultFilters, category_id: 1 }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Música')).toBeInTheDocument()
      })

      const categorySelect = container.querySelector('select') as HTMLSelectElement
      fireEvent.change(categorySelect, { target: { value: '' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        category_id: undefined,
      })
    })

    it('should display selected category', async () => {
      const { container } = render(
        <PublicEventFilters
          filters={{ ...defaultFilters, category_id: 2 }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      await waitFor(() => {
        const categorySelect = container.querySelector('select') as HTMLSelectElement
        expect(categorySelect.value).toBe('2')
      })
    })
  })

  describe('Month Filter', () => {
    it('should call onFiltersChange when month is selected', async () => {
      const { container } = render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      const selects = container.querySelectorAll('select')
      const monthSelect = selects[1] // Second select is month
      fireEvent.change(monthSelect, { target: { value: '06' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        month: '06',
      })
    })

    it('should display selected month', async () => {
      const { container } = render(
        <PublicEventFilters
          filters={{ ...defaultFilters, month: '03' }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      const selects = container.querySelectorAll('select')
      const monthSelect = selects[1] as HTMLSelectElement
      expect(monthSelect.value).toBe('03')
    })

    it('should handle clearing month filter', async () => {
      const { container } = render(
        <PublicEventFilters
          filters={{ ...defaultFilters, month: '12' }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      const selects = container.querySelectorAll('select')
      const monthSelect = selects[1]
      fireEvent.change(monthSelect, { target: { value: '' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        month: '',
      })
    })
  })

  describe('Year Filter', () => {
    it('should call onFiltersChange when year is selected', async () => {
      const currentYear = new Date().getFullYear()

      const { container } = render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      const selects = container.querySelectorAll('select')
      const yearSelect = selects[2] // Third select is year
      fireEvent.change(yearSelect, { target: { value: String(currentYear) } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        year: String(currentYear),
      })
    })

    it('should display selected year', async () => {
      const currentYear = new Date().getFullYear()

      const { container } = render(
        <PublicEventFilters
          filters={{ ...defaultFilters, year: String(currentYear) }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      const selects = container.querySelectorAll('select')
      const yearSelect = selects[2] as HTMLSelectElement
      expect(yearSelect.value).toBe(String(currentYear))
    })
  })

  describe('Clear Filters', () => {
    it('should show clear button when filters are active', async () => {
      render(
        <PublicEventFilters
          filters={{ ...defaultFilters, search: 'test' }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      expect(screen.getByText('Limpiar filtros')).toBeInTheDocument()
    })

    it('should not show clear button when no filters are active', async () => {
      render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      expect(screen.queryByText('Limpiar filtros')).not.toBeInTheDocument()
    })

    it('should clear all filters when clear button is clicked', async () => {
      render(
        <PublicEventFilters
          filters={{
            search: 'test',
            category_id: 1,
            month: '06',
            year: '2025',
          }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      const clearButton = screen.getByText('Limpiar filtros')
      fireEvent.click(clearButton)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        search: '',
        category_id: undefined,
        month: '',
        year: '',
      })
    })
  })

  describe('Active Filters Summary', () => {
    it('should display search filter chip', async () => {
      render(
        <PublicEventFilters
          filters={{ ...defaultFilters, search: 'Festival' }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      expect(screen.getByText(/Búsqueda:/)).toBeInTheDocument()
      expect(screen.getByText(/"Festival"/)).toBeInTheDocument()
    })

    it('should display category filter chip', async () => {
      render(
        <PublicEventFilters
          filters={{ ...defaultFilters, category_id: 1 }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/Categoría:/)).toBeInTheDocument()
        expect(screen.getByText('Música')).toBeInTheDocument()
      })
    })

    it('should display month filter chip', async () => {
      render(
        <PublicEventFilters
          filters={{ ...defaultFilters, month: '06' }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      expect(screen.getByText(/Mes:/)).toBeInTheDocument()
      expect(screen.getByText('Junio')).toBeInTheDocument()
    })

    it('should display year filter chip', async () => {
      render(
        <PublicEventFilters
          filters={{ ...defaultFilters, year: '2025' }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      expect(screen.getByText(/Año:/)).toBeInTheDocument()
      expect(screen.getByText('2025')).toBeInTheDocument()
    })

    it('should display all active filters together', async () => {
      render(
        <PublicEventFilters
          filters={{
            search: 'Música',
            category_id: 2,
            month: '12',
            year: '2025',
          }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText(/"Música"/)).toBeInTheDocument()
        expect(screen.getByText('Deportes')).toBeInTheDocument()
        expect(screen.getByText('Diciembre')).toBeInTheDocument()
        expect(screen.getByText('2025')).toBeInTheDocument()
      })
    })
  })

  describe('Mobile Filters Toggle', () => {
    it('should toggle filters visibility on mobile', async () => {
      const { container } = render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      const toggleButton = screen.getByText('Filtros')
      const filtersContainer = container.querySelector('.lg\\:block')

      // Initially hidden on mobile
      expect(filtersContainer).toHaveClass('hidden')

      // Click to show
      fireEvent.click(toggleButton)
      expect(filtersContainer).toHaveClass('block')

      // Click to hide again
      fireEvent.click(toggleButton)
      expect(filtersContainer).toHaveClass('hidden')
    })
  })

  describe('Edge Cases', () => {
    it('should handle API error gracefully', async () => {
      ;(apiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      // Should still render with empty categories
      expect(screen.getByText('Todas las categorías')).toBeInTheDocument()
    })

    it('should handle empty categories response', async () => {
      ;(apiClient.get as jest.Mock).mockResolvedValue({ categories: [] })

      render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Todas las categorías')).toBeInTheDocument()
      })
    })

    it('should handle very long search text', async () => {
      const longText = 'A'.repeat(200)

      render(
        <PublicEventFilters
          filters={{ ...defaultFilters, search: longText }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      const searchInput = screen.getByPlaceholderText('Buscar eventos...') as HTMLInputElement
      expect(searchInput.value).toBe(longText)
    })

    it('should handle special characters in search', async () => {
      render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      const searchInput = screen.getByPlaceholderText('Buscar eventos...')
      fireEvent.change(searchInput, { target: { value: '<script>alert("xss")</script>' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        search: '<script>alert("xss")</script>',
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', async () => {
      render(
        <PublicEventFilters
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      expect(screen.getByText('Categoría')).toBeInTheDocument()
      expect(screen.getByText('Mes')).toBeInTheDocument()
      expect(screen.getByText('Año')).toBeInTheDocument()
    })

    it('should have accessible button titles', async () => {
      render(
        <PublicEventFilters
          filters={{ ...defaultFilters, search: 'test' }}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Wait for async effects to complete
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled()
      })

      const clearButton = screen.getByText('Limpiar filtros')
      expect(clearButton).toBeInTheDocument()
    })
  })
})
