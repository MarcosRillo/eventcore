import { act,renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { useOrganizerStats } from '@/features/organizer-dashboard/hooks/useOrganizerStats';

jest.mock('@/lib/swr/fetcher', () => ({
  apiFetcher: jest.fn(),
}));

import { apiFetcher } from '@/lib/swr/fetcher';

const mockedFetcher = apiFetcher as jest.Mock;

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

describe('useOrganizerStats', () => {
  const mockStats = {
    total_events: 10,
    pending_internal: 2,
    approved_internal: 3,
    pending_public: 1,
    published: 4,
    requires_changes: 0,
    rejected: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedFetcher.mockResolvedValue({ data: mockStats });
  });

  test('should initialize with loading state', () => {
    mockedFetcher.mockImplementation(
      () => new Promise(() => {})
    );

    const { result } = renderHook(() => useOrganizerStats(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('should fetch stats on mount and update state', async () => {
    const { result } = renderHook(() => useOrganizerStats(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.error).toBeNull();
    expect(mockedFetcher).toHaveBeenCalled();
  });

  test('should handle fetch error', async () => {
    const mockError = new Error('Failed to fetch');
    mockedFetcher.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useOrganizerStats(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBe('Failed to fetch');
  });

  test('should refetch stats when refetch is called', async () => {
    const { result } = renderHook(() => useOrganizerStats(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const callCount = mockedFetcher.mock.calls.length;

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockedFetcher.mock.calls.length).toBeGreaterThan(callCount);
    expect(result.current.stats).toEqual(mockStats);
  });

  test('should handle non-Error thrown values', async () => {
    mockedFetcher.mockRejectedValueOnce('String error');

    const { result } = renderHook(() => useOrganizerStats(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
  });
});
