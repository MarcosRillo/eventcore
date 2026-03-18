/**
 * Tests for AdminEventFilters component
 *
 * Tests search input, event type select, status pills, and time scope toggle.
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { AdminEventFilters } from '@/features/entity-admin/components/dumb/AdminEventFilters'
import type { EventTypeInfo } from '@/types/event.types'

describe('AdminEventFilters', () => {
  const defaultProps = {
    activeStatus: null as null,
    timeScope: 'upcoming' as const,
    onStatusChange: jest.fn(),
    onTimeScopeChange: jest.fn(),
    statusCounts: {
      total: 50,
      pending_internal_approval: 10,
      pending_public_approval: 5,
      published: 30,
      requires_changes: 2,
      rejected: 3,
    },
  }

  const mockEventTypes: EventTypeInfo[] = [
    { id: 1, name: 'Conferencia', is_active: true },
    { id: 2, name: 'Taller', is_active: true },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders status pills and time scope without search when onSearchChange is not provided', () => {
    render(<AdminEventFilters {...defaultProps} />)

    expect(screen.getByText('Todos')).toBeInTheDocument()
    expect(screen.getByText('Próximos')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Buscar por título o descripción…')).not.toBeInTheDocument()
  })

  test('renders search input when onSearchChange is provided', () => {
    const onSearchChange = jest.fn()
    render(<AdminEventFilters {...defaultProps} onSearchChange={onSearchChange} />)

    expect(screen.getByPlaceholderText('Buscar por título o descripción…')).toBeInTheDocument()
  })

  test('calls onSearchChange when typing in search input', () => {
    const onSearchChange = jest.fn()
    render(<AdminEventFilters {...defaultProps} onSearchChange={onSearchChange} searchValue="" />)

    const input = screen.getByPlaceholderText('Buscar por título o descripción…')
    fireEvent.change(input, { target: { value: 'jazz' } })

    expect(onSearchChange).toHaveBeenCalledWith('jazz')
  })

  test('renders event type select when onEventTypeChange is provided', () => {
    const onSearchChange = jest.fn()
    const onEventTypeChange = jest.fn()
    render(
      <AdminEventFilters
        {...defaultProps}
        onSearchChange={onSearchChange}
        onEventTypeChange={onEventTypeChange}
        eventTypes={mockEventTypes}
        selectedEventTypeId={null}
      />
    )

    expect(screen.getByText('Todos los tipos')).toBeInTheDocument()
  })

  test('does not render event type select without onSearchChange', () => {
    const onEventTypeChange = jest.fn()
    render(
      <AdminEventFilters
        {...defaultProps}
        onEventTypeChange={onEventTypeChange}
        eventTypes={mockEventTypes}
      />
    )

    // Select should not render because onSearchChange is not provided (search row guard)
    expect(screen.queryByText('Todos los tipos')).not.toBeInTheDocument()
  })

  test('displays search value from props', () => {
    const onSearchChange = jest.fn()
    render(
      <AdminEventFilters
        {...defaultProps}
        onSearchChange={onSearchChange}
        searchValue="test query"
      />
    )

    const input = screen.getByPlaceholderText('Buscar por título o descripción…')
    expect(input).toHaveValue('test query')
  })
})
