/**
 * Generic Pagination Hook
 * Provides pagination functionality for any data set
 */

import { useMemo,useState } from 'react';

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNext: boolean;
  hasPrev: boolean;
  itemsPerPage: number;
  totalItems: number;
}

export const usePagination = (totalItems: number, itemsPerPage = 10, initialPage = 1) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const paginationState = useMemo((): PaginationState => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      currentPage,
      totalPages,
      startIndex,
      endIndex,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      itemsPerPage,
      totalItems
    };
  }, [currentPage, totalItems, itemsPerPage]);

  const goToPage = (page: number) => {
    const clampedPage = Math.max(1, Math.min(page, paginationState.totalPages));
    setCurrentPage(clampedPage);
  };

  const goToNext = () => {
    if (paginationState.hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (paginationState.hasPrev) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToFirst = () => {
    setCurrentPage(1);
  };

  const goToLast = () => {
    setCurrentPage(paginationState.totalPages);
  };

  const resetPage = () => {
    setCurrentPage(1);
  };

  // Helper to paginate data locally
  const paginateData = <T>(data: T[]): T[] => {
    return data.slice(paginationState.startIndex, paginationState.endIndex);
  };

  return {
    ...paginationState,
    goToPage,
    goToNext,
    goToPrev,
    goToFirst,
    goToLast,
    resetPage,
    paginateData
  };
};