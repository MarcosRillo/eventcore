import { render, screen, fireEvent } from '@testing-library/react'
import { AdminQuickFilters } from '../AdminQuickFilters'

describe('AdminQuickFilters', () => {
  const mockOnFilterChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render all filter buttons', () => {
      render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /pending/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /approved/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /published/i })).toBeInTheDocument()
    })

    it('should render with correct layout classes', () => {
      const { container } = render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      const filterContainer = container.querySelector('[role="group"]')
      expect(filterContainer).toBeInTheDocument()
      expect(filterContainer).toHaveClass('flex', 'gap-2', 'mb-4')
    })

    it('should have aria-label for filter group', () => {
      const { container } = render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      const filterGroup = container.querySelector('[role="group"]')
      expect(filterGroup).toHaveAttribute('aria-label', 'Filter events by status')
    })

    it('should render all 4 buttons', () => {
      render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(4)
    })
  })

  describe('Active State', () => {
    it('should mark "All" as active when activeFilter is null', () => {
      render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      const allButton = screen.getByRole('button', { name: /all/i })
      expect(allButton).toHaveClass('bg-blue-600', 'text-white')
      expect(allButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('should mark "Pending" as active when activeFilter is "pending_internal"', () => {
      render(
        <AdminQuickFilters
          activeFilter="pending_internal"
          onFilterChange={mockOnFilterChange}
        />
      )

      const pendingButton = screen.getByRole('button', { name: /pending/i })
      expect(pendingButton).toHaveClass('bg-blue-600', 'text-white')
      expect(pendingButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('should mark "Approved" as active when activeFilter is "approved_internal"', () => {
      render(
        <AdminQuickFilters
          activeFilter="approved_internal"
          onFilterChange={mockOnFilterChange}
        />
      )

      const approvedButton = screen.getByRole('button', { name: /approved/i })
      expect(approvedButton).toHaveClass('bg-blue-600', 'text-white')
      expect(approvedButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('should mark "Published" as active when activeFilter is "published"', () => {
      render(
        <AdminQuickFilters
          activeFilter="published"
          onFilterChange={mockOnFilterChange}
        />
      )

      const publishedButton = screen.getByRole('button', { name: /published/i })
      expect(publishedButton).toHaveClass('bg-blue-600', 'text-white')
      expect(publishedButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('should not mark other buttons as active when one is selected', () => {
      render(
        <AdminQuickFilters
          activeFilter="pending_internal"
          onFilterChange={mockOnFilterChange}
        />
      )

      const allButton = screen.getByRole('button', { name: /all/i })
      const approvedButton = screen.getByRole('button', { name: /approved/i })
      const publishedButton = screen.getByRole('button', { name: /published/i })

      expect(allButton).toHaveClass('bg-white')
      expect(allButton).toHaveAttribute('aria-pressed', 'false')
      expect(approvedButton).toHaveClass('bg-white')
      expect(approvedButton).toHaveAttribute('aria-pressed', 'false')
      expect(publishedButton).toHaveClass('bg-white')
      expect(publishedButton).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('Click Interactions', () => {
    it('should call onFilterChange with null when All button is clicked', () => {
      render(
        <AdminQuickFilters
          activeFilter="pending_internal"
          onFilterChange={mockOnFilterChange}
        />
      )

      const allButton = screen.getByRole('button', { name: /all/i })
      fireEvent.click(allButton)

      expect(mockOnFilterChange).toHaveBeenCalledWith(null)
      expect(mockOnFilterChange).toHaveBeenCalledTimes(1)
    })

    it('should call onFilterChange with "pending_internal" when Pending button is clicked', () => {
      render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      const pendingButton = screen.getByRole('button', { name: /pending/i })
      fireEvent.click(pendingButton)

      expect(mockOnFilterChange).toHaveBeenCalledWith('pending_internal')
      expect(mockOnFilterChange).toHaveBeenCalledTimes(1)
    })

    it('should call onFilterChange with "approved_internal" when Approved button is clicked', () => {
      render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      const approvedButton = screen.getByRole('button', { name: /approved/i })
      fireEvent.click(approvedButton)

      expect(mockOnFilterChange).toHaveBeenCalledWith('approved_internal')
      expect(mockOnFilterChange).toHaveBeenCalledTimes(1)
    })

    it('should call onFilterChange with "published" when Published button is clicked', () => {
      render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      const publishedButton = screen.getByRole('button', { name: /published/i })
      fireEvent.click(publishedButton)

      expect(mockOnFilterChange).toHaveBeenCalledWith('published')
      expect(mockOnFilterChange).toHaveBeenCalledTimes(1)
    })

    it('should allow clicking the same filter multiple times', () => {
      render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      const allButton = screen.getByRole('button', { name: /all/i })
      fireEvent.click(allButton)
      fireEvent.click(allButton)
      fireEvent.click(allButton)

      expect(mockOnFilterChange).toHaveBeenCalledTimes(3)
      expect(mockOnFilterChange).toHaveBeenCalledWith(null)
    })

    it('should handle rapid filter changes', () => {
      const { rerender } = render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /pending/i }))

      rerender(
        <AdminQuickFilters
          activeFilter="pending_internal"
          onFilterChange={mockOnFilterChange}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /approved/i }))

      rerender(
        <AdminQuickFilters
          activeFilter="approved_internal"
          onFilterChange={mockOnFilterChange}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /published/i }))

      expect(mockOnFilterChange).toHaveBeenCalledTimes(3)
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /pending/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /approved/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /published/i })).toBeInTheDocument()
    })

    it('should use button elements for keyboard navigation', () => {
      render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON')
      })
    })

    it('should have aria-pressed attribute on active button', () => {
      render(
        <AdminQuickFilters
          activeFilter="pending_internal"
          onFilterChange={mockOnFilterChange}
        />
      )

      const pendingButton = screen.getByRole('button', { name: /pending/i })
      expect(pendingButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('should have aria-pressed="false" on inactive buttons', () => {
      render(
        <AdminQuickFilters
          activeFilter="pending_internal"
          onFilterChange={mockOnFilterChange}
        />
      )

      const allButton = screen.getByRole('button', { name: /all/i })
      expect(allButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('should provide visual feedback for active state', () => {
      render(
        <AdminQuickFilters
          activeFilter="pending_internal"
          onFilterChange={mockOnFilterChange}
        />
      )

      const pendingButton = screen.getByRole('button', { name: /pending/i })
      const allButton = screen.getByRole('button', { name: /all/i })

      // Active button should have blue background
      expect(pendingButton).toHaveClass('bg-blue-600')
      // Inactive button should have white background
      expect(allButton).toHaveClass('bg-white')
    })

    it('should have group role with aria-label', () => {
      const { container } = render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      const group = container.querySelector('[role="group"]')
      expect(group).toHaveAttribute('aria-label', 'Filter events by status')
    })
  })

  describe('Edge Cases', () => {
    it('should handle activeFilter with unexpected value gracefully', () => {
      render(
        <AdminQuickFilters
          activeFilter="unexpected_value"
          onFilterChange={mockOnFilterChange}
        />
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(4)

      // All buttons should be in inactive state
      buttons.forEach(button => {
        expect(button).toHaveClass('bg-white')
        expect(button).toHaveAttribute('aria-pressed', 'false')
      })
    })

    it('should handle empty string as activeFilter', () => {
      render(
        <AdminQuickFilters
          activeFilter=""
          onFilterChange={mockOnFilterChange}
        />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('bg-white')
        expect(button).toHaveAttribute('aria-pressed', 'false')
      })
    })
  })

  describe('Visual Styling', () => {
    it('should apply correct classes to active button', () => {
      render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      const allButton = screen.getByRole('button', { name: /all/i })
      expect(allButton).toHaveClass(
        'px-4',
        'py-2',
        'rounded-md',
        'text-sm',
        'font-medium',
        'transition-colors',
        'bg-blue-600',
        'text-white'
      )
    })

    it('should apply correct classes to inactive buttons', () => {
      render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      const pendingButton = screen.getByRole('button', { name: /pending/i })
      expect(pendingButton).toHaveClass(
        'px-4',
        'py-2',
        'rounded-md',
        'text-sm',
        'font-medium',
        'transition-colors',
        'bg-white',
        'text-gray-700',
        'hover:bg-gray-50',
        'border',
        'border-gray-300'
      )
    })

    it('should have consistent sizing across all buttons', () => {
      render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('px-4', 'py-2', 'text-sm')
      })
    })

    it('should have rounded corners on all buttons', () => {
      render(
        <AdminQuickFilters
          activeFilter={null}
          onFilterChange={mockOnFilterChange}
        />
      )

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('rounded-md')
      })
    })
  })
})
