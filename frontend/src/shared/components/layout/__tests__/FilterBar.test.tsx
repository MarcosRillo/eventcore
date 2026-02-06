/**
 * FilterBar Component Tests
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { FilterBar } from '@/shared/components/layout/FilterBar'

describe('FilterBar', () => {
  test('renders children', () => {
    render(
      <FilterBar>
        <div>Filter 1</div>
        <div>Filter 2</div>
      </FilterBar>
    )

    expect(screen.getByText('Filter 1')).toBeInTheDocument()
    expect(screen.getByText('Filter 2')).toBeInTheDocument()
  })

  test('renders card wrapper with correct classes', () => {
    render(
      <FilterBar>
        <div>Filter</div>
      </FilterBar>
    )

    const wrapper = screen.getByRole('region')
    expect(wrapper.className).toContain('bg-white')
    expect(wrapper.className).toContain('rounded-lg')
    expect(wrapper.className).toContain('border')
    expect(wrapper.className).toContain('border-neutral-200')
  })

  test('has role="region" and default aria-label', () => {
    render(
      <FilterBar>
        <div>Filter</div>
      </FilterBar>
    )

    expect(screen.getByRole('region', { name: 'Filtros' })).toBeInTheDocument()
  })

  test('applies custom ariaLabel', () => {
    render(
      <FilterBar ariaLabel="Filtros de eventos">
        <div>Filter</div>
      </FilterBar>
    )

    expect(screen.getByRole('region', { name: 'Filtros de eventos' })).toBeInTheDocument()
  })

  test('renders grid when columns is defined', () => {
    render(
      <FilterBar columns={3}>
        <div>Filter 1</div>
        <div>Filter 2</div>
      </FilterBar>
    )

    const wrapper = screen.getByRole('region')
    const grid = wrapper.querySelector('.grid')
    expect(grid).toBeInTheDocument()
    expect(grid?.className).toContain('md:grid-cols-3')
    expect(grid?.className).toContain('gap-4')
  })

  test('does not render grid when columns is not defined', () => {
    render(
      <FilterBar>
        <div>Filter 1</div>
      </FilterBar>
    )

    const wrapper = screen.getByRole('region')
    const grids = wrapper.querySelectorAll('.grid')
    expect(grids).toHaveLength(0)
  })

  test('renders collapsible toggle button', () => {
    render(
      <FilterBar collapsible>
        <div>Filter</div>
      </FilterBar>
    )

    const toggle = screen.getByRole('button', { name: /filtros/i })
    expect(toggle).toBeInTheDocument()
  })

  test('content is hidden by default when collapsible (mobile)', () => {
    render(
      <FilterBar collapsible>
        <div>Filter</div>
      </FilterBar>
    )

    const content = document.getElementById('filters-content')
    expect(content?.className).toContain('hidden')
    expect(content?.className).toContain('md:block')
  })

  test('click toggle shows content', () => {
    render(
      <FilterBar collapsible>
        <div>Filter</div>
      </FilterBar>
    )

    const toggle = screen.getByRole('button', { name: /filtros/i })
    fireEvent.click(toggle)

    const content = document.getElementById('filters-content')
    expect(content?.className).toContain('block')
    expect(content?.className).not.toContain('hidden')
  })

  test('toggle updates aria-expanded', () => {
    render(
      <FilterBar collapsible>
        <div>Filter</div>
      </FilterBar>
    )

    const toggle = screen.getByRole('button', { name: /filtros/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  test('shows "Activos" badge when hasActiveFilters and collapsible', () => {
    render(
      <FilterBar collapsible hasActiveFilters>
        <div>Filter</div>
      </FilterBar>
    )

    expect(screen.getByText('Activos')).toBeInTheDocument()
  })

  test('does not show "Activos" badge without hasActiveFilters', () => {
    render(
      <FilterBar collapsible>
        <div>Filter</div>
      </FilterBar>
    )

    expect(screen.queryByText('Activos')).not.toBeInTheDocument()
  })

  test('renders clear footer when hasActiveFilters and onClearFilters', () => {
    const onClear = jest.fn()

    render(
      <FilterBar hasActiveFilters onClearFilters={onClear}>
        <div>Filter</div>
      </FilterBar>
    )

    const clearButton = screen.getByRole('button', { name: /limpiar filtros/i })
    expect(clearButton).toBeInTheDocument()

    fireEvent.click(clearButton)
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  test('does not render clear footer without active filters', () => {
    const onClear = jest.fn()

    render(
      <FilterBar onClearFilters={onClear}>
        <div>Filter</div>
      </FilterBar>
    )

    expect(screen.queryByRole('button', { name: /limpiar filtros/i })).not.toBeInTheDocument()
  })

  test('applies custom className', () => {
    render(
      <FilterBar className="shadow-sm mb-6">
        <div>Filter</div>
      </FilterBar>
    )

    const wrapper = screen.getByRole('region')
    expect(wrapper.className).toContain('shadow-sm')
    expect(wrapper.className).toContain('mb-6')
  })

  test('content visible by default when collapsible and defaultOpen', () => {
    render(
      <FilterBar collapsible defaultOpen>
        <div>Filter</div>
      </FilterBar>
    )

    const content = document.getElementById('filters-content')
    expect(content?.className).toContain('block')
    expect(content?.className).not.toContain('hidden')
  })
})
