import { renderHook, act, waitFor } from '@testing-library/react'
import { usePaginatedData, BaseFilters } from '../usePaginatedData'

// Mock useDebounce
jest.mock('../useDebounce', () => ({
  useDebounce: (value: string) => value,
}))

describe('usePaginatedData', () => {
  interface TestItem {
    id: number
    name: string
  }

  interface TestFilters extends BaseFilters {
    status?: string
  }

  const mockData: TestItem[] = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ]

  const mockResponse = {
    data: mockData,
    meta: {
      current_page: 1,
      last_page: 3,
      total: 25,
      per_page: 10,
    },
  }

  const mockFetchFn = jest.fn()

  const defaultConfig = {
    fetchFn: mockFetchFn,
    initialFilters: { page: 1, per_page: 10 } as TestFilters,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchFn.mockResolvedValue(mockResponse)
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>({
          ...defaultConfig,
          autoLoad: false,
        })
      )

      expect(result.current.data).toEqual([])
      expect(result.current.pagination).toBeNull()
      expect(result.current.filters).toEqual({ page: 1, per_page: 10 })
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should start loading when autoLoad is true', async () => {
      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>(defaultConfig)
      )

      // Wait for initial load to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockFetchFn).toHaveBeenCalled()
    })

    it('should not load when autoLoad is false', async () => {
      renderHook(() =>
        usePaginatedData<TestItem, TestFilters>({
          ...defaultConfig,
          autoLoad: false,
        })
      )

      expect(mockFetchFn).not.toHaveBeenCalled()
    })
  })

  describe('data loading', () => {
    it('should load data and update state', async () => {
      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>(defaultConfig)
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockData)
      expect(result.current.pagination).toEqual(mockResponse.meta)
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      mockFetchFn.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>(defaultConfig)
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
      expect(result.current.data).toEqual([])
      expect(result.current.pagination).toBeNull()
    })

    it('should handle non-Error exceptions', async () => {
      mockFetchFn.mockRejectedValue('String error')

      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>(defaultConfig)
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Error loading data')
    })
  })

  describe('setFilters', () => {
    it('should update filters and reset page to 1', async () => {
      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>(defaultConfig)
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setFilters({ status: 'active' })
      })

      expect(result.current.filters.status).toBe('active')
      expect(result.current.filters.page).toBe(1)

      // Wait for async fetch triggered by filter change
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should preserve page when explicitly set', async () => {
      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>(defaultConfig)
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setFilters({ page: 5, status: 'active' })
      })

      expect(result.current.filters.page).toBe(5)

      // Wait for async fetch triggered by filter change
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('resetFilters', () => {
    it('should reset filters to initial values', async () => {
      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>(defaultConfig)
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // First, change some filters
      act(() => {
        result.current.setFilters({ status: 'active', page: 5 })
      })

      expect(result.current.filters.status).toBe('active')

      // Wait for async fetch triggered by filter change
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Then reset
      act(() => {
        result.current.resetFilters()
      })

      expect(result.current.filters).toEqual({ page: 1, per_page: 10 })

      // Wait for async fetch triggered by reset
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('changePage', () => {
    it('should update the page filter', async () => {
      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>(defaultConfig)
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.changePage(3)
      })

      expect(result.current.filters.page).toBe(3)

      // Wait for async fetch triggered by page change
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('refreshData', () => {
    it('should trigger a data refresh', async () => {
      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>(defaultConfig)
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialCallCount = mockFetchFn.mock.calls.length

      act(() => {
        result.current.refreshData()
      })

      await waitFor(() => {
        expect(mockFetchFn.mock.calls.length).toBeGreaterThan(initialCallCount)
      })
    })
  })

  describe('addItem', () => {
    it('should add item to the beginning of data array', async () => {
      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>(defaultConfig)
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const newItem = { id: 3, name: 'New Item' }

      act(() => {
        result.current.addItem(newItem)
      })

      expect(result.current.data[0]).toEqual(newItem)
      expect(result.current.data).toHaveLength(3)
    })
  })

  describe('updateItem', () => {
    it('should update an existing item by id', async () => {
      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>(defaultConfig)
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateItem(1, { name: 'Updated Name' })
      })

      const updatedItem = result.current.data.find((item) => item.id === 1)
      expect(updatedItem?.name).toBe('Updated Name')
    })

    it('should not modify other items', async () => {
      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>(defaultConfig)
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.updateItem(1, { name: 'Updated Name' })
      })

      const otherItem = result.current.data.find((item) => item.id === 2)
      expect(otherItem?.name).toBe('Item 2')
    })
  })

  describe('removeItem', () => {
    it('should remove an item by id', async () => {
      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>(defaultConfig)
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.removeItem(1)
      })

      expect(result.current.data).toHaveLength(1)
      expect(result.current.data.find((item) => item.id === 1)).toBeUndefined()
    })

    it('should not affect data if id does not exist', async () => {
      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>(defaultConfig)
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const originalLength = result.current.data.length

      act(() => {
        result.current.removeItem(999)
      })

      expect(result.current.data).toHaveLength(originalLength)
    })
  })

  describe('edge cases', () => {
    it('should handle empty response data', async () => {
      mockFetchFn.mockResolvedValue({ data: [], meta: null })

      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>(defaultConfig)
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual([])
      expect(result.current.pagination).toBeNull()
    })

    it('should handle undefined data in response', async () => {
      mockFetchFn.mockResolvedValue({ meta: null })

      const { result } = renderHook(() =>
        usePaginatedData<TestItem, TestFilters>(defaultConfig)
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual([])
    })
  })
})
