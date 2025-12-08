/**
 * CalendarToolbar Component Tests (TDD - RED Phase)
 *
 * Tests for custom react-big-calendar toolbar.
 * Tests written FIRST following TDD methodology.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { CalendarToolbar } from '../CalendarToolbar'
import type { View } from 'react-big-calendar'

describe('CalendarToolbar', () => {
  const mockOnNavigate = jest.fn()
  const mockOnView = jest.fn()

  const defaultProps = {
    date: new Date('2025-12-10T12:00:00.000Z'),
    view: 'month' as View,
    views: ['month', 'week', 'day', 'agenda'] as View[],
    label: 'December 2025',
    onNavigate: mockOnNavigate,
    onView: mockOnView,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    // Act
    render(<CalendarToolbar {...defaultProps} />)

    // Assert
    expect(screen.getByText('December 2025')).toBeInTheDocument()
    expect(screen.getByRole('toolbar')).toBeInTheDocument()
  })

  it('renders all view buttons when provided in views prop', () => {
    // Act
    render(<CalendarToolbar {...defaultProps} />)

    // Assert
    expect(screen.getByRole('button', { name: 'View month' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View week' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View day' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View agenda' })).toBeInTheDocument()
  })

  it('highlights the current active view button', () => {
    // Act - Render with 'month' view active
    const { rerender } = render(<CalendarToolbar {...defaultProps} view="month" />)

    // Assert - Month button should have active styling
    const monthButton = screen.getByRole('button', { name: /month/i })
    expect(monthButton).toHaveClass('bg-blue-600') // Active styling

    // Act - Change to 'week' view
    rerender(<CalendarToolbar {...defaultProps} view="week" />)

    // Assert - Week button should now have active styling
    const weekButton = screen.getByRole('button', { name: /week/i })
    expect(weekButton).toHaveClass('bg-blue-600')
    expect(monthButton).not.toHaveClass('bg-blue-600')
  })

  it('calls onView handler when view button is clicked', () => {
    // Arrange
    render(<CalendarToolbar {...defaultProps} />)
    const weekButton = screen.getByRole('button', { name: /week/i })

    // Act
    fireEvent.click(weekButton)

    // Assert
    expect(mockOnView).toHaveBeenCalledTimes(1)
    expect(mockOnView).toHaveBeenCalledWith('week')
  })

  it('renders navigation buttons (Today, Previous, Next)', () => {
    // Act
    render(<CalendarToolbar {...defaultProps} />)

    // Assert
    expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('calls onNavigate with correct action when navigation buttons clicked', () => {
    // Arrange
    render(<CalendarToolbar {...defaultProps} />)
    const todayButton = screen.getByRole('button', { name: /today/i })
    const previousButton = screen.getByRole('button', { name: /previous/i })
    const nextButton = screen.getByRole('button', { name: /next/i })

    // Act & Assert - Today button
    fireEvent.click(todayButton)
    expect(mockOnNavigate).toHaveBeenCalledWith('TODAY')

    // Act & Assert - Previous button
    fireEvent.click(previousButton)
    expect(mockOnNavigate).toHaveBeenCalledWith('PREV')

    // Act & Assert - Next button
    fireEvent.click(nextButton)
    expect(mockOnNavigate).toHaveBeenCalledWith('NEXT')

    expect(mockOnNavigate).toHaveBeenCalledTimes(3)
  })

  it('displays the current label text correctly', () => {
    // Arrange & Act
    const { rerender } = render(<CalendarToolbar {...defaultProps} label="December 2025" />)

    // Assert
    expect(screen.getByText('December 2025')).toBeInTheDocument()

    // Act - Change label
    rerender(<CalendarToolbar {...defaultProps} label="January 2026" />)

    // Assert
    expect(screen.getByText('January 2026')).toBeInTheDocument()
    expect(screen.queryByText('December 2025')).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    // Act
    render(<CalendarToolbar {...defaultProps} />)

    // Assert - Toolbar has role
    const toolbar = screen.getByRole('toolbar')
    expect(toolbar).toHaveAttribute('aria-label', 'Calendar toolbar')

    // Assert - All buttons have accessible names
    expect(screen.getByRole('button', { name: /today/i })).toHaveAccessibleName()
    expect(screen.getByRole('button', { name: /previous/i })).toHaveAccessibleName()
    expect(screen.getByRole('button', { name: /next/i })).toHaveAccessibleName()
    expect(screen.getByRole('button', { name: /month/i })).toHaveAccessibleName()
    expect(screen.getByRole('button', { name: /week/i })).toHaveAccessibleName()
  })
})
