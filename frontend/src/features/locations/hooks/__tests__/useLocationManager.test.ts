import { renderHook, act, waitFor } from '@testing-library/react'

import { useLocationManager } from '@/features/locations/hooks/useLocationManager'
import * as locationService from '@/features/locations/services/location.service'

// Mock the service
jest.mock('@/features/locations/services/location.service')

// Mock useAuth
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
  }),
}))

const mockLocationService = locationService as jest.Mocked<typeof locationService>

describe('useLocationManager', () => {
  const mockLocations = [
    {
      id: 1,
      name: 'Teatro San Martín',
      address: 'Av. Corrientes 1530',
      city: 'CABA',
      country: 'Argentina',
      is_active: true,
      max_capacity: 500,
      entity_id: 1,
      features: [],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Centro Cultural Kirchner',
      address: 'Sarmiento 151',
      city: 'CABA',
      country: 'Argentina',
      is_active: false,
      max_capacity: 1000,
      entity_id: 1,
      features: [],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ]

  const mockPaginationResponse = {
    data: mockLocations,
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 2,
      from: 1,
      to: 2,
      path: 'http://api.example.com/locations',
      links: [],
    },
    links: {
      first: 'http://api.example.com/locations?page=1',
      last: 'http://api.example.com/locations?page=1',
      prev: null,
      next: null,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockLocationService.getLocations.mockResolvedValue(mockPaginationResponse)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => useLocationManager())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.searchTerm).toBe('')
      expect(result.current.filterStatus).toBe('all')
      expect(result.current.currentPage).toBe(1)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should fetch locations on mount', async () => {
      const { result } = renderHook(() => useLocationManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockLocationService.getLocations).toHaveBeenCalledWith({
        page: 1,
        per_page: 10,
        search: undefined,
        is_active: undefined,
      })
      expect(result.current.locations).toHaveLength(2)
    })

    it('should calculate stats correctly', async () => {
      const { result } = renderHook(() => useLocationManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.stats.total).toBe(2)
      expect(result.current.stats.active).toBe(1)
      expect(result.current.stats.inactive).toBe(1)
    })
  })

  describe('search functionality', () => {
    it('should update search term immediately when handleSearchChange is called', async () => {
      const { result } = renderHook(() => useLocationManager())

      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.handleSearchChange('Teatro')
      })

      // searchTerm updates immediately (debounce is handled by usePaginatedData for API calls)
      expect(result.current.searchTerm).toBe('Teatro')
    })

    it('should call service with search parameter', async () => {
      const { result } = renderHook(() => useLocationManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      jest.clearAllMocks()

      act(() => {
        result.current.handleSearchChange('Teatro')
      })

      await waitFor(() => {
        expect(mockLocationService.getLocations).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'Teatro',
          })
        )
      })
    })
  })

  describe('filter functionality', () => {
    it('should update filter status when handleFilterChange is called', async () => {
      const { result } = renderHook(() => useLocationManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.handleFilterChange('active')
      })

      expect(result.current.filterStatus).toBe('active')
    })

    it('should call service with is_active true for active filter', async () => {
      const { result } = renderHook(() => useLocationManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      jest.clearAllMocks()

      act(() => {
        result.current.handleFilterChange('active')
      })

      await waitFor(() => {
        expect(mockLocationService.getLocations).toHaveBeenCalledWith(
          expect.objectContaining({
            is_active: true,
          })
        )
      })
    })

    it('should call service with is_active false for inactive filter', async () => {
      const { result } = renderHook(() => useLocationManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      jest.clearAllMocks()

      act(() => {
        result.current.handleFilterChange('inactive')
      })

      await waitFor(() => {
        expect(mockLocationService.getLocations).toHaveBeenCalledWith(
          expect.objectContaining({
            is_active: false,
          })
        )
      })
    })
  })

  describe('pagination', () => {
    it('should update current page when handlePageChange is called', async () => {
      const { result } = renderHook(() => useLocationManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.handlePageChange(2)
      })

      expect(result.current.currentPage).toBe(2)
    })

    it('should return pagination data from response', async () => {
      const { result } = renderHook(() => useLocationManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.pagination).toBeDefined()
      expect(result.current.pagination?.current_page).toBe(1)
      expect(result.current.pagination?.total).toBe(2)
    })
  })

  describe('delete functionality', () => {
    it('should call deleteLocation service when handleDeleteLocation is called', async () => {
      mockLocationService.deleteLocation.mockResolvedValue()

      const { result } = renderHook(() => useLocationManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.handleDeleteLocation(1)
      })

      expect(mockLocationService.deleteLocation).toHaveBeenCalledWith(1)
    })

    it('should throw error when delete fails', async () => {
      mockLocationService.deleteLocation.mockRejectedValue(new Error('Delete failed'))

      const { result } = renderHook(() => useLocationManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.handleDeleteLocation(1)
        })
      ).rejects.toThrow('Error al eliminar ubicación')
    })
  })

  describe('optimistic updates', () => {
    it('should add location via addLocation', async () => {
      const { result } = renderHook(() => useLocationManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const newLocation = {
        id: 3,
        name: 'New Location',
        address: 'New Address',
        city: 'New City',
        country: 'Argentina',
        is_active: true,
        max_capacity: 100,
        entity_id: 1,
        features: [],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      }

      act(() => {
        result.current.addLocation(newLocation)
      })

      expect(result.current.locations).toContainEqual(newLocation)
    })

    it('should update location via updateLocation', async () => {
      const { result } = renderHook(() => useLocationManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateLocation(1, { name: 'Updated Name' })
      })

      const updatedLocation = result.current.locations.find(l => l.id === 1)
      expect(updatedLocation?.name).toBe('Updated Name')
    })

    it('should remove location via removeLocation', async () => {
      const { result } = renderHook(() => useLocationManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.locations).toHaveLength(2)

      act(() => {
        result.current.removeLocation(1)
      })

      expect(result.current.locations).toHaveLength(1)
      expect(result.current.locations.find(l => l.id === 1)).toBeUndefined()
    })
  })

  describe('error handling', () => {
    it('should set error when fetch fails', async () => {
      mockLocationService.getLocations.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useLocationManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeDefined()
    })
  })

  describe('refresh functionality', () => {
    it('should refetch data when refreshData is called', async () => {
      const { result } = renderHook(() => useLocationManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      jest.clearAllMocks()

      act(() => {
        result.current.refreshData()
      })

      await waitFor(() => {
        expect(mockLocationService.getLocations).toHaveBeenCalled()
      })
    })
  })

  describe('reset filters', () => {
    it('should reset all filters when resetFilters is called', async () => {
      const { result } = renderHook(() => useLocationManager())

      await act(async () => {
        jest.advanceTimersByTime(100)
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.handleSearchChange('Teatro')
        result.current.handleFilterChange('active')
      })

      // searchTerm and filterStatus update immediately
      expect(result.current.searchTerm).toBe('Teatro')
      expect(result.current.filterStatus).toBe('active')

      act(() => {
        result.current.resetFilters()
      })

      expect(result.current.searchTerm).toBe('')
      expect(result.current.filterStatus).toBe('all')
    })
  })
})
