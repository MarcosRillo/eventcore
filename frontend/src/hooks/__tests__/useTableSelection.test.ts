import { renderHook, act } from '@testing-library/react'

import { useTableSelection } from '@/hooks/useTableSelection'

interface TestItem {
  id: number
  name: string
}

describe('useTableSelection', () => {
  const mockItems: TestItem[] = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
    { id: 4, name: 'Item 4' },
    { id: 5, name: 'Item 5' }
  ]

  describe('Initialization', () => {
    it('should initialize with no selections', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      expect(result.current.selectedCount).toBe(0)
      expect(result.current.totalCount).toBe(5)
      expect(result.current.isAllSelected).toBe(false)
      expect(result.current.isPartiallySelected).toBe(false)
      expect(result.current.hasSelection).toBe(false)
      expect(result.current.selectedIds).toEqual([])
    })

    it('should handle empty items array', () => {
      const { result } = renderHook(() => useTableSelection([]))
      
      expect(result.current.totalCount).toBe(0)
      expect(result.current.isAllSelected).toBe(false)
    })
  })

  describe('Single Item Selection', () => {
    it('should select an item', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.toggleSelection(1)
      })
      
      expect(result.current.isSelected(1)).toBe(true)
      expect(result.current.selectedCount).toBe(1)
      expect(result.current.hasSelection).toBe(true)
      expect(result.current.selectedIds).toEqual([1])
    })

    it('should deselect a selected item', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.toggleSelection(1)
      })
      
      expect(result.current.isSelected(1)).toBe(true)
      
      act(() => {
        result.current.toggleSelection(1)
      })
      
      expect(result.current.isSelected(1)).toBe(false)
      expect(result.current.selectedCount).toBe(0)
    })

    it('should handle string IDs', () => {
      const stringIdItems = [
        { id: 'a', name: 'Item A' },
        { id: 'b', name: 'Item B' }
      ]
      const { result } = renderHook(() => useTableSelection(stringIdItems))
      
      act(() => {
        result.current.toggleSelection('a')
      })
      
      expect(result.current.isSelected('a')).toBe(true)
      expect(result.current.selectedIds).toEqual(['a'])
    })
  })

  describe('Multiple Selection', () => {
    it('should select multiple items', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.selectMultiple([1, 3, 5])
      })
      
      expect(result.current.selectedCount).toBe(3)
      expect(result.current.selectedIds).toEqual([1, 3, 5])
      expect(result.current.isSelected(1)).toBe(true)
      expect(result.current.isSelected(2)).toBe(false)
      expect(result.current.isSelected(3)).toBe(true)
    })

    it('should replace previous selection when calling selectMultiple', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.selectMultiple([1, 2])
      })
      
      expect(result.current.selectedCount).toBe(2)
      
      act(() => {
        result.current.selectMultiple([4, 5])
      })
      
      expect(result.current.selectedCount).toBe(2)
      expect(result.current.selectedIds).toEqual([4, 5])
    })

    it('should deselect multiple items', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.selectMultiple([1, 2, 3, 4])
      })
      
      act(() => {
        result.current.deselectMultiple([2, 4])
      })
      
      expect(result.current.selectedCount).toBe(2)
      expect(result.current.selectedIds).toEqual([1, 3])
    })
  })

  describe('Select All / Clear', () => {
    it('should select all items', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.selectAll()
      })
      
      expect(result.current.selectedCount).toBe(5)
      expect(result.current.isAllSelected).toBe(true)
      expect(result.current.hasSelection).toBe(true)
      expect(result.current.selectedIds).toHaveLength(5)
    })

    it('should clear all selections', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.selectAll()
      })
      
      act(() => {
        result.current.clearSelection()
      })
      
      expect(result.current.selectedCount).toBe(0)
      expect(result.current.isAllSelected).toBe(false)
      expect(result.current.hasSelection).toBe(false)
    })

    it('should toggle select all', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.toggleSelectAll()
      })
      
      expect(result.current.isAllSelected).toBe(true)
      
      act(() => {
        result.current.toggleSelectAll()
      })
      
      expect(result.current.isAllSelected).toBe(false)
      expect(result.current.selectedCount).toBe(0)
    })
  })

  describe('Selection States', () => {
    it('should detect partially selected state', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.selectMultiple([1, 2])
      })
      
      expect(result.current.isPartiallySelected).toBe(true)
      expect(result.current.isAllSelected).toBe(false)
    })

    it('should not be partially selected when all are selected', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.selectAll()
      })
      
      expect(result.current.isPartiallySelected).toBe(false)
      expect(result.current.isAllSelected).toBe(true)
    })

    it('should not be partially selected when none are selected', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      expect(result.current.isPartiallySelected).toBe(false)
      expect(result.current.isAllSelected).toBe(false)
    })
  })

  describe('Get Selected Items', () => {
    it('should return full data for selected items', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.selectMultiple([1, 3, 5])
      })
      
      const selectedItems = result.current.getSelectedItems()
      
      expect(selectedItems).toHaveLength(3)
      expect(selectedItems[0]).toEqual({ id: 1, name: 'Item 1' })
      expect(selectedItems[1]).toEqual({ id: 3, name: 'Item 3' })
      expect(selectedItems[2]).toEqual({ id: 5, name: 'Item 5' })
    })

    it('should return empty array when none selected', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      const selectedItems = result.current.getSelectedItems()
      
      expect(selectedItems).toEqual([])
    })
  })

  describe('Select Range', () => {
    it('should select range of items', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.selectRange(2, 4)
      })
      
      expect(result.current.selectedCount).toBe(3)
      expect(result.current.isSelected(2)).toBe(true)
      expect(result.current.isSelected(3)).toBe(true)
      expect(result.current.isSelected(4)).toBe(true)
    })

    it('should select range in reverse order', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.selectRange(4, 2)
      })
      
      expect(result.current.selectedCount).toBe(3)
      expect(result.current.selectedIds).toContain(2)
      expect(result.current.selectedIds).toContain(3)
      expect(result.current.selectedIds).toContain(4)
    })

    it('should add to existing selection when selecting range', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.toggleSelection(1)
      })
      
      act(() => {
        result.current.selectRange(3, 4)
      })
      
      expect(result.current.selectedCount).toBe(3)
      expect(result.current.isSelected(1)).toBe(true)
      expect(result.current.isSelected(3)).toBe(true)
      expect(result.current.isSelected(4)).toBe(true)
    })

    it('should handle invalid range IDs gracefully', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.selectRange(99, 100)
      })
      
      expect(result.current.selectedCount).toBe(0)
    })
  })

  describe('Dynamic Items Changes', () => {
    it('should update totalCount when items change', () => {
      const { result, rerender } = renderHook(
        ({ items }) => useTableSelection(items),
        { initialProps: { items: mockItems } }
      )
      
      expect(result.current.totalCount).toBe(5)
      
      const newItems = [...mockItems, { id: 6, name: 'Item 6' }]
      rerender({ items: newItems })
      
      expect(result.current.totalCount).toBe(6)
    })

    it('should preserve selections when items array changes but IDs remain', () => {
      const { result, rerender } = renderHook(
        ({ items }) => useTableSelection(items),
        { initialProps: { items: mockItems } }
      )
      
      act(() => {
        result.current.selectMultiple([1, 2])
      })
      
      expect(result.current.selectedCount).toBe(2)
      
      // Same items, just new array reference
      const newItems = [...mockItems]
      rerender({ items: newItems })
      
      expect(result.current.selectedCount).toBe(2)
      expect(result.current.isSelected(1)).toBe(true)
    })

    it('should update selectedCount when items are removed', () => {
      const { result, rerender } = renderHook(
        ({ items }) => useTableSelection(items),
        { initialProps: { items: mockItems } }
      )
      
      act(() => {
        result.current.selectAll()
      })
      
      expect(result.current.isAllSelected).toBe(true)
      
      const fewerItems = mockItems.slice(0, 3)
      rerender({ items: fewerItems })
      
      expect(result.current.totalCount).toBe(3)
      // Selections are still 5 but only 3 items exist
      expect(result.current.isAllSelected).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle selection of non-existent ID', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.toggleSelection(999)
      })
      
      expect(result.current.isSelected(999)).toBe(true)
      // Selection works even if ID doesn't exist in current items
      expect(result.current.selectedCount).toBe(1)
    })

    it('should handle empty selectMultiple array', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.selectMultiple([])
      })
      
      expect(result.current.selectedCount).toBe(0)
    })

    it('should handle duplicate IDs in selectMultiple', () => {
      const { result } = renderHook(() => useTableSelection(mockItems))
      
      act(() => {
        result.current.selectMultiple([1, 1, 2, 2, 3])
      })
      
      // Set should deduplicate
      expect(result.current.selectedCount).toBe(3)
    })
  })
})
