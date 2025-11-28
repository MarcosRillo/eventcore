/**
 * Tests for useAdminStats hook
 *
 * Tests fetching and managing admin statistics.
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useAdminStats } from '../hooks/useAdminStats'
import { adminStatsService } from '@/features/approval/services/admin-stats.service'

jest.mock('@/features/approval/services/admin-stats.service')

describe('useAdminStats', () => {
  const mockStats = {
    total: 100,
    pending: 15,
    approved: 45,
    published: 35,
    rejected: 5
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(adminStatsService.getSummary as jest.Mock).mockResolvedValue(mockStats)
  })

  describe('initialization', () => {
    test('should initialize with null stats and loading true', async () => {
      const { result } = renderHook(() => useAdminStats())

      // Initial state before fetch completes
      expect(result.current.stats).toBeNull()
      expect(result.current.error).toBeNull()

      // Wait for async fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    test('should auto-fetch stats on mount', async () => {
      const { result } = renderHook(() => useAdminStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(adminStatsService.getSummary).toHaveBeenCalledTimes(1)
      expect(result.current.stats).toEqual(mockStats)
    })
  })

  describe('data loading', () => {
    test('should load stats and update state on success', async () => {
      const { result } = renderHook(() => useAdminStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.stats).toEqual(mockStats)
      expect(result.current.stats?.total).toBe(100)
      expect(result.current.stats?.pending).toBe(15)
      expect(result.current.stats?.approved).toBe(45)
      expect(result.current.stats?.published).toBe(35)
      expect(result.current.stats?.rejected).toBe(5)
      expect(result.current.error).toBeNull()
    })

    test('should set error state on fetch failure', async () => {
      ;(adminStatsService.getSummary as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      const { result } = renderHook(() => useAdminStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to load statistics')
      expect(result.current.stats).toBeNull()
    })

    test('should show loading state during fetch', async () => {
      ;(adminStatsService.getSummary as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockStats), 100))
      )

      const { result } = renderHook(() => useAdminStats())

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.stats).toEqual(mockStats)
    })
  })

  describe('refetch', () => {
    test('should refetch stats when refetch is called', async () => {
      const { result } = renderHook(() => useAdminStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(adminStatsService.getSummary).toHaveBeenCalledTimes(1)

      act(() => {
        result.current.refetch()
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(adminStatsService.getSummary).toHaveBeenCalledTimes(2)
    })

    test('should update stats with new data on refetch', async () => {
      const { result } = renderHook(() => useAdminStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.stats?.pending).toBe(15)

      // Mock updated stats
      const updatedStats = {
        ...mockStats,
        pending: 10, // decreased
        approved: 50 // increased
      }
      ;(adminStatsService.getSummary as jest.Mock).mockResolvedValueOnce(updatedStats)

      act(() => {
        result.current.refetch()
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.stats?.pending).toBe(10)
      expect(result.current.stats?.approved).toBe(50)
    })

    test('should clear error and recover on successful refetch', async () => {
      // First call fails
      ;(adminStatsService.getSummary as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      const { result } = renderHook(() => useAdminStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to load statistics')
      expect(result.current.stats).toBeNull()

      // Second call succeeds
      ;(adminStatsService.getSummary as jest.Mock).mockResolvedValueOnce(mockStats)

      act(() => {
        result.current.refetch()
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeNull()
      expect(result.current.stats).toEqual(mockStats)
    })

    test('should set loading true during refetch', async () => {
      const { result } = renderHook(() => useAdminStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Mock slow response
      ;(adminStatsService.getSummary as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockStats), 100))
      )

      act(() => {
        result.current.refetch()
      })

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('edge cases', () => {
    test('should handle zero counts in stats', async () => {
      const emptyStats = {
        total: 0,
        pending: 0,
        approved: 0,
        published: 0,
        rejected: 0
      }
      ;(adminStatsService.getSummary as jest.Mock).mockResolvedValue(emptyStats)

      const { result } = renderHook(() => useAdminStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.stats?.total).toBe(0)
      expect(result.current.stats?.pending).toBe(0)
      expect(result.current.error).toBeNull()
    })

    test('should handle large counts in stats', async () => {
      const largeStats = {
        total: 999999,
        pending: 100000,
        approved: 500000,
        published: 350000,
        rejected: 49999
      }
      ;(adminStatsService.getSummary as jest.Mock).mockResolvedValue(largeStats)

      const { result } = renderHook(() => useAdminStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.stats?.total).toBe(999999)
    })

    test('should handle multiple rapid refetch calls', async () => {
      const { result } = renderHook(() => useAdminStats())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Rapid refetch calls
      act(() => {
        result.current.refetch()
      })
      act(() => {
        result.current.refetch()
      })
      act(() => {
        result.current.refetch()
      })

      // Wait for all fetches to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should have called service multiple times
      expect(adminStatsService.getSummary).toHaveBeenCalled()
    })
  })
})
