import { fireEvent,render, screen } from '@testing-library/react'

import { LocationTable } from '@/features/locations/components/dumb/LocationTable'
import { Location } from '@/types/location.types'

// Mock heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  PencilIcon: () => <span data-testid="pencil-icon" />,
  TrashIcon: () => <span data-testid="trash-icon" />,
}))

// Mock @/components/ui with all needed components
jest.mock('@/components/ui', () => ({
  Button: ({ children, onClick, title, variant, size, 'aria-label': ariaLabel }: {
    children: React.ReactNode
    onClick?: () => void
    title?: string
    variant?: string
    size?: string
    'aria-label'?: string
  }) => (
    <button onClick={onClick} title={title} data-variant={variant} data-size={size} aria-label={ariaLabel}>
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

describe('LocationTable', () => {
  // Simplified mock locations for Tucumán Tourism
  const mockLocations: Location[] = [
    {
      id: 1,
      name: 'Centro de Convenciones Tucumán',
      address: 'Av. Soldati 330',
      city: 'San Miguel de Tucumán',
      state: 'Tucumán',
      country: 'Argentina',
      description: 'Centro de eventos principal',
      is_active: true,
      entity_id: 1,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Parque 9 de Julio',
      address: 'Av. Aconquija s/n',
      city: 'San Miguel de Tucumán',
      state: 'Tucumán',
      country: 'Argentina',
      is_active: true,
      entity_id: 1,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ]

  const mockPagination = {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 2,
    from: 1,
    to: 2,
    path: 'http://api.example.com/locations',
    links: [],
  }

  const mockConfirmDialog = {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: jest.fn(),
  }

  const defaultProps = {
    locations: mockLocations,
    pagination: mockPagination,
    loading: false,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onPageChange: jest.fn(),
    confirmDialog: mockConfirmDialog,
    onCloseConfirmDialog: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render loading state when loading is true', () => {
      render(<LocationTable {...defaultProps} loading={true} />)

      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should render empty state when no locations', () => {
      render(<LocationTable {...defaultProps} locations={[]} />)

      expect(screen.getByText('No hay ubicaciones disponibles')).toBeInTheDocument()
    })

    it('should render table with locations', () => {
      render(<LocationTable {...defaultProps} />)

      expect(screen.getByText('Centro de Convenciones Tucumán')).toBeInTheDocument()
      expect(screen.getByText('Parque 9 de Julio')).toBeInTheDocument()
    })

    it('should render simplified table headers', () => {
      render(<LocationTable {...defaultProps} />)

      expect(screen.getByText('Ubicación')).toBeInTheDocument()
      expect(screen.getByText('Ciudad')).toBeInTheDocument()
      expect(screen.getByText('Descripción')).toBeInTheDocument()
      expect(screen.getByText('Acciones')).toBeInTheDocument()
    })
  })

  describe('location data display', () => {
    it('should display location name and address', () => {
      render(<LocationTable {...defaultProps} />)

      expect(screen.getByText('Centro de Convenciones Tucumán')).toBeInTheDocument()
      expect(screen.getByText('Av. Soldati 330')).toBeInTheDocument()
    })

    it('should display city and state', () => {
      render(<LocationTable {...defaultProps} />)

      // Multiple Tucumán occurrences expected (state for each location)
      const tucumanElements = screen.getAllByText('Tucumán')
      expect(tucumanElements.length).toBeGreaterThan(0)
    })

    it('should display description when available', () => {
      render(<LocationTable {...defaultProps} />)

      expect(screen.getByText('Centro de eventos principal')).toBeInTheDocument()
    })

    it('should display dash when description is undefined', () => {
      render(<LocationTable {...defaultProps} />)

      // Parque 9 de Julio has no description
      const dashes = screen.getAllByText('—')
      expect(dashes.length).toBeGreaterThan(0)
    })
  })

  describe('action buttons', () => {
    it('should render edit buttons for each location', () => {
      render(<LocationTable {...defaultProps} />)

      const editIcons = screen.getAllByTestId('pencil-icon')
      expect(editIcons).toHaveLength(2)
    })

    it('should render delete buttons for each location', () => {
      render(<LocationTable {...defaultProps} />)

      const deleteIcons = screen.getAllByTestId('trash-icon')
      expect(deleteIcons).toHaveLength(2)
    })

    it('should call onEdit when edit button is clicked', () => {
      render(<LocationTable {...defaultProps} />)

      const editButtons = screen.getAllByTitle('Editar')
      fireEvent.click(editButtons[0])

      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockLocations[0])
    })

    it('should call onDelete when delete button is clicked', () => {
      render(<LocationTable {...defaultProps} />)

      const deleteButtons = screen.getAllByTitle('Eliminar')
      fireEvent.click(deleteButtons[0])

      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockLocations[0])
    })
  })

  describe('pagination', () => {
    it('should render pagination when total > 0', () => {
      render(<LocationTable {...defaultProps} />)

      // Pagination component should be rendered with neutral border
      const paginationContainer = document.querySelector('.border-t.border-neutral-200')
      expect(paginationContainer).toBeInTheDocument()
    })

    it('should not render pagination when pagination is null', () => {
      render(<LocationTable {...defaultProps} pagination={null} />)

      const paginationContainer = document.querySelector('.border-t.border-neutral-200')
      expect(paginationContainer).not.toBeInTheDocument()
    })

    it('should not render pagination when total is 0', () => {
      const zeroPagination = { ...mockPagination, total: 0 }
      render(<LocationTable {...defaultProps} pagination={zeroPagination} />)

      const paginationContainer = document.querySelector('.border-t.border-neutral-200')
      expect(paginationContainer).not.toBeInTheDocument()
    })
  })

  describe('confirm dialog', () => {
    it('should render confirm dialog when isOpen is true', () => {
      const openConfirmDialog = {
        ...mockConfirmDialog,
        isOpen: true,
        title: 'Eliminar ubicación',
        message: '¿Está seguro de eliminar esta ubicación?',
      }

      render(<LocationTable {...defaultProps} confirmDialog={openConfirmDialog} />)

      expect(screen.getByText('Eliminar ubicación')).toBeInTheDocument()
      expect(screen.getByText('¿Está seguro de eliminar esta ubicación?')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper table structure', () => {
      render(<LocationTable {...defaultProps} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('row')).toHaveLength(3) // header + 2 data rows
    })

    it('should have edit buttons with title attribute', () => {
      render(<LocationTable {...defaultProps} />)

      const editButtons = screen.getAllByTitle('Editar')
      expect(editButtons).toHaveLength(2)
    })

    it('should have delete buttons with title attribute', () => {
      render(<LocationTable {...defaultProps} />)

      const deleteButtons = screen.getAllByTitle('Eliminar')
      expect(deleteButtons).toHaveLength(2)
    })

    it('should have aria-labels on action buttons', () => {
      render(<LocationTable {...defaultProps} />)

      expect(screen.getByLabelText('Editar Centro de Convenciones Tucumán')).toBeInTheDocument()
      expect(screen.getByLabelText('Eliminar Centro de Convenciones Tucumán')).toBeInTheDocument()
    })
  })
})
