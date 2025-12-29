import { renderHook, act } from '@testing-library/react'

import { DashboardTab } from '@/features/events/components/EventsFilterTabs'
import { useEventsFilters } from '@/hooks/useEventsFilters'

describe('useEventsFilters', () => {
  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useEventsFilters())
      
      expect(result.current.activeTab).toBe('requires-action')
      expect(result.current.searchQuery).toBe('')
      expect(result.current.currentPage).toBe(1)
    })

    it('should initialize with custom tab', () => {
      const { result } = renderHook(() => useEventsFilters('published'))

      expect(result.current.activeTab).toBe('published')
    })
  })

  describe('Tab Management', () => {
    it('should set active tab', () => {
      const { result } = renderHook(() => useEventsFilters())

      act(() => {
        result.current.setActiveTab('pending')
      })

      expect(result.current.activeTab).toBe('pending')
    })

    it('should handle tab change and reset page', () => {
      const { result } = renderHook(() => useEventsFilters())
      
      // Navigate to page 3
      act(() => {
        result.current.setCurrentPage(3)
      })
      
      expect(result.current.currentPage).toBe(3)
      
      // Change tab - should reset page
      act(() => {
        result.current.handleTabChange('published')
      })
      
      expect(result.current.activeTab).toBe('published')
      expect(result.current.currentPage).toBe(1)
    })

    it('should support all valid tab values', () => {
      const { result } = renderHook(() => useEventsFilters())

      const tabs: DashboardTab[] = ['requires-action', 'pending', 'published', 'historic']

      tabs.forEach(tab => {
        act(() => {
          result.current.setActiveTab(tab)
        })

        expect(result.current.activeTab).toBe(tab)
      })
    })
  })

  describe('Search Management', () => {
    it('should set search query', () => {
      const { result } = renderHook(() => useEventsFilters())
      
      act(() => {
        result.current.setSearchQuery('test query')
      })
      
      expect(result.current.searchQuery).toBe('test query')
    })

    it('should handle search change and reset page', () => {
      const { result } = renderHook(() => useEventsFilters())
      
      // Navigate to page 5
      act(() => {
        result.current.setCurrentPage(5)
      })
      
      expect(result.current.currentPage).toBe(5)
      
      // Search - should reset page
      act(() => {
        result.current.handleSearchChange('event name')
      })
      
      expect(result.current.searchQuery).toBe('event name')
      expect(result.current.currentPage).toBe(1)
    })

    it('should handle empty search query', () => {
      const { result } = renderHook(() => useEventsFilters())
      
      act(() => {
        result.current.setSearchQuery('something')
      })
      
      act(() => {
        result.current.setSearchQuery('')
      })
      
      expect(result.current.searchQuery).toBe('')
    })

    it('should preserve whitespace in search query', () => {
      const { result } = renderHook(() => useEventsFilters())
      
      act(() => {
        result.current.setSearchQuery('  leading and trailing  ')
      })
      
      expect(result.current.searchQuery).toBe('  leading and trailing  ')
    })
  })

  describe('Page Management', () => {
    it('should set current page', () => {
      const { result } = renderHook(() => useEventsFilters())
      
      act(() => {
        result.current.setCurrentPage(7)
      })
      
      expect(result.current.currentPage).toBe(7)
    })

    it('should handle page change', () => {
      const { result } = renderHook(() => useEventsFilters())
      
      act(() => {
        result.current.handlePageChange(10)
      })
      
      expect(result.current.currentPage).toBe(10)
    })

    it('should allow setting page to 1', () => {
      const { result } = renderHook(() => useEventsFilters())
      
      act(() => {
        result.current.setCurrentPage(5)
      })
      
      act(() => {
        result.current.handlePageChange(1)
      })
      
      expect(result.current.currentPage).toBe(1)
    })
  })

  describe('Reset Filters', () => {
    it('should reset all filters to default', () => {
      const { result } = renderHook(() => useEventsFilters('pending'))
      
      // Set some values
      act(() => {
        result.current.setActiveTab('published')
        result.current.setSearchQuery('some search')
        result.current.setCurrentPage(5)
      })
      
      expect(result.current.activeTab).toBe('published')
      expect(result.current.searchQuery).toBe('some search')
      expect(result.current.currentPage).toBe(5)
      
      // Reset
      act(() => {
        result.current.resetFilters()
      })
      
      expect(result.current.activeTab).toBe('requires-action')
      expect(result.current.searchQuery).toBe('')
      expect(result.current.currentPage).toBe(1)
    })

    it('should reset to default tab regardless of initial tab', () => {
      const { result } = renderHook(() => useEventsFilters('published'))

      act(() => {
        result.current.setActiveTab('historic')
      })
      
      act(() => {
        result.current.resetFilters()
      })
      
      // Resets to 'requires-action', NOT to the initial tab
      expect(result.current.activeTab).toBe('requires-action')
    })
  })

  describe('Combined Filter Operations', () => {
    it('should handle multiple filter changes', () => {
      const { result } = renderHook(() => useEventsFilters())

      act(() => {
        result.current.handleTabChange('pending')
      })

      act(() => {
        result.current.handleSearchChange('conference')
      })

      act(() => {
        result.current.handlePageChange(3)
      })

      expect(result.current.activeTab).toBe('pending')
      expect(result.current.searchQuery).toBe('conference')
      expect(result.current.currentPage).toBe(3)
    })

    it('should maintain tab when changing search', () => {
      const { result } = renderHook(() => useEventsFilters())

      act(() => {
        result.current.setActiveTab('historic')
      })

      act(() => {
        result.current.handleSearchChange('test')
      })

      expect(result.current.activeTab).toBe('historic')
      expect(result.current.searchQuery).toBe('test')
    })

    it('should maintain search when changing tab', () => {
      const { result } = renderHook(() => useEventsFilters())
      
      act(() => {
        result.current.setSearchQuery('event')
      })
      
      act(() => {
        result.current.handleTabChange('published')
      })
      
      expect(result.current.searchQuery).toBe('event')
      expect(result.current.activeTab).toBe('published')
    })
  })

  describe('Handler Functions vs Direct Setters', () => {
    it('handleTabChange should reset page but setActiveTab should not', () => {
      const { result } = renderHook(() => useEventsFilters())

      act(() => {
        result.current.setCurrentPage(5)
      })

      // Using handleTabChange resets page
      act(() => {
        result.current.handleTabChange('pending')
      })

      expect(result.current.currentPage).toBe(1)

      // Using setActiveTab directly does NOT reset page
      act(() => {
        result.current.setCurrentPage(5)
      })

      act(() => {
        result.current.setActiveTab('historic')
      })

      expect(result.current.currentPage).toBe(5)
    })

    it('handleSearchChange should reset page but setSearchQuery should not', () => {
      const { result } = renderHook(() => useEventsFilters())
      
      act(() => {
        result.current.setCurrentPage(5)
      })
      
      // Using handleSearchChange resets page
      act(() => {
        result.current.handleSearchChange('test')
      })
      
      expect(result.current.currentPage).toBe(1)
      
      // Using setSearchQuery directly does NOT reset page
      act(() => {
        result.current.setCurrentPage(5)
      })
      
      act(() => {
        result.current.setSearchQuery('another')
      })
      
      expect(result.current.currentPage).toBe(5)
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid filter changes', () => {
      const { result } = renderHook(() => useEventsFilters())

      act(() => {
        result.current.handleTabChange('pending')
        result.current.handleSearchChange('quick')
        result.current.handlePageChange(2)
        result.current.resetFilters()
      })
      
      expect(result.current.activeTab).toBe('requires-action')
      expect(result.current.searchQuery).toBe('')
      expect(result.current.currentPage).toBe(1)
    })

    it('should handle setting page to 0', () => {
      const { result } = renderHook(() => useEventsFilters())
      
      act(() => {
        result.current.setCurrentPage(0)
      })
      
      // Hook doesn't validate, just sets the value
      expect(result.current.currentPage).toBe(0)
    })

    it('should handle negative page numbers', () => {
      const { result } = renderHook(() => useEventsFilters())
      
      act(() => {
        result.current.setCurrentPage(-1)
      })
      
      expect(result.current.currentPage).toBe(-1)
    })
  })
})
