/**
 * Tests for EventCardContainer (Smart Component)
 *
 * Tests integration with hooks and event card rendering.
 */

import { fireEvent,render, screen } from '@testing-library/react'

import { EventCardContainer } from '@/features/events/components/smart/EventCardContainer'
import { useEventActions } from '@/features/events/hooks/useEventActions'
import { useEventCardLogic } from '@/features/events/hooks/useEventCardLogic'
import { useEventUrgency } from '@/features/events/hooks/useEventUrgency'
import { Event, EventStatus,EventType } from '@/types/event.types'

// Mock hooks
jest.mock('@/features/events/hooks/useEventCardLogic')
jest.mock('@/features/events/hooks/useEventUrgency')
jest.mock('@/features/events/hooks/useEventActions')

// Mock EventCard component
jest.mock('@/features/events/components/dumb/EventCard', () => ({
  EventCard: ({
    event,
    formattedDate,
    statusColor,
    urgencyIndicator,
    actionButtons,
    onViewDetail
  }: {
    event: Event
    formattedDate: { date: string; time: string }
    statusColor: string
    urgencyIndicator: React.ReactNode
    actionButtons: React.ReactNode
    onViewDetail: () => void
  }) => (
    <div data-testid="event-card">
      <span data-testid="event-title">{event.title}</span>
      <span data-testid="formatted-date">{formattedDate.date}</span>
      <span data-testid="formatted-time">{formattedDate.time}</span>
      <span data-testid="status-color">{statusColor}</span>
      <div data-testid="urgency-indicator">{urgencyIndicator}</div>
      <div data-testid="action-buttons">{actionButtons}</div>
      <button data-testid="view-detail-btn" onClick={onViewDetail}>View Detail</button>
    </div>
  )
}))

// Mock Button component
jest.mock('@/components/ui', () => ({
  Button: ({ children, onClick, variant, size }: {
    children: React.ReactNode
    onClick: () => void
    variant: string
    size: string
  }) => (
    <button onClick={onClick} data-variant={variant} data-size={size}>
      {children}
    </button>
  )
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Clock: () => <span data-testid="clock-icon" />
}))

describe('EventCardContainer', () => {
  const mockOnViewDetail = jest.fn()
  const mockOnEditEvent = jest.fn()
  const mockOnDeleteEvent = jest.fn()
  const mockOnApproveInternal = jest.fn()
  const mockOnRequestPublicApproval = jest.fn()
  const mockOnPublishEvent = jest.fn()
  const mockOnRequestChanges = jest.fn()
  const mockOnApproveEvent = jest.fn()

  const baseEvent: Event = {
    id: 1,
    title: 'Test Event',
    description: 'Test description',
    type: 'sede_unica' as EventType,
    status: 'published' as EventStatus,
    start_date: '2025-12-15T18:00:00',
    end_date: '2025-12-15T22:00:00',
    is_featured: false,
    category_id: 1,
    category: { id: 1, name: 'Music', slug: 'music', color: '#FF5733', entity_id: 1, is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    locations: [],
    location: { id: 1, name: 'Teatro', address: 'Test 123', city: 'CABA', country: 'Argentina', features: [], is_active: true, entity_id: 1, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    organizer: { id: 1, name: 'Test Org', organization: 'Test Org' },
    approval_history: [],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  const mockFormattedDate = {
    date: '15 de diciembre, 2025',
    time: '18:00 - 22:00'
  }

  const mockActions = [
    { key: 'view', label: 'Ver', variant: 'primary', onClick: jest.fn() },
    { key: 'edit', label: 'Editar', variant: 'secondary', onClick: jest.fn() }
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    ;(useEventCardLogic as jest.Mock).mockReturnValue({
      formattedDate: mockFormattedDate,
      statusColor: 'bg-green-100 text-green-800',
      canApproveInternal: false,
      canRequestPublicApproval: false,
      canPublish: false,
      canRequestChanges: false
    })

    ;(useEventUrgency as jest.Mock).mockReturnValue({
      urgencyData: null
    })

    ;(useEventActions as jest.Mock).mockReturnValue({
      actions: mockActions
    })
  })

  describe('rendering', () => {
    test('should render EventCard component', () => {
      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.getByTestId('event-card')).toBeInTheDocument()
    })

    test('should pass event to EventCard', () => {
      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.getByTestId('event-title')).toHaveTextContent('Test Event')
    })

    test('should pass formatted date from hook', () => {
      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.getByTestId('formatted-date')).toHaveTextContent('15 de diciembre, 2025')
      expect(screen.getByTestId('formatted-time')).toHaveTextContent('18:00 - 22:00')
    })

    test('should pass status color from hook', () => {
      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.getByTestId('status-color')).toHaveTextContent('bg-green-100 text-green-800')
    })
  })

  describe('hooks integration', () => {
    test('should call useEventCardLogic with event', () => {
      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(useEventCardLogic).toHaveBeenCalledWith(baseEvent)
    })

    test('should call useEventUrgency with event', () => {
      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(useEventUrgency).toHaveBeenCalledWith(baseEvent)
    })

    test('should call useEventActions with correct props', () => {
      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
          onEditEvent={mockOnEditEvent}
          onDeleteEvent={mockOnDeleteEvent}
        />
      )

      expect(useEventActions).toHaveBeenCalledWith(
        expect.objectContaining({
          event: baseEvent,
          onViewDetail: mockOnViewDetail,
          onEditEvent: mockOnEditEvent,
          onDeleteEvent: mockOnDeleteEvent
        })
      )
    })
  })

  describe('urgency indicator', () => {
    test('should render urgency indicator when urgencyData exists', () => {
      ;(useEventUrgency as jest.Mock).mockReturnValue({
        urgencyData: {
          text: 'Urgente',
          className: 'bg-red-100 text-red-800',
          showIcon: true,
          showPulse: false
        }
      })

      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.getByText('Urgente')).toBeInTheDocument()
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument()
    })

    test('should render pulse indicator when showPulse is true', () => {
      ;(useEventUrgency as jest.Mock).mockReturnValue({
        urgencyData: {
          text: 'Hoy',
          className: 'bg-blue-100 text-blue-800',
          showIcon: false,
          showPulse: true
        }
      })

      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.getByText('Hoy')).toBeInTheDocument()
      const pulseElement = document.querySelector('.animate-pulse')
      expect(pulseElement).toBeInTheDocument()
    })

    test('should not render urgency indicator when urgencyData is null', () => {
      ;(useEventUrgency as jest.Mock).mockReturnValue({
        urgencyData: null
      })

      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      const urgencyContainer = screen.getByTestId('urgency-indicator')
      expect(urgencyContainer).toBeEmptyDOMElement()
    })
  })

  describe('action buttons', () => {
    test('should render action buttons from hook', () => {
      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.getByText('Ver')).toBeInTheDocument()
      expect(screen.getByText('Editar')).toBeInTheDocument()
    })

    test('should pass variant and size to buttons', () => {
      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      const viewButton = screen.getByText('Ver')
      expect(viewButton).toHaveAttribute('data-variant', 'primary')
      expect(viewButton).toHaveAttribute('data-size', 'sm')
    })

    test('should call action onClick when button is clicked', () => {
      const mockActionClick = jest.fn()
      ;(useEventActions as jest.Mock).mockReturnValue({
        actions: [
          { key: 'test', label: 'Test Action', variant: 'primary', onClick: mockActionClick }
        ]
      })

      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      fireEvent.click(screen.getByText('Test Action'))
      expect(mockActionClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('onViewDetail handler', () => {
    test('should call onViewDetail with event id when triggered', () => {
      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      fireEvent.click(screen.getByTestId('view-detail-btn'))
      expect(mockOnViewDetail).toHaveBeenCalledWith(1)
    })

    test('should call onViewDetail with correct id for different events', () => {
      const eventWithDifferentId = { ...baseEvent, id: 42 }

      render(
        <EventCardContainer
          event={eventWithDifferentId}
          onViewDetail={mockOnViewDetail}
        />
      )

      fireEvent.click(screen.getByTestId('view-detail-btn'))
      expect(mockOnViewDetail).toHaveBeenCalledWith(42)
    })
  })

  describe('workflow action props', () => {
    test('should pass workflow actions to useEventActions', () => {
      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
          onApproveInternal={mockOnApproveInternal}
          onRequestPublicApproval={mockOnRequestPublicApproval}
          onPublishEvent={mockOnPublishEvent}
          onRequestChanges={mockOnRequestChanges}
        />
      )

      expect(useEventActions).toHaveBeenCalledWith(
        expect.objectContaining({
          onApproveInternal: mockOnApproveInternal,
          onRequestPublicApproval: mockOnRequestPublicApproval,
          onPublishEvent: mockOnPublishEvent,
          onRequestChanges: mockOnRequestChanges
        })
      )
    })

    test('should pass legacy onApproveEvent to useEventActions', () => {
      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
          onApproveEvent={mockOnApproveEvent}
        />
      )

      expect(useEventActions).toHaveBeenCalledWith(
        expect.objectContaining({
          onApproveEvent: mockOnApproveEvent
        })
      )
    })

    test('should pass permission flags to useEventActions', () => {
      ;(useEventCardLogic as jest.Mock).mockReturnValue({
        formattedDate: mockFormattedDate,
        statusColor: 'bg-green-100',
        canApproveInternal: true,
        canRequestPublicApproval: true,
        canPublish: false,
        canRequestChanges: true
      })

      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(useEventActions).toHaveBeenCalledWith(
        expect.objectContaining({
          canApproveInternal: true,
          canRequestPublicApproval: true,
          canPublish: false,
          canRequestChanges: true
        })
      )
    })
  })

  describe('edge cases', () => {
    test('should handle event with no optional handlers', () => {
      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.getByTestId('event-card')).toBeInTheDocument()
    })

    test('should handle empty actions array', () => {
      ;(useEventActions as jest.Mock).mockReturnValue({
        actions: []
      })

      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      const actionButtons = screen.getByTestId('action-buttons')
      expect(actionButtons.querySelector('button')).not.toBeInTheDocument()
    })

    test('should handle multiple actions', () => {
      ;(useEventActions as jest.Mock).mockReturnValue({
        actions: [
          { key: 'view', label: 'Ver', variant: 'primary', onClick: jest.fn() },
          { key: 'edit', label: 'Editar', variant: 'secondary', onClick: jest.fn() },
          { key: 'delete', label: 'Eliminar', variant: 'danger', onClick: jest.fn() },
          { key: 'publish', label: 'Publicar', variant: 'success', onClick: jest.fn() }
        ]
      })

      render(
        <EventCardContainer
          event={baseEvent}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.getByText('Ver')).toBeInTheDocument()
      expect(screen.getByText('Editar')).toBeInTheDocument()
      expect(screen.getByText('Eliminar')).toBeInTheDocument()
      expect(screen.getByText('Publicar')).toBeInTheDocument()
    })
  })
})
