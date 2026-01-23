/**
 * Generic Table Selection Hook
 * Provides selection functionality for table rows with any data type
 */

import { useCallback,useMemo, useState } from 'react';

export const useTableSelection = <T extends { id: number | string }>(items: T[]) => {
  const [selectedIds, setSelectedIds] = useState<Set<T['id']>>(new Set());

  const selectionState = useMemo(() => {
    const selectedCount = selectedIds.size;
    const totalCount = items.length;

    return {
      selectedCount,
      totalCount,
      isAllSelected: totalCount > 0 && selectedCount === totalCount,
      isPartiallySelected: selectedCount > 0 && selectedCount < totalCount,
      hasSelection: selectedCount > 0,
      selectedIds: Array.from(selectedIds)
    };
  }, [selectedIds, items.length]);

  const isSelected = useCallback((id: T['id']) => selectedIds.has(id), [selectedIds]);

  const toggleSelection = useCallback((id: T['id']) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(item => item.id)));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectMultiple = useCallback((ids: T['id'][]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectionState.isAllSelected) {
      clearSelection();
    } else {
      selectAll();
    }
  }, [selectionState.isAllSelected, clearSelection, selectAll]);

  // Get selected items with full data
  const getSelectedItems = useCallback((): T[] => {
    return items.filter(item => selectedIds.has(item.id));
  }, [items, selectedIds]);

  // Bulk operations helpers
  const selectRange = useCallback((startId: T['id'], endId: T['id']) => {
    const startIndex = items.findIndex(item => item.id === startId);
    const endIndex = items.findIndex(item => item.id === endId);

    if (startIndex === -1 || endIndex === -1) return;

    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);

    const rangeIds = items.slice(start, end + 1).map(item => item.id);
    setSelectedIds(prev => new Set([...prev, ...rangeIds]));
  }, [items]);

  const deselectMultiple = useCallback((ids: T['id'][]) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      ids.forEach(id => newSet.delete(id));
      return newSet;
    });
  }, []);

  return {
    ...selectionState,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    selectMultiple,
    toggleSelectAll,
    getSelectedItems,
    selectRange,
    deselectMultiple
  };
};