/**
 * Tests for AdminEventListItem Component
 *
 * Tests rendering of event data, status variants, featured star,
 * action button, and accessibility.
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { AdminEventListItem } from '@/features/entity-admin/components/dumb/AdminEventListItem'
import type { Event } from '@/types/event.types'

// Mock next/image - filter non-DOM props to avoid React warnings
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className, style, loading }: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src as string} alt={alt as string} className={className as string} style={style as React.CSSProperties} loading={loading as string} />
  },
}))

describe('AdminEventListItem', () => {
  const mockOnManage = jest.fn()

  const baseEvent: Event = {
    id: 1,
    title: 'Test Admin Event',
    description: 'Test description',
    start_date: '2025-06-15',
    end_date: '2025-06-15',
    type: 'single_location',
    status: 'draft',
    is_featured: false,
    locations: [{ id: 1, name: 'Centro Cultural' }],
    event_type: { id: 1, name: 'Festival' },
    approval_history: [],
  } as Event

  const defaultProps = {
    event: baseEvent,
    onManage: mockOnManage,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    test('should render event title in h3', () => {
      render(<AdminEventListItem {...defaultProps} />)

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Test Admin Event')
    })

    test('should render formatted date', () => {
      render(<AdminEventListItem {...defaultProps} />)

      // Format varies by timezone: "14 jun 2025" or "15 jun 2025"
      expect(screen.getByText(/\d+\s+jun\s+2025/i)).toBeInTheDocument()
    })

    test('should render location name', () => {
      render(<AdminEventListItem {...defaultProps} />)

      expect(screen.getByText('Centro Cultural')).toBeInTheDocument()
    })

    test('should render event type badge', () => {
      render(<AdminEventListItem {...defaultProps} />)

      expect(screen.getByText('Festival')).toBeInTheDocument()
    })

    test('should render status badge', () => {
      render(<AdminEventListItem {...defaultProps} />)

      expect(screen.getByText('Borrador')).toBeInTheDocument()
    })

    test('should render as article element', () => {
      render(<AdminEventListItem {...defaultProps} />)

      expect(screen.getByRole('article')).toBeInTheDocument()
    })
  })

  describe('status variants', () => {
    test('should render published status', () => {
      const event = { ...baseEvent, status: 'published' } as Event
      render(<AdminEventListItem event={event} onManage={mockOnManage} />)

      expect(screen.getByText('Publicado')).toBeInTheDocument()
    })

    test('should render pending status', () => {
      const event = { ...baseEvent, status: 'pending_internal_approval' } as Event
      render(<AdminEventListItem event={event} onManage={mockOnManage} />)

      expect(screen.getByText('Pendiente Interno')).toBeInTheDocument()
    })

    test('should render rejected status', () => {
      const event = { ...baseEvent, status: 'rejected' } as Event
      render(<AdminEventListItem event={event} onManage={mockOnManage} />)

      expect(screen.getByText('Rechazado')).toBeInTheDocument()
    })
  })

  describe('featured star', () => {
    test('should show "Destacado" when event is featured', () => {
      const event = { ...baseEvent, is_featured: true }
      render(<AdminEventListItem event={event as Event} onManage={mockOnManage} />)

      expect(screen.getByText('Destacado')).toBeInTheDocument()
    })

    test('should not show "Destacado" when event is not featured', () => {
      render(<AdminEventListItem {...defaultProps} />)

      expect(screen.queryByText('Destacado')).not.toBeInTheDocument()
    })
  })

  describe('missing data', () => {
    test('should show "Sin fecha" when no start_date', () => {
      const event = { ...baseEvent, start_date: '' } as Event
      render(<AdminEventListItem event={event} onManage={mockOnManage} />)

      expect(screen.getByText('Sin fecha')).toBeInTheDocument()
    })

    test('should show "Sin ubicación" when no locations', () => {
      const event = { ...baseEvent, locations: [], location: undefined } as unknown as Event
      render(<AdminEventListItem event={event} onManage={mockOnManage} />)

      expect(screen.getByText('Sin ubicación')).toBeInTheDocument()
    })

    test('should not render event type badge when no event_type', () => {
      const event = { ...baseEvent, event_type: undefined } as unknown as Event
      render(<AdminEventListItem event={event} onManage={mockOnManage} />)

      expect(screen.queryByText('Festival')).not.toBeInTheDocument()
    })
  })

  describe('onManage callback', () => {
    test('should render Gestionar button', () => {
      render(<AdminEventListItem {...defaultProps} />)

      expect(screen.getByRole('button', { name: /gestionar/i })).toBeInTheDocument()
    })

    test('should call onManage when Gestionar is clicked', () => {
      render(<AdminEventListItem {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /gestionar/i }))

      expect(mockOnManage).toHaveBeenCalledTimes(1)
    })
  })

  describe('accessibility', () => {
    test('should have accessible aria-label on Gestionar button', () => {
      render(<AdminEventListItem {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: 'Gestionar aprobación de Test Admin Event' })
      ).toBeInTheDocument()
    })

    test('should have aria-hidden on decorative icons', () => {
      render(<AdminEventListItem {...defaultProps} />)

      const svgs = screen.getByRole('article').querySelectorAll('svg')
      svgs.forEach(svg => {
        expect(svg).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  describe('memoization', () => {
    test('should be a memoized component', () => {
      expect(typeof AdminEventListItem).toBe('object')
      expect(AdminEventListItem.$$typeof?.toString()).toContain('react.memo')
    })
  })
})
