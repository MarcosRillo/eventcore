/**
 * CalendarToolbar Component Tests (TDD - RED Phase)
 *
 * Tests for custom react-big-calendar toolbar.
 * Tests written FIRST following TDD methodology.
 */

import { fireEvent,render, screen } from '@testing-library/react'
import type { View } from 'react-big-calendar'

import { CalendarToolbar } from '@/features/internal-calendar/components/dumb/CalendarToolbar'

describe('CalendarToolbar', () => {
  const mockOnNavigate = jest.fn()
  const mockOnView = jest.fn()

  // Mock localizer (required for ToolbarProps)
  const mockLocalizer = {
    format: jest.fn(),
    parse: jest.fn(),
    startOfWeek: jest.fn(),
    getDay: jest.fn(),
    locales: {},
    messages: {},
  }

  const defaultProps = {
    date: new Date('2025-12-10T12:00:00.000Z'),
    view: 'month' as View,
    views: ['month', 'week', 'day', 'agenda'] as View[],
    label: 'December 2025',
    onNavigate: mockOnNavigate,
    onView: mockOnView,
    localizer: mockLocalizer,
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
    expect(screen.getByRole('button', { name: 'Ver Mes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver Semana' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver Día' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver Agenda' })).toBeInTheDocument()
  })

  it('highlights the current active view button', () => {
    // Act - Render with 'month' view active
    const { rerender } = render(<CalendarToolbar {...defaultProps} view="month" />)

    // Assert - Month button should have active styling
    const monthButton = screen.getByRole('button', { name: /mes/i })
    expect(monthButton).toHaveClass('bg-primary-600') // Active styling

    // Act - Change to 'week' view
    rerender(<CalendarToolbar {...defaultProps} view="week" />)

    // Assert - Week button should now have active styling
    const weekButton = screen.getByRole('button', { name: /semana/i })
    expect(weekButton).toHaveClass('bg-primary-600')
    expect(monthButton).not.toHaveClass('bg-primary-600')
  })

  it('calls onView handler when view button is clicked', () => {
    // Arrange
    render(<CalendarToolbar {...defaultProps} />)
    const weekButton = screen.getByRole('button', { name: /semana/i })

    // Act
    fireEvent.click(weekButton)

    // Assert
    expect(mockOnView).toHaveBeenCalledTimes(1)
    expect(mockOnView).toHaveBeenCalledWith('week')
  })

  it('renders navigation buttons (Hoy, Anterior, Siguiente)', () => {
    // Act
    render(<CalendarToolbar {...defaultProps} />)

    // Assert
    expect(screen.getByRole('button', { name: /hoy/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument()
  })

  it('calls onNavigate with correct action when navigation buttons clicked', () => {
    // Arrange
    render(<CalendarToolbar {...defaultProps} />)
    const todayButton = screen.getByRole('button', { name: /hoy/i })
    const previousButton = screen.getByRole('button', { name: /anterior/i })
    const nextButton = screen.getByRole('button', { name: /siguiente/i })

    // Act & Assert - Hoy button
    fireEvent.click(todayButton)
    expect(mockOnNavigate).toHaveBeenCalledWith('TODAY')

    // Act & Assert - Anterior button
    fireEvent.click(previousButton)
    expect(mockOnNavigate).toHaveBeenCalledWith('PREV')

    // Act & Assert - Siguiente button
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
    expect(screen.getByRole('button', { name: /hoy/i })).toHaveAccessibleName()
    expect(screen.getByRole('button', { name: /anterior/i })).toHaveAccessibleName()
    expect(screen.getByRole('button', { name: /siguiente/i })).toHaveAccessibleName()
    expect(screen.getByRole('button', { name: /mes/i })).toHaveAccessibleName()
    expect(screen.getByRole('button', { name: /semana/i })).toHaveAccessibleName()
  })
})
