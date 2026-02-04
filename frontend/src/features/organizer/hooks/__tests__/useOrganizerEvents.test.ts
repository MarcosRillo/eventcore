import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { SWRConfig } from 'swr'

import { useOrganizerEvents } from '@/features/organizer/hooks/useOrganizerEvents'
import * as organizerEventService from '@/features/organizer/services/organizer-event.service'
import { EventListResponse } from '@/features/organizer/types/event.types'

jest.mock('@/lib/swr/fetcher', () => ({
  apiFetcher: jest.fn(),
}))

jest.mock('../../services/organizer-event.service', () => ({
  deleteEvent: jest.fn(),
}))

import { apiFetcher } from '@/lib/swr/fetcher'

const mockedFetcher = apiFetcher as jest.Mock

// Mock window.confirm
const originalConfirm = window.confirm
beforeAll(() => {
  window.confirm = jest.fn()
})
afterAll(() => {
  window.confirm = originalConfirm
})

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children
  )

describe('useOrganizerEvents', () => {
  const mockEvents = [
    { id: 1, title: 'Event 1', status: 'draft' },
    { id: 2, title: 'Event 2', status: 'published' },
    { id: 3, title: 'Event 3', status: 'draft' },
  ]

  const mockResponse: Partial<EventListResponse> = {
    data: mockEvents as EventListResponse['data'],
    current_page: 1,
    last_page: 3,
    total: 25,
    per_page: 10,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(window.confirm as jest.Mock).mockClear()
    mockedFetcher.mockResolvedValue(mockResponse)
  })

  describe('Initialization', () => {
    it('should initialize with default values and load data', async () => {
      const { result } = renderHook(() => useOrganizerEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.events).toEqual(mockEvents)
      expect(result.current.error).toBe(null)
      expect(result.current.currentPage).toBe(1)
      expect(result.current.totalPages).toBe(3)
      expect(result.current.total).toBe(25)
      expect(result.current.statusFilter).toBe(null)
      expect(result.current.isDeleting).toBe(false)
    })

    it('should fetch events via SWR on mount', async () => {
      renderHook(() => useOrganizerEvents(), { wrapper })

      await waitFor(() => {
        expect(mockedFetcher).toHaveBeenCalled()
      })

      // SWR key should include page=1&per_page=10
      const calledUrl = mockedFetcher.mock.calls[0][0]
      expect(calledUrl).toContain('page=1')
      expect(calledUrl).toContain('per_page=10')
    })

    it('should set events from API response', async () => {
      const { result } = renderHook(() => useOrganizerEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.events).toEqual(mockEvents)
        expect(result.current.currentPage).toBe(1)
        expect(result.current.totalPages).toBe(3)
        expect(result.current.total).toBe(25)
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle API error on mount', async () => {
      mockedFetcher.mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => useOrganizerEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.error).toBe('API Error')
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('handlePageChange', () => {
    it('should change page and trigger new SWR fetch', async () => {
      const page2Response: Partial<EventListResponse> = {
        data: [{ id: 4, title: 'Event 4', status: 'draft' }] as EventListResponse['data'],
        current_page: 2,
        last_page: 3,
        total: 25,
        per_page: 10,
      }

      let callCount = 0
      mockedFetcher.mockImplementation(() => {
        callCount++
        if (callCount <= 1) return Promise.resolve(mockResponse)
        return Promise.resolve(page2Response)
      })

      const { result } = renderHook(() => useOrganizerEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Change to page 2
      act(() => {
        result.current.handlePageChange(2)
      })

      await waitFor(() => {
        expect(result.current.currentPage).toBe(2)
        expect(result.current.events).toEqual(page2Response.data)
      })

      // Verify SWR was called with page=2
      const lastCall = mockedFetcher.mock.calls[mockedFetcher.mock.calls.length - 1][0]
      expect(lastCall).toContain('page=2')
    })
  })

  describe('handleStatusFilter', () => {
    it('should filter events by status and reset to page 1', async () => {
      const filteredResponse: Partial<EventListResponse> = {
        data: [{ id: 1, title: 'Event 1', status: 'draft' }] as EventListResponse['data'],
        current_page: 1,
        last_page: 1,
        total: 1,
        per_page: 10,
      }

      let callCount = 0
      mockedFetcher.mockImplementation(() => {
        callCount++
        if (callCount <= 1) return Promise.resolve(mockResponse)
        return Promise.resolve(filteredResponse)
      })

      const { result } = renderHook(() => useOrganizerEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Apply status filter
      act(() => {
        result.current.handleStatusFilter('draft')
      })

      await waitFor(() => {
        expect(result.current.statusFilter).toBe('draft')
        expect(result.current.currentPage).toBe(1)
        expect(result.current.events).toEqual(filteredResponse.data)
      })

      // Verify SWR was called with status=draft
      const lastCall = mockedFetcher.mock.calls[mockedFetcher.mock.calls.length - 1][0]
      expect(lastCall).toContain('status=draft')
    })

    it('should clear filter when status is null', async () => {
      mockedFetcher.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useOrganizerEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // First apply a filter
      act(() => {
        result.current.handleStatusFilter('draft')
      })

      await waitFor(() => {
        expect(result.current.statusFilter).toBe('draft')
      })

      // Verify a call was made with status=draft
      const draftCall = mockedFetcher.mock.calls.find(
        (call: string[]) => call[0].includes('status=draft')
      )
      expect(draftCall).toBeDefined()

      // Clear filter
      act(() => {
        result.current.handleStatusFilter(null)
      })

      await waitFor(() => {
        expect(result.current.statusFilter).toBe(null)
      })
    })

    it('should reset to page 1 when applying filter from page 2', async () => {
      let callCount = 0
      mockedFetcher.mockImplementation(() => {
        callCount++
        if (callCount <= 1) {
          return Promise.resolve(mockResponse)
        }
        return Promise.resolve({
          ...mockResponse,
          current_page: callCount <= 2 ? 2 : 1,
        })
      })

      const { result } = renderHook(() => useOrganizerEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Navigate to page 2
      act(() => {
        result.current.handlePageChange(2)
      })

      await waitFor(() => {
        expect(result.current.currentPage).toBe(2)
      })

      // Apply filter — should reset to page 1
      act(() => {
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

      const { result } = renderHook(() => useOrganizerEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Delete event
      await act(async () => {
        await result.current.handleDelete(1)
      })

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this event?')
      expect(organizerEventService.deleteEvent).toHaveBeenCalledWith(1)
    })

    it('should not delete event when user cancels', async () => {
      ;(window.confirm as jest.Mock).mockReturnValueOnce(false)

      const { result } = renderHook(() => useOrganizerEvents(), { wrapper })

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

      const { result } = renderHook(() => useOrganizerEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Start deletion (without await to check intermediate state)
      act(() => {
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
  })

  describe('retry', () => {
    it('should allow retrying after error', async () => {
      let callCount = 0
      mockedFetcher.mockImplementation(() => {
        callCount++
        if (callCount <= 1) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve(mockResponse)
      })

      const { result } = renderHook(() => useOrganizerEvents(), { wrapper })

      // Wait for error
      await waitFor(() => {
        expect(result.current.error).toBe('Network error')
      })

      // Retry
      await act(async () => {
        result.current.retry()
      })

      await waitFor(() => {
        expect(result.current.events).toEqual(mockEvents)
        expect(result.current.error).toBe(null)
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle empty events array', async () => {
      mockedFetcher.mockResolvedValue({
        data: [],
        current_page: 1,
        last_page: 0,
        total: 0,
        per_page: 10,
      })

      const { result } = renderHook(() => useOrganizerEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.events).toEqual([])
        expect(result.current.total).toBe(0)
        expect(result.current.loading).toBe(false)
      })
    })

    it('should handle missing last_page in response', async () => {
      mockedFetcher.mockResolvedValue({
        data: mockEvents,
        current_page: 1,
        last_page: undefined,
        total: 25,
        per_page: 10,
      })

      const { result } = renderHook(() => useOrganizerEvents(), { wrapper })

      await waitFor(() => {
        expect(result.current.totalPages).toBe(1) // Defaults to 1
      })
    })
  })
})
