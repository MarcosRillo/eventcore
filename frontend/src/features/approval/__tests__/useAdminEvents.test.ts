/**
 * Tests for useAdminEvents hook
 *
 * Tests fetching and managing admin events with filtering.
 */

import { renderHook, act, waitFor } from '@testing-library/react'

import { useAdminEvents } from '@/features/approval/hooks/useAdminEvents'
import { adminEventService } from '@/features/approval/services/admin-event.service'

jest.mock('@/features/approval/services/admin-event.service')

describe('useAdminEvents', () => {
  const mockEventsResponse = {
    data: [
      { id: 1, title: 'Event 1', status: 'pending_approval' },
      { id: 2, title: 'Event 2', status: 'approved_internal' },
    ],
    meta: { current_page: 1, total: 2 }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(adminEventService.getAll as jest.Mock).mockResolvedValue(mockEventsResponse)
  })

  describe('initialization', () => {
    test('should initialize with empty events and loading true', async () => {
      const { result } = renderHook(() => useAdminEvents())

      // Initial state before fetch completes
      expect(result.current.events.data).toEqual([])
      expect(result.current.events.meta).toEqual({ current_page: 1, total: 0 })
      expect(result.current.statusFilter).toBeNull()
      expect(result.current.error).toBeNull()

      // Wait for async fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    test('should auto-fetch events on mount', async () => {
      const { result } = renderHook(() => useAdminEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(adminEventService.getAll).toHaveBeenCalledWith({ status: null })
      expect(adminEventService.getAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('data loading', () => {
    test('should load events and update state on success', async () => {
      const { result } = renderHook(() => useAdminEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.events).toEqual(mockEventsResponse)
      expect(result.current.events.data).toHaveLength(2)
      expect(result.current.events.data[0].title).toBe('Event 1')
      expect(result.current.error).toBeNull()
    })

    test('should set error state on fetch failure', async () => {
      ;(adminEventService.getAll as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      const { result } = renderHook(() => useAdminEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to load events')
      expect(result.current.events.data).toEqual([])
    })

    test('should show loading state during fetch', async () => {
      ;(adminEventService.getAll as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockEventsResponse), 100))
      )

      const { result } = renderHook(() => useAdminEvents())

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.events.data).toHaveLength(2)
    })
  })

  describe('handleStatusFilter', () => {
    test('should update status filter and refetch events', async () => {
      const { result } = renderHook(() => useAdminEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Clear mock to track new calls
      ;(adminEventService.getAll as jest.Mock).mockClear()

      act(() => {
        result.current.handleStatusFilter('pending_approval')
      })

      expect(result.current.statusFilter).toBe('pending_approval')

      // Wait for refetch triggered by filter change
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(adminEventService.getAll).toHaveBeenCalledWith({ status: 'pending_approval' })
    })

    test('should handle null status filter (show all)', async () => {
      const { result } = renderHook(() => useAdminEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set a filter first
      act(() => {
        result.current.handleStatusFilter('approved_internal')
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Clear mock and reset filter to null
      ;(adminEventService.getAll as jest.Mock).mockClear()

      act(() => {
        result.current.handleStatusFilter(null)
      })

      expect(result.current.statusFilter).toBeNull()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(adminEventService.getAll).toHaveBeenCalledWith({ status: null })
    })

    test('should support various status filter values', async () => {
      const { result } = renderHook(() => useAdminEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const statuses = ['pending_approval', 'approved_internal', 'published', 'rejected']

      for (const status of statuses) {
        act(() => {
          result.current.handleStatusFilter(status)
        })

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        expect(result.current.statusFilter).toBe(status)
      }
    })
  })

  describe('retry', () => {
    test('should refetch events when retry is called', async () => {
      const { result } = renderHook(() => useAdminEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(adminEventService.getAll).toHaveBeenCalledTimes(1)

      act(() => {
        result.current.retry()
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(adminEventService.getAll).toHaveBeenCalledTimes(2)
    })

    test('should clear error and retry on failure recovery', async () => {
      // First call fails
      ;(adminEventService.getAll as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      const { result } = renderHook(() => useAdminEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to load events')

      // Second call succeeds
      ;(adminEventService.getAll as jest.Mock).mockResolvedValueOnce(mockEventsResponse)

      act(() => {
        result.current.retry()
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeNull()
      expect(result.current.events.data).toHaveLength(2)
    })
  })

  describe('edge cases', () => {
    test('should handle empty events response', async () => {
      ;(adminEventService.getAll as jest.Mock).mockResolvedValue({
        data: [],
        meta: { current_page: 1, total: 0 }
      })

      const { result } = renderHook(() => useAdminEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.events.data).toEqual([])
      expect(result.current.events.meta.total).toBe(0)
      expect(result.current.error).toBeNull()
    })

    test('should handle multiple rapid filter changes', async () => {
      const { result } = renderHook(() => useAdminEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Rapid filter changes
      act(() => {
        result.current.handleStatusFilter('pending_approval')
      })
      act(() => {
        result.current.handleStatusFilter('approved_internal')
      })
      act(() => {
        result.current.handleStatusFilter('published')
      })

      // Final filter should be the last one set
      expect(result.current.statusFilter).toBe('published')

      // Wait for all fetches to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })
})
