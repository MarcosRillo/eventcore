import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryTable } from '../CategoryTable'
import { Category } from '@/types/category.types'
import {
  CategoryColumnConfig,
  CategoryActionConfig,
  CategoryConfirmDialogData
} from '@/features/categories/components/smart/CategoryTableContainer'

// Mock @/components/ui with all needed components
jest.mock('@/components/ui', () => ({
  Button: ({ children, onClick, title, variant, size, className }: {
    children: React.ReactNode
    onClick?: () => void
    title?: string
    variant?: string
    size?: string
    className?: string
  }) => (
    <button onClick={onClick} title={title} data-variant={variant} data-size={size} className={className}>
      {children}
    </button>
  ),
  Pagination: ({ currentPage, totalPages, onPageChange }: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    showInfo?: boolean
    totalItems?: number
  }) => (
    <div data-testid="pagination">
      <span>Page {currentPage} of {totalPages}</span>
      <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  ),
  ConfirmDialog: ({ isOpen, title, message }: {
    isOpen: boolean
    title: string
    message: string
    onConfirm?: () => void
    onCancel?: () => void
  }) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        <div>{title}</div>
        <div>{message}</div>
      </div>
    ) : null,
}))

describe('CategoryTable', () => {
  const mockCategories: Category[] = [
    {
      id: 1,
      name: 'Música',
      slug: 'musica',
      description: 'Eventos musicales',
      color: '#FF0000',
      is_active: true,
      entity_id: 1,
      created_at: '2025-01-15T10:30:00Z',
      updated_at: '2025-01-15T10:30:00Z',
    },
    {
      id: 2,
      name: 'Deportes',
      slug: 'deportes',
      description: null,
      color: '#00FF00',
      is_active: false,
      entity_id: 1,
      created_at: '2025-01-10T08:00:00Z',
      updated_at: '2025-01-10T08:00:00Z',
    },
  ]

  const mockPagination = {
    current_page: 1,
    last_page: 3,
    per_page: 10,
    total: 25,
    from: 1,
    to: 10,
    path: 'http://api.example.com/categories',
    links: [],
  }

  const mockColumns: CategoryColumnConfig[] = [
    { key: 'category', label: 'Categoría', visible: true },
    { key: 'color', label: 'Color', visible: true },
    { key: 'status', label: 'Estado', visible: true },
    { key: 'created', label: 'Creado', visible: true },
  ]

  const mockActions: CategoryActionConfig[] = [
    {
      key: 'edit',
      label: 'Editar',
      icon: '✏️',
      className: 'text-indigo-600',
      onClick: jest.fn(),
    },
    {
      key: 'delete',
      label: 'Eliminar',
      icon: '🗑️',
      className: 'text-red-600',
      onClick: jest.fn(),
    },
  ]

  const mockConfirmDialog: CategoryConfirmDialogData = {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: jest.fn(),
  }

  const defaultProps = {
    categories: mockCategories,
    pagination: mockPagination,
    loading: false,
    columns: mockColumns,
    actions: mockActions,
    confirmDialog: mockConfirmDialog,
    onPageChange: jest.fn(),
    onFormatDate: jest.fn((date: string) => new Date(date).toLocaleDateString()),
    onCloseConfirmDialog: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render loading state when loading is true', () => {
      render(<CategoryTable {...defaultProps} loading={true} />)

      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render empty state when no categories', () => {
      render(<CategoryTable {...defaultProps} categories={[]} />)

      expect(screen.getByText('No hay categorías disponibles')).toBeInTheDocument()
    })

    it('should render table with categories', () => {
      render(<CategoryTable {...defaultProps} />)

      expect(screen.getByText('Música')).toBeInTheDocument()
      expect(screen.getByText('Deportes')).toBeInTheDocument()
    })

    it('should render table headers from columns config', () => {
      render(<CategoryTable {...defaultProps} />)

      expect(screen.getByText('Categoría')).toBeInTheDocument()
      expect(screen.getByText('Color')).toBeInTheDocument()
      expect(screen.getByText('Estado')).toBeInTheDocument()
      expect(screen.getByText('Creado')).toBeInTheDocument()
      expect(screen.getByText('Acciones')).toBeInTheDocument()
    })

    it('should not render actions column when actions array is empty', () => {
      render(<CategoryTable {...defaultProps} actions={[]} />)

      expect(screen.queryByText('Acciones')).not.toBeInTheDocument()
    })

    it('should only render visible columns', () => {
      const columnsWithHidden: CategoryColumnConfig[] = [
        { key: 'category', label: 'Categoría', visible: true },
        { key: 'color', label: 'Color', visible: false },
        { key: 'status', label: 'Estado', visible: true },
        { key: 'created', label: 'Creado', visible: false },
      ]

      render(<CategoryTable {...defaultProps} columns={columnsWithHidden} />)

      expect(screen.getByText('Categoría')).toBeInTheDocument()
      expect(screen.queryByText('Color')).not.toBeInTheDocument()
      expect(screen.getByText('Estado')).toBeInTheDocument()
      expect(screen.queryByText('Creado')).not.toBeInTheDocument()
    })
  })

  describe('category data display', () => {
    it('should display category name and description', () => {
      render(<CategoryTable {...defaultProps} />)

      expect(screen.getByText('Música')).toBeInTheDocument()
      expect(screen.getByText('Eventos musicales')).toBeInTheDocument()
    })

    it('should not render description when null', () => {
      render(<CategoryTable {...defaultProps} />)

      // Deportes has null description
      expect(screen.getByText('Deportes')).toBeInTheDocument()
      expect(screen.queryByText('null')).not.toBeInTheDocument()
    })

    it('should display color with color swatch', () => {
      render(<CategoryTable {...defaultProps} />)

      expect(screen.getByText('#FF0000')).toBeInTheDocument()
      expect(screen.getByText('#00FF00')).toBeInTheDocument()
    })

    it('should display active status with green badge', () => {
      render(<CategoryTable {...defaultProps} />)

      const activeBadge = screen.getByText('Activa')
      expect(activeBadge).toHaveClass('bg-green-100', 'text-green-800')
    })

    it('should display inactive status with red badge', () => {
      render(<CategoryTable {...defaultProps} />)

      const inactiveBadge = screen.getByText('Inactiva')
      expect(inactiveBadge).toHaveClass('bg-red-100', 'text-red-800')
    })

    it('should call onFormatDate for created dates', () => {
      render(<CategoryTable {...defaultProps} />)

      expect(defaultProps.onFormatDate).toHaveBeenCalledWith('2025-01-15T10:30:00Z')
      expect(defaultProps.onFormatDate).toHaveBeenCalledWith('2025-01-10T08:00:00Z')
    })
  })

  describe('action buttons', () => {
    it('should render action buttons for each category', () => {
      render(<CategoryTable {...defaultProps} />)

      const editButtons = screen.getAllByTitle('Editar')
      const deleteButtons = screen.getAllByTitle('Eliminar')

      expect(editButtons).toHaveLength(2)
      expect(deleteButtons).toHaveLength(2)
    })

    it('should call action onClick when button is clicked', () => {
      render(<CategoryTable {...defaultProps} />)

      const editButtons = screen.getAllByTitle('Editar')
      fireEvent.click(editButtons[0])

      expect(mockActions[0].onClick).toHaveBeenCalledWith(mockCategories[0])
    })

    it('should call delete action onClick when delete button is clicked', () => {
      render(<CategoryTable {...defaultProps} />)

      const deleteButtons = screen.getAllByTitle('Eliminar')
      fireEvent.click(deleteButtons[0])

      expect(mockActions[1].onClick).toHaveBeenCalledWith(mockCategories[0])
    })

    it('should render action labels in buttons', () => {
      render(<CategoryTable {...defaultProps} />)

      // Labels are rendered inside buttons
      const editButtons = screen.getAllByTitle('Editar')
      const deleteButtons = screen.getAllByTitle('Eliminar')

      // Each button contains the label text
      expect(editButtons[0]).toHaveTextContent('Editar')
      expect(deleteButtons[0]).toHaveTextContent('Eliminar')
    })
  })

  describe('pagination', () => {
    it('should render pagination when total > 0', () => {
      render(<CategoryTable {...defaultProps} />)

      expect(screen.getByTestId('pagination')).toBeInTheDocument()
    })

    it('should not render pagination when pagination is null', () => {
      render(<CategoryTable {...defaultProps} pagination={null} />)

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
    })

    it('should not render pagination when total is 0', () => {
      const zeroPagination = { ...mockPagination, total: 0 }
      render(<CategoryTable {...defaultProps} pagination={zeroPagination} />)

      expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
    })

    it('should call onPageChange when pagination changes', () => {
      render(<CategoryTable {...defaultProps} />)

      const nextButton = screen.getByText('Next')
      fireEvent.click(nextButton)

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2)
    })
  })

  describe('confirm dialog', () => {
    it('should render confirm dialog when isOpen is true', () => {
      const openConfirmDialog: CategoryConfirmDialogData = {
        isOpen: true,
        title: 'Confirmar Eliminación',
        message: '¿Estás seguro de eliminar esta categoría?',
        onConfirm: jest.fn(),
      }

      render(<CategoryTable {...defaultProps} confirmDialog={openConfirmDialog} />)

      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      expect(screen.getByText('Confirmar Eliminación')).toBeInTheDocument()
      expect(screen.getByText('¿Estás seguro de eliminar esta categoría?')).toBeInTheDocument()
    })

    it('should not render confirm dialog when isOpen is false', () => {
      render(<CategoryTable {...defaultProps} />)

      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper table structure', () => {
      render(<CategoryTable {...defaultProps} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('row')).toHaveLength(3) // header + 2 data rows
    })

    it('should have action buttons with title attributes', () => {
      render(<CategoryTable {...defaultProps} />)

      const editButtons = screen.getAllByTitle('Editar')
      const deleteButtons = screen.getAllByTitle('Eliminar')

      expect(editButtons).toHaveLength(2)
      expect(deleteButtons).toHaveLength(2)
    })
  })

  describe('edge cases', () => {
    it('should render default dash for unknown column keys', () => {
      const columnsWithUnknown: CategoryColumnConfig[] = [
        { key: 'unknown', label: 'Unknown', visible: true },
      ]

      render(<CategoryTable {...defaultProps} columns={columnsWithUnknown} />)

      const dashes = screen.getAllByText('—')
      expect(dashes).toHaveLength(2) // One for each category
    })

    it('should handle categories with missing optional fields', () => {
      const categoriesWithMissingFields: Category[] = [
        {
          id: 1,
          name: 'Test',
          slug: 'test',
          is_active: true,
          entity_id: 1,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ]

      render(<CategoryTable {...defaultProps} categories={categoriesWithMissingFields} />)

      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })
})
