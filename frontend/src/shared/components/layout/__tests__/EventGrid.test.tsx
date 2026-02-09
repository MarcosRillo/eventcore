/**
 * EventGrid Component Tests
 */

import { render, screen } from '@testing-library/react'

import { EventGrid } from '@/shared/components/layout/EventGrid'

describe('EventGrid', () => {
  test('renders children', () => {
    render(
      <EventGrid>
        <div>Card 1</div>
        <div>Card 2</div>
      </EventGrid>
    )

    expect(screen.getByText('Card 1')).toBeInTheDocument()
    expect(screen.getByText('Card 2')).toBeInTheDocument()
  })

  test('applies default grid classes', () => {
    render(
      <EventGrid>
        <div>Card</div>
      </EventGrid>
    )

    const grid = screen.getByRole('region', { name: 'Event grid' })
    expect(grid.className).toContain('grid')
    expect(grid.className).toContain('grid-cols-1')
    expect(grid.className).toContain('md:grid-cols-2')
    expect(grid.className).toContain('lg:grid-cols-3')
    expect(grid.className).toContain('gap-6')
  })

  test('has role="region" and default aria-label', () => {
    render(
      <EventGrid>
        <div>Card</div>
      </EventGrid>
    )

    expect(screen.getByRole('region', { name: 'Event grid' })).toBeInTheDocument()
  })

  test('applies custom columns', () => {
    render(
      <EventGrid columns={{ sm: 2, md: 3, lg: 4 }}>
        <div>Card</div>
      </EventGrid>
    )

    const grid = screen.getByRole('region')
    expect(grid.className).toContain('grid-cols-2')
    expect(grid.className).toContain('md:grid-cols-3')
    expect(grid.className).toContain('lg:grid-cols-4')
  })

  test('applies custom gap', () => {
    render(
      <EventGrid gap={4}>
        <div>Card</div>
      </EventGrid>
    )

    const grid = screen.getByRole('region')
    expect(grid.className).toContain('gap-4')
    expect(grid.className).not.toContain('gap-6')
  })

  test('applies custom ariaLabel', () => {
    render(
      <EventGrid ariaLabel="Custom grid">
        <div>Card</div>
      </EventGrid>
    )

    expect(screen.getByRole('region', { name: 'Custom grid' })).toBeInTheDocument()
  })

  test('applies custom className', () => {
    render(
      <EventGrid className="mt-4">
        <div>Card</div>
      </EventGrid>
    )

    const grid = screen.getByRole('region')
    expect(grid.className).toContain('mt-4')
  })

  test('applies xl column class when provided', () => {
    render(
      <EventGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}>
        <div>Card</div>
      </EventGrid>
    )

    const grid = screen.getByRole('region')
    expect(grid.className).toContain('xl:grid-cols-4')
  })

  test('does not apply xl class when not provided', () => {
    render(
      <EventGrid columns={{ sm: 1, md: 2, lg: 3 }}>
        <div>Card</div>
      </EventGrid>
    )

    const grid = screen.getByRole('region')
    expect(grid.className).not.toMatch(/xl:grid-cols/)
  })
})
