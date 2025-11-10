import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OrganizerEventListContainer } from '@/features/organizer/components/smart/OrganizerEventListContainer'
import * as organizerEventService from '@/features/organizer/services/organizer-event.service'
import { ToastProvider } from '@/components/ui/Toast'

jest.mock('../services/organizer-event.service')

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

// Helper to render with ToastProvider
const renderWithProviders = (component: React.ReactElement) => {
  return render(<ToastProvider>{component}</ToastProvider>)
}

describe('OrganizerEventList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
  })

  describe('Initial Render & Loading', () => {
    // Test 1: Shows loading state initially
    test('should display loading state on initial render', () => {
      // ARRANGE
      (organizerEventService.getEvents as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves (stays loading)
      )

      // ACT
      renderWithProviders(<OrganizerEventListContainer />)

      // ASSERT
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    // Test 2: Fetches events on mount
    test('should fetch and display events on mount', async () => {
      // ARRANGE
      const mockEvents = [
        {
          id: 1,
          title: 'Festival de Jazz',
          event_date: '2025-11-15',
          status: 'published',
          location: 'Plaza Independencia'
        },
        {
          id: 2,
          title: 'Expo Gastronómica',
          event_date: '2025-12-01',
          status: 'pending',
          location: 'Parque 9 de Julio'
        }
      ]

      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValue({
        data: mockEvents,
        pagination: { total: 2, per_page: 10, current_page: 1 }
      })

      // ACT
      renderWithProviders(<OrganizerEventListContainer />)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText('Festival de Jazz')).toBeInTheDocument()
        expect(screen.getByText('Expo Gastronómica')).toBeInTheDocument()
      })

      expect(organizerEventService.getEvents).toHaveBeenCalledWith({
        page: 1,
        per_page: 10,
        status: null
      })
    })
  })

  describe('Pagination', () => {
    // Test 3: Shows pagination controls when needed
    test('should display pagination controls when total > per_page', async () => {
      // ARRANGE
      const mockEvents = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Event ${i + 1}`,
        event_date: '2025-11-15',
        status: 'published',
        location: 'Location'
      }))

      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValue({
        data: mockEvents,
        pagination: { total: 25, per_page: 10, current_page: 1, last_page: 3 }
      })

      // ACT
      renderWithProviders(<OrganizerEventListContainer />)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/1.*3/)).toBeInTheDocument() // "Page 1 of 3"
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
      })
    })

    // Test 4: Handles next page navigation
    test('should navigate to next page when next button clicked', async () => {
      // ARRANGE
      const mockPage1 = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `Event ${i + 1}`,
        event_date: '2025-11-15',
        status: 'published',
        location: 'Location'
      }))

      const mockPage2 = Array.from({ length: 5 }, (_, i) => ({
        id: i + 11,
        title: `Event ${i + 11}`,
        event_date: '2025-11-15',
        status: 'published',
        location: 'Location'
      }))

      ;(organizerEventService.getEvents as jest.Mock)
        .mockResolvedValueOnce({
          data: mockPage1,
          pagination: { total: 15, per_page: 10, current_page: 1, last_page: 2 }
        })
        .mockResolvedValueOnce({
          data: mockPage2,
          pagination: { total: 15, per_page: 10, current_page: 2, last_page: 2 }
        })

      // ACT
      renderWithProviders(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /next/i }))

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText('Event 11')).toBeInTheDocument()
        expect(organizerEventService.getEvents).toHaveBeenCalledWith({
          page: 2,
          per_page: 10,
          status: null
        })
      })
    })
  })

  describe('Status Filtering', () => {
    // Test 5: Handles status filter change
    test('should filter events by status when filter selected', async () => {
      // ARRANGE
      const allEvents = [
        { id: 1, title: 'Event 1', status: 'published', event_date: '2025-11-15', location: 'Loc' },
        { id: 2, title: 'Event 2', status: 'pending', event_date: '2025-11-16', location: 'Loc' }
      ]

      const publishedEvents = [
        { id: 1, title: 'Event 1', status: 'published', event_date: '2025-11-15', location: 'Loc' }
      ]

      ;(organizerEventService.getEvents as jest.Mock)
        .mockResolvedValueOnce({
          data: allEvents,
          pagination: { total: 2, per_page: 10, current_page: 1 }
        })
        .mockResolvedValueOnce({
          data: publishedEvents,
          pagination: { total: 1, per_page: 10, current_page: 1 }
        })

      // ACT
      renderWithProviders(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
        expect(screen.getByText('Event 2')).toBeInTheDocument()
      })

      // Select "Published" filter
      const statusSelect = screen.getByLabelText(/filter by status/i)
      fireEvent.change(statusSelect, { target: { value: 'published' } })

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
        expect(screen.queryByText('Event 2')).not.toBeInTheDocument()
      })

      expect(organizerEventService.getEvents).toHaveBeenLastCalledWith({
        page: 1,
        per_page: 10,
        status: 'published'
      })
    })
  })

  describe('Empty States', () => {
    // Test 6: Shows empty state when no events
    test('should display "no events" empty state', async () => {
      // ARRANGE
      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValue({
        data: [],
        pagination: { total: 0, per_page: 10, current_page: 1 }
      })

      // ACT
      renderWithProviders(<OrganizerEventListContainer />)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/no events yet/i)).toBeInTheDocument()
        expect(screen.getByText(/create your first event/i)).toBeInTheDocument()
      })
    })

    // Test 7: Shows filtered empty state
    test('should display "no matching events" when filter returns empty', async () => {
      // ARRANGE
      const allEvents = [
        { id: 1, title: 'Event 1', status: 'published', event_date: '2025-11-15', location: 'Loc' }
      ]

      ;(organizerEventService.getEvents as jest.Mock)
        .mockResolvedValueOnce({
          data: allEvents,
          pagination: { total: 1, per_page: 10, current_page: 1 }
        })
        .mockResolvedValueOnce({
          data: [],
          pagination: { total: 0, per_page: 10, current_page: 1 }
        })

      // ACT
      renderWithProviders(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
      })

      // Apply filter that returns no results
      const statusSelect = screen.getByLabelText(/filter by status/i)
      fireEvent.change(statusSelect, { target: { value: 'rejected' } })

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/no events found/i)).toBeInTheDocument()
        expect(screen.getByText(/try a different filter/i)).toBeInTheDocument()
      })
    })
  })

  describe('Event Actions', () => {
    // Test 8: Handles edit action
    test('should navigate to edit page when edit button clicked', async () => {
      // ARRANGE
      const mockEvents = [
        { id: 1, title: 'Event 1', status: 'draft', event_date: '2025-11-15', location: 'Loc' }
      ]

      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValue({
        data: mockEvents,
        pagination: { total: 1, per_page: 10, current_page: 1 }
      })

      // ACT
      renderWithProviders(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
      })

      const editButton = screen.getByLabelText(/edit.*event 1/i)
      fireEvent.click(editButton)

      // ASSERT
      expect(mockPush).toHaveBeenCalledWith('/organizer/events/1/edit')
    })

    // Test 9: Handles delete action with confirmation
    // OBSOLETE: Delete now uses DeleteConfirmModal (covered in EventActionButtons tests)
    test.skip('should show confirmation dialog and delete event', async () => {
      // ARRANGE
      const mockEvents = [
        { id: 1, title: 'Event 1', status: 'draft', event_date: '2025-11-15', location: 'Loc' },
        { id: 2, title: 'Event 2', status: 'draft', event_date: '2025-11-16', location: 'Loc' }
      ]

      ;(organizerEventService.getEvents as jest.Mock)
        .mockResolvedValueOnce({
          data: mockEvents,
          pagination: { total: 2, per_page: 10, current_page: 1 }
        })
        .mockResolvedValueOnce({
          data: [mockEvents[1]],
          pagination: { total: 1, per_page: 10, current_page: 1 }
        })

      ;(organizerEventService.deleteEvent as jest.Mock).mockResolvedValue({ success: true })

      // Mock window.confirm
      global.confirm = jest.fn(() => true)

      // ACT
      renderWithProviders(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
      })

      const deleteButton = screen.getByLabelText(/delete.*event 1/i)
      fireEvent.click(deleteButton)

      // ASSERT
      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('delete')
      )

      await waitFor(() => {
        expect(organizerEventService.deleteEvent).toHaveBeenCalledWith(1)
        expect(screen.queryByText('Event 1')).not.toBeInTheDocument()
        expect(screen.getByText('Event 2')).toBeInTheDocument()
      })
    })

    // Test 10: Handles view action
    test('should navigate to event detail when view button clicked', async () => {
      // ARRANGE
      const mockEvents = [
        { id: 1, title: 'Event 1', status: 'published', event_date: '2025-11-15', location: 'Loc' }
      ]

      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValue({
        data: mockEvents,
        pagination: { total: 1, per_page: 10, current_page: 1 }
      })

      // ACT
      renderWithProviders(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
      })

      const viewButton = screen.getByLabelText(/view.*event 1/i)
      fireEvent.click(viewButton)

      // ASSERT
      expect(mockPush).toHaveBeenCalledWith('/organizer/events/1')
    })
  })

  describe('Error Handling', () => {
    // Test 11: Displays error state on API failure
    test('should display error message when API call fails', async () => {
      // ARRANGE
      const mockError = new Error('Network error')
      ;(organizerEventService.getEvents as jest.Mock).mockRejectedValue(mockError)

      // Mock console.error to avoid noise in tests
      jest.spyOn(console, 'error').mockImplementation(() => {})

      // ACT
      renderWithProviders(<OrganizerEventListContainer />)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/error loading events/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      })
    })

    // Test 12: Shows loading state during delete operation
    // OBSOLETE: Delete now uses DeleteConfirmModal (covered in useEventActions tests)
    test.skip('should show loading state during delete operation', async () => {
      // ARRANGE
      const mockEvents = [
        { id: 1, title: 'Event 1', status: 'draft', event_date: '2025-11-15', location: 'Loc' }
      ]

      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValue({
        data: mockEvents,
        pagination: { total: 1, per_page: 10, current_page: 1 }
      })

      ;(organizerEventService.deleteEvent as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      global.confirm = jest.fn(() => true)

      // ACT
      renderWithProviders(<OrganizerEventListContainer />)

      await waitFor(() => {
        expect(screen.getByText('Event 1')).toBeInTheDocument()
      })

      const deleteButton = screen.getByLabelText(/delete.*event 1/i)
      fireEvent.click(deleteButton)

      // ASSERT
      await waitFor(() => {
        expect(screen.getByText(/deleting/i)).toBeInTheDocument()
      })
    })
  })
})
