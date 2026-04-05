/**
 * Tests for EventsList Component
 *
 * Tests grid layout, loading state, empty state, and event rendering.
 */

import { render, screen } from '@testing-library/react'

import { EventsList } from '@/features/events/components/smart/EventsList'
import { Event, EventStatus,EventType } from '@/types/event.types'

// Helper to create complete Event objects
const createMockEvent = (overrides?: Partial<Event>): Event => ({
  id: 1,
  title: 'Test Event',
  description: 'Test Description',
  type: 'sede_unica' as EventType,
  status: 'published' as EventStatus,
  start_date: '2025-12-15',
  end_date: '2025-12-15',
  is_featured: false,
  locations: [],
  location: {
    id: 1,
    name: 'Teatro San Martín',
    address: 'Av. Corrientes 1530',
    city: 'CABA',
    country: 'Argentina',
    is_active: true,
    entity_id: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  organizer: { id: 1, name: 'John Doe', organization: 'Test Org' },
  approval_history: [],
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
})

// Mock EventCardContainer
jest.mock('../smart/EventCardContainer', () => ({
  EventCardContainer: ({
    event,
    onViewDetail,
    onEditEvent,
    onDeleteEvent
  }: {
    event: Event
    onViewDetail: (id: number) => void
    onEditEvent?: (event: Event) => void
    onDeleteEvent?: (id: number) => void
  }) => (
    <div data-testid={`event-card-${event.id}`}>
      <span data-testid="event-title">{event.title}</span>
      <button onClick={() => onViewDetail(event.id)}>View</button>
      {onEditEvent && <button onClick={() => onEditEvent(event)}>Edit</button>}
      {onDeleteEvent && <button onClick={() => onDeleteEvent(event.id)}>Delete</button>}
    </div>
  )
}))

describe('EventsList', () => {
  const mockOnViewDetail = jest.fn()
  const mockOnEditEvent = jest.fn()
  const mockOnDeleteEvent = jest.fn()
  const mockOnApproveInternal = jest.fn()
  const mockOnRequestPublicApproval = jest.fn()
  const mockOnPublishEvent = jest.fn()
  const mockOnRequestChanges = jest.fn()
  const mockOnRejectEvent = jest.fn()
  const mockOnApproveEvent = jest.fn()

  const mockEvents: Event[] = [
    createMockEvent({ id: 1, title: 'Event 1', status: 'published' as EventStatus }),
    createMockEvent({ id: 2, title: 'Event 2', status: 'draft' as EventStatus, start_date: '2025-12-20', end_date: '2025-12-20' }),
    createMockEvent({ id: 3, title: 'Event 3', status: 'pending' as EventStatus, start_date: '2025-12-25', end_date: '2025-12-25' }),
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('loading state', () => {
    test('should render loading skeletons when isLoading is true', () => {
      render(
        <EventsList
          events={[]}
          isLoading={true}
          onViewDetail={mockOnViewDetail}
        />
      )

      // Should render 6 skeleton cards
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBe(6)
    })

    test('should render skeleton with correct structure', () => {
      render(
        <EventsList
          events={[]}
          isLoading={true}
          onViewDetail={mockOnViewDetail}
        />
      )

      // Check for skeleton elements inside the loading cards
      const skeletonCards = document.querySelectorAll('.animate-pulse')
      expect(skeletonCards[0]).toBeInTheDocument()

      // Should have gray background elements
      const grayBgs = document.querySelectorAll('.bg-gray-200')
      expect(grayBgs.length).toBeGreaterThan(0)
    })

    test('should not render events when loading', () => {
      render(
        <EventsList
          events={mockEvents}
          isLoading={true}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.queryByTestId('event-card-1')).not.toBeInTheDocument()
      expect(screen.queryByTestId('event-card-2')).not.toBeInTheDocument()
    })

    test('should use grid layout for loading skeletons', () => {
      render(
        <EventsList
          events={[]}
          isLoading={true}
          onViewDetail={mockOnViewDetail}
        />
      )

      const grid = document.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
    })
  })

  describe('empty state', () => {
    test('should render empty state when events array is empty', () => {
      render(
        <EventsList
          events={[]}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.getByText('No hay eventos disponibles')).toBeInTheDocument()
    })

    test('should render helpful message in empty state', () => {
      render(
        <EventsList
          events={[]}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.getByText(/no se encontraron eventos/i)).toBeInTheDocument()
    })

    test('should render SVG icon in empty state', () => {
      render(
        <EventsList
          events={[]}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
        />
      )

      const svg = document.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    test('should render empty state when events is null/undefined', () => {
      render(
        <EventsList
          events={null as unknown as Event[]}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.getByText('No hay eventos disponibles')).toBeInTheDocument()
    })
  })

  describe('events rendering', () => {
    test('should render EventCardContainer for each event', () => {
      render(
        <EventsList
          events={mockEvents}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.getByTestId('event-card-1')).toBeInTheDocument()
      expect(screen.getByTestId('event-card-2')).toBeInTheDocument()
      expect(screen.getByTestId('event-card-3')).toBeInTheDocument()
    })

    test('should render event titles', () => {
      render(
        <EventsList
          events={mockEvents}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.getByText('Event 1')).toBeInTheDocument()
      expect(screen.getByText('Event 2')).toBeInTheDocument()
      expect(screen.getByText('Event 3')).toBeInTheDocument()
    })

    test('should use grid layout for events', () => {
      render(
        <EventsList
          events={mockEvents}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
        />
      )

      const grid = document.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6')
    })

    test('should render correct number of event cards', () => {
      render(
        <EventsList
          events={mockEvents}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
        />
      )

      const eventCards = screen.getAllByTestId(/event-card-/)
      expect(eventCards).toHaveLength(3)
    })
  })

  describe('callback props', () => {
    test('should pass onViewDetail to EventCardContainer', () => {
      render(
        <EventsList
          events={mockEvents}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
        />
      )

      const viewButtons = screen.getAllByRole('button', { name: 'View' })
      expect(viewButtons).toHaveLength(3)
    })

    test('should pass onEditEvent to EventCardContainer when provided', () => {
      render(
        <EventsList
          events={mockEvents}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
          onEditEvent={mockOnEditEvent}
        />
      )

      const editButtons = screen.getAllByRole('button', { name: 'Edit' })
      expect(editButtons).toHaveLength(3)
    })

    test('should pass onDeleteEvent to EventCardContainer when provided', () => {
      render(
        <EventsList
          events={mockEvents}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
          onDeleteEvent={mockOnDeleteEvent}
        />
      )

      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' })
      expect(deleteButtons).toHaveLength(3)
    })

    test('should not render edit buttons when onEditEvent is not provided', () => {
      render(
        <EventsList
          events={mockEvents}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    })
  })

  describe('workflow action props', () => {
    test('should accept all workflow action props', () => {
      // This test verifies the component accepts all the workflow props without errors
      render(
        <EventsList
          events={mockEvents}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
          onApproveInternal={mockOnApproveInternal}
          onRequestPublicApproval={mockOnRequestPublicApproval}
          onPublishEvent={mockOnPublishEvent}
          onRequestChanges={mockOnRequestChanges}
          onRejectEvent={mockOnRejectEvent}
          onApproveEvent={mockOnApproveEvent}
        />
      )

      expect(screen.getByTestId('event-card-1')).toBeInTheDocument()
    })
  })

  describe('default props', () => {
    test('should default isLoading to false', () => {
      render(
        <EventsList
          events={mockEvents}
          onViewDetail={mockOnViewDetail}
        />
      )

      // Should show events, not loading state
      expect(screen.getByTestId('event-card-1')).toBeInTheDocument()
      expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    test('should handle single event', () => {
      render(
        <EventsList
          events={[mockEvents[0]]}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
        />
      )

      expect(screen.getByTestId('event-card-1')).toBeInTheDocument()
      expect(screen.queryByTestId('event-card-2')).not.toBeInTheDocument()
    })

    test('should handle many events', () => {
      const manyEvents = Array.from({ length: 20 }, (_, i) =>
        createMockEvent({ id: i + 1, title: `Event ${i + 1}` })
      )

      render(
        <EventsList
          events={manyEvents}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
        />
      )

      const eventCards = screen.getAllByTestId(/event-card-/)
      expect(eventCards).toHaveLength(20)
    })

    test('should preserve event order', () => {
      render(
        <EventsList
          events={mockEvents}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
        />
      )

      const titles = screen.getAllByTestId('event-title')
      expect(titles[0]).toHaveTextContent('Event 1')
      expect(titles[1]).toHaveTextContent('Event 2')
      expect(titles[2]).toHaveTextContent('Event 3')
    })
  })

  describe('styling', () => {
    test('should have centered empty state', () => {
      render(
        <EventsList
          events={[]}
          isLoading={false}
          onViewDetail={mockOnViewDetail}
        />
      )

      // Check that the empty state message is rendered correctly
      const emptyMessage = screen.getByText('No hay eventos disponibles')
      expect(emptyMessage).toBeInTheDocument()
      // The container should have centering styles
      const centeredContainer = document.querySelector('.text-center')
      expect(centeredContainer).toBeInTheDocument()
    })

    test('should have correct spacing for skeleton cards', () => {
      render(
        <EventsList
          events={[]}
          isLoading={true}
          onViewDetail={mockOnViewDetail}
        />
      )

      const grid = document.querySelector('.grid')
      expect(grid).toHaveClass('gap-6')
    })
  })
})
