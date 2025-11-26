import { render, screen, fireEvent } from '@testing-library/react'
import { EventTable, ColumnConfig, ActionConfig, ConfirmDialogData } from '../EventTable'
import { Event, EVENT_STATUS, EVENT_TYPE } from '@/types/event.types'

// Mock UI components
jest.mock('@/components/ui', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
  ConfirmDialog: ({ isOpen, title, message, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        <div data-testid="confirm-title">{title}</div>
        <div data-testid="confirm-message">{message}</div>
        <button data-testid="confirm-button" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ) : null,
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}))

// Mock PermissionGate to always allow
jest.mock('@/components/auth/PermissionGate', () => ({
  PermissionGate: ({ children }: any) => <>{children}</>,
}))

const createMockEvent = (overrides?: Partial<Event>): Event => ({
  id: 1,
  title: 'Test Event',
  description: 'Test Description',
  start_date: '2025-12-15T10:00:00Z',
  end_date: '2025-12-15T18:00:00Z',
  status: EVENT_STATUS.DRAFT,
  type: EVENT_TYPE.SINGLE_LOCATION,
  category_id: 1,
  location_id: 1,
  organizer_id: 1,
  is_featured: false,
  created_at: '2025-11-01T00:00:00Z',
  updated_at: '2025-11-01T00:00:00Z',
  category: {
    id: 1,
    name: 'Music',
    slug: 'music',
    color: '#FF5733',
  },
  location: {
    id: 1,
    name: 'Teatro San Martín',
    address: 'Av. Corrientes 1530',
    city: 'CABA',
  },
  organizer: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    organization: 'Test Org',
  },
  ...overrides,
})

describe('EventTable', () => {
  const mockColumns: ColumnConfig[] = [
    { key: 'event', label: 'Evento', visible: true },
    { key: 'date', label: 'Fecha', visible: true },
    { key: 'location', label: 'Ubicación', visible: true },
    { key: 'actions', label: 'Acciones', visible: true, className: 'text-right' },
  ]

  const mockActions: ActionConfig[] = [
    {
      key: 'view',
      label: 'Ver',
      icon: '👁️',
      className: 'text-blue-600',
      onClick: jest.fn(),
    },
  ]

  const mockConfirmDialog: ConfirmDialogData = {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: jest.fn(),
  }

  const mockStatusLabels = {
    [EVENT_STATUS.DRAFT]: { label: 'Borrador', className: 'bg-gray-100' },
    [EVENT_STATUS.PUBLISHED]: { label: 'Publicado', className: 'bg-green-100' },
  }

  const mockTypeLabels = {
    [EVENT_TYPE.SINGLE_LOCATION]: 'Sede Única',
    [EVENT_TYPE.MULTI_LOCATION]: 'Multi-Sede',
  }

  const mockFormatDate = jest.fn((dateString: string) => '15/12/2025 10:00')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should display loading spinner when isLoading is true', () => {
      render(
        <EventTable
          events={[]}
          isLoading={true}
          columns={mockColumns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should display empty message when no events exist', () => {
      render(
        <EventTable
          events={[]}
          isLoading={false}
          columns={mockColumns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByText('No hay eventos disponibles')).toBeInTheDocument()
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('Table Rendering', () => {
    it('should render table with events when data exists', () => {
      const events = [createMockEvent()]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={mockColumns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText('Test Event')).toBeInTheDocument()
    })

    it('should render only visible columns', () => {
      const columnsWithHidden: ColumnConfig[] = [
        { key: 'event', label: 'Evento', visible: true },
        { key: 'date', label: 'Fecha', visible: false },
        { key: 'location', label: 'Ubicación', visible: true },
      ]

      const events = [createMockEvent()]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columnsWithHidden}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      // Should only have 2 headers (event and location)
      const headers = screen.getAllByRole('columnheader')
      expect(headers).toHaveLength(2)
      expect(screen.getByText('Evento')).toBeInTheDocument()
      expect(screen.queryByText('Fecha')).not.toBeInTheDocument()
      expect(screen.getByText('Ubicación')).toBeInTheDocument()
    })

    it('should apply custom className to column headers', () => {
      const events = [createMockEvent()]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={mockColumns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      const actionsHeader = screen.getByText('Acciones')
      expect(actionsHeader).toHaveClass('text-right')
    })
  })

  describe('Event Rendering', () => {
    it('should render event title and description', () => {
      const events = [createMockEvent()]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={mockColumns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByText('Test Event')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    it('should show featured badge for featured events', () => {
      const events = [createMockEvent({ is_featured: true })]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={mockColumns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByText('Destacado')).toBeInTheDocument()
    })

    it('should hide description in compact view', () => {
      const events = [createMockEvent()]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={mockColumns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          compactView={true}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByText('Test Event')).toBeInTheDocument()
      expect(screen.queryByText('Test Description')).not.toBeInTheDocument()
    })
  })

  describe('Date Rendering', () => {
    it('should call onFormatDate for start date', () => {
      const columns: ColumnConfig[] = [
        { key: 'date', label: 'Fecha', visible: true },
      ]
      const events = [createMockEvent()]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(mockFormatDate).toHaveBeenCalledWith(events[0].start_date)
    })

    it('should show end date when different from start date', () => {
      const columns: ColumnConfig[] = [
        { key: 'date', label: 'Fecha', visible: true },
      ]
      const events = [
        createMockEvent({
          start_date: '2025-12-15T10:00:00Z',
          end_date: '2025-12-17T18:00:00Z',
        }),
      ]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(mockFormatDate).toHaveBeenCalledWith(events[0].start_date)
      expect(mockFormatDate).toHaveBeenCalledWith(events[0].end_date)
      expect(screen.getByText(/hasta/)).toBeInTheDocument()
    })
  })

  describe('Location Rendering', () => {
    it('should render location name from location object', () => {
      const columns: ColumnConfig[] = [
        { key: 'location', label: 'Ubicación', visible: true },
      ]
      const events = [createMockEvent()]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByText('Teatro San Martín')).toBeInTheDocument()
    })

    it('should render location_text when location object is missing', () => {
      const columns: ColumnConfig[] = [
        { key: 'location', label: 'Ubicación', visible: true },
      ]
      const events = [createMockEvent({ location: undefined, location_text: 'Custom Location' })]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByText('Custom Location')).toBeInTheDocument()
    })

    it('should show multi-location indicator', () => {
      const columns: ColumnConfig[] = [
        { key: 'location', label: 'Ubicación', visible: true },
      ]
      const events = [
        createMockEvent({
          locations: [
            { id: 1, name: 'Location 1', address: 'Address 1', city: 'City 1' },
            { id: 2, name: 'Location 2', address: 'Address 2', city: 'City 2' },
            { id: 3, name: 'Location 3', address: 'Address 3', city: 'City 3' },
          ],
        }),
      ]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByText(/\+2 más/)).toBeInTheDocument()
    })
  })

  describe('Status Rendering', () => {
    it('should render status badge with correct label and color', () => {
      const columns: ColumnConfig[] = [
        { key: 'status', label: 'Estado', visible: true },
      ]
      const events = [createMockEvent({ status: EVENT_STATUS.DRAFT })]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      const badge = screen.getByText('Borrador')
      expect(badge).toHaveClass('bg-gray-100')
    })

    it('should handle status as object', () => {
      const columns: ColumnConfig[] = [
        { key: 'status', label: 'Estado', visible: true },
      ]
      const events = [
        createMockEvent({
          status: {
            status_code: EVENT_STATUS.PUBLISHED,
            status_name: 'Publicado',
          } as any,
        }),
      ]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByText('Publicado')).toBeInTheDocument()
    })
  })

  describe('Type Rendering', () => {
    it('should render type badge with correct label', () => {
      const columns: ColumnConfig[] = [
        { key: 'type', label: 'Tipo', visible: true },
      ]
      const events = [createMockEvent({ type: EVENT_TYPE.SINGLE_LOCATION })]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByText('Sede Única')).toBeInTheDocument()
    })

    it('should handle type as object', () => {
      const columns: ColumnConfig[] = [
        { key: 'type', label: 'Tipo', visible: true },
      ]
      const events = [
        createMockEvent({
          type: {
            type_code: EVENT_TYPE.MULTI_LOCATION,
            type_name: 'Multi-Sede',
          } as any,
        }),
      ]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByText('Multi-Sede')).toBeInTheDocument()
    })
  })

  describe('Category Rendering', () => {
    it('should render category badge with color', () => {
      const columns: ColumnConfig[] = [
        { key: 'category', label: 'Categoría', visible: true },
      ]
      const events = [createMockEvent()]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      const badge = screen.getByText('Music')
      expect(badge).toHaveStyle({ backgroundColor: '#FF5733' })
    })

    it('should show placeholder when category is missing', () => {
      const columns: ColumnConfig[] = [
        { key: 'category', label: 'Categoría', visible: true },
      ]
      const events = [createMockEvent({ category: undefined })]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByText('Sin categoría')).toBeInTheDocument()
    })
  })

  describe('Organizer Rendering', () => {
    it('should render organizer name and organization', () => {
      const columns: ColumnConfig[] = [
        { key: 'organizer', label: 'Organizador', visible: true },
      ]
      const events = [createMockEvent()]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Test Org')).toBeInTheDocument()
    })

    it('should show placeholder when organizer is missing', () => {
      const columns: ColumnConfig[] = [
        { key: 'organizer', label: 'Organizador', visible: true },
      ]
      const events = [createMockEvent({ organizer: undefined })]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByText('No especificado')).toBeInTheDocument()
    })
  })

  describe('Actions Rendering', () => {
    it('should render action buttons', () => {
      const events = [createMockEvent()]
      const onViewClick = jest.fn()
      const actions: ActionConfig[] = [
        {
          key: 'view',
          label: 'Ver',
          icon: '👁️',
          className: 'text-blue-600',
          onClick: onViewClick,
        },
      ]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={mockColumns}
          actions={actions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      const button = screen.getByRole('button', { name: /ver/i })
      fireEvent.click(button)

      expect(onViewClick).toHaveBeenCalledWith(events[0])
    })

    it('should only render actions that meet conditions', () => {
      const events = [createMockEvent({ status: EVENT_STATUS.DRAFT })]
      const actions: ActionConfig[] = [
        {
          key: 'always-visible',
          label: 'Always Visible',
          icon: '✅',
          className: '',
          onClick: jest.fn(),
        },
        {
          key: 'conditional',
          label: 'Conditional',
          icon: '❌',
          className: '',
          condition: (event) => event.status === EVENT_STATUS.PUBLISHED,
          onClick: jest.fn(),
        },
      ]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={mockColumns}
          actions={actions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByRole('button', { name: /always visible/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /conditional/i })).not.toBeInTheDocument()
    })
  })

  describe('Confirm Dialog', () => {
    it('should render confirm dialog when isOpen is true', () => {
      const confirmDialog: ConfirmDialogData = {
        isOpen: true,
        title: 'Confirm Delete',
        message: 'Are you sure?',
        onConfirm: jest.fn(),
      }

      render(
        <EventTable
          events={[createMockEvent()]}
          isLoading={false}
          columns={mockColumns}
          actions={mockActions}
          confirmDialog={confirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
      expect(screen.getByTestId('confirm-title')).toHaveTextContent('Confirm Delete')
      expect(screen.getByTestId('confirm-message')).toHaveTextContent('Are you sure?')
    })

    it('should call onConfirm when confirm button is clicked', () => {
      const onConfirm = jest.fn()
      const confirmDialog: ConfirmDialogData = {
        isOpen: true,
        title: 'Confirm',
        message: 'Message',
        onConfirm,
      }

      render(
        <EventTable
          events={[createMockEvent()]}
          isLoading={false}
          columns={mockColumns}
          actions={mockActions}
          confirmDialog={confirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      fireEvent.click(screen.getByTestId('confirm-button'))
      expect(onConfirm).toHaveBeenCalled()
    })

    it('should call onCloseConfirmDialog when cancel button is clicked', () => {
      const onCloseConfirmDialog = jest.fn()
      const confirmDialog: ConfirmDialogData = {
        isOpen: true,
        title: 'Confirm',
        message: 'Message',
        onConfirm: jest.fn(),
      }

      render(
        <EventTable
          events={[createMockEvent()]}
          isLoading={false}
          columns={mockColumns}
          actions={mockActions}
          confirmDialog={confirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={onCloseConfirmDialog}
        />
      )

      fireEvent.click(screen.getByTestId('cancel-button'))
      expect(onCloseConfirmDialog).toHaveBeenCalled()
    })
  })

  describe('Feedback Rendering', () => {
    it('should show comments badge when approval_comments exist', () => {
      const columns: ColumnConfig[] = [
        { key: 'feedback', label: 'Comentarios', visible: true },
      ]
      const events = [createMockEvent({ approval_comments: 'Please fix the title' })]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByText('Con comentarios')).toBeInTheDocument()
    })

    it('should show placeholder when no comments exist', () => {
      const columns: ColumnConfig[] = [
        { key: 'feedback', label: 'Comentarios', visible: true },
      ]
      const events = [createMockEvent({ approval_comments: '' })]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(screen.getByText('Sin comentarios')).toBeInTheDocument()
    })
  })

  describe('Created Date Rendering', () => {
    it('should format and display created_at date', () => {
      const columns: ColumnConfig[] = [
        { key: 'created', label: 'Creado', visible: true },
      ]
      const events = [createMockEvent()]

      render(
        <EventTable
          events={events}
          isLoading={false}
          columns={columns}
          actions={mockActions}
          confirmDialog={mockConfirmDialog}
          statusLabels={mockStatusLabels}
          typeLabels={mockTypeLabels}
          onFormatDate={mockFormatDate}
          onCloseConfirmDialog={jest.fn()}
        />
      )

      expect(mockFormatDate).toHaveBeenCalledWith(events[0].created_at)
    })
  })
})
