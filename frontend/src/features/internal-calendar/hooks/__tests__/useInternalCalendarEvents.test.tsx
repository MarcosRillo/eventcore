import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';
import type { InternalCalendarFilters } from '@/features/internal-calendar/types/internal-calendar.types';

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

describe('useInternalCalendarEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with loading state', () => {
    mockedFetcher.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useInternalCalendarEvents(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.events).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  test('should fetch events on mount and update state', async () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Event 1',
        start_date: '2025-12-10',
        end_date: '2025-12-11',
        status: { id: 1, status_code: 'approved_internal', status_name: 'Approved Internal', description: 'Event approved for internal use' },
        organization: { id: 1, name: 'Test Org' },
      },
      {
        id: 2,
        title: 'Event 2',
        start_date: '2025-12-15',
        end_date: '2025-12-16',
        status: { id: 2, status_code: 'published', status_name: 'Published', description: 'Event published' },
        organization: { id: 1, name: 'Test Org' },
      },
    ];
    mockedFetcher.mockResolvedValue({ data: mockEvents });

    const { result } = renderHook(() => useInternalCalendarEvents(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.events).toHaveLength(2);
    expect(result.current.events[0].title).toBe('Event 1');
    expect(result.current.error).toBeNull();
    expect(mockedFetcher).toHaveBeenCalled();
  });

  test('should fetch events with filters when provided', async () => {
    const mockFilters: InternalCalendarFilters = {
      status: 'published',
      start_date: '2025-12-01',
      end_date: '2025-12-31',
    };
    const mockEvents = [
      {
        id: 3,
        title: 'Filtered Event',
        start_date: '2025-12-20',
        end_date: '2025-12-21',
        status: { id: 3, status_code: 'published', status_name: 'Published', description: 'Event published' },
        organization: { id: 2, name: 'Org 2' },
      },
    ];
    mockedFetcher.mockResolvedValue({ data: mockEvents });

    const { result } = renderHook(() => useInternalCalendarEvents(mockFilters), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedFetcher).toHaveBeenCalledWith(
      expect.stringContaining('status=published')
    );
    expect(mockedFetcher).toHaveBeenCalledWith(
      expect.stringContaining('start_date=2025-12-01')
    );
    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.events).toHaveLength(1);
  });

  test('should handle fetch error', async () => {
    mockedFetcher.mockRejectedValue(new Error('Failed to fetch events'));

    const { result } = renderHook(() => useInternalCalendarEvents(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.events).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch events');
  });

  test('should refetch events when refetch is called', async () => {
    const mockEvents = [
      {
        id: 4,
        title: 'Refetched Event',
        start_date: '2025-12-25',
        end_date: '2025-12-26',
        status: { id: 1, status_code: 'approved_internal', status_name: 'Approved Internal', description: 'Event approved for internal use' },
        organization: { id: 1, name: 'Test Org' },
      },
    ];
    mockedFetcher.mockResolvedValue({ data: mockEvents });

    const { result } = renderHook(() => useInternalCalendarEvents(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const callCount = mockedFetcher.mock.calls.length;

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockedFetcher.mock.calls.length).toBeGreaterThan(callCount);
    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.events).toHaveLength(1);
  });
});
