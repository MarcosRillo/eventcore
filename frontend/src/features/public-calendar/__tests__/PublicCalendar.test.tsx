/**
 * Tests for Public Calendar Component
 *
 * Tests the public-facing calendar page with event listing,
 * filtering, and responsive layout.
 */

import { render, screen, fireEvent } from '@testing-library/react'

import { PublicCalendar } from '@/features/public-calendar/components/dumb/PublicCalendar'
import { PublicEvent, EventType, EventSubtype, Location } from '@/features/public-calendar/types/public-calendar.types'

describe('PublicCalendar', () => {
  const mockEvents: PublicEvent[] = [
    {
      id: 1,
      title: 'Festival de Música',
      slug: 'festival-de-musica',
      description: 'Gran evento musical',
      image_url: 'https://example.com/image1.jpg',
      start_date: '2025-11-15',
      end_date: '2025-11-17',
      event_type: { id: 1, name: 'Música' },
      event_subtype: { id: 1, name: 'Festival', event_type_id: 1 },
      locations: [{ id: 1, name: 'Teatro San Martín', city: 'San Miguel de Tucumán' }],
      is_featured: true
    },
    {
      id: 2,
      title: 'Exposición de Arte',
      slug: 'exposicion-de-arte',
      description: 'Arte contemporáneo',
      image_url: 'https://example.com/image2.jpg',
      start_date: '2025-11-20',
      end_date: '2025-11-20',
      event_type: { id: 2, name: 'Arte' },
      locations: [{ id: 2, name: 'Museo Provincial', city: 'San Miguel de Tucumán' }],
      is_featured: false
    }
  ]

  const mockEventTypes: EventType[] = [
    { id: 1, name: 'Música', slug: 'musica', is_active: true },
    { id: 2, name: 'Arte', slug: 'arte', is_active: true },
    { id: 3, name: 'Gastronomía', slug: 'gastronomia', is_active: true }
  ]

  const mockEventSubtypes: EventSubtype[] = [
    { id: 1, name: 'Festival', slug: 'festival', event_type_id: 1, is_active: true },
    { id: 2, name: 'Concierto', slug: 'concierto', event_type_id: 1, is_active: true }
  ]

  const mockLocations: Location[] = [
    { id: 1, name: 'Teatro San Martín', city: 'San Miguel de Tucumán' },
    { id: 2, name: 'Museo Provincial', city: 'San Miguel de Tucumán' }
  ]

  const mockHandlers = {
    onEventTypeFilter: jest.fn(),
    onEventSubtypeFilter: jest.fn(),
    onLocationFilter: jest.fn(),
    onEventClick: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Layout Structure', () => {
    test('renders calendar with header and event grid', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          eventTypes={mockEventTypes}
          eventSubtypes={mockEventSubtypes}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByText(/eventos en tucumán/i)).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /event grid/i })).toBeInTheDocument()
    })

    test('displays correct number of event cards', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          eventTypes={mockEventTypes}
          eventSubtypes={mockEventSubtypes}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Festival de Música')).toBeInTheDocument()
      expect(screen.getByText('Exposición de Arte')).toBeInTheDocument()
    })

    test('applies responsive grid classes', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          eventTypes={mockEventTypes}
          eventSubtypes={mockEventSubtypes}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      const grid = screen.getByRole('region', { name: /event grid/i })

      expect(grid.className).toContain('grid')
      expect(grid.className).toMatch(/grid-cols-1/)
      expect(grid.className).toMatch(/md:grid-cols-2/)
      expect(grid.className).toMatch(/lg:grid-cols-3/)
    })
  })

  describe('Filters', () => {
    test('renders event type filter dropdown', () => {
      const { container } = render(
        <PublicCalendar
          events={mockEvents}
          eventTypes={mockEventTypes}
          eventSubtypes={mockEventSubtypes}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      const select = container.querySelector('#event-type-filter')
      expect(select).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Música' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Arte' })).toBeInTheDocument()
    })

    test('renders event subtype filter dropdown', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          eventTypes={mockEventTypes}
          eventSubtypes={mockEventSubtypes}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByLabelText(/subtipo/i)).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Festival' })).toBeInTheDocument()
    })

    test('renders location filter dropdown', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          eventTypes={mockEventTypes}
          eventSubtypes={mockEventSubtypes}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByLabelText(/ubicación/i)).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Teatro San Martín/i })).toBeInTheDocument()
    })

    test('calls onEventTypeFilter when event type is selected', () => {
      const { container } = render(
        <PublicCalendar
          events={mockEvents}
          eventTypes={mockEventTypes}
          eventSubtypes={mockEventSubtypes}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      const select = container.querySelector('#event-type-filter') as HTMLSelectElement
      fireEvent.change(select, { target: { value: '1' } })

      expect(mockHandlers.onEventTypeFilter).toHaveBeenCalledWith(1)
    })

    test('calls onEventSubtypeFilter when event subtype is selected', () => {
      const { container } = render(
        <PublicCalendar
          events={mockEvents}
          eventTypes={mockEventTypes}
          eventSubtypes={mockEventSubtypes}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      const select = container.querySelector('#event-subtype-filter') as HTMLSelectElement
      fireEvent.change(select, { target: { value: '1' } })

      expect(mockHandlers.onEventSubtypeFilter).toHaveBeenCalledWith(1)
    })

    test('calls onLocationFilter when location is selected', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          eventTypes={mockEventTypes}
          eventSubtypes={mockEventSubtypes}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      const select = screen.getByLabelText(/ubicación/i)
      fireEvent.change(select, { target: { value: '1' } })

      expect(mockHandlers.onLocationFilter).toHaveBeenCalledWith(1)
    })
  })

  describe('Loading State', () => {
    test('displays loading spinner when loading is true', () => {
      render(
        <PublicCalendar
          events={[]}
          eventTypes={mockEventTypes}
          eventSubtypes={mockEventSubtypes}
          locations={mockLocations}
          loading={true}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
    })

    test('does not display event grid when loading', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          eventTypes={mockEventTypes}
          eventSubtypes={mockEventSubtypes}
          locations={mockLocations}
          loading={true}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.queryByRole('region', { name: /event grid/i })).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    test('displays error message when error is present', () => {
      render(
        <PublicCalendar
          events={[]}
          eventTypes={mockEventTypes}
          eventSubtypes={mockEventSubtypes}
          locations={mockLocations}
          loading={false}
          error="Failed to load events"
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Failed to load events')).toBeInTheDocument()
    })

    test('does not display event grid when error is present', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          eventTypes={mockEventTypes}
          eventSubtypes={mockEventSubtypes}
          locations={mockLocations}
          loading={false}
          error="Failed to load events"
          {...mockHandlers}
        />
      )

      expect(screen.queryByRole('region', { name: /event grid/i })).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    test('displays empty message when no events', () => {
      render(
        <PublicCalendar
          events={[]}
          eventTypes={mockEventTypes}
          eventSubtypes={mockEventSubtypes}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/no hay eventos disponibles/i)).toBeInTheDocument()
    })
  })

  describe('SEO', () => {
    test('has proper heading hierarchy', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          eventTypes={mockEventTypes}
          eventSubtypes={mockEventSubtypes}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
      expect(h1.textContent).toMatch(/eventos en tucumán/i)
    })

    test('uses semantic HTML', () => {
      render(
        <PublicCalendar
          events={mockEvents}
          eventTypes={mockEventTypes}
          eventSubtypes={mockEventSubtypes}
          locations={mockLocations}
          loading={false}
          error={null}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /event grid/i })).toBeInTheDocument()
    })
  })
})
