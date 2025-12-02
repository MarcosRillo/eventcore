/**
 * Tests for OrganizerQuickFilters (Dumb Component)
 *
 * Tests rendering and interaction of status filter buttons.
 * Updated Dec 2, 2025 for Spanish labels and all status filters.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { OrganizerQuickFilters } from '../OrganizerQuickFilters'

describe('OrganizerQuickFilters', () => {
  const mockOnFilterChange = jest.fn()

  const defaultProps = {
    activeFilter: null,
    onFilterChange: mockOnFilterChange
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    test('should render all filter buttons', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Borrador' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Pendiente' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Aprobado' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Publicado' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Requiere Cambios' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Rechazado' })).toBeInTheDocument()
    })

    test('should render 7 filter buttons', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(7)
    })

    test('should have group role for accessibility', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      expect(screen.getByRole('group', { name: /filtrar eventos por estado/i })).toBeInTheDocument()
    })
  })

  describe('active state styling', () => {
    test('should highlight Todos button when activeFilter is null', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter={null} />)

      const todosButton = screen.getByRole('button', { name: 'Todos' })
      expect(todosButton).toHaveClass('bg-primary-600', 'text-white')
    })

    test('should highlight Borrador button when activeFilter is draft', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter="draft" />)

      const draftButton = screen.getByRole('button', { name: 'Borrador' })
      expect(draftButton).toHaveClass('bg-primary-600', 'text-white')
    })

    test('should highlight Pendiente button when activeFilter is pending_internal_approval', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter="pending_internal_approval" />)

      const pendingButton = screen.getByRole('button', { name: 'Pendiente' })
      expect(pendingButton).toHaveClass('bg-primary-600', 'text-white')
    })

    test('should highlight Publicado button when activeFilter is published', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter="published" />)

      const publishedButton = screen.getByRole('button', { name: 'Publicado' })
      expect(publishedButton).toHaveClass('bg-primary-600', 'text-white')
    })

    test('should not highlight inactive buttons', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter="draft" />)

      const todosButton = screen.getByRole('button', { name: 'Todos' })
      const pendienteButton = screen.getByRole('button', { name: 'Pendiente' })
      const publicadoButton = screen.getByRole('button', { name: 'Publicado' })

      expect(todosButton).toHaveClass('bg-white')
      expect(pendienteButton).toHaveClass('bg-white')
      expect(publicadoButton).toHaveClass('bg-white')
    })
  })

  describe('button interactions', () => {
    test('should call onFilterChange with null when Todos is clicked', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Todos' }))

      expect(mockOnFilterChange).toHaveBeenCalledWith(null)
    })

    test('should call onFilterChange with draft when Borrador is clicked', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Borrador' }))

      expect(mockOnFilterChange).toHaveBeenCalledWith('draft')
    })

    test('should call onFilterChange with pending_internal_approval when Pendiente is clicked', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Pendiente' }))

      expect(mockOnFilterChange).toHaveBeenCalledWith('pending_internal_approval')
    })

    test('should call onFilterChange with published when Publicado is clicked', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Publicado' }))

      expect(mockOnFilterChange).toHaveBeenCalledWith('published')
    })

    test('should call onFilterChange with requires_changes when Requiere Cambios is clicked', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Requiere Cambios' }))

      expect(mockOnFilterChange).toHaveBeenCalledWith('requires_changes')
    })

    test('should call onFilterChange with rejected when Rechazado is clicked', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Rechazado' }))

      expect(mockOnFilterChange).toHaveBeenCalledWith('rejected')
    })

    test('should call onFilterChange only once per click', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Borrador' }))

      expect(mockOnFilterChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('accessibility', () => {
    test('should have aria-pressed true for active filter', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter="draft" />)

      const draftButton = screen.getByRole('button', { name: 'Borrador' })
      expect(draftButton).toHaveAttribute('aria-pressed', 'true')
    })

    test('should have aria-pressed false for inactive filters', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter="draft" />)

      const todosButton = screen.getByRole('button', { name: 'Todos' })
      const pendienteButton = screen.getByRole('button', { name: 'Pendiente' })

      expect(todosButton).toHaveAttribute('aria-pressed', 'false')
      expect(pendienteButton).toHaveAttribute('aria-pressed', 'false')
    })

    test('should have aria-pressed true for Todos when activeFilter is null', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter={null} />)

      const todosButton = screen.getByRole('button', { name: 'Todos' })
      expect(todosButton).toHaveAttribute('aria-pressed', 'true')
    })

    test('should have aria-label on container', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      const container = screen.getByRole('group')
      expect(container).toHaveAttribute('aria-label', 'Filtrar eventos por estado')
    })
  })

  describe('styling', () => {
    test('should have proper container classes', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      const container = screen.getByRole('group')
      expect(container).toHaveClass('flex', 'flex-wrap', 'gap-2', 'mb-4')
    })

    test('should have proper button base classes', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'Todos' })
      expect(button).toHaveClass('px-3', 'py-1.5', 'rounded-md', 'text-sm', 'font-medium')
    })
  })

  describe('edge cases', () => {
    test('should handle rapid filter changes', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Borrador' }))
      fireEvent.click(screen.getByRole('button', { name: 'Pendiente' }))
      fireEvent.click(screen.getByRole('button', { name: 'Publicado' }))
      fireEvent.click(screen.getByRole('button', { name: 'Todos' }))

      expect(mockOnFilterChange).toHaveBeenCalledTimes(4)
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(1, 'draft')
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(2, 'pending_internal_approval')
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(3, 'published')
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(4, null)
    })

    test('should allow clicking already active filter', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter="draft" />)

      fireEvent.click(screen.getByRole('button', { name: 'Borrador' }))

      expect(mockOnFilterChange).toHaveBeenCalledWith('draft')
    })
  })
})
