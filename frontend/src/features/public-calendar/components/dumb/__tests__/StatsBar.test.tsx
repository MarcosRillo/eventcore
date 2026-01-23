/**
 * Tests for StatsBar (Dumb Component)
 *
 * Tests loading state, null stats, stats display, and accessibility.
 */

import { render, screen } from '@testing-library/react'

import { StatsBar } from '@/features/public-calendar/components/dumb/StatsBar'
import { PublicStats } from '@/features/public-calendar/types/public-calendar.types'

describe('StatsBar', () => {
  const mockStats: PublicStats = {
    total_events: 45,
    total_event_types: 12,
    events_this_month: 8
  }

  describe('loading state', () => {
    test('should render loading skeleton when loading is true', () => {
      const { container } = render(<StatsBar stats={null} loading={true} />)

      const loadingContainer = container.querySelector('.bg-primary-50')
      expect(loadingContainer).toBeInTheDocument()
      expect(loadingContainer).toHaveClass('border-b', 'border-primary-100')
    })

    test('should render 3 loading placeholders', () => {
      const { container } = render(<StatsBar stats={null} loading={true} />)

      const placeholders = container.querySelectorAll('.animate-pulse')
      expect(placeholders.length).toBe(3)
    })

    test('should apply pulse animation to placeholders', () => {
      const { container } = render(<StatsBar stats={null} loading={true} />)

      const placeholders = container.querySelectorAll('.animate-pulse')
      placeholders.forEach(placeholder => {
        expect(placeholder).toHaveClass('animate-pulse', 'flex', 'items-center', 'gap-2')
      })
    })
  })

  describe('null stats state', () => {
    test('should render nothing when stats is null and not loading', () => {
      const { container } = render(<StatsBar stats={null} loading={false} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('with stats', () => {
    test('should render stats container with correct styling', () => {
      const { container } = render(<StatsBar stats={mockStats} loading={false} />)

      const statsContainer = container.querySelector('.bg-primary-50')
      expect(statsContainer).toBeInTheDocument()
      expect(statsContainer).toHaveClass('border-b', 'border-primary-100')
    })

    test('should render total events stat with correct value and label', () => {
      render(<StatsBar stats={mockStats} loading={false} />)

      expect(screen.getByText('45')).toBeInTheDocument()
      expect(screen.getByText('Eventos publicados')).toBeInTheDocument()
    })

    test('should render total event types stat with correct value and label', () => {
      render(<StatsBar stats={mockStats} loading={false} />)

      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('Tipos de eventos activos')).toBeInTheDocument()
    })

    test('should render events this month stat with correct value and label', () => {
      render(<StatsBar stats={mockStats} loading={false} />)

      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('Este mes')).toBeInTheDocument()
    })

    test('should render exactly 3 stat items', () => {
      const { container } = render(<StatsBar stats={mockStats} loading={false} />)

      const statItems = container.querySelectorAll('.flex.items-center.gap-2.text-primary-700')
      expect(statItems.length).toBe(3)
    })

    test('should render 3 SVG icons for stats', () => {
      const { container } = render(<StatsBar stats={mockStats} loading={false} />)

      const icons = container.querySelectorAll('svg.w-5.h-5')
      expect(icons.length).toBe(3)
    })

    test('should apply correct text styling to values and labels', () => {
      render(<StatsBar stats={mockStats} loading={false} />)

      const value = screen.getByText('45')
      expect(value).toHaveClass('font-semibold', 'text-primary-900')

      const label = screen.getByText('Eventos publicados')
      expect(label).toHaveClass('text-sm', 'text-primary-600')
    })

    test('should apply responsive gap classes to container', () => {
      const { container } = render(<StatsBar stats={mockStats} loading={false} />)

      const flexContainer = container.querySelector('.flex.flex-wrap.justify-center')
      expect(flexContainer).toHaveClass('gap-6', 'md:gap-12')
    })
  })

  describe('accessibility', () => {
    test('should hide decorative icons from screen readers', () => {
      const { container } = render(<StatsBar stats={mockStats} loading={false} />)

      const icons = container.querySelectorAll('svg[aria-hidden="true"]')
      expect(icons.length).toBe(3)
    })
  })

  describe('edge cases', () => {
    test('should handle zero values correctly', () => {
      const zeroStats: PublicStats = {
        total_events: 0,
        total_event_types: 0,
        events_this_month: 0
      }

      render(<StatsBar stats={zeroStats} loading={false} />)

      // Should still render all stats, just with 0 values
      const zeroValues = screen.getAllByText('0')
      expect(zeroValues.length).toBe(3)
      expect(screen.getByText('Eventos publicados')).toBeInTheDocument()
    })

    test('should handle large numbers correctly', () => {
      const largeStats: PublicStats = {
        total_events: 1234,
        total_event_types: 567,
        events_this_month: 89
      }

      render(<StatsBar stats={largeStats} loading={false} />)

      expect(screen.getByText('1234')).toBeInTheDocument()
      expect(screen.getByText('567')).toBeInTheDocument()
      expect(screen.getByText('89')).toBeInTheDocument()
    })
  })
})
