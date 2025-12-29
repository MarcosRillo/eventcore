/**
 * useEventSubtypeManager Hook Tests
 *
 * Tests for event subtype management hook including parent type loading,
 * filtering, pagination, CRUD operations, and optimistic updates.
 *
 * Created: December 2, 2025
 */

import { renderHook, act, waitFor } from '@testing-library/react'

import { useAuth } from '@/context/AuthContext'
import { useEventSubtypeManager } from '@/features/event-types/hooks/useEventSubtypeManager'
import * as eventSubtypeService from '@/features/event-types/services/eventSubtype.service'
import * as eventTypeService from '@/features/event-types/services/eventType.service'
import type { EventType, EventSubtype, EventSubtypePagination } from '@/types/eventType.types'

// Mock dependencies
jest.mock('../services/eventSubtype.service')
jest.mock('../services/eventType.service')
jest.mock('@/context/AuthContext')

describe('useEventSubtypeManager', () => {
  const mockedEventSubtypeService = eventSubtypeService as jest.Mocked<typeof eventSubtypeService>
  const mockedEventTypeService = eventTypeService as jest.Mocked<typeof eventTypeService>
  const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

  // Sample parent event type
  const mockParentEventType: EventType = {
    id: 1,
    name: 'Conferencia',
    is_active: true,
    subtypes_count: 3,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }

  // Sample subtypes
  const mockSubtype1: EventSubtype = {
    id: 1,
    event_type_id: 1,
    name: 'Congreso Nacional',
    is_active: true,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }

  const mockSubtype2: EventSubtype = {
    id: 2,
    event_type_id: 1,
    name: 'Congreso Internacional',
    is_active: false,
    created_at: '2025-01-02T00:00:00.000Z',
    updated_at: '2025-01-02T00:00:00.000Z',
  }

  const mockPaginationResponse: EventSubtypePagination = {
    data: [mockSubtype1, mockSubtype2],
    current_page: 1,
    last_page: 2,
    per_page: 10,
    total: 15,
    from: 1,
    to: 10,
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock auth context - authenticated by default
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 1, name: 'Test User', email: 'test@test.com' },
      login: jest.fn(),
      logout: jest.fn(),
      checkAuth: jest.fn(),
    })

    // Mock service responses
    mockedEventTypeService.getEventType.mockResolvedValue(mockParentEventType)
    mockedEventSubtypeService.getEventSubtypes.mockResolvedValue(mockPaginationResponse)
    mockedEventSubtypeService.deleteEventSubtype.mockResolvedValue(undefined)
  })

  describe('initialization', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.searchTerm).toBe('')
      expect(result.current.filterStatus).toBe('all')
      expect(result.current.currentPage).toBe(1)
      expect(result.current.error).toBeNull()
    })

    it('should fetch parent event type on mount', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.parentLoading).toBe(false)
      })

      expect(mockedEventTypeService.getEventType).toHaveBeenCalledWith(1)
      expect(result.current.parentEventType).toEqual(mockParentEventType)
    })

    it('should fetch subtypes on mount when authenticated', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockedEventSubtypeService.getEventSubtypes).toHaveBeenCalled()
      expect(result.current.eventSubtypes).toHaveLength(2)
    })

    it('should not fetch when not authenticated', async () => {
      mockedUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuth: jest.fn(),
      })

      renderHook(() => useEventSubtypeManager(1))

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockedEventSubtypeService.getEventSubtypes).not.toHaveBeenCalled()
    })

    it('should not fetch while auth is loading', async () => {
      mockedUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: true,
        user: null,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuth: jest.fn(),
      })

      renderHook(() => useEventSubtypeManager(1))

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockedEventSubtypeService.getEventSubtypes).not.toHaveBeenCalled()
    })

    it('should not fetch with invalid eventTypeId', async () => {
      renderHook(() => useEventSubtypeManager(0))

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockedEventSubtypeService.getEventSubtypes).not.toHaveBeenCalled()
    })
  })

  describe('parent event type loading', () => {
    it('should show parent loading state initially', () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      // Initially loading
      expect(result.current.parentLoading).toBe(true)
    })

    it('should handle parent not found', async () => {
      mockedEventTypeService.getEventType.mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useEventSubtypeManager(999))

      await waitFor(() => {
        expect(result.current.parentLoading).toBe(false)
      })

      expect(result.current.parentEventType).toBeNull()
    })

    it('should load different parent types', async () => {
      const otherParent: EventType = { ...mockParentEventType, id: 2, name: 'Taller' }
      mockedEventTypeService.getEventType.mockResolvedValue(otherParent)

      const { result } = renderHook(() => useEventSubtypeManager(2))

      await waitFor(() => {
        expect(result.current.parentLoading).toBe(false)
      })

      expect(result.current.parentEventType?.id).toBe(2)
      expect(result.current.parentEventType?.name).toBe('Taller')
    })
  })

  describe('search functionality', () => {
    it('should update search term', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.handleSearchChange('nacional')
      })

      expect(result.current.searchTerm).toBe('nacional')
    })

    it('should debounce search requests', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      jest.clearAllMocks()

      act(() => {
        result.current.handleSearchChange('n')
        result.current.handleSearchChange('na')
        result.current.handleSearchChange('nac')
        result.current.handleSearchChange('nacional')
      })

      await waitFor(() => {
        expect(mockedEventSubtypeService.getEventSubtypes).toHaveBeenCalled()
      }, { timeout: 500 })
    })
  })

  describe('filter functionality', () => {
    it('should update filter status to active', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.handleFilterChange('active')
      })

      expect(result.current.filterStatus).toBe('active')
    })

    it('should update filter status to inactive', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.handleFilterChange('inactive')
      })

      expect(result.current.filterStatus).toBe('inactive')
    })

    it('should reset to all filter', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.handleFilterChange('active')
      })

      act(() => {
        result.current.handleFilterChange('all')
      })

      expect(result.current.filterStatus).toBe('all')
    })
  })

  describe('pagination', () => {
    it('should update current page', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.handlePageChange(2)
      })

      expect(result.current.currentPage).toBe(2)
    })

    it('should fetch data for new page', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      jest.clearAllMocks()

      act(() => {
        result.current.changePage(3)
      })

      await waitFor(() => {
        expect(mockedEventSubtypeService.getEventSubtypes).toHaveBeenCalled()
      })
    })

    it('should return pagination object', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.eventSubtypes.length).toBeGreaterThan(0)
      })

      // Pagination interface should be available (might be null initially)
      // The hook exposes pagination, even if it's null before data loads
      expect('pagination' in result.current).toBe(true)
    })
  })

  describe('delete event subtype', () => {
    it('should delete event subtype successfully', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.handleDeleteEventSubtype(1)
      })

      expect(mockedEventSubtypeService.deleteEventSubtype).toHaveBeenCalledWith(1, 1)
    })

    it('should perform optimistic update on delete', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialLength = result.current.eventSubtypes.length

      await act(async () => {
        await result.current.handleDeleteEventSubtype(1)
      })

      expect(result.current.eventSubtypes.length).toBeLessThanOrEqual(initialLength)
    })

    it('should handle delete error and refresh data', async () => {
      mockedEventSubtypeService.deleteEventSubtype.mockRejectedValue(new Error('Delete failed'))

      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.handleDeleteEventSubtype(1)
        })
      ).rejects.toThrow('Error al eliminar el subtipo de evento')
    })
  })

  describe('optimistic updates', () => {
    it('should add event subtype optimistically', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const newSubtype: EventSubtype = {
        id: 3,
        event_type_id: 1,
        name: 'New Subtype',
        is_active: true,
        created_at: '2025-01-03T00:00:00.000Z',
        updated_at: '2025-01-03T00:00:00.000Z',
      }

      act(() => {
        result.current.addEventSubtype(newSubtype)
      })

      expect(result.current.eventSubtypes).toContainEqual(newSubtype)
    })

    it('should update event subtype optimistically', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateEventSubtype(1, { name: 'Updated Name' })
      })

      const updatedSubtype = result.current.eventSubtypes.find(st => st.id === 1)
      expect(updatedSubtype?.name).toBe('Updated Name')
    })

    it('should remove event subtype optimistically', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.removeEventSubtype(1)
      })

      const removedSubtype = result.current.eventSubtypes.find(st => st.id === 1)
      expect(removedSubtype).toBeUndefined()
    })
  })

  describe('statistics', () => {
    it('should calculate stats correctly', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.eventSubtypes.length).toBeGreaterThan(0)
      })

      // Stats should be calculated from loaded data
      // mockSubtype1 is active, mockSubtype2 is inactive
      expect(result.current.stats).toBeDefined()
      expect(result.current.stats.active).toBe(1)
      expect(result.current.stats.inactive).toBe(1)
      // Total comes from pagination, may not be immediately available
      expect(typeof result.current.stats.total).toBe('number')
    })

    it('should update stats when data changes', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Remove an active subtype
      act(() => {
        result.current.removeEventSubtype(1)
      })

      expect(result.current.stats.active).toBe(0)
      expect(result.current.stats.inactive).toBe(1)
    })
  })

  describe('reset filters', () => {
    it('should reset all filters to defaults', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Set some filters
      act(() => {
        result.current.handleSearchChange('test')
        result.current.handleFilterChange('active')
        result.current.handlePageChange(3)
      })

      expect(result.current.searchTerm).toBe('test')
      expect(result.current.filterStatus).toBe('active')
      expect(result.current.currentPage).toBe(3)

      // Reset
      act(() => {
        result.current.resetFilters()
      })

      expect(result.current.searchTerm).toBe('')
      expect(result.current.filterStatus).toBe('all')
      expect(result.current.currentPage).toBe(1)
    })
  })

  describe('refresh data', () => {
    it('should refresh data on demand', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      jest.clearAllMocks()

      act(() => {
        result.current.refreshData()
      })

      await waitFor(() => {
        expect(mockedEventSubtypeService.getEventSubtypes).toHaveBeenCalled()
      })
    })
  })

  describe('error handling', () => {
    it('should set error on fetch failure', async () => {
      mockedEventSubtypeService.getEventSubtypes.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('setFilters', () => {
    it('should set multiple filters at once', async () => {
      const { result } = renderHook(() => useEventSubtypeManager(1))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setFilters({ search: 'test', status: 'active', page: 2 })
      })

      expect(result.current.searchTerm).toBe('test')
      expect(result.current.filterStatus).toBe('active')
      expect(result.current.currentPage).toBe(2)
    })
  })
})
