/**
 * Generic Table Sorting Hook
 * Provides sorting functionality for any table data
 */

import { useMemo,useState } from 'react';

interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

const getNestedValue = (obj: unknown, path: string): unknown => {
  return path.split('.').reduce((current, key) => (current as Record<string, unknown>)?.[key], obj);
};

const compareValues = (a: unknown, b: unknown): number => {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  return String(a).localeCompare(String(b));
};

export const useTableSorting = <T>(data: T[], initialSortColumn?: string) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(
    initialSortColumn ? { column: initialSortColumn, direction: 'asc' } : null
  );

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.column);
      const bValue = getNestedValue(b, sortConfig.column);

      if (sortConfig.direction === 'asc') {
        return compareValues(aValue, bValue);
      } else {
        return compareValues(bValue, aValue);
      }
    });
  }, [data, sortConfig]);

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev?.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearSort = () => {
    setSortConfig(null);
  };

  return {
    sortConfig,
    sortedData,
    handleSort,
    clearSort,
    isSortedBy: (column: string) => sortConfig?.column === column,
    getSortDirection: (column: string) =>
      sortConfig?.column === column ? sortConfig.direction : null
  };
};