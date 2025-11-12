/**
 * Tests for usePublicEvents hook
 *
 * Tests data fetching, filtering, and state management
 * for public events.
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { usePublicEvents } from '../hooks/usePublicEvents'
import { publicEventsService } from '../services/public-events.service'

jest.mock('../services/public-events.service')

describe('usePublicEvents', () => {
  const mockEvents = {
    data: [
      {
        id: 1,
        title: 'Festival de Música',
        description: 'Gran evento musical',
        start_date: '2025-11-15',
        end_date: '2025-11-17',
        category: { id: 1, name: 'Música' },
        locations: [{ id: 1, name: 'Teatro San Martín', city: 'San Miguel de Tucumán' }],
        is_featured: true
      }
    ],
    meta: {
      current_page: 1,
      total: 1,
      per_page: 10
    }
  }

  const mockCategories = {
    data: [
      { id: 1, name: 'Música' },
      { id: 2, name: 'Arte' }
    ]
  }

  const mockLocations = {
    data: [
      { id: 1, name: 'Teatro San Martín', city: 'San Miguel de Tucumán' }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Load', () => {
    test('fetches events, categories, and locations on mount', async () => {
      (publicEventsService.getAll as jest.Mock).mockResolvedValue(mockEvents);
      (publicEventsService.getCategories as jest.Mock).mockResolvedValue(mockCategories);
      (publicEventsService.getLocations as jest.Mock).mockResolvedValue(mockLocations)

      const { result } = renderHook(() => usePublicEvents())

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(publicEventsService.getAll).toHaveBeenCalled()
      expect(publicEventsService.getCategories).toHaveBeenCalled()
      expect(publicEventsService.getLocations).toHaveBeenCalled()
      expect(result.current.events).toEqual(mockEvents.data)
      expect(result.current.categories).toEqual(mockCategories.data)
      expect(result.current.locations).toEqual(mockLocations.data)
    })

    test('sets error state when fetch fails', async () => {
      (publicEventsService.getAll as jest.Mock).mockRejectedValue(new Error('Network error'));
      (publicEventsService.getCategories as jest.Mock).mockResolvedValue(mockCategories);
      (publicEventsService.getLocations as jest.Mock).mockResolvedValue(mockLocations)

      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Failed to load events')
      expect(result.current.events).toEqual([])
    })
  })

  describe('Filtering', () => {
    test('applies category filter', async () => {
      (publicEventsService.getAll as jest.Mock).mockResolvedValue(mockEvents);
      (publicEventsService.getCategories as jest.Mock).mockResolvedValue(mockCategories);
      (publicEventsService.getLocations as jest.Mock).mockResolvedValue(mockLocations)

      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleCategoryFilter(1)
      })

      await waitFor(() => {
        expect(publicEventsService.getAll).toHaveBeenCalledWith({
          category_id: 1,
          location_id: null,
          start_date: null,
          end_date: null
        })
      })
    })

    test('applies location filter', async () => {
      (publicEventsService.getAll as jest.Mock).mockResolvedValue(mockEvents);
      (publicEventsService.getCategories as jest.Mock).mockResolvedValue(mockCategories);
      (publicEventsService.getLocations as jest.Mock).mockResolvedValue(mockLocations)

      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        result.current.handleLocationFilter(1)
      })

      await waitFor(() => {
        expect(publicEventsService.getAll).toHaveBeenCalledWith({
          category_id: null,
          location_id: 1,
          start_date: null,
          end_date: null
        })
      })
    })

    test('clears filters when null is passed', async () => {
      (publicEventsService.getAll as jest.Mock).mockResolvedValue(mockEvents);
      (publicEventsService.getCategories as jest.Mock).mockResolvedValue(mockCategories);
      (publicEventsService.getLocations as jest.Mock).mockResolvedValue(mockLocations)

      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Set filters
      act(() => {
        result.current.handleCategoryFilter(1)
      })

      await waitFor(() => {
        expect(result.current.filters.category_id).toBe(1)
      })

      // Clear filters
      act(() => {
        result.current.handleCategoryFilter(null)
      })

      await waitFor(() => {
        expect(publicEventsService.getAll).toHaveBeenCalledWith({
          category_id: null,
          location_id: null,
          start_date: null,
          end_date: null
        })
      })
    })
  })

  describe('Retry', () => {
    test('retry function refetches events', async () => {
      (publicEventsService.getAll as jest.Mock).mockResolvedValue(mockEvents);
      (publicEventsService.getCategories as jest.Mock).mockResolvedValue(mockCategories);
      (publicEventsService.getLocations as jest.Mock).mockResolvedValue(mockLocations)

      const { result } = renderHook(() => usePublicEvents())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      jest.clearAllMocks()

      act(() => {
        result.current.retry()
      })

      await waitFor(() => {
        expect(publicEventsService.getAll).toHaveBeenCalled()
      })
    })
  })
})
