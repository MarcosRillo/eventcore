/**
 * DashboardModeView Component Tests
 * Tests for the admin dashboard view with tab-based event filtering
 */

import { fireEvent,render, screen, waitFor } from '@testing-library/react'

import { DashboardModeView } from '@/features/entity-admin/components/DashboardModeView'
import { Event, EVENT_STATUS, EVENT_TYPE } from '@/types/event.types'

// Mock dependencies
const mockUseAuth = jest.fn()
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock child components
jest.mock('@/features/events/components', () => ({
  EventsFilterTabs: ({
    activeTab,
    onTabChange,
    counters,
  }: {
    activeTab: string
    onTabChange: (tab: string) => void
    counters: Record<string, number>
  }) => (
    <div data-testid="events-filter-tabs">
      <span data-testid="active-tab">{activeTab}</span>
      <span data-testid="counters">{JSON.stringify(counters)}</span>
      <button data-testid="tab-requires-action" onClick={() => onTabChange('requires-action')}>
        Requires Action
      </button>
      <button data-testid="tab-pending" onClick={() => onTabChange('pending')}>
        Pending
      </button>
      <button data-testid="tab-published" onClick={() => onTabChange('published')}>
        Published
      </button>
      <button data-testid="tab-historic" onClick={() => onTabChange('historic')}>
        Historic
      </button>
    </div>
  ),
  EventsList: ({
    events,
    isLoading,
    onViewDetail,
    onApproveInternal,
    onPublishEvent,
  }: {
    events: Event[]
    isLoading: boolean
    onViewDetail: (id: number) => void
    onApproveInternal?: (event: Event) => void
    onPublishEvent?: (event: Event) => void
  }) => (
    <div data-testid="events-list">
      <span data-testid="events-count">{events.length}</span>
      <span data-testid="is-loading">{isLoading.toString()}</span>
      {events.map((event) => (
        <div key={event.id} data-testid={`event-${event.id}`}>
          <span>{event.title}</span>
          <button onClick={() => onViewDetail(event.id)}>View</button>
          {onApproveInternal && (
            <button onClick={() => onApproveInternal(event)}>Approve Internal</button>
          )}
          {onPublishEvent && <button onClick={() => onPublishEvent(event)}>Publish</button>}
        </div>
      ))}
    </div>
  ),
}))

// Helper to create mock events with specific statuses
const createMockEvent = (overrides?: Partial<Event>): Event => ({
  id: 1,
  title: 'Test Event',
  description: 'Test Description',
  start_date: '2025-12-15T10:00:00Z',
  end_date: '2025-12-20T18:00:00Z',
  status: EVENT_STATUS.DRAFT,
  type: EVENT_TYPE.SINGLE_LOCATION,
  event_type_id: 1,
  event_subtype_id: 1,
  event_type: { id: 1, name: 'Cultural', entity_id: 1, is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  event_subtype: { id: 1, name: 'Music Festival', event_type_id: 1, entity_id: 1, is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  is_featured: false,
  created_at: '2025-11-01T00:00:00Z',
  updated_at: '2025-11-01T00:00:00Z',
  approval_history: [],
  locations: [],
  ...overrides,
})

describe('DashboardModeView', () => {
  const defaultProps = {
    events: [],
    isLoading: false,
    onViewDetail: jest.fn(),
    onEditEvent: jest.fn(),
    onDeleteEvent: jest.fn(),
    onApproveInternal: jest.fn(),
    onRequestPublicApproval: jest.fn(),
    onPublishEvent: jest.fn(),
    onRequestChanges: jest.fn(),
    onRejectEvent: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Default to entity_admin user
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        name: 'Admin User',
        email: 'admin@test.com',
        role: { role_code: 'entity_admin', role_name: 'Entity Admin' },
      },
    })
  })

  describe('Dashboard Mode Visibility', () => {
    it('should show dashboard mode for entity_admin users', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 1,
          name: 'Entity Admin',
          role: { role_code: 'entity_admin' },
        },
      })

      render(<DashboardModeView {...defaultProps} />)

      expect(screen.getByTestId('events-filter-tabs')).toBeInTheDocument()
    })

    it('should show dashboard mode for entity_staff users', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 2,
          name: 'Entity Staff',
          role: { role_code: 'entity_staff' },
        },
      })

      render(<DashboardModeView {...defaultProps} />)

      expect(screen.getByTestId('events-filter-tabs')).toBeInTheDocument()
    })

    it('should NOT show dashboard mode for organizer_admin users', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 3,
          name: 'Organizer',
          role: { role_code: 'organizer_admin' },
        },
      })

      render(<DashboardModeView {...defaultProps} />)

      expect(screen.queryByTestId('events-filter-tabs')).not.toBeInTheDocument()
      expect(screen.getByText('Eventos Publicados')).toBeInTheDocument()
    })

    it('should NOT show dashboard mode for unauthenticated users', () => {
      mockUseAuth.mockReturnValue({
        user: null,
      })

      render(<DashboardModeView {...defaultProps} />)

      expect(screen.queryByTestId('events-filter-tabs')).not.toBeInTheDocument()
      expect(screen.getByText('Todos los Eventos')).toBeInTheDocument()
    })
  })

  describe('Event Filtering by Tab', () => {
    it('should filter requires-action events correctly', async () => {
      const events = [
        createMockEvent({ id: 1, status: 'pending_internal_approval' }),
        createMockEvent({ id: 2, status: 'pending_public_approval' }),
        createMockEvent({ id: 3, status: 'requires_changes' }),
        createMockEvent({ id: 4, status: 'published' }), // Should NOT be in requires-action
      ]

      render(<DashboardModeView {...defaultProps} events={events} />)

      // Check counters include requires-action count
      await waitFor(() => {
        const countersEl = screen.getByTestId('counters')
        const counters = JSON.parse(countersEl.textContent || '{}')
        expect(counters['requires-action']).toBe(3)
      })
    })

    it('should filter pending events correctly (approved_internal and draft)', async () => {
      const events = [
        createMockEvent({ id: 1, status: 'approved_internal' }),
        createMockEvent({ id: 2, status: 'draft' }),
        createMockEvent({ id: 3, status: 'published' }), // Should NOT be in pending
      ]

      render(<DashboardModeView {...defaultProps} events={events} />)

      await waitFor(() => {
        const countersEl = screen.getByTestId('counters')
        const counters = JSON.parse(countersEl.textContent || '{}')
        expect(counters['pending']).toBe(2)
      })
    })

    it('should filter published events correctly', async () => {
      const events = [
        createMockEvent({ id: 1, status: 'published' }),
        createMockEvent({ id: 2, status: 'published' }),
        createMockEvent({ id: 3, status: 'draft' }), // Should NOT be in published
      ]

      render(<DashboardModeView {...defaultProps} events={events} />)

      await waitFor(() => {
        const countersEl = screen.getByTestId('counters')
        const counters = JSON.parse(countersEl.textContent || '{}')
        expect(counters['published']).toBe(2)
      })
    })

    it('should filter historic events correctly (rejected, cancelled, or ended)', async () => {
      const pastDate = '2020-01-01T00:00:00Z'
      const events = [
        createMockEvent({ id: 1, status: 'rejected' }),
        createMockEvent({ id: 2, status: 'cancelled' }),
        createMockEvent({ id: 3, status: 'published', end_date: pastDate }), // Ended event
        createMockEvent({ id: 4, status: 'published', end_date: '2030-12-31T00:00:00Z' }), // Future, not historic
      ]

      render(<DashboardModeView {...defaultProps} events={events} />)

      await waitFor(() => {
        const countersEl = screen.getByTestId('counters')
        const counters = JSON.parse(countersEl.textContent || '{}')
        expect(counters['historic']).toBe(3) // rejected + cancelled + ended
      })
    })
  })

  describe('Tab Counter Calculations', () => {
    it('should calculate all counters correctly with mixed events', async () => {
      const events = [
        // requires-action: 2
        createMockEvent({
          id: 1,
          status: 'pending_internal_approval',
          end_date: '2030-12-31T00:00:00Z'
        }),
        createMockEvent({
          id: 2,
          status: 'pending_public_approval',
          end_date: '2030-12-31T00:00:00Z'
        }),
        // pending: 1
        createMockEvent({
          id: 3,
          status: 'draft',
          end_date: '2030-12-31T00:00:00Z'
        }),
        // published: 1
        createMockEvent({ id: 4, status: 'published', end_date: '2030-12-31T00:00:00Z' }),
        // historic: 1
        createMockEvent({ id: 5, status: 'rejected' }),
      ]

      render(<DashboardModeView {...defaultProps} events={events} />)

      await waitFor(() => {
        const countersEl = screen.getByTestId('counters')
        const counters = JSON.parse(countersEl.textContent || '{}')
        expect(counters['requires-action']).toBe(2)
        expect(counters['pending']).toBe(1)
        expect(counters['published']).toBe(1)
        expect(counters['historic']).toBe(1)
      })
    })

    it('should handle empty events array', async () => {
      render(<DashboardModeView {...defaultProps} events={[]} />)

      await waitFor(() => {
        const countersEl = screen.getByTestId('counters')
        const counters = JSON.parse(countersEl.textContent || '{}')
        expect(counters['requires-action']).toBe(0)
        expect(counters['pending']).toBe(0)
        expect(counters['published']).toBe(0)
        expect(counters['historic']).toBe(0)
      })
    })

    it('should handle null events gracefully', async () => {
      // @ts-expect-error - Testing null handling
      render(<DashboardModeView {...defaultProps} events={null} />)

      await waitFor(() => {
        const countersEl = screen.getByTestId('counters')
        const counters = JSON.parse(countersEl.textContent || '{}')
        expect(counters['requires-action']).toBe(0)
      })
    })
  })

  describe('Event Status Object Support', () => {
    it('should handle status as string', async () => {
      const events = [createMockEvent({ id: 1, status: 'pending_internal_approval' })]

      render(<DashboardModeView {...defaultProps} events={events} />)

      await waitFor(() => {
        const countersEl = screen.getByTestId('counters')
        const counters = JSON.parse(countersEl.textContent || '{}')
        expect(counters['requires-action']).toBe(1)
      })
    })

    it('should handle status as object with status_code', async () => {
      const events = [
        createMockEvent({
          id: 1,
          status: { status_code: 'pending_internal_approval', status_name: 'Pending Internal' },
        }),
      ]

      render(<DashboardModeView {...defaultProps} events={events} />)

      await waitFor(() => {
        const countersEl = screen.getByTestId('counters')
        const counters = JSON.parse(countersEl.textContent || '{}')
        expect(counters['requires-action']).toBe(1)
      })
    })
  })

  describe('Event Action Handlers', () => {
    it('should call onViewDetail when view action is triggered', async () => {
      const onViewDetail = jest.fn()
      const events = [createMockEvent({ id: 42, status: 'draft' })]

      render(<DashboardModeView {...defaultProps} events={events} onViewDetail={onViewDetail} />)

      const viewButton = screen.getByRole('button', { name: /view/i })
      viewButton.click()

      expect(onViewDetail).toHaveBeenCalledWith(42)
    })

    it('should call onApproveInternal when approve action is triggered', () => {
      const onApproveInternal = jest.fn()
      const events = [createMockEvent({ id: 1, status: 'pending_internal_approval' })]

      render(
        <DashboardModeView {...defaultProps} events={events} onApproveInternal={onApproveInternal} />
      )

      const approveButton = screen.getByRole('button', { name: /approve internal/i })
      approveButton.click()

      expect(onApproveInternal).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
    })

    it('should call onPublishEvent when publish action is triggered', () => {
      const onPublishEvent = jest.fn()
      const events = [createMockEvent({ id: 1, status: 'pending_public_approval' })]

      render(
        <DashboardModeView {...defaultProps} events={events} onPublishEvent={onPublishEvent} />
      )

      // Get the publish button within the event card (not the tab button)
      const eventCard = screen.getByTestId('event-1')
      const publishButton = eventCard.querySelector('button:last-child')
      fireEvent.click(publishButton!)

      expect(onPublishEvent).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
    })
  })

  describe('Legacy Compatibility', () => {
    it('should use onApproveEvent as fallback when onApproveInternal is not provided', () => {
      const onApproveEvent = jest.fn()
      const events = [createMockEvent({ id: 1, status: 'draft' })]

      render(
        <DashboardModeView
          events={events}
          isLoading={false}
          onViewDetail={jest.fn()}
          onApproveEvent={onApproveEvent}
        />
      )

      // The component should still render and pass the legacy handler
      expect(screen.getByTestId('events-list')).toBeInTheDocument()
    })
  })

  describe('Initial Tab Selection', () => {
    it('should auto-select requires-action tab when it has events', async () => {
      const events = [
        createMockEvent({ id: 1, status: 'pending_internal_approval' }),
        createMockEvent({ id: 2, status: 'published', end_date: '2030-12-31T00:00:00Z' }),
      ]

      render(<DashboardModeView {...defaultProps} events={events} />)

      await waitFor(() => {
        const activeTab = screen.getByTestId('active-tab')
        expect(activeTab.textContent).toBe('requires-action')
      })
    })

    it('should auto-select pending tab when requires-action is empty', async () => {
      const events = [
        createMockEvent({ id: 1, status: 'draft' }),
        createMockEvent({ id: 2, status: 'published', end_date: '2030-12-31T00:00:00Z' }),
      ]

      render(<DashboardModeView {...defaultProps} events={events} />)

      await waitFor(() => {
        const activeTab = screen.getByTestId('active-tab')
        expect(activeTab.textContent).toBe('pending')
      })
    })

    it('should auto-select published tab when requires-action and pending are empty', async () => {
      const events = [
        createMockEvent({ id: 1, status: 'published', end_date: '2030-12-31T00:00:00Z' }),
      ]

      render(<DashboardModeView {...defaultProps} events={events} />)

      await waitFor(() => {
        const activeTab = screen.getByTestId('active-tab')
        expect(activeTab.textContent).toBe('published')
      })
    })

    it('should default to published for non-admin users', async () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 1,
          name: 'Organizer',
          role: { role_code: 'organizer_admin' },
        },
      })

      const events = [createMockEvent({ id: 1, status: 'pending_internal_approval' })]

      render(<DashboardModeView {...defaultProps} events={events} />)

      // Non-admin users don't see tabs, they see all events
      expect(screen.queryByTestId('events-filter-tabs')).not.toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('should show empty state message when no events exist', async () => {
      const events: Event[] = []

      render(<DashboardModeView {...defaultProps} events={events} />)

      // When all tabs are empty, component defaults to historic tab
      // and shows appropriate empty state
      await waitFor(() => {
        const eventsCount = screen.getByTestId('events-count')
        expect(eventsCount.textContent).toBe('0')
      })
    })

    it('should pass isLoading to EventsList', () => {
      render(<DashboardModeView {...defaultProps} events={[]} isLoading={true} />)

      expect(screen.getByTestId('is-loading').textContent).toBe('true')
    })
  })

  describe('Loading State', () => {
    it('should pass loading state to child components', () => {
      render(
        <DashboardModeView {...defaultProps} events={[createMockEvent()]} isLoading={true} />
      )

      const loadingEl = screen.getByTestId('is-loading')
      expect(loadingEl.textContent).toBe('true')
    })
  })
})
