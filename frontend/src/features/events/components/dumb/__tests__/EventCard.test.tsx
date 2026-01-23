/**
 * Tests for EventCard (Dumb Component)
 *
 * Tests rendering of event card with title, status, date, organization, and actions.
 */

import { fireEvent,render, screen } from '@testing-library/react'

import { EventCard } from '@/features/events/components/dumb/EventCard'
import { Event, EventStatus,EventType } from '@/types/event.types'

// Mock UI components
jest.mock('@/components/ui', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span data-testid="badge" className={className}>{children}</span>
  )
}))

// Mock heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  CalendarIcon: () => <span data-testid="calendar-icon" />,
  ClockIcon: () => <span data-testid="clock-icon" />,
  BuildingOffice2Icon: () => <span data-testid="building-icon" />
}))

jest.mock('@heroicons/react/24/solid', () => ({
  StarIcon: () => <span data-testid="star-icon" />
}))

describe('EventCard', () => {
  const mockOnViewDetail = jest.fn()

  const baseEvent: Event = {
    id: 1,
    title: 'Test Event',
    description: 'Test description',
    type: 'sede_unica' as EventType,
    status: 'published' as EventStatus,
    start_date: '2025-12-15T18:00:00',
    end_date: '2025-12-15T22:00:00',
    is_featured: false,
    category_id: 1,
    category: { id: 1, name: 'Music', slug: 'music', color: '#FF5733', entity_id: 1, is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    locations: [],
    location: { id: 1, name: 'Teatro', address: 'Test 123', city: 'CABA', country: 'Argentina', features: [], is_active: true, entity_id: 1, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
    organizer: { id: 1, name: 'Test Organizer', organization: 'Test Org' },
    approval_history: [],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  const defaultProps = {
    event: baseEvent,
    formattedDate: {
      date: '15 de diciembre, 2025',
      time: '18:00 - 22:00'
    },
    statusColor: 'bg-green-100 text-green-800',
    urgencyIndicator: null,
    actionButtons: <button>View</button>,
    onViewDetail: mockOnViewDetail
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    test('should render card component', () => {
      render(<EventCard {...defaultProps} />)

      expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    test('should render event title', () => {
      render(<EventCard {...defaultProps} />)

      expect(screen.getByText('Test Event')).toBeInTheDocument()
    })

    test('should render status badge', () => {
      render(<EventCard {...defaultProps} />)

      expect(screen.getByTestId('badge')).toBeInTheDocument()
      expect(screen.getByText('published')).toBeInTheDocument()
    })

    test('should render formatted date', () => {
      render(<EventCard {...defaultProps} />)

      expect(screen.getByText('15 de diciembre, 2025')).toBeInTheDocument()
    })

    test('should render formatted time', () => {
      render(<EventCard {...defaultProps} />)

      expect(screen.getByText('18:00 - 22:00')).toBeInTheDocument()
    })

    test('should render calendar icon', () => {
      render(<EventCard {...defaultProps} />)

      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
    })

    test('should render clock icon', () => {
      render(<EventCard {...defaultProps} />)

      expect(screen.getByTestId('clock-icon')).toBeInTheDocument()
    })

    test('should render action buttons', () => {
      render(<EventCard {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument()
    })
  })

  describe('organizer display', () => {
    test('should render organizer name when organizer exists', () => {
      render(<EventCard {...defaultProps} />)

      expect(screen.getByText('Test Organizer')).toBeInTheDocument()
      expect(screen.getByTestId('building-icon')).toBeInTheDocument()
    })

    test('should not render organizer section when organizer is null', () => {
      const eventWithoutOrganizer = { ...baseEvent, organizer: undefined }
      render(<EventCard {...defaultProps} event={eventWithoutOrganizer} />)

      expect(screen.queryByText('Test Organizer')).not.toBeInTheDocument()
      expect(screen.queryByTestId('building-icon')).not.toBeInTheDocument()
    })
  })

  describe('description display', () => {
    test('should render description when it exists', () => {
      render(<EventCard {...defaultProps} />)

      expect(screen.getByText('Test description')).toBeInTheDocument()
    })

    test('should not render description when it is empty', () => {
      const eventWithoutDescription = { ...baseEvent, description: '' }
      render(<EventCard {...defaultProps} event={eventWithoutDescription} />)

      expect(screen.queryByText('Test description')).not.toBeInTheDocument()
    })

    test('should not render description when it is undefined', () => {
      // Type assertion needed for edge case testing - component handles missing description gracefully
      const eventWithoutDescription = { ...baseEvent, description: undefined } as unknown as Event
      render(<EventCard {...defaultProps} event={eventWithoutDescription} />)

      // The paragraph should not be rendered
      const paragraphs = document.querySelectorAll('p.text-sm.text-gray-600.line-clamp-2')
      expect(paragraphs.length).toBe(0)
    })
  })

  describe('featured indicator', () => {
    test('should render star icon when event is featured', () => {
      const featuredEvent = { ...baseEvent, is_featured: true }
      render(<EventCard {...defaultProps} event={featuredEvent} />)

      expect(screen.getByTestId('star-icon')).toBeInTheDocument()
    })

    test('should not render star icon when event is not featured', () => {
      render(<EventCard {...defaultProps} />)

      expect(screen.queryByTestId('star-icon')).not.toBeInTheDocument()
    })
  })

  describe('status display', () => {
    test('should display string status directly', () => {
      render(<EventCard {...defaultProps} />)

      expect(screen.getByText('published')).toBeInTheDocument()
    })

    test('should display status_code when status is an object', () => {
      const eventWithObjectStatus = {
        ...baseEvent,
        status: { status_code: 'pending', status_name: 'Pending Approval' }
      }
      render(<EventCard {...defaultProps} event={eventWithObjectStatus as unknown as Event} />)

      expect(screen.getByText('pending')).toBeInTheDocument()
    })

    test('should apply status color class to badge', () => {
      render(<EventCard {...defaultProps} />)

      const badge = screen.getByTestId('badge')
      expect(badge).toHaveClass('bg-green-100', 'text-green-800')
    })
  })

  describe('urgency indicator', () => {
    test('should render urgency indicator when provided', () => {
      const urgencyIndicator = <span data-testid="urgency">Urgent!</span>
      render(<EventCard {...defaultProps} urgencyIndicator={urgencyIndicator} />)

      expect(screen.getByTestId('urgency')).toBeInTheDocument()
      expect(screen.getByText('Urgent!')).toBeInTheDocument()
    })

    test('should not render urgency indicator when null', () => {
      render(<EventCard {...defaultProps} urgencyIndicator={null} />)

      expect(screen.queryByTestId('urgency')).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    test('should call onViewDetail when title is clicked', () => {
      render(<EventCard {...defaultProps} />)

      const title = screen.getByText('Test Event')
      fireEvent.click(title)

      expect(mockOnViewDetail).toHaveBeenCalledTimes(1)
    })

    test('should have cursor-pointer class on title', () => {
      render(<EventCard {...defaultProps} />)

      const title = screen.getByText('Test Event')
      expect(title).toHaveClass('cursor-pointer')
    })

    test('should have hover effect class on title', () => {
      render(<EventCard {...defaultProps} />)

      const title = screen.getByText('Test Event')
      expect(title).toHaveClass('hover:text-blue-600')
    })
  })

  describe('styling', () => {
    test('should apply hover classes to card', () => {
      render(<EventCard {...defaultProps} />)

      const card = screen.getByTestId('card')
      expect(card).toHaveClass('relative', 'overflow-hidden', 'transition-all')
    })

    test('should have title with correct styling', () => {
      render(<EventCard {...defaultProps} />)

      const title = screen.getByText('Test Event')
      expect(title).toHaveClass('text-lg', 'font-semibold', 'text-gray-900')
    })

    test('should have line-clamp-2 on title for truncation', () => {
      render(<EventCard {...defaultProps} />)

      const title = screen.getByText('Test Event')
      expect(title).toHaveClass('line-clamp-2')
    })
  })

  describe('action buttons', () => {
    test('should render custom action buttons', () => {
      const customButtons = (
        <div data-testid="custom-actions">
          <button>Edit</button>
          <button>Delete</button>
        </div>
      )
      render(<EventCard {...defaultProps} actionButtons={customButtons} />)

      expect(screen.getByTestId('custom-actions')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    })

    test('should render action buttons in bordered section', () => {
      render(<EventCard {...defaultProps} />)

      // The action button is rendered inside the Card mock
      const viewButton = screen.getByRole('button', { name: 'View' })
      expect(viewButton).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    test('should handle long event title', () => {
      const longTitleEvent = {
        ...baseEvent,
        title: 'This is a very long event title that should be truncated with line-clamp'
      }
      render(<EventCard {...defaultProps} event={longTitleEvent} />)

      expect(screen.getByText(longTitleEvent.title)).toBeInTheDocument()
    })

    test('should handle long description', () => {
      const longDescEvent = {
        ...baseEvent,
        description: 'This is a very long description that should be truncated. It goes on and on with lots of details about the event.'
      }
      render(<EventCard {...defaultProps} event={longDescEvent} />)

      expect(screen.getByText(longDescEvent.description)).toBeInTheDocument()
    })

    test('should handle event with minimal data', () => {
      const minimalEvent: Event = {
        ...baseEvent,
        id: 99,
        title: 'Minimal Event',
        status: 'draft' as EventStatus,
      }
      render(<EventCard {...defaultProps} event={minimalEvent} />)

      expect(screen.getByText('Minimal Event')).toBeInTheDocument()
      expect(screen.getByText('draft')).toBeInTheDocument()
    })
  })
})
