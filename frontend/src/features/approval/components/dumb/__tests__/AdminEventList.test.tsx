import { render, screen } from '@testing-library/react'
import { AdminEventList } from '../AdminEventList'
import { Event, EventStatus } from '@/features/approval/types/approval.types'

interface MockApprovalActionButtonsProps {
  event: Event
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onRequestChanges: (id: number) => void
  onPublish: (id: number) => void
  loading?: boolean
}

// Mock ApprovalActionButtons component
jest.mock('@/features/approval/components/dumb/ApprovalActionButtons', () => ({
  ApprovalActionButtons: ({ event, onApprove, onReject, onRequestChanges, onPublish, loading }: MockApprovalActionButtonsProps) => (
    <div data-testid="approval-action-buttons">
      <span data-testid="event-id">{event.id}</span>
      <button onClick={() => onApprove(event.id)}>Approve</button>
      <button onClick={() => onReject(event.id)}>Reject</button>
      <button onClick={() => onRequestChanges(event.id)}>Request Changes</button>
      <button onClick={() => onPublish(event.id)}>Publish</button>
      <span data-testid="loading-state">{loading ? 'loading' : 'not-loading'}</span>
    </div>
  ),
}))

describe('AdminEventList', () => {
  const mockHandlers = {
    onApprove: jest.fn(),
    onReject: jest.fn(),
    onRequestChanges: jest.fn(),
    onPublish: jest.fn(),
  }

  const createMockEvent = (overrides?: Partial<Event>): Event => ({
    id: 1,
    title: 'Test Event',
    description: 'Test Description',
    start_date: '2025-12-01',
    end_date: '2025-12-01',
    status: 'pending_internal',
    category_id: 1,
    location_id: 1,
    organizer: 'Test Organizer',
    created_at: '2025-01-01T00:00:00Z',
    ...overrides,
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render table with headers', () => {
      render(
        <AdminEventList
          events={[]}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Organizer')).toBeInTheDocument()
      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByText('Date')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('should render table element', () => {
      render(
        <AdminEventList
          events={[]}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('should have 6 column headers', () => {
      render(
        <AdminEventList
          events={[]}
          {...mockHandlers}
        />
      )

      const headers = screen.getAllByRole('columnheader')
      expect(headers).toHaveLength(6)
    })

    it('should render with scrollable container', () => {
      const { container } = render(
        <AdminEventList
          events={[]}
          {...mockHandlers}
        />
      )

      const scrollContainer = container.querySelector('.overflow-x-auto')
      expect(scrollContainer).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should render empty table when no events provided', () => {
      render(
        <AdminEventList
          events={[]}
          {...mockHandlers}
        />
      )

      const tbody = screen.getByRole('table').querySelector('tbody')
      expect(tbody?.children).toHaveLength(0)
    })

    it('should render table structure even with empty events array', () => {
      render(
        <AdminEventList
          events={[]}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('columnheader')).toHaveLength(6)
    })
  })

  describe('Event Rendering', () => {
    it('should render single event', () => {
      const event = createMockEvent({ title: 'Summer Festival' })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Summer Festival')).toBeInTheDocument()
    })

    it('should render multiple events', () => {
      const events = [
        createMockEvent({ id: 1, title: 'Event 1' }),
        createMockEvent({ id: 2, title: 'Event 2' }),
        createMockEvent({ id: 3, title: 'Event 3' }),
      ]

      render(
        <AdminEventList
          events={events}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Event 1')).toBeInTheDocument()
      expect(screen.getByText('Event 2')).toBeInTheDocument()
      expect(screen.getByText('Event 3')).toBeInTheDocument()
    })

    it('should render all event fields', () => {
      const event = createMockEvent({
        title: 'Complete Event',
        organizer: 'John Doe',
        category_id: 5,
        start_date: '2025-12-15',
        status: 'approved_internal',
      })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Complete Event')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Category 5')).toBeInTheDocument()
      expect(screen.getByText(/Dec \d+, 2025/)).toBeInTheDocument()
      expect(screen.getByText('Approved')).toBeInTheDocument()
    })

    it('should render organizer name', () => {
      const event = createMockEvent({ organizer: 'Jane Smith' })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('should render category ID', () => {
      const event = createMockEvent({ category_id: 42 })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Category 42')).toBeInTheDocument()
    })
  })

  describe('Date Formatting', () => {
    it('should format date correctly (Month Day, Year)', () => {
      const event = createMockEvent({ start_date: '2025-12-15' })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/Dec \d+, 2025/)).toBeInTheDocument()
    })

    it('should format date with full month name abbreviation', () => {
      const event = createMockEvent({ start_date: '2025-11-15' })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/Nov \d+, 2025/)).toBeInTheDocument()
    })

    it('should format dates for different months', () => {
      const events = [
        createMockEvent({ id: 1, start_date: '2025-01-15' }),
        createMockEvent({ id: 2, start_date: '2025-06-15' }),
        createMockEvent({ id: 3, start_date: '2025-12-15' }),
      ]

      render(
        <AdminEventList
          events={events}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/Jan \d+, 2025/)).toBeInTheDocument()
      expect(screen.getByText(/Jun \d+, 2025/)).toBeInTheDocument()
      expect(screen.getByText(/Dec \d+, 2025/)).toBeInTheDocument()
    })

    it('should handle dates at year boundaries', () => {
      const events = [
        createMockEvent({ id: 1, start_date: '2025-12-15' }),
        createMockEvent({ id: 2, start_date: '2026-01-15' }),
      ]

      render(
        <AdminEventList
          events={events}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(/Dec \d+, 2025/)).toBeInTheDocument()
      expect(screen.getByText(/Jan \d+, 2026/)).toBeInTheDocument()
    })
  })

  describe('Status Display', () => {
    it('should display "Pending" status for pending_internal', () => {
      const event = createMockEvent({ status: 'pending_internal' })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      const statusBadge = screen.getByText('Pending')
      expect(statusBadge).toBeInTheDocument()
      expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
    })

    it('should display "Approved" status for approved_internal', () => {
      const event = createMockEvent({ status: 'approved_internal' })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      const statusBadge = screen.getByText('Approved')
      expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800')
    })

    it('should display "Published" status for published', () => {
      const event = createMockEvent({ status: 'published' })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      const statusBadge = screen.getByText('Published')
      expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800')
    })

    it('should display "Rejected" status for rejected', () => {
      const event = createMockEvent({ status: 'rejected' })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      const statusBadge = screen.getByText('Rejected')
      expect(statusBadge).toHaveClass('bg-red-100', 'text-red-800')
    })

    it('should display "Changes Needed" status for requires_changes', () => {
      const event = createMockEvent({ status: 'requires_changes' })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      const statusBadge = screen.getByText('Changes Needed')
      expect(statusBadge).toHaveClass('bg-orange-100', 'text-orange-800')
    })

    it('should display unknown status with default styling', () => {
      const event = createMockEvent({ status: 'unknown_status' as EventStatus })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      const statusBadge = screen.getByText('unknown_status')
      expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-800')
    })

    it('should apply rounded pill styling to status badges', () => {
      const event = createMockEvent({ status: 'approved_internal' })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      const statusBadge = screen.getByText('Approved')
      expect(statusBadge).toHaveClass('px-2', 'py-1', 'text-xs', 'font-medium', 'rounded-full')
    })

    it('should display different statuses for different events', () => {
      const events = [
        createMockEvent({ id: 1, status: 'pending_internal' }),
        createMockEvent({ id: 2, status: 'approved_internal' }),
        createMockEvent({ id: 3, status: 'published' }),
      ]

      render(
        <AdminEventList
          events={events}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getByText('Approved')).toBeInTheDocument()
      expect(screen.getByText('Published')).toBeInTheDocument()
    })
  })

  describe('Action Buttons Integration', () => {
    it('should render ApprovalActionButtons for each event', () => {
      const events = [
        createMockEvent({ id: 1 }),
        createMockEvent({ id: 2 }),
        createMockEvent({ id: 3 }),
      ]

      render(
        <AdminEventList
          events={events}
          {...mockHandlers}
        />
      )

      const actionButtons = screen.getAllByTestId('approval-action-buttons')
      expect(actionButtons).toHaveLength(3)
    })

    it('should pass correct event to ApprovalActionButtons', () => {
      const event = createMockEvent({ id: 42, title: 'Test Event' })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('event-id')).toHaveTextContent('42')
    })

    it('should pass all action handlers to ApprovalActionButtons', () => {
      const event = createMockEvent({ id: 1 })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Approve')).toBeInTheDocument()
      expect(screen.getByText('Reject')).toBeInTheDocument()
      expect(screen.getByText('Request Changes')).toBeInTheDocument()
      expect(screen.getByText('Publish')).toBeInTheDocument()
    })

    it('should pass loading state to ApprovalActionButtons', () => {
      const event = createMockEvent()

      render(
        <AdminEventList
          events={[event]}
          loading={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading')
    })

    it('should pass non-loading state by default', () => {
      const event = createMockEvent()

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      expect(screen.getByTestId('loading-state')).toHaveTextContent('not-loading')
    })

    it('should render action buttons for all events regardless of status', () => {
      const events = [
        createMockEvent({ id: 1, status: 'pending_internal' }),
        createMockEvent({ id: 2, status: 'approved_internal' }),
        createMockEvent({ id: 3, status: 'published' }),
      ]

      render(
        <AdminEventList
          events={events}
          {...mockHandlers}
        />
      )

      const eventIds = screen.getAllByTestId('event-id')
      expect(eventIds[0]).toHaveTextContent('1')
      expect(eventIds[1]).toHaveTextContent('2')
      expect(eventIds[2]).toHaveTextContent('3')
    })
  })

  describe('Table Structure', () => {
    it('should use semantic table elements', () => {
      const event = createMockEvent()

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('columnheader')).toHaveLength(6)
      expect(screen.getAllByRole('row')).toHaveLength(2) // Header + 1 data row
    })

    it('should apply correct styling to table', () => {
      const { container } = render(
        <AdminEventList
          events={[]}
          {...mockHandlers}
        />
      )

      const table = container.querySelector('table')
      expect(table).toHaveClass('min-w-full', 'divide-y', 'divide-gray-200')
    })

    it('should apply correct styling to header', () => {
      const { container } = render(
        <AdminEventList
          events={[]}
          {...mockHandlers}
        />
      )

      const thead = container.querySelector('thead')
      expect(thead).toHaveClass('bg-gray-50')
    })

    it('should apply correct styling to body', () => {
      const event = createMockEvent()

      const { container } = render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      const tbody = container.querySelector('tbody')
      expect(tbody).toHaveClass('bg-white', 'divide-y', 'divide-gray-200')
    })

    it('should render correct number of rows', () => {
      const events = [
        createMockEvent({ id: 1 }),
        createMockEvent({ id: 2 }),
        createMockEvent({ id: 3 }),
      ]

      const { container } = render(
        <AdminEventList
          events={events}
          {...mockHandlers}
        />
      )

      const rows = container.querySelectorAll('tbody tr')
      expect(rows).toHaveLength(3)
    })

    it('should maintain consistent column count across rows', () => {
      const events = [
        createMockEvent({ id: 1 }),
        createMockEvent({ id: 2 }),
      ]

      const { container } = render(
        <AdminEventList
          events={events}
          {...mockHandlers}
        />
      )

      const rows = container.querySelectorAll('tbody tr')
      rows.forEach(row => {
        const cells = row.querySelectorAll('td')
        expect(cells).toHaveLength(6)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long event titles', () => {
      const longTitle = 'A'.repeat(200)
      const event = createMockEvent({ title: longTitle })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should handle special characters in event title', () => {
      const event = createMockEvent({ title: 'Event & "Special" <chars>' })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Event & "Special" <chars>')).toBeInTheDocument()
    })

    it('should handle empty string as title', () => {
      const event = createMockEvent({ title: '' })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      // Should still render the row even with empty title
      expect(screen.getByTestId('approval-action-buttons')).toBeInTheDocument()
    })

    it('should handle very long organizer names', () => {
      const longName = 'A'.repeat(100)
      const event = createMockEvent({ organizer: longName })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('should handle large category IDs', () => {
      const event = createMockEvent({ category_id: 999999 })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Category 999999')).toBeInTheDocument()
    })

    it('should handle category ID of 0', () => {
      const event = createMockEvent({ category_id: 0 })

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Category 0')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper table headers', () => {
      render(
        <AdminEventList
          events={[]}
          {...mockHandlers}
        />
      )

      const headers = screen.getAllByRole('columnheader')
      expect(headers[0]).toHaveTextContent('Title')
      expect(headers[1]).toHaveTextContent('Organizer')
      expect(headers[2]).toHaveTextContent('Category')
      expect(headers[3]).toHaveTextContent('Date')
      expect(headers[4]).toHaveTextContent('Status')
      expect(headers[5]).toHaveTextContent('Actions')
    })

    it('should use semantic HTML for table structure', () => {
      const event = createMockEvent()

      render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('should have proper header cell styling', () => {
      const { container } = render(
        <AdminEventList
          events={[]}
          {...mockHandlers}
        />
      )

      const headers = container.querySelectorAll('th')
      headers.forEach(header => {
        expect(header).toHaveClass(
          'px-6',
          'py-3',
          'text-left',
          'text-xs',
          'font-medium',
          'text-gray-500',
          'uppercase',
          'tracking-wider'
        )
      })
    })

    it('should have proper data cell styling', () => {
      const event = createMockEvent()

      const { container } = render(
        <AdminEventList
          events={[event]}
          {...mockHandlers}
        />
      )

      const dataCells = container.querySelectorAll('tbody td')
      dataCells.forEach(cell => {
        expect(cell).toHaveClass('px-6', 'py-4')
      })
    })
  })
})
