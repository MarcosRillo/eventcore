/**
 * Tests for OrganizerQuickFilters (Dumb Component)
 *
 * Tests rendering and interaction of status filter buttons.
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

      expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Draft' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Pending' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Published' })).toBeInTheDocument()
    })

    test('should render 4 filter buttons', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(4)
    })

    test('should have group role for accessibility', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      expect(screen.getByRole('group', { name: /filter events by status/i })).toBeInTheDocument()
    })
  })

  describe('active state styling', () => {
    test('should highlight All button when activeFilter is null', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter={null} />)

      const allButton = screen.getByRole('button', { name: 'All' })
      expect(allButton).toHaveClass('bg-blue-600', 'text-white')
    })

    test('should highlight Draft button when activeFilter is draft', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter="draft" />)

      const draftButton = screen.getByRole('button', { name: 'Draft' })
      expect(draftButton).toHaveClass('bg-blue-600', 'text-white')
    })

    test('should highlight Pending button when activeFilter is pending', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter="pending" />)

      const pendingButton = screen.getByRole('button', { name: 'Pending' })
      expect(pendingButton).toHaveClass('bg-blue-600', 'text-white')
    })

    test('should highlight Published button when activeFilter is published', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter="published" />)

      const publishedButton = screen.getByRole('button', { name: 'Published' })
      expect(publishedButton).toHaveClass('bg-blue-600', 'text-white')
    })

    test('should not highlight inactive buttons', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter="draft" />)

      const allButton = screen.getByRole('button', { name: 'All' })
      const pendingButton = screen.getByRole('button', { name: 'Pending' })
      const publishedButton = screen.getByRole('button', { name: 'Published' })

      expect(allButton).toHaveClass('bg-white')
      expect(pendingButton).toHaveClass('bg-white')
      expect(publishedButton).toHaveClass('bg-white')
    })
  })

  describe('button interactions', () => {
    test('should call onFilterChange with null when All is clicked', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'All' }))

      expect(mockOnFilterChange).toHaveBeenCalledWith(null)
    })

    test('should call onFilterChange with draft when Draft is clicked', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Draft' }))

      expect(mockOnFilterChange).toHaveBeenCalledWith('draft')
    })

    test('should call onFilterChange with pending when Pending is clicked', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Pending' }))

      expect(mockOnFilterChange).toHaveBeenCalledWith('pending')
    })

    test('should call onFilterChange with published when Published is clicked', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Published' }))

      expect(mockOnFilterChange).toHaveBeenCalledWith('published')
    })

    test('should call onFilterChange only once per click', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Draft' }))

      expect(mockOnFilterChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('accessibility', () => {
    test('should have aria-pressed true for active filter', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter="draft" />)

      const draftButton = screen.getByRole('button', { name: 'Draft' })
      expect(draftButton).toHaveAttribute('aria-pressed', 'true')
    })

    test('should have aria-pressed false for inactive filters', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter="draft" />)

      const allButton = screen.getByRole('button', { name: 'All' })
      const pendingButton = screen.getByRole('button', { name: 'Pending' })

      expect(allButton).toHaveAttribute('aria-pressed', 'false')
      expect(pendingButton).toHaveAttribute('aria-pressed', 'false')
    })

    test('should have aria-pressed true for All when activeFilter is null', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter={null} />)

      const allButton = screen.getByRole('button', { name: 'All' })
      expect(allButton).toHaveAttribute('aria-pressed', 'true')
    })

    test('should have aria-label on container', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      const container = screen.getByRole('group')
      expect(container).toHaveAttribute('aria-label', 'Filter events by status')
    })
  })

  describe('styling', () => {
    test('should have proper container classes', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      const container = screen.getByRole('group')
      expect(container).toHaveClass('flex', 'gap-2', 'mb-4')
    })

    test('should have proper button base classes', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      const button = screen.getByRole('button', { name: 'All' })
      expect(button).toHaveClass('px-4', 'py-2', 'rounded-md', 'text-sm', 'font-medium')
    })
  })

  describe('edge cases', () => {
    test('should handle rapid filter changes', () => {
      render(<OrganizerQuickFilters {...defaultProps} />)

      fireEvent.click(screen.getByRole('button', { name: 'Draft' }))
      fireEvent.click(screen.getByRole('button', { name: 'Pending' }))
      fireEvent.click(screen.getByRole('button', { name: 'Published' }))
      fireEvent.click(screen.getByRole('button', { name: 'All' }))

      expect(mockOnFilterChange).toHaveBeenCalledTimes(4)
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(1, 'draft')
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(2, 'pending')
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(3, 'published')
      expect(mockOnFilterChange).toHaveBeenNthCalledWith(4, null)
    })

    test('should allow clicking already active filter', () => {
      render(<OrganizerQuickFilters {...defaultProps} activeFilter="draft" />)

      fireEvent.click(screen.getByRole('button', { name: 'Draft' }))

      expect(mockOnFilterChange).toHaveBeenCalledWith('draft')
    })
  })
})
