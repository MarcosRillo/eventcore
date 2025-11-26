import { renderHook, act, waitFor } from '@testing-library/react'
import { useCategoryManager } from '../useCategoryManager'
import { useAuth } from '@/context/AuthContext'
import { usePaginatedData } from '@/hooks/usePaginatedData'
import * as categoryService from '@/features/categories/services/category.service'

// Mock dependencies
jest.mock('@/context/AuthContext')
jest.mock('@/hooks/usePaginatedData')
jest.mock('@/features/categories/services/category.service')

const mockSetFilters = jest.fn()
const mockResetFilters = jest.fn()
const mockChangePage = jest.fn()
const mockRefreshData = jest.fn()
const mockAddItem = jest.fn()
const mockUpdateItem = jest.fn()
const mockRemoveItem = jest.fn()

describe('useCategoryManager', () => {
  const mockCategories = [
    { id: 1, name: 'Music', slug: 'music', is_active: true, color: '#FF0000' },
    { id: 2, name: 'Sports', slug: 'sports', is_active: false, color: '#00FF00' },
    { id: 3, name: 'Tech', slug: 'tech', is_active: true, color: '#0000FF' },
  ]

  const mockPagination = {
    current_page: 1,
    last_page: 3,
    per_page: 10,
    total: 25,
    from: 1,
    to: 10,
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Default useAuth mock (authenticated)
    ;(useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 1, email: 'test@example.com' },
    })

    // Default usePaginatedData mock
    ;(usePaginatedData as jest.Mock).mockReturnValue({
      data: mockCategories,
      pagination: mockPagination,
      filters: { page: 1, per_page: 10, status: 'all' },
      isLoading: false,
      error: null,
      setFilters: mockSetFilters,
      resetFilters: mockResetFilters,
      changePage: mockChangePage,
      refreshData: mockRefreshData,
      addItem: mockAddItem,
      updateItem: mockUpdateItem,
      removeItem: mockRemoveItem,
    })
  })

  describe('Initialization', () => {
    it('should initialize with default values when authenticated', () => {
      const { result } = renderHook(() => useCategoryManager())

      expect(result.current.categories).toEqual(mockCategories)
      expect(result.current.pagination).toEqual(mockPagination)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.searchTerm).toBe('')
      expect(result.current.filterStatus).toBe('all')
      expect(result.current.currentPage).toBe(1)
    })

    it('should not auto-load when user is not authenticated', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      })

      renderHook(() => useCategoryManager())

      // Verify autoLoad was set to false
      expect(usePaginatedData).toHaveBeenCalledWith(
        expect.objectContaining({
          autoLoad: false,
        })
      )
    })

    it('should not auto-load while auth is loading', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: true,
        user: null,
      })

      renderHook(() => useCategoryManager())

      expect(usePaginatedData).toHaveBeenCalledWith(
        expect.objectContaining({
          autoLoad: false,
        })
      )
    })

    it('should auto-load when authenticated and not loading', () => {
      renderHook(() => useCategoryManager())

      expect(usePaginatedData).toHaveBeenCalledWith(
        expect.objectContaining({
          autoLoad: true,
        })
      )
    })
  })

  describe('Filter State', () => {
    it('should extract search term from filters', () => {
      ;(usePaginatedData as jest.Mock).mockReturnValue({
        data: mockCategories,
        pagination: mockPagination,
        filters: { page: 1, per_page: 10, status: 'all', search: 'Music' },
        isLoading: false,
        error: null,
        setFilters: mockSetFilters,
        resetFilters: mockResetFilters,
        changePage: mockChangePage,
        refreshData: mockRefreshData,
        addItem: mockAddItem,
        updateItem: mockUpdateItem,
        removeItem: mockRemoveItem,
      })

      const { result } = renderHook(() => useCategoryManager())

      expect(result.current.searchTerm).toBe('Music')
    })

    it('should extract filter status from filters', () => {
      ;(usePaginatedData as jest.Mock).mockReturnValue({
        data: mockCategories,
        pagination: mockPagination,
        filters: { page: 1, per_page: 10, status: 'active' },
        isLoading: false,
        error: null,
        setFilters: mockSetFilters,
        resetFilters: mockResetFilters,
        changePage: mockChangePage,
        refreshData: mockRefreshData,
        addItem: mockAddItem,
        updateItem: mockUpdateItem,
        removeItem: mockRemoveItem,
      })

      const { result } = renderHook(() => useCategoryManager())

      expect(result.current.filterStatus).toBe('active')
    })

    it('should extract current page from filters', () => {
      ;(usePaginatedData as jest.Mock).mockReturnValue({
        data: mockCategories,
        pagination: mockPagination,
        filters: { page: 3, per_page: 10, status: 'all' },
        isLoading: false,
        error: null,
        setFilters: mockSetFilters,
        resetFilters: mockResetFilters,
        changePage: mockChangePage,
        refreshData: mockRefreshData,
        addItem: mockAddItem,
        updateItem: mockUpdateItem,
        removeItem: mockRemoveItem,
      })

      const { result } = renderHook(() => useCategoryManager())

      expect(result.current.currentPage).toBe(3)
    })
  })

  describe('Search Functionality', () => {
    it('should call setFilters when handleSearchChange is called', () => {
      const { result } = renderHook(() => useCategoryManager())

      act(() => {
        result.current.handleSearchChange('Tech')
      })

      expect(mockSetFilters).toHaveBeenCalledWith({ search: 'Tech' })
    })

    it('should call setFilters with empty string when clearing search', () => {
      const { result } = renderHook(() => useCategoryManager())

      act(() => {
        result.current.handleSearchChange('')
      })

      expect(mockSetFilters).toHaveBeenCalledWith({ search: '' })
    })
  })

  describe('Status Filter Functionality', () => {
    it('should call setFilters when handleFilterChange is called with active', () => {
      const { result } = renderHook(() => useCategoryManager())

      act(() => {
        result.current.handleFilterChange('active')
      })

      expect(mockSetFilters).toHaveBeenCalledWith({ status: 'active' })
    })

    it('should call setFilters when handleFilterChange is called with inactive', () => {
      const { result } = renderHook(() => useCategoryManager())

      act(() => {
        result.current.handleFilterChange('inactive')
      })

      expect(mockSetFilters).toHaveBeenCalledWith({ status: 'inactive' })
    })

    it('should call setFilters when handleFilterChange is called with all', () => {
      const { result } = renderHook(() => useCategoryManager())

      act(() => {
        result.current.handleFilterChange('all')
      })

      expect(mockSetFilters).toHaveBeenCalledWith({ status: 'all' })
    })
  })

  describe('Pagination Functionality', () => {
    it('should call changePage when handlePageChange is called', () => {
      const { result } = renderHook(() => useCategoryManager())

      act(() => {
        result.current.handlePageChange(2)
      })

      expect(mockChangePage).toHaveBeenCalledWith(2)
    })
  })

  describe('Delete Category', () => {
    it('should delete category with optimistic update and refresh', async () => {
      ;(categoryService.deleteCategory as jest.Mock).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useCategoryManager())

      await act(async () => {
        await result.current.handleDeleteCategory(1)
      })

      expect(mockRemoveItem).toHaveBeenCalledWith(1)
      expect(categoryService.deleteCategory).toHaveBeenCalledWith(1)
      expect(mockRefreshData).toHaveBeenCalled()
    })

    it('should revert optimistic update on delete error', async () => {
      ;(categoryService.deleteCategory as jest.Mock).mockRejectedValueOnce(
        new Error('Delete failed')
      )

      const { result } = renderHook(() => useCategoryManager())

      await expect(
        act(async () => {
          await result.current.handleDeleteCategory(1)
        })
      ).rejects.toThrow('Delete failed')

      expect(mockRemoveItem).toHaveBeenCalledWith(1)
      expect(categoryService.deleteCategory).toHaveBeenCalledWith(1)
      expect(mockRefreshData).toHaveBeenCalledTimes(1)
    })
  })

  describe('Optimistic Updates', () => {
    it('should expose addCategory for optimistic addition', () => {
      const { result } = renderHook(() => useCategoryManager())

      const newCategory = { id: 4, name: 'Art', slug: 'art', is_active: true, color: '#FFFF00' }

      act(() => {
        result.current.addCategory(newCategory)
      })

      expect(mockAddItem).toHaveBeenCalledWith(newCategory)
    })

    it('should expose updateCategory for optimistic update', () => {
      const { result } = renderHook(() => useCategoryManager())

      act(() => {
        result.current.updateCategory(1, { name: 'Updated Music' })
      })

      expect(mockUpdateItem).toHaveBeenCalledWith(1, { name: 'Updated Music' })
    })

    it('should expose removeCategory for optimistic removal', () => {
      const { result } = renderHook(() => useCategoryManager())

      act(() => {
        result.current.removeCategory(1)
      })

      expect(mockRemoveItem).toHaveBeenCalledWith(1)
    })
  })

  describe('Statistics Calculation', () => {
    it('should calculate total from pagination', () => {
      const { result } = renderHook(() => useCategoryManager())

      expect(result.current.stats.total).toBe(25)
    })

    it('should calculate active categories count', () => {
      const { result } = renderHook(() => useCategoryManager())

      // mockCategories has 2 active (id 1, 3)
      expect(result.current.stats.active).toBe(2)
    })

    it('should calculate inactive categories count', () => {
      const { result } = renderHook(() => useCategoryManager())

      // mockCategories has 1 inactive (id 2)
      expect(result.current.stats.inactive).toBe(1)
    })

    it('should handle empty categories array for stats', () => {
      ;(usePaginatedData as jest.Mock).mockReturnValue({
        data: [],
        pagination: { total: 0, current_page: 1, last_page: 1, per_page: 10, from: 0, to: 0 },
        filters: { page: 1, per_page: 10, status: 'all' },
        isLoading: false,
        error: null,
        setFilters: mockSetFilters,
        resetFilters: mockResetFilters,
        changePage: mockChangePage,
        refreshData: mockRefreshData,
        addItem: mockAddItem,
        updateItem: mockUpdateItem,
        removeItem: mockRemoveItem,
      })

      const { result } = renderHook(() => useCategoryManager())

      expect(result.current.stats).toEqual({
        total: 0,
        active: 0,
        inactive: 0,
      })
    })

    it('should handle null pagination for stats', () => {
      ;(usePaginatedData as jest.Mock).mockReturnValue({
        data: mockCategories,
        pagination: null,
        filters: { page: 1, per_page: 10, status: 'all' },
        isLoading: false,
        error: null,
        setFilters: mockSetFilters,
        resetFilters: mockResetFilters,
        changePage: mockChangePage,
        refreshData: mockRefreshData,
        addItem: mockAddItem,
        updateItem: mockUpdateItem,
        removeItem: mockRemoveItem,
      })

      const { result } = renderHook(() => useCategoryManager())

      expect(result.current.stats.total).toBe(0)
      expect(result.current.stats.active).toBe(2)
      expect(result.current.stats.inactive).toBe(1)
    })
  })

  describe('Generic Actions', () => {
    it('should expose setFilters action', () => {
      const { result } = renderHook(() => useCategoryManager())

      act(() => {
        result.current.setFilters({ search: 'test', status: 'active' })
      })

      expect(mockSetFilters).toHaveBeenCalledWith({ search: 'test', status: 'active' })
    })

    it('should expose resetFilters action', () => {
      const { result } = renderHook(() => useCategoryManager())

      act(() => {
        result.current.resetFilters()
      })

      expect(mockResetFilters).toHaveBeenCalled()
    })

    it('should expose changePage action', () => {
      const { result } = renderHook(() => useCategoryManager())

      act(() => {
        result.current.changePage(3)
      })

      expect(mockChangePage).toHaveBeenCalledWith(3)
    })

    it('should expose refreshData action', () => {
      const { result } = renderHook(() => useCategoryManager())

      act(() => {
        result.current.refreshData()
      })

      expect(mockRefreshData).toHaveBeenCalled()
    })
  })

  describe('Loading and Error States', () => {
    it('should reflect loading state from usePaginatedData', () => {
      ;(usePaginatedData as jest.Mock).mockReturnValue({
        data: [],
        pagination: null,
        filters: { page: 1, per_page: 10, status: 'all' },
        isLoading: true,
        error: null,
        setFilters: mockSetFilters,
        resetFilters: mockResetFilters,
        changePage: mockChangePage,
        refreshData: mockRefreshData,
        addItem: mockAddItem,
        updateItem: mockUpdateItem,
        removeItem: mockRemoveItem,
      })

      const { result } = renderHook(() => useCategoryManager())

      expect(result.current.isLoading).toBe(true)
    })

    it('should reflect error state from usePaginatedData', () => {
      ;(usePaginatedData as jest.Mock).mockReturnValue({
        data: [],
        pagination: null,
        filters: { page: 1, per_page: 10, status: 'all' },
        isLoading: false,
        error: 'Network error',
        setFilters: mockSetFilters,
        resetFilters: mockResetFilters,
        changePage: mockChangePage,
        refreshData: mockRefreshData,
        addItem: mockAddItem,
        updateItem: mockUpdateItem,
        removeItem: mockRemoveItem,
      })

      const { result } = renderHook(() => useCategoryManager())

      expect(result.current.error).toBe('Network error')
    })
  })
})
