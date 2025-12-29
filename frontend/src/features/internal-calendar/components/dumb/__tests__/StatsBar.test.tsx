/**
 * StatsBar Component Tests (Internal Calendar)
 *
 * Tests for the internal calendar statistics bar component.
 * Following TDD methodology - tests written first.
 */

import { render, screen } from '@testing-library/react'

import { StatsBar } from '@/features/internal-calendar/components/dumb/StatsBar'
import type { InternalStats } from '@/features/internal-calendar/types/internal-calendar.types'

describe('StatsBar (Internal Calendar)', () => {
  const mockStats: InternalStats = {
    total_events: 42,
    total_event_types: 8,
    events_this_month: 15
  }

  describe('Loading State', () => {
    it('shows loading skeleton when loading is true', () => {
      render(<StatsBar stats={null} loading={true} />)

      // Should show loading state with testid
      const container = screen.getByTestId('stats-loading')
      expect(container).toBeInTheDocument()

      // Should have animate-pulse class on skeleton items
      const pulseElements = container.querySelectorAll('.animate-pulse')
      expect(pulseElements.length).toBe(3)
    })

    it('does not show stats when loading', () => {
      render(<StatsBar stats={mockStats} loading={true} />)

      // Stats values should not be visible
      expect(screen.queryByText('42')).not.toBeInTheDocument()
      expect(screen.queryByText('8')).not.toBeInTheDocument()
      expect(screen.queryByText('15')).not.toBeInTheDocument()
    })
  })

  describe('Null Stats', () => {
    it('returns null when stats is null and not loading', () => {
      const { container } = render(<StatsBar stats={null} loading={false} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Stats Display', () => {
    beforeEach(() => {
      render(<StatsBar stats={mockStats} loading={false} />)
    })

    it('displays total events count', () => {
      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('Eventos aprobados')).toBeInTheDocument()
    })

    it('displays total event types count', () => {
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('Tipos de eventos activos')).toBeInTheDocument()
    })

    it('displays events this month count', () => {
      expect(screen.getByText('15')).toBeInTheDocument()
      expect(screen.getByText('Este mes')).toBeInTheDocument()
    })

    it('renders all three stat icons', () => {
      const icons = screen.getAllByRole('img', { hidden: true })
      expect(icons).toHaveLength(3)
    })

    it('has correct styling classes', () => {
      const statsBar = screen.getByRole('region', { name: /estadísticas/i })
      expect(statsBar).toHaveClass('bg-primary-50', 'border-b', 'border-primary-100')
    })
  })

  describe('Zero Values', () => {
    it('displays zero values correctly', () => {
      const zeroStats: InternalStats = {
        total_events: 0,
        total_event_types: 0,
        events_this_month: 0
      }

      render(<StatsBar stats={zeroStats} loading={false} />)

      const zeros = screen.getAllByText('0')
      expect(zeros).toHaveLength(3)
    })
  })

  describe('Large Numbers', () => {
    it('displays large numbers correctly', () => {
      const largeStats: InternalStats = {
        total_events: 1234,
        total_event_types: 99,
        events_this_month: 567
      }

      render(<StatsBar stats={largeStats} loading={false} />)

      expect(screen.getByText('1234')).toBeInTheDocument()
      expect(screen.getByText('99')).toBeInTheDocument()
      expect(screen.getByText('567')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<StatsBar stats={mockStats} loading={false} />)

      const statsBar = screen.getByRole('region', { name: /estadísticas/i })
      expect(statsBar).toBeInTheDocument()
    })

    it('icons have aria-hidden attribute', () => {
      render(<StatsBar stats={mockStats} loading={false} />)

      const icons = screen.getAllByRole('img', { hidden: true })
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true')
      })
    })
  })

  describe('Responsive Layout', () => {
    it('has responsive gap classes', () => {
      render(<StatsBar stats={mockStats} loading={false} />)

      const statsContainer = screen.getByRole('region', { name: /estadísticas/i }).firstChild?.firstChild
      expect(statsContainer).toHaveClass('gap-6', 'md:gap-12')
    })
  })
})
