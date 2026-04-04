/**
 * Tests for Public Calendar Component
 *
 * Tests the public-facing calendar page with event listing,
 * filtering, and responsive layout.
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { PublicCalendar } from '@/features/public-calendar/components/dumb/PublicCalendar'
import { EventSubtype, EventType, Location, PublicEvent } from '@/features/public-calendar/types/public-calendar.types'

describe('PublicCalendar', () => {
  const mockEvents: PublicEvent[] = [
    {
      id: 1,
      title: 'Festival de Música',
      description: 'Gran evento musical',
      featured_image: 'https://example.com/image1.jpg',
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
      description: 'Arte contemporáneo',
      featured_image: 'https://example.com/image2.jpg',
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

  const defaultProps = {
    events: mockEvents,
    eventTypes: mockEventTypes,
    eventSubtypes: mockEventSubtypes,
    locations: mockLocations,
    loading: false,
    error: null,
    selectedEventTypeId: null,
    selectedSubtypeId: null,
    selectedLocationId: null,
    ...mockHandlers
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Layout Structure', () => {
    test('renders calendar with header and event grid', () => {
      render(<PublicCalendar {...defaultProps} />)

      expect(screen.getByText(/eventos en tucumán/i)).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /event grid/i })).toBeInTheDocument()
    })

    test('displays correct number of event cards', () => {
      render(<PublicCalendar {...defaultProps} />)

      expect(screen.getByText('Festival de Música')).toBeInTheDocument()
      expect(screen.getByText('Exposición de Arte')).toBeInTheDocument()
    })

    test('applies responsive grid classes', () => {
      render(<PublicCalendar {...defaultProps} />)

      const grid = screen.getByRole('region', { name: /event grid/i })

      expect(grid.className).toContain('grid')
      expect(grid.className).toMatch(/grid-cols-1/)
      expect(grid.className).toMatch(/md:grid-cols-2/)
      expect(grid.className).toMatch(/lg:grid-cols-3/)
    })
  })

  describe('Filters', () => {
    test('renders event type filter with label', () => {
      render(<PublicCalendar {...defaultProps} />)

      expect(screen.getByText('Tipo de Evento')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Tipo de Evento/i })).toBeInTheDocument()
    })

    test('renders event type options in dropdown', () => {
      render(<PublicCalendar {...defaultProps} />)

      // Open the listbox
      fireEvent.click(screen.getByRole('button', { name: /Tipo de Evento/i }))

      expect(screen.getByRole('option', { name: 'Música' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Arte' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Gastronomía' })).toBeInTheDocument()
    })

    test('renders event subtype filter with label', () => {
      render(<PublicCalendar {...defaultProps} />)

      expect(screen.getByText('Subtipo (Opcional)')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Subtipo/i })).toBeInTheDocument()
    })

    test('renders subtype options in dropdown', () => {
      render(<PublicCalendar {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /Subtipo/i }))

      expect(screen.getByRole('option', { name: 'Festival' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Concierto' })).toBeInTheDocument()
    })

    test('renders location filter with label', () => {
      render(<PublicCalendar {...defaultProps} />)

      expect(screen.getByText('Ubicación')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Ubicación/i })).toBeInTheDocument()
    })

    test('renders location options in dropdown', () => {
      render(<PublicCalendar {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /Ubicación/i }))

      expect(screen.getByRole('option', { name: /Teatro San Martín/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Museo Provincial/i })).toBeInTheDocument()
    })

    test('calls onEventTypeFilter when event type is selected', () => {
      render(<PublicCalendar {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /Tipo de Evento/i }))
      fireEvent.click(screen.getByRole('option', { name: 'Música' }))

      expect(mockHandlers.onEventTypeFilter).toHaveBeenCalledWith(1)
    })

    test('calls onEventSubtypeFilter when subtype is selected', () => {
      render(<PublicCalendar {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /Subtipo/i }))
      fireEvent.click(screen.getByRole('option', { name: 'Festival' }))

      expect(mockHandlers.onEventSubtypeFilter).toHaveBeenCalledWith(1)
    })

    test('calls onLocationFilter when location is selected', () => {
      render(<PublicCalendar {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /Ubicación/i }))
      fireEvent.click(screen.getByRole('option', { name: /Teatro San Martín/i }))

      expect(mockHandlers.onLocationFilter).toHaveBeenCalledWith(1)
    })

    test('disables subtype filter when no subtypes available', () => {
      render(<PublicCalendar {...defaultProps} eventSubtypes={[]} />)

      const subtypeButton = screen.getByRole('button', { name: /Subtipo/i })
      expect(subtypeButton).toBeDisabled()
    })
  })

  describe('Loading State', () => {
    test('displays loading spinner when loading is true', () => {
      render(<PublicCalendar {...defaultProps} loading={true} events={[]} />)

      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
    })

    test('does not display event grid when loading', () => {
      render(<PublicCalendar {...defaultProps} loading={true} />)

      expect(screen.queryByRole('region', { name: /event grid/i })).not.toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    test('displays error message when error is present', () => {
      render(<PublicCalendar {...defaultProps} events={[]} error="Failed to load events" />)

      expect(screen.getByText('Failed to load events')).toBeInTheDocument()
    })

    test('does not display event grid when error is present', () => {
      render(<PublicCalendar {...defaultProps} error="Failed to load events" />)

      expect(screen.queryByRole('region', { name: /event grid/i })).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    test('displays empty message when no events', () => {
      render(<PublicCalendar {...defaultProps} events={[]} />)

      expect(screen.getByText(/no hay eventos disponibles/i)).toBeInTheDocument()
    })
  })

  describe('SEO', () => {
    test('has proper heading hierarchy', () => {
      render(<PublicCalendar {...defaultProps} />)

      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
      expect(h1.textContent).toMatch(/eventos en tucumán/i)
    })

    test('uses semantic HTML', () => {
      render(<PublicCalendar {...defaultProps} />)

      expect(screen.getByRole('region', { name: /event grid/i })).toBeInTheDocument()
    })
  })
})
