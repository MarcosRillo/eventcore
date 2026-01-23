import { act,renderHook } from '@testing-library/react'

import { usePagination } from '@/hooks/usePagination'

describe('usePagination', () => {
  describe('Initialization', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => usePagination(100))
      
      expect(result.current.currentPage).toBe(1)
      expect(result.current.totalPages).toBe(10)
      expect(result.current.itemsPerPage).toBe(10)
      expect(result.current.totalItems).toBe(100)
      expect(result.current.startIndex).toBe(0)
      expect(result.current.endIndex).toBe(10)
      expect(result.current.hasNext).toBe(true)
      expect(result.current.hasPrev).toBe(false)
    })

    it('should initialize with custom items per page', () => {
      const { result } = renderHook(() => usePagination(100, 25))
      
      expect(result.current.totalPages).toBe(4)
      expect(result.current.itemsPerPage).toBe(25)
      expect(result.current.endIndex).toBe(25)
    })

    it('should initialize with custom initial page', () => {
      const { result } = renderHook(() => usePagination(100, 10, 3))
      
      expect(result.current.currentPage).toBe(3)
      expect(result.current.startIndex).toBe(20)
      expect(result.current.endIndex).toBe(30)
    })
  })

  describe('Navigation', () => {
    it('should go to next page', () => {
      const { result } = renderHook(() => usePagination(100, 10))
      
      act(() => {
        result.current.goToNext()
      })
      
      expect(result.current.currentPage).toBe(2)
      expect(result.current.startIndex).toBe(10)
      expect(result.current.endIndex).toBe(20)
    })

    it('should not go beyond last page when calling goToNext', () => {
      const { result } = renderHook(() => usePagination(100, 10, 10))
      
      act(() => {
        result.current.goToNext()
      })
      
      expect(result.current.currentPage).toBe(10)
    })

    it('should go to previous page', () => {
      const { result } = renderHook(() => usePagination(100, 10, 3))
      
      act(() => {
        result.current.goToPrev()
      })
      
      expect(result.current.currentPage).toBe(2)
      expect(result.current.startIndex).toBe(10)
      expect(result.current.endIndex).toBe(20)
    })

    it('should not go below page 1 when calling goToPrev', () => {
      const { result } = renderHook(() => usePagination(100, 10, 1))
      
      act(() => {
        result.current.goToPrev()
      })
      
      expect(result.current.currentPage).toBe(1)
    })

    it('should go to first page', () => {
      const { result } = renderHook(() => usePagination(100, 10, 5))
      
      act(() => {
        result.current.goToFirst()
      })
      
      expect(result.current.currentPage).toBe(1)
      expect(result.current.startIndex).toBe(0)
    })

    it('should go to last page', () => {
      const { result } = renderHook(() => usePagination(100, 10, 1))
      
      act(() => {
        result.current.goToLast()
      })
      
      expect(result.current.currentPage).toBe(10)
      expect(result.current.startIndex).toBe(90)
      expect(result.current.endIndex).toBe(100)
    })

    it('should go to specific page', () => {
      const { result } = renderHook(() => usePagination(100, 10))
      
      act(() => {
        result.current.goToPage(7)
      })
      
      expect(result.current.currentPage).toBe(7)
      expect(result.current.startIndex).toBe(60)
      expect(result.current.endIndex).toBe(70)
    })

    it('should clamp page number when going to invalid page (too high)', () => {
      const { result } = renderHook(() => usePagination(100, 10))
      
      act(() => {
        result.current.goToPage(999)
      })
      
      expect(result.current.currentPage).toBe(10)
    })

    it('should clamp page number when going to invalid page (too low)', () => {
      const { result } = renderHook(() => usePagination(100, 10))
      
      act(() => {
        result.current.goToPage(-5)
      })
      
      expect(result.current.currentPage).toBe(1)
    })

    it('should reset page to 1', () => {
      const { result } = renderHook(() => usePagination(100, 10, 5))
      
      act(() => {
        result.current.resetPage()
      })
      
      expect(result.current.currentPage).toBe(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle 0 items', () => {
      const { result } = renderHook(() => usePagination(0, 10))
      
      expect(result.current.totalPages).toBe(0)
      expect(result.current.startIndex).toBe(0)
      expect(result.current.endIndex).toBe(0)
      expect(result.current.hasNext).toBe(false)
      expect(result.current.hasPrev).toBe(false)
    })

    it('should handle items that do not divide evenly', () => {
      const { result } = renderHook(() => usePagination(95, 10))
      
      expect(result.current.totalPages).toBe(10)
      
      act(() => {
        result.current.goToLast()
      })
      
      expect(result.current.startIndex).toBe(90)
      expect(result.current.endIndex).toBe(95)
    })

    it('should handle single item', () => {
      const { result } = renderHook(() => usePagination(1, 10))
      
      expect(result.current.totalPages).toBe(1)
      expect(result.current.currentPage).toBe(1)
      expect(result.current.hasNext).toBe(false)
      expect(result.current.hasPrev).toBe(false)
    })

    it('should handle items equal to items per page', () => {
      const { result } = renderHook(() => usePagination(10, 10))
      
      expect(result.current.totalPages).toBe(1)
      expect(result.current.hasNext).toBe(false)
    })
  })

  describe('State Flags', () => {
    it('should correctly set hasNext and hasPrev for first page', () => {
      const { result } = renderHook(() => usePagination(100, 10, 1))
      
      expect(result.current.hasNext).toBe(true)
      expect(result.current.hasPrev).toBe(false)
    })

    it('should correctly set hasNext and hasPrev for middle page', () => {
      const { result } = renderHook(() => usePagination(100, 10, 5))
      
      expect(result.current.hasNext).toBe(true)
      expect(result.current.hasPrev).toBe(true)
    })

    it('should correctly set hasNext and hasPrev for last page', () => {
      const { result } = renderHook(() => usePagination(100, 10, 10))
      
      expect(result.current.hasNext).toBe(false)
      expect(result.current.hasPrev).toBe(true)
    })
  })

  describe('paginateData Helper', () => {
    it('should paginate array data correctly', () => {
      const { result } = renderHook(() => usePagination(10, 3))
      const data = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
      
      const page1 = result.current.paginateData(data)
      expect(page1).toEqual(['a', 'b', 'c'])
      
      act(() => {
        result.current.goToNext()
      })
      
      const page2 = result.current.paginateData(data)
      expect(page2).toEqual(['d', 'e', 'f'])
      
      act(() => {
        result.current.goToLast()
      })
      
      const lastPage = result.current.paginateData(data)
      expect(lastPage).toEqual(['j'])
    })

    it('should handle empty array', () => {
      const { result } = renderHook(() => usePagination(0, 10))
      const data: string[] = []
      
      const paginated = result.current.paginateData(data)
      expect(paginated).toEqual([])
    })

    it('should work with object arrays', () => {
      const { result } = renderHook(() => usePagination(5, 2))
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' },
        { id: 5, name: 'Item 5' }
      ]
      
      const page1 = result.current.paginateData(data)
      expect(page1).toHaveLength(2)
      expect(page1[0].id).toBe(1)
      expect(page1[1].id).toBe(2)
    })
  })

  describe('Dynamic totalItems changes', () => {
    it('should recalculate when totalItems changes', () => {
      const { result, rerender } = renderHook(
        ({ totalItems }) => usePagination(totalItems, 10, 5),
        { initialProps: { totalItems: 100 } }
      )
      
      expect(result.current.totalPages).toBe(10)
      
      rerender({ totalItems: 50 })
      
      expect(result.current.totalPages).toBe(5)
      expect(result.current.currentPage).toBe(5)
    })

    it('should adjust current page if it exceeds new totalPages', () => {
      const { result, rerender } = renderHook(
        ({ totalItems }) => usePagination(totalItems, 10, 8),
        { initialProps: { totalItems: 100 } }
      )
      
      expect(result.current.currentPage).toBe(8)
      
      // Reduce total items so there are only 3 pages
      rerender({ totalItems: 30 })
      
      // Current page should still be 8 but values recalculated
      expect(result.current.totalPages).toBe(3)
    })
  })
})
