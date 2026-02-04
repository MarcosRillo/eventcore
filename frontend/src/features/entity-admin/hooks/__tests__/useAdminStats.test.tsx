import { act,renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { useAdminStats } from '@/features/entity-admin/hooks/useAdminStats';
import { adminStatsService } from '@/features/entity-admin/services';
import type { AdminApprovalStats } from '@/features/entity-admin/types';

jest.mock('@/lib/swr/fetcher', () => ({
  apiFetcher: jest.fn(),
}));

jest.mock('@/features/entity-admin/services', () => ({
  adminStatsService: {
    transformStatsToCardData: jest.fn(),
  },
}));

import { apiFetcher } from '@/lib/swr/fetcher';

const mockedFetcher = apiFetcher as jest.Mock;
const mockedService = adminStatsService as jest.Mocked<typeof adminStatsService>;

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

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
    mockedFetcher.mockResolvedValue({ data: mockStats });
    mockedService.transformStatsToCardData.mockReturnValue(mockCardData);
  });

  test('fetches stats on mount', async () => {
    const { result } = renderHook(() => useAdminStats(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedFetcher).toHaveBeenCalled();
    expect(result.current.stats).toEqual(mockStats);
  });

  test('returns card data for dashboard', async () => {
    const { result } = renderHook(() => useAdminStats(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.cardData).toEqual(mockCardData);
    expect(mockedService.transformStatsToCardData).toHaveBeenCalledWith(mockStats);
  });

  test('sets error state when fetch fails', async () => {
    const errorMessage = 'Network error';
    mockedFetcher.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useAdminStats(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.stats).toBeNull();
  });

  test('provides refetch function to reload data', async () => {
    const { result } = renderHook(() => useAdminStats(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const callCount = mockedFetcher.mock.calls.length;

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockedFetcher.mock.calls.length).toBeGreaterThan(callCount);
  });

  test('clears error on successful refetch', async () => {
    mockedFetcher.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAdminStats(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    mockedFetcher.mockResolvedValueOnce({ data: mockStats });

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
    expect(result.current.stats).toEqual(mockStats);
  });

  test('returns correct loading state during fetch', async () => {
    mockedFetcher.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: mockStats }), 100))
    );

    const { result } = renderHook(() => useAdminStats(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.stats).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toEqual(mockStats);
  });

  test('returns null cardData when stats are null', async () => {
    mockedFetcher.mockRejectedValueOnce(new Error('Error'));

    const { result } = renderHook(() => useAdminStats(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toBeNull();
    expect(result.current.cardData).toEqual([]);
  });
});
