/**
 * Tests for OrganizerEventFilters (Dumb Component)
 *
 * Tests the unified filter bar with status pills and time scope toggle.
 */

import { fireEvent, render, screen } from '@testing-library/react'

import { OrganizerEventFilters } from '@/features/organizer/components/dumb/OrganizerEventFilters'

describe('OrganizerEventFilters', () => {
  const mockOnStatusChange = jest.fn()
  const mockOnTimeScopeChange = jest.fn()

  const defaultProps = {
    activeStatus: null as string | null,
    timeScope: 'upcoming' as const,
    onStatusChange: mockOnStatusChange,
    onTimeScopeChange: mockOnTimeScopeChange,
    statusCounts: {
      total: 25,
      draft: 3,
      pending_internal: 5,
      approved_internal: 8,
      published: 10,
      requires_changes: 2,
      rejected: 1,
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('status filters', () => {
    test('should render all status filter buttons', () => {
      render(<OrganizerEventFilters {...defaultProps} />)

      expect(screen.getByRole('button', { name: /todos/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /borrador/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /pendiente/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /aprobado/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /publicado/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /req\. cambios/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /rechazado/i })).toBeInTheDocument()
    })

    test('should call onStatusChange with null when Todos is clicked', () => {
      render(<OrganizerEventFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /todos/i }))

      expect(mockOnStatusChange).toHaveBeenCalledWith(null)
    })

    test('should call onStatusChange with draft when Borrador is clicked', () => {
      render(<OrganizerEventFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /borrador/i }))

      expect(mockOnStatusChange).toHaveBeenCalledWith('draft')
    })

    test('should call onStatusChange with pending_internal_approval when Pendiente is clicked', () => {
      render(<OrganizerEventFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /pendiente/i }))

      expect(mockOnStatusChange).toHaveBeenCalledWith('pending_internal_approval')
    })

    test('should call onStatusChange with published when Publicado is clicked', () => {
      render(<OrganizerEventFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /publicado/i }))

      expect(mockOnStatusChange).toHaveBeenCalledWith('published')
    })

    test('should call onStatusChange with requires_changes when Req. Cambios is clicked', () => {
      render(<OrganizerEventFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /req\. cambios/i }))

      expect(mockOnStatusChange).toHaveBeenCalledWith('requires_changes')
    })

    test('should call onStatusChange with rejected when Rechazado is clicked', () => {
      render(<OrganizerEventFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /rechazado/i }))

      expect(mockOnStatusChange).toHaveBeenCalledWith('rejected')
    })
  })

  describe('count badges', () => {
    test('should display count badges when statusCounts provided', () => {
      render(<OrganizerEventFilters {...defaultProps} />)

      const todosButton = screen.getByRole('button', { name: /todos/i })
      expect(todosButton).toHaveTextContent('(25)')

      const draftButton = screen.getByRole('button', { name: /borrador/i })
      expect(draftButton).toHaveTextContent('(3)')

      const pendingButton = screen.getByRole('button', { name: /pendiente/i })
      expect(pendingButton).toHaveTextContent('(5)')
    })

    test('should not display badges when statusCounts is null', () => {
      render(<OrganizerEventFilters {...defaultProps} statusCounts={null} />)

      const todosButton = screen.getByRole('button', { name: 'Todos' })
      expect(todosButton).not.toHaveTextContent('(')
    })
  })

  describe('active state styling', () => {
    test('should highlight active status button', () => {
      render(<OrganizerEventFilters {...defaultProps} activeStatus="draft" />)

      const draftButton = screen.getByRole('button', { name: /borrador/i })
      expect(draftButton).toHaveClass('bg-primary-600', 'text-white')
    })

    test('should have aria-pressed true for active status', () => {
      render(<OrganizerEventFilters {...defaultProps} activeStatus="draft" />)

      const draftButton = screen.getByRole('button', { name: /borrador/i })
      expect(draftButton).toHaveAttribute('aria-pressed', 'true')
    })

    test('should have aria-pressed false for inactive status', () => {
      render(<OrganizerEventFilters {...defaultProps} activeStatus="draft" />)

      const todosButton = screen.getByRole('button', { name: /todos/i })
      expect(todosButton).toHaveAttribute('aria-pressed', 'false')
    })

    test('should highlight Todos when activeStatus is null', () => {
      render(<OrganizerEventFilters {...defaultProps} activeStatus={null} />)

      const todosButton = screen.getByRole('button', { name: /todos/i })
      expect(todosButton).toHaveClass('bg-primary-600', 'text-white')
    })
  })

  describe('time scope toggle', () => {
    test('should render Proximos and Pasados buttons', () => {
      render(<OrganizerEventFilters {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Proximos' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Pasados' })).toBeInTheDocument()
    })

    test('should highlight upcoming when timeScope is upcoming', () => {
      render(<OrganizerEventFilters {...defaultProps} timeScope="upcoming" />)

      const upcomingButton = screen.getByRole('button', { name: 'Proximos' })
      expect(upcomingButton).toHaveClass('bg-white', 'shadow-sm')
      expect(upcomingButton).toHaveAttribute('aria-pressed', 'true')
    })

    test('should highlight past when timeScope is past', () => {
      render(<OrganizerEventFilters {...defaultProps} timeScope="past" />)

      const pastButton = screen.getByRole('button', { name: 'Pasados' })
      expect(pastButton).toHaveClass('bg-white', 'shadow-sm')
      expect(pastButton).toHaveAttribute('aria-pressed', 'true')
    })

    test('should call onTimeScopeChange with upcoming', () => {
      render(<OrganizerEventFilters {...defaultProps} timeScope="past" />)

      fireEvent.click(screen.getByRole('button', { name: 'Proximos' }))

      expect(mockOnTimeScopeChange).toHaveBeenCalledWith('upcoming')
    })

    test('should call onTimeScopeChange with past', () => {
      render(<OrganizerEventFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Pasados' }))

      expect(mockOnTimeScopeChange).toHaveBeenCalledWith('past')
    })
  })

  describe('accessibility', () => {
    test('should have group role for status filters', () => {
      render(<OrganizerEventFilters {...defaultProps} />)

      expect(screen.getByRole('group', { name: /filtrar eventos por estado/i })).toBeInTheDocument()
    })

    test('should have group role for time scope', () => {
      render(<OrganizerEventFilters {...defaultProps} />)

      expect(screen.getByRole('group', { name: /filtrar por periodo/i })).toBeInTheDocument()
    })

    test('should have aria-pressed on all filter buttons', () => {
      render(<OrganizerEventFilters {...defaultProps} activeStatus="draft" />)

      const statusGroup = screen.getByRole('group', { name: /filtrar eventos por estado/i })
      const buttons = statusGroup.querySelectorAll('button')
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-pressed')
      })
    })
  })

  describe('edge cases', () => {
    test('should handle rapid filter changes', () => {
      render(<OrganizerEventFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: /borrador/i }))
      fireEvent.click(screen.getByRole('button', { name: /pendiente/i }))
      fireEvent.click(screen.getByRole('button', { name: /publicado/i }))
      fireEvent.click(screen.getByRole('button', { name: /todos/i }))

      expect(mockOnStatusChange).toHaveBeenCalledTimes(4)
      expect(mockOnStatusChange).toHaveBeenNthCalledWith(1, 'draft')
      expect(mockOnStatusChange).toHaveBeenNthCalledWith(2, 'pending_internal_approval')
      expect(mockOnStatusChange).toHaveBeenNthCalledWith(3, 'published')
      expect(mockOnStatusChange).toHaveBeenNthCalledWith(4, null)
    })
  })
})
