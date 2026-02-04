/**
 * Tests for OrganizerStatsSummary (Dumb Component)
 *
 * Tests the compact stats summary bar rendering and states.
 */

import { render, screen } from '@testing-library/react'

import { OrganizerStatsSummary } from '@/features/organizer-dashboard/components/dumb/OrganizerStatsSummary'

describe('OrganizerStatsSummary', () => {
  const mockStats = {
    total_events: 25,
    upcoming_events: 12,
    past_events: 6,
    pending_internal: 5,
    approved_internal: 8,
    pending_public: 3,
    published: 10,
    requires_changes: 2,
    rejected: 2,
    draft: 3
  }

  describe('loading state', () => {
    test('should render loading skeleton when loading', () => {
      render(<OrganizerStatsSummary stats={null} loading={true} />)

      expect(screen.getByTestId('stats-loading')).toBeInTheDocument()
    })

    test('should render 5 skeleton items', () => {
      render(<OrganizerStatsSummary stats={null} loading={true} />)

      const skeletons = screen.getByTestId('stats-loading').querySelectorAll('.animate-pulse')
      expect(skeletons).toHaveLength(5)
    })
  })

  describe('null state', () => {
    test('should return null when stats is null and not loading', () => {
      const { container } = render(<OrganizerStatsSummary stats={null} loading={false} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('with stats data', () => {
    test('should render stats region', () => {
      render(<OrganizerStatsSummary stats={mockStats} loading={false} />)

      expect(screen.getByRole('region', { name: /estadisticas/i })).toBeInTheDocument()
    })

    test('should display total events', () => {
      render(<OrganizerStatsSummary stats={mockStats} loading={false} />)

      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByText('Total eventos')).toBeInTheDocument()
    })

    test('should display upcoming events', () => {
      render(<OrganizerStatsSummary stats={mockStats} loading={false} />)

      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('Proximos')).toBeInTheDocument()
    })

    test('should display past events', () => {
      render(<OrganizerStatsSummary stats={mockStats} loading={false} />)

      expect(screen.getByText('6')).toBeInTheDocument()
      expect(screen.getByText('Pasados')).toBeInTheDocument()
    })

    test('should display pending events', () => {
      render(<OrganizerStatsSummary stats={mockStats} loading={false} />)

      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('Pendientes')).toBeInTheDocument()
    })

    test('should display requires changes count', () => {
      render(<OrganizerStatsSummary stats={mockStats} loading={false} />)

      expect(screen.getByText('Req. cambios')).toBeInTheDocument()
    })

    test('should use tabular-nums for numeric values', () => {
      render(<OrganizerStatsSummary stats={mockStats} loading={false} />)

      const numericElements = screen.getAllByText(/^\d+$/)
      numericElements.forEach((el) => {
        expect(el).toHaveClass('tabular-nums')
      })
    })
  })

  describe('accessibility', () => {
    test('should have region role with aria-label', () => {
      render(<OrganizerStatsSummary stats={mockStats} loading={false} />)

      const region = screen.getByRole('region')
      expect(region).toHaveAttribute('aria-label', 'Resumen de estadisticas')
    })

    test('should have aria-hidden on icons', () => {
      render(<OrganizerStatsSummary stats={mockStats} loading={false} />)

      const svgs = screen.getByRole('region').querySelectorAll('svg')
      svgs.forEach((svg) => {
        expect(svg).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })
})
