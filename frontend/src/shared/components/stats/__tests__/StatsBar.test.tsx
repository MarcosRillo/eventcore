import { render, screen } from '@testing-library/react'

import type { StatBarItem } from '@/shared/components/stats/StatsBar'
import { StatsBar } from '@/shared/components/stats/StatsBar'

const CalendarIcon = () => (
  <svg data-testid="icon-calendar" className="w-5 h-5" viewBox="0 0 24 24" />
)
const TagIcon = () => (
  <svg data-testid="icon-tag" className="w-5 h-5" viewBox="0 0 24 24" />
)
const TrendIcon = () => (
  <svg data-testid="icon-trend" className="w-5 h-5" viewBox="0 0 24 24" />
)

const mockItems: StatBarItem[] = [
  { value: 42, label: 'Eventos aprobados', icon: <CalendarIcon /> },
  { value: 8, label: 'Tipos de eventos activos', icon: <TagIcon /> },
  { value: 15, label: 'Este mes', icon: <TrendIcon /> },
]

describe('StatsBar', () => {
  describe('Loading State', () => {
    it('shows loading skeleton when loading is true', () => {
      render(<StatsBar items={[]} loading={true} />)

      const container = screen.getByTestId('stats-loading')
      expect(container).toBeInTheDocument()

      const pulseElements = container.querySelectorAll('.animate-pulse')
      expect(pulseElements).toHaveLength(3)
    })

    it('respects custom skeletonCount', () => {
      render(<StatsBar items={[]} loading={true} skeletonCount={5} />)

      const container = screen.getByTestId('stats-loading')
      const pulseElements = container.querySelectorAll('.animate-pulse')
      expect(pulseElements).toHaveLength(5)
    })

    it('does not show items when loading', () => {
      render(<StatsBar items={mockItems} loading={true} />)

      expect(screen.queryByText('42')).not.toBeInTheDocument()
    })
  })

  describe('Empty Items', () => {
    it('returns null when items is empty and not loading', () => {
      const { container } = render(<StatsBar items={[]} loading={false} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Stats Display', () => {
    beforeEach(() => {
      render(<StatsBar items={mockItems} loading={false} />)
    })

    it('displays all stat values', () => {
      expect(screen.getByText('42')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('displays all stat labels', () => {
      expect(screen.getByText('Eventos aprobados')).toBeInTheDocument()
      expect(screen.getByText('Tipos de eventos activos')).toBeInTheDocument()
      expect(screen.getByText('Este mes')).toBeInTheDocument()
    })

    it('renders all icons', () => {
      expect(screen.getByTestId('icon-calendar')).toBeInTheDocument()
      expect(screen.getByTestId('icon-tag')).toBeInTheDocument()
      expect(screen.getByTestId('icon-trend')).toBeInTheDocument()
    })
  })

  describe('Zero Values', () => {
    it('displays zero values correctly', () => {
      const zeroItems: StatBarItem[] = [
        { value: 0, label: 'A', icon: <CalendarIcon /> },
        { value: 0, label: 'B', icon: <TagIcon /> },
        { value: 0, label: 'C', icon: <TrendIcon /> },
      ]

      render(<StatsBar items={zeroItems} loading={false} />)

      const zeros = screen.getAllByText('0')
      expect(zeros).toHaveLength(3)
    })
  })

  describe('Large Numbers', () => {
    it('displays large numbers correctly', () => {
      const largeItems: StatBarItem[] = [
        { value: 1234, label: 'Total', icon: <CalendarIcon /> },
        { value: 99999, label: 'Big', icon: <TagIcon /> },
      ]

      render(<StatsBar items={largeItems} loading={false} />)

      expect(screen.getByText('1234')).toBeInTheDocument()
      expect(screen.getByText('99999')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has region role with default aria-label', () => {
      render(<StatsBar items={mockItems} loading={false} />)

      expect(screen.getByRole('region', { name: /estadísticas/i })).toBeInTheDocument()
    })

    it('supports custom aria-label', () => {
      render(
        <StatsBar items={mockItems} loading={false} ariaLabel="Resumen de estadisticas" />
      )

      expect(screen.getByRole('region', { name: 'Resumen de estadisticas' })).toBeInTheDocument()
    })

    it('icons are aria-hidden', () => {
      render(<StatsBar items={mockItems} loading={false} />)

      const region = screen.getByRole('region')
      const hiddenSpans = region.querySelectorAll('[aria-hidden="true"]')
      expect(hiddenSpans).toHaveLength(3)
    })
  })

  describe('Responsive Layout', () => {
    it('has responsive gap classes', () => {
      render(<StatsBar items={mockItems} loading={false} />)

      const region = screen.getByRole('region')
      const flexContainer = region.firstChild?.firstChild
      expect(flexContainer).toHaveClass('gap-6', 'md:gap-12')
    })
  })

  describe('Tabular Numbers', () => {
    it('uses tabular-nums for stat values', () => {
      render(<StatsBar items={mockItems} loading={false} />)

      const valueElement = screen.getByText('42')
      expect(valueElement).toHaveClass('tabular-nums')
    })
  })
})
