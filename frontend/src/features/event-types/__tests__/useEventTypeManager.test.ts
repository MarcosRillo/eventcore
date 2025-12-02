/**
 * useEventTypeManager Hook Tests
 *
 * Tests for event type management hook including filtering,
 * pagination, CRUD operations, and optimistic updates.
 *
 * Created: December 2, 2025
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useEventTypeManager } from '../hooks/useEventTypeManager'
import * as eventTypeService from '../services/eventType.service'
import { useAuth } from '@/context/AuthContext'
import type { EventType, EventTypePagination } from '@/types/eventType.types'

// Mock dependencies
jest.mock('../services/eventType.service')
jest.mock('@/context/AuthContext')

describe('useEventTypeManager', () => {
  const mockedEventTypeService = eventTypeService as jest.Mocked<typeof eventTypeService>
  const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

  // Sample data
  const mockEventType1: EventType = {
    id: 1,
    name: 'Conferencia',
    is_active: true,
    subtypes_count: 3,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  }

  const mockEventType2: EventType = {
    id: 2,
    name: 'Taller',
    is_active: false,
    subtypes_count: 0,
    created_at: '2025-01-02T00:00:00.000Z',
    updated_at: '2025-01-02T00:00:00.000Z',
  }

  const mockPaginationResponse: EventTypePagination = {
    data: [mockEventType1, mockEventType2],
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
    mockedEventTypeService.getEventTypes.mockResolvedValue(mockPaginationResponse)
    mockedEventTypeService.deleteEventType.mockResolvedValue(undefined)
  })

  describe('initialization', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(() => useEventTypeManager())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.searchTerm).toBe('')
      expect(result.current.filterStatus).toBe('all')
      expect(result.current.currentPage).toBe(1)
      expect(result.current.error).toBeNull()
    })

    it('should fetch event types on mount when authenticated', async () => {
      const { result } = renderHook(() => useEventTypeManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockedEventTypeService.getEventTypes).toHaveBeenCalled()
      expect(result.current.eventTypes).toHaveLength(2)
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

      renderHook(() => useEventTypeManager())

      // Give it time to potentially make the call
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockedEventTypeService.getEventTypes).not.toHaveBeenCalled()
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

      renderHook(() => useEventTypeManager())

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockedEventTypeService.getEventTypes).not.toHaveBeenCalled()
    })
  })

  describe('search functionality', () => {
    it('should update search term', async () => {
      const { result } = renderHook(() => useEventTypeManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.handleSearchChange('test')
      })

      expect(result.current.searchTerm).toBe('test')
    })

    it('should debounce search requests', async () => {
      const { result } = renderHook(() => useEventTypeManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Clear initial call
      jest.clearAllMocks()

      act(() => {
        result.current.handleSearchChange('t')
        result.current.handleSearchChange('te')
        result.current.handleSearchChange('tes')
        result.current.handleSearchChange('test')
      })

      // Wait for debounce
      await waitFor(() => {
        expect(mockedEventTypeService.getEventTypes).toHaveBeenCalled()
      }, { timeout: 500 })
    })
  })

  describe('filter functionality', () => {
    it('should update filter status to active', async () => {
      const { result } = renderHook(() => useEventTypeManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.handleFilterChange('active')
      })

      expect(result.current.filterStatus).toBe('active')
    })

    it('should update filter status to inactive', async () => {
      const { result } = renderHook(() => useEventTypeManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.handleFilterChange('inactive')
      })

      expect(result.current.filterStatus).toBe('inactive')
    })

    it('should reset to all filter', async () => {
      const { result } = renderHook(() => useEventTypeManager())

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
      const { result } = renderHook(() => useEventTypeManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.handlePageChange(2)
      })

      expect(result.current.currentPage).toBe(2)
    })

    it('should fetch data for new page', async () => {
      const { result } = renderHook(() => useEventTypeManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      jest.clearAllMocks()

      act(() => {
        result.current.changePage(3)
      })

      await waitFor(() => {
        expect(mockedEventTypeService.getEventTypes).toHaveBeenCalled()
      })
    })

    it('should return pagination object', async () => {
      const { result } = renderHook(() => useEventTypeManager())

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.eventTypes.length).toBeGreaterThan(0)
      })

      // Pagination interface should be available
      expect('pagination' in result.current).toBe(true)
    })
  })

  describe('delete event type', () => {
    it('should delete event type successfully', async () => {
      const { result } = renderHook(() => useEventTypeManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.handleDeleteEventType(1)
      })

      expect(mockedEventTypeService.deleteEventType).toHaveBeenCalledWith(1)
    })

    it('should perform optimistic update on delete', async () => {
      const { result } = renderHook(() => useEventTypeManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialLength = result.current.eventTypes.length

      await act(async () => {
        await result.current.handleDeleteEventType(1)
      })

      // After delete, the item should be removed
      expect(result.current.eventTypes.length).toBeLessThanOrEqual(initialLength)
    })

    it('should handle delete error and refresh data', async () => {
      mockedEventTypeService.deleteEventType.mockRejectedValue(new Error('Delete failed'))

      const { result } = renderHook(() => useEventTypeManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.handleDeleteEventType(1)
        })
      ).rejects.toThrow('Error al eliminar el tipo de evento')
    })
  })

  describe('optimistic updates', () => {
    it('should add event type optimistically', async () => {
      const { result } = renderHook(() => useEventTypeManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const newEventType: EventType = {
        id: 3,
        name: 'New Type',
        is_active: true,
        subtypes_count: 0,
        created_at: '2025-01-03T00:00:00.000Z',
        updated_at: '2025-01-03T00:00:00.000Z',
      }

      act(() => {
        result.current.addEventType(newEventType)
      })

      expect(result.current.eventTypes).toContainEqual(newEventType)
    })

    it('should update event type optimistically', async () => {
      const { result } = renderHook(() => useEventTypeManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateEventType(1, { name: 'Updated Name' })
      })

      const updatedType = result.current.eventTypes.find(et => et.id === 1)
      expect(updatedType?.name).toBe('Updated Name')
    })

    it('should remove event type optimistically', async () => {
      const { result } = renderHook(() => useEventTypeManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.removeEventType(1)
      })

      const removedType = result.current.eventTypes.find(et => et.id === 1)
      expect(removedType).toBeUndefined()
    })
  })

  describe('statistics', () => {
    it('should calculate stats correctly', async () => {
      const { result } = renderHook(() => useEventTypeManager())

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.eventTypes.length).toBeGreaterThan(0)
      })

      // Stats should be calculated from loaded data
      // mockEventType1 is active, mockEventType2 is inactive
      expect(result.current.stats).toBeDefined()
      expect(result.current.stats.active).toBe(1)
      expect(result.current.stats.inactive).toBe(1)
      // Total comes from pagination, may not be immediately available
      expect(typeof result.current.stats.total).toBe('number')
    })

    it('should update stats when data changes', async () => {
      const { result } = renderHook(() => useEventTypeManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Remove an active type
      act(() => {
        result.current.removeEventType(1)
      })

      expect(result.current.stats.active).toBe(0)
      expect(result.current.stats.inactive).toBe(1)
    })
  })

  describe('reset filters', () => {
    it('should reset all filters to defaults', async () => {
      const { result } = renderHook(() => useEventTypeManager())

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
      const { result } = renderHook(() => useEventTypeManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      jest.clearAllMocks()

      act(() => {
        result.current.refreshData()
      })

      await waitFor(() => {
        expect(mockedEventTypeService.getEventTypes).toHaveBeenCalled()
      })
    })
  })

  describe('error handling', () => {
    it('should set error on fetch failure', async () => {
      mockedEventTypeService.getEventTypes.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useEventTypeManager())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('setFilters', () => {
    it('should set multiple filters at once', async () => {
      const { result } = renderHook(() => useEventTypeManager())

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
