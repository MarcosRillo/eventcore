import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { LocationTableContainer } from '@/features/locations/components/smart/LocationTableContainer'
import { PaginationMeta } from '@/types/api-response.types'
import { Location } from '@/types/location.types'

// Mock GenericTable
jest.mock('@/shared/components/tables', () => ({
  GenericTable: <T extends { id: number }>({
    items,
    columns,
    actions,
    isLoading,
    emptyMessage,
    pagination,
    onPageChange,
    confirmDialog,
    onCloseConfirmDialog,
    testId,
  }: {
    items: T[]
    columns: Array<{ key: string; label: string; render: (item: T) => React.ReactNode }>
    actions: Array<{ key: string; label: string; icon: React.ReactNode; variant: string; onClick: (item: T) => void }>
    isLoading: boolean
    emptyMessage: string
    pagination: { current_page: number; last_page: number; total: number } | null
    onPageChange: (page: number) => void
    confirmDialog: { isOpen: boolean; title: string; message: string; onConfirm: () => void }
    onCloseConfirmDialog: () => void
    testId?: string
  }) => {
    if (isLoading) {
      return <div data-testid={`${testId}-loading`}>Loading...</div>
    }

    if (items.length === 0) {
      return <div data-testid={`${testId}-empty`}>{emptyMessage}</div>
    }

    return (
      <div data-testid={testId}>
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} data-testid={`${testId}-row-${item.id}`}>
                {columns.map(col => (
                  <td key={col.key}>{col.render(item)}</td>
                ))}
                <td>
                  {actions.map(action => (
                    <button
                      key={action.key}
                      onClick={() => action.onClick(item)}
                      data-testid={`${action.key}-button-${item.id}`}
                      title={action.label}
                    >
                      {action.label}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pagination && pagination.total > 0 && (
          <div data-testid="pagination">
            <button onClick={() => onPageChange(pagination.current_page - 1)}>Prev</button>
            <span>Page {pagination.current_page} of {pagination.last_page}</span>
            <button onClick={() => onPageChange(pagination.current_page + 1)}>Next</button>
          </div>
        )}
        {confirmDialog.isOpen && (
          <div data-testid="confirm-dialog" role="alertdialog">
            <h3>{confirmDialog.title}</h3>
            <p>{confirmDialog.message}</p>
            <button onClick={confirmDialog.onConfirm} data-testid="confirm-button">Confirmar</button>
            <button onClick={onCloseConfirmDialog} data-testid="cancel-button">Cancelar</button>
          </div>
        )}
      </div>
    )
  },
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Pencil: () => <span data-testid="pencil-icon" />,
  Trash2: () => <span data-testid="trash-icon" />,
  MapPin: () => <span data-testid="map-pin-icon" />,
}))


// Helper to create mock location
const createMockLocation = (overrides: Partial<Location> = {}): Location => ({
  id: 1,
  name: 'Centro de Convenciones',
  address: 'Av. Soldati 330',
  city: 'Demo City',
  state: 'Demo State',
  country: 'Argentina',
  description: 'Un centro de eventos importante',
  is_active: true,
  entity_id: 1,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
})

// Helper to create mock pagination
const createMockPagination = (overrides: Partial<PaginationMeta> = {}): PaginationMeta => ({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 2,
  from: 1,
  to: 2,
  path: 'http://api.example.com/locations',
  links: [],
  ...overrides,
})

describe('LocationTableContainer', () => {
  const mockLocations = [
    createMockLocation({ id: 1, name: 'Centro de Convenciones' }),
    createMockLocation({ id: 2, name: 'Parque 9 de Julio', description: undefined }),
  ]

  const defaultProps = {
    locations: mockLocations,
    pagination: createMockPagination(),
    loading: false,
    onEdit: jest.fn(),
    onDelete: jest.fn().mockResolvedValue(undefined),
    onPageChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render loading state when loading is true', () => {
      render(<LocationTableContainer {...defaultProps} loading={true} />)

      expect(screen.getByTestId('location-table-loading')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render empty state when no locations', () => {
      render(<LocationTableContainer {...defaultProps} locations={[]} />)

      expect(screen.getByTestId('location-table-empty')).toBeInTheDocument()
      expect(screen.getByText('No hay ubicaciones disponibles')).toBeInTheDocument()
    })

    it('should render table with locations', () => {
      render(<LocationTableContainer {...defaultProps} />)

      expect(screen.getByTestId('location-table')).toBeInTheDocument()
      expect(screen.getByTestId('location-table-row-1')).toBeInTheDocument()
      expect(screen.getByTestId('location-table-row-2')).toBeInTheDocument()
    })

    it('should render column headers', () => {
      render(<LocationTableContainer {...defaultProps} />)

      expect(screen.getByText('Ubicación')).toBeInTheDocument()
      expect(screen.getByText('Dirección')).toBeInTheDocument()
      expect(screen.getByText('Acciones')).toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('should render edit and delete buttons for each location', () => {
      render(<LocationTableContainer {...defaultProps} />)

      expect(screen.getByTestId('edit-button-1')).toBeInTheDocument()
      expect(screen.getByTestId('delete-button-1')).toBeInTheDocument()
      expect(screen.getByTestId('edit-button-2')).toBeInTheDocument()
      expect(screen.getByTestId('delete-button-2')).toBeInTheDocument()
    })

    it('should call onEdit when edit button is clicked', () => {
      render(<LocationTableContainer {...defaultProps} />)

      fireEvent.click(screen.getByTestId('edit-button-1'))

      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockLocations[0])
    })

    it('should show confirm dialog when delete button is clicked', () => {
      render(<LocationTableContainer {...defaultProps} />)

      fireEvent.click(screen.getByTestId('delete-button-1'))

      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      expect(screen.getByText('Eliminar Ubicación')).toBeInTheDocument()
      expect(screen.getByText(/¿Estás seguro de que deseas eliminar "Centro de Convenciones"/)).toBeInTheDocument()
    })

    it('should call onDelete when confirm button is clicked', async () => {
      render(<LocationTableContainer {...defaultProps} />)

      // Click delete to open dialog
      fireEvent.click(screen.getByTestId('delete-button-1'))

      // Click confirm
      fireEvent.click(screen.getByTestId('confirm-button'))

      await waitFor(() => {
        expect(defaultProps.onDelete).toHaveBeenCalledWith(1)
      })
    })

    it('should provide close handler for confirm dialog', () => {
      render(<LocationTableContainer {...defaultProps} />)

      // Click delete to open dialog
      fireEvent.click(screen.getByTestId('delete-button-1'))
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()

      // Verify cancel button exists and is clickable
      const cancelButton = screen.getByTestId('cancel-button')
      expect(cancelButton).toBeInTheDocument()

      // Click cancel - should not throw
      expect(() => fireEvent.click(cancelButton)).not.toThrow()
    })
  })

  describe('pagination', () => {
    it('should render pagination when pagination is provided', () => {
      render(<LocationTableContainer {...defaultProps} />)

      expect(screen.getByTestId('pagination')).toBeInTheDocument()
      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
    })

    it('should call onPageChange when pagination is used', () => {
      render(<LocationTableContainer {...defaultProps} pagination={createMockPagination({ last_page: 3 })} />)

      fireEvent.click(screen.getByText('Next'))

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2)
    })
  })
})
