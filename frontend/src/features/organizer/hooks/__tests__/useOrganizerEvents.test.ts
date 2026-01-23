import { act, renderHook, waitFor } from '@testing-library/react'

import { useOrganizerEvents } from '@/features/organizer/hooks/useOrganizerEvents'
import * as organizerEventService from '@/features/organizer/services/organizer-event.service'

jest.mock('@/features/organizer/services/organizer-event.service')

// Mock window.confirm
const originalConfirm = window.confirm
beforeAll(() => {
  window.confirm = jest.fn()
})
afterAll(() => {
  window.confirm = originalConfirm
})

describe('useOrganizerEvents', () => {
  const mockEvents = [
    { id: 1, title: 'Event 1', status: 'draft' },
    { id: 2, title: 'Event 2', status: 'published' },
    { id: 3, title: 'Event 3', status: 'draft' },
  ]

  const mockResponse = {
    data: mockEvents,
    current_page: 1,
    last_page: 3,
    total: 25,
    per_page: 10,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(window.confirm as jest.Mock).mockClear()
    ;(organizerEventService.getEvents as jest.Mock).mockResolvedValue(mockResponse)
  })

  describe('Initialization', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => useOrganizerEvents())

      expect(result.current.events).toEqual([])
      expect(result.current.loading).toBe(true) // Initial loading
      expect(result.current.error).toBe(null)
      expect(result.current.currentPage).toBe(1)
      expect(result.current.totalPages).toBe(1)
      expect(result.current.total).toBe(0)
      expect(result.current.statusFilter).toBe(null)
      expect(result.current.isDeleting).toBe(false)

      // Wait for async updates to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should fetch events on mount', async () => {
      renderHook(() => useOrganizerEvents())

      await waitFor(() => {
        expect(organizerEventService.getEvents).toHaveBeenCalledWith({
          page: 1,
          per_page: 10,
          status: null,
        })
      })
    })

    it('should set events from API response', async () => {
      const { result } = renderHook(() => useOrganizerEvents())

      await waitFor(() => {
        expect(result.current.events).toEqual(mockEvents)
        expect(result.current.currentPage).toBe(1)
        expect(result.current.totalPages).toBe(3)
        expect(result.current.total).toBe(25)
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle API error on mount', async () => {
      ;(organizerEventService.getEvents as jest.Mock).mockRejectedValueOnce(
        new Error('API Error')
      )

      const { result } = renderHook(() => useOrganizerEvents())

      await waitFor(() => {
        expect(result.current.error).toBe('Error loading events')
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('handlePageChange', () => {
    it('should change page and fetch new events', async () => {
      const { result } = renderHook(() => useOrganizerEvents())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Mock response for page 2
      const page2Response = {
        data: [{ id: 4, title: 'Event 4', status: 'draft' }],
        current_page: 2,
        last_page: 3,
        total: 25,
        per_page: 10,
      }
      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValueOnce(page2Response)

      // Change to page 2
      await act(async () => {
        result.current.handlePageChange(2)
      })

      await waitFor(() => {
        expect(organizerEventService.getEvents).toHaveBeenCalledWith({
          page: 2,
          per_page: 10,
          status: null,
        })
        expect(result.current.currentPage).toBe(2)
        expect(result.current.events).toEqual(page2Response.data)
      })
    })

    it('should set loading state during page change', async () => {
      const { result } = renderHook(() => useOrganizerEvents())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Mock slow API response
      ;(organizerEventService.getEvents as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
      )

      // Start page change
      await act(async () => {
        result.current.handlePageChange(2)
      })

      // Should be loading
      await waitFor(() => {
        expect(result.current.loading).toBe(true)
      })
    })
  })

  describe('handleStatusFilter', () => {
    it('should filter events by status and reset to page 1', async () => {
      const { result } = renderHook(() => useOrganizerEvents())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Mock response for filtered events
      const filteredResponse = {
        data: [{ id: 1, title: 'Event 1', status: 'draft' }],
        current_page: 1,
        last_page: 1,
        total: 1,
        per_page: 10,
      }
      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValueOnce(filteredResponse)

      // Apply status filter
      await act(async () => {
        result.current.handleStatusFilter('draft')
      })

      await waitFor(() => {
        expect(organizerEventService.getEvents).toHaveBeenCalledWith({
          page: 1,
          per_page: 10,
          status: 'draft',
        })
        expect(result.current.statusFilter).toBe('draft')
        expect(result.current.currentPage).toBe(1)
        expect(result.current.events).toEqual(filteredResponse.data)
      })
    })

    it('should clear filter when status is null', async () => {
      const { result } = renderHook(() => useOrganizerEvents())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // First apply a filter
      await act(async () => {
        result.current.handleStatusFilter('draft')
      })

      // Clear filter
      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValueOnce(mockResponse)
      await act(async () => {
        result.current.handleStatusFilter(null)
      })

      await waitFor(() => {
        expect(organizerEventService.getEvents).toHaveBeenCalledWith({
          page: 1,
          per_page: 10,
          status: null,
        })
        expect(result.current.statusFilter).toBe(null)
      })
    })

    it('should reset to page 1 when applying filter from page 2', async () => {
      const { result } = renderHook(() => useOrganizerEvents())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Navigate to page 2 - mock response for page 2
      const page2Response = {
        data: mockEvents,
        current_page: 2,
        last_page: 3,
        total: 25,
        per_page: 10
      }
      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValueOnce(page2Response)

      await act(async () => {
        result.current.handlePageChange(2)
      })

      await waitFor(() => {
        expect(result.current.currentPage).toBe(2)
      })

      // Apply filter
      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValueOnce(mockResponse)
      await act(async () => {
        result.current.handleStatusFilter('published')
      })

      await waitFor(() => {
        expect(result.current.currentPage).toBe(1)
      })
    })
  })

  describe('handleDelete', () => {
    it('should delete event when user confirms', async () => {
      ;(window.confirm as jest.Mock).mockReturnValueOnce(true)
      ;(organizerEventService.deleteEvent as jest.Mock).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useOrganizerEvents())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Mock refresh after delete
      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValueOnce(mockResponse)

      // Delete event
      await act(async () => {
        await result.current.handleDelete(1)
      })

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this event?')
      expect(organizerEventService.deleteEvent).toHaveBeenCalledWith(1)

      // Should refresh events list
      await waitFor(() => {
        expect(organizerEventService.getEvents).toHaveBeenCalledTimes(2) // Initial + refresh
      })
    })

    it('should not delete event when user cancels', async () => {
      ;(window.confirm as jest.Mock).mockReturnValueOnce(false)

      const { result } = renderHook(() => useOrganizerEvents())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Try to delete event
      await act(async () => {
        await result.current.handleDelete(1)
      })

      expect(window.confirm).toHaveBeenCalled()
      expect(organizerEventService.deleteEvent).not.toHaveBeenCalled()
    })

    it('should set isDeleting state during deletion', async () => {
      ;(window.confirm as jest.Mock).mockReturnValueOnce(true)
      ;(organizerEventService.deleteEvent as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve(undefined), 100))
      )

      const { result } = renderHook(() => useOrganizerEvents())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Start deletion (without await to check intermediate state)
      await act(async () => {
        result.current.handleDelete(1)
      })

      // Should be deleting
      await waitFor(() => {
        expect(result.current.isDeleting).toBe(true)
      })

      // Wait for deletion to complete
      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false)
      })
    })

    it('should handle delete error', async () => {
      ;(window.confirm as jest.Mock).mockReturnValueOnce(true)
      ;(organizerEventService.deleteEvent as jest.Mock).mockRejectedValueOnce(
        new Error('Delete failed')
      )

      const { result } = renderHook(() => useOrganizerEvents())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Try to delete
      await act(async () => {
        await result.current.handleDelete(1)
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Error deleting event')
        expect(result.current.isDeleting).toBe(false)
      })
    })
  })

  describe('retry', () => {
    it('should allow retrying after error', async () => {
      // First call fails
      ;(organizerEventService.getEvents as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      const { result } = renderHook(() => useOrganizerEvents())

      // Wait for error
      await waitFor(() => {
        expect(result.current.error).toBe('Error loading events')
      })

      // Second call succeeds
      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValueOnce(mockResponse)

      // Retry
      await act(async () => {
        await result.current.retry()
      })

      await waitFor(() => {
        expect(result.current.events).toEqual(mockEvents)
        expect(result.current.error).toBe(null)
      })
    })

    it('should maintain current page and filter when retrying', async () => {
      const { result } = renderHook(() => useOrganizerEvents())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Navigate to page 2 with filter
      await act(async () => {
        result.current.handlePageChange(2)
      })
      await act(async () => {
        result.current.handleStatusFilter('draft')
      })

      // Retry
      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValueOnce(mockResponse)
      await act(async () => {
        await result.current.retry()
      })

      await waitFor(() => {
        expect(organizerEventService.getEvents).toHaveBeenCalledWith({
          page: 1, // Reset by filter
          per_page: 10,
          status: 'draft',
        })
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle empty events array', async () => {
      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValueOnce({
        data: [],
        current_page: 1,
        last_page: 0,
        total: 0,
        per_page: 10,
      })

      const { result } = renderHook(() => useOrganizerEvents())

      await waitFor(() => {
        expect(result.current.events).toEqual([])
        expect(result.current.total).toBe(0)
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle missing last_page in response', async () => {
      ;(organizerEventService.getEvents as jest.Mock).mockResolvedValueOnce({
        data: mockEvents,
        current_page: 1,
        last_page: undefined,
        total: 25,
        per_page: 10,
      })

      const { result } = renderHook(() => useOrganizerEvents())

      await waitFor(() => {
        expect(result.current.totalPages).toBe(1) // Defaults to 1
      })
    })
  })
})
