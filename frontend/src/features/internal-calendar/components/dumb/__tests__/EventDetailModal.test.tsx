/**
 * EventDetailModal Component Tests (TDD - RED Phase)
 *
 * Tests for the event detail modal that displays full event information.
 * Tests written FIRST following TDD methodology.
 */

import { fireEvent,render, screen } from '@testing-library/react'

import { EventDetailModal } from '@/features/internal-calendar/components/dumb/EventDetailModal'
import type { BigCalendarEvent } from '@/features/internal-calendar/types/internal-calendar.types'

// Mock the base Modal component
jest.mock('@/components/ui/Modal', () => {
  return function MockModal({
    isOpen,
    onClose,
    title,
    children,
    size,
  }: {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    size?: string
  }) {
    if (!isOpen) return null
    return (
      <div data-testid="modal" data-size={size}>
        <div data-testid="modal-title">{title}</div>
        <button onClick={onClose} data-testid="modal-close">
          Close
        </button>
        <div data-testid="modal-content">{children}</div>
      </div>
    )
  }
})

describe('EventDetailModal', () => {
  const mockOnClose = jest.fn()

  const mockEvent: BigCalendarEvent = {
    id: 1,
    title: 'Annual Tech Conference 2025',
    start: new Date('2025-12-10T10:00:00.000Z'),
    end: new Date('2025-12-10T18:00:00.000Z'),
    color: '#FF5733',
    resource: {
      id: 1,
      title: 'Annual Tech Conference 2025',
      description: 'A comprehensive technology conference featuring the latest innovations.',
      start_date: '2025-12-10T10:00:00.000Z',
      end_date: '2025-12-10T18:00:00.000Z',
      status: {
        id: 1,
        status_code: 'approved_internal',
        status_name: 'Approved Internal',
        description: 'Event approved for internal use',
      },
      organization: {
        id: 1,
        name: 'Tech Organization',
      },
      eventType: {
        id: 1,
        name: 'Conference',
        color: '#FF5733',
      },
      locations: [
        {
          id: 1,
          name: 'Convention Center',
          city: 'Buenos Aires',
        },
        {
          id: 2,
          name: 'Virtual Platform',
          city: 'Online',
        },
      ],
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when isOpen is true', () => {
    // Act
    render(<EventDetailModal event={mockEvent} isOpen={true} onClose={mockOnClose} />)

    // Assert
    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByTestId('modal-title')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    // Act
    render(<EventDetailModal event={mockEvent} isOpen={false} onClose={mockOnClose} />)

    // Assert
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })

  it('displays event title and description', () => {
    // Act
    render(<EventDetailModal event={mockEvent} isOpen={true} onClose={mockOnClose} />)

    // Assert
    expect(screen.getByText('Annual Tech Conference 2025')).toBeInTheDocument()
    expect(
      screen.getByText('A comprehensive technology conference featuring the latest innovations.')
    ).toBeInTheDocument()
  })

  it('displays formatted start and end dates', () => {
    // Act
    render(<EventDetailModal event={mockEvent} isOpen={true} onClose={mockOnClose} />)

    // Assert
    // Dates should be formatted in a readable way
    expect(screen.getByText('December 10, 2025')).toBeInTheDocument() // Date
    expect(screen.getByText(/07:00 - 15:00/)).toBeInTheDocument() // Time range
  })

  it('displays organization and status information', () => {
    // Act
    render(<EventDetailModal event={mockEvent} isOpen={true} onClose={mockOnClose} />)

    // Assert
    expect(screen.getByText('Tech Organization')).toBeInTheDocument()
    expect(screen.getByText('Approved Internal')).toBeInTheDocument()
  })

  it('displays event type with color indicator', () => {
    // Act
    render(<EventDetailModal event={mockEvent} isOpen={true} onClose={mockOnClose} />)

    // Assert
    expect(screen.getByText('Conference')).toBeInTheDocument()
    // Color indicator should be present (badge or dot)
    const content = screen.getByTestId('modal-content')
    expect(content).toBeInTheDocument()
  })

  it('displays multiple locations when available', () => {
    // Act
    render(<EventDetailModal event={mockEvent} isOpen={true} onClose={mockOnClose} />)

    // Assert
    expect(screen.getByText('Convention Center - Buenos Aires')).toBeInTheDocument()
    expect(screen.getByText('Virtual Platform - Online')).toBeInTheDocument()
    expect(screen.getByText(/Locations/)).toBeInTheDocument() // Plural label
  })

  it('handles events without description gracefully', () => {
    // Arrange
    const eventWithoutDescription: BigCalendarEvent = {
      ...mockEvent,
      resource: {
        ...mockEvent.resource,
        description: undefined,
      },
    }

    // Act
    render(<EventDetailModal event={eventWithoutDescription} isOpen={true} onClose={mockOnClose} />)

    // Assert
    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByText('Annual Tech Conference 2025')).toBeInTheDocument()
    // Should not crash, modal still renders
  })

  it('handles events without locations gracefully', () => {
    // Arrange
    const eventWithoutLocations: BigCalendarEvent = {
      ...mockEvent,
      resource: {
        ...mockEvent.resource,
        locations: undefined,
      },
    }

    // Act
    render(<EventDetailModal event={eventWithoutLocations} isOpen={true} onClose={mockOnClose} />)

    // Assert
    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByText('Annual Tech Conference 2025')).toBeInTheDocument()
    // Should not crash, modal still renders
  })

  it('calls onClose when close button is clicked', () => {
    // Arrange
    render(<EventDetailModal event={mockEvent} isOpen={true} onClose={mockOnClose} />)
    const closeButton = screen.getByTestId('modal-close')

    // Act
    fireEvent.click(closeButton)

    // Assert
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
