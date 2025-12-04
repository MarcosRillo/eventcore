/**
 * Tests for useAdminStats hook
 *
 * Tests the hook that fetches and manages admin approval statistics.
 * Following TDD: RED phase - these tests should fail initially.
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useAdminStats } from '../useAdminStats';
import { adminStatsService } from '@/features/entity-admin/services';
import type { AdminApprovalStats } from '@/features/entity-admin/types';

// Mock the service
jest.mock('@/features/entity-admin/services', () => ({
  adminStatsService: {
    getApprovalStats: jest.fn(),
    transformStatsToCardData: jest.fn(),
  },
}));

const mockedService = adminStatsService as jest.Mocked<typeof adminStatsService>;

describe('useAdminStats', () => {
  const mockStats: AdminApprovalStats = {
    total: 100,
    pending_internal_approval: 15,
    pending_public_approval: 8,
    approved_internal: 12,
    published: 45,
    requires_changes: 5,
    rejected: 10,
    draft: 3,
    cancelled: 2,
  };

  const mockCardData = [
    { key: 'pending_internal_approval', label: 'Pend. Interno', value: 15, color: 'warning' as const },
    { key: 'published', label: 'Publicados', value: 45, color: 'success' as const },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockedService.getApprovalStats.mockResolvedValue(mockStats);
    mockedService.transformStatsToCardData.mockReturnValue(mockCardData);
  });

  test('fetches stats on mount', async () => {
    const { result } = renderHook(() => useAdminStats());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedService.getApprovalStats).toHaveBeenCalledTimes(1);
    expect(result.current.stats).toEqual(mockStats);
  });

  test('returns card data for dashboard', async () => {
    const { result } = renderHook(() => useAdminStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.cardData).toEqual(mockCardData);
    expect(mockedService.transformStatsToCardData).toHaveBeenCalledWith(mockStats);
  });

  test('sets error state when fetch fails', async () => {
    const errorMessage = 'Network error';
    mockedService.getApprovalStats.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useAdminStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.stats).toBeNull();
  });

  test('provides refetch function to reload data', async () => {
    const { result } = renderHook(() => useAdminStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedService.getApprovalStats).toHaveBeenCalledTimes(1);

    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(mockedService.getApprovalStats).toHaveBeenCalledTimes(2);
  });

  test('clears error on successful refetch', async () => {
    // First call fails
    mockedService.getApprovalStats.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAdminStats());

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    // Second call succeeds
    mockedService.getApprovalStats.mockResolvedValueOnce(mockStats);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.stats).toEqual(mockStats);
  });

  test('returns correct loading state during fetch', async () => {
    // Delay the response
    mockedService.getApprovalStats.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve(mockStats), 100))
    );

    const { result } = renderHook(() => useAdminStats());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.stats).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toEqual(mockStats);
  });

  test('returns null cardData when stats are null', async () => {
    mockedService.getApprovalStats.mockRejectedValueOnce(new Error('Error'));

    const { result } = renderHook(() => useAdminStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toBeNull();
    expect(result.current.cardData).toEqual([]);
  });
});
