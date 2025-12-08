import { renderHook, waitFor, act } from '@testing-library/react';
import { useInternalCalendarEvents } from '@/features/internal-calendar/hooks/useInternalCalendarEvents';
import { internalCalendarService } from '@/features/internal-calendar/services/internalCalendar.service';
import type { InternalCalendarFilters } from '@/features/internal-calendar/types/internal-calendar.types';

// Mock the service
jest.mock('../../services/internalCalendar.service');

describe('useInternalCalendarEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with loading state', () => {
    // Arrange
    (internalCalendarService.getEvents as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    // Act
    const { result } = renderHook(() => useInternalCalendarEvents());

    // Assert
    expect(result.current.loading).toBe(true);
    expect(result.current.events).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  test('should fetch events on mount and update state', async () => {
    // Arrange
    const mockEvents = [
      {
        id: 1,
        title: 'Event 1',
        start_date: '2025-12-10',
        end_date: '2025-12-11',
        status: { id: 1, status_code: 'approved_internal', name: 'Approved Internal' },
        organization: { id: 1, name: 'Test Org' },
      },
      {
        id: 2,
        title: 'Event 2',
        start_date: '2025-12-15',
        end_date: '2025-12-16',
        status: { id: 2, status_code: 'published', name: 'Published' },
        organization: { id: 1, name: 'Test Org' },
      },
    ];
    (internalCalendarService.getEvents as jest.Mock).mockResolvedValue(mockEvents);

    // Act
    const { result } = renderHook(() => useInternalCalendarEvents());

    // Assert - Initial state
    expect(result.current.loading).toBe(true);

    // Wait for async operation
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert - Final state
    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.events).toHaveLength(2);
    expect(result.current.events[0].title).toBe('Event 1');
    expect(result.current.error).toBeNull();
    expect(internalCalendarService.getEvents).toHaveBeenCalled();
  });

  test('should fetch events with filters when provided', async () => {
    // Arrange
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
        status: { id: 3, status_code: 'published', name: 'Published' },
        organization: { id: 2, name: 'Org 2' },
      },
    ];
    (internalCalendarService.getEvents as jest.Mock).mockResolvedValue(mockEvents);

    // Act
    const { result } = renderHook(() => useInternalCalendarEvents(mockFilters));

    // Wait for async operation
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(internalCalendarService.getEvents).toHaveBeenCalledWith(mockFilters);
    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.events).toHaveLength(1);
  });

  test('should handle fetch error', async () => {
    // Arrange
    const mockError = new Error('Failed to fetch events');
    (internalCalendarService.getEvents as jest.Mock).mockRejectedValue(mockError);

    // Act
    const { result } = renderHook(() => useInternalCalendarEvents());

    // Wait for async operation
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(result.current.events).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch events');
  });

  test('should refetch events when refetch is called', async () => {
    // Arrange
    const mockEvents = [
      {
        id: 4,
        title: 'Refetched Event',
        start_date: '2025-12-25',
        end_date: '2025-12-26',
        status: { id: 1, status_code: 'approved_internal', name: 'Approved Internal' },
        organization: { id: 1, name: 'Test Org' },
      },
    ];
    (internalCalendarService.getEvents as jest.Mock).mockResolvedValue(mockEvents);

    // Act
    const { result } = renderHook(() => useInternalCalendarEvents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear previous calls
    jest.clearAllMocks();

    // Refetch
    await act(async () => {
      await result.current.refetch();
    });

    // Assert
    expect(internalCalendarService.getEvents).toHaveBeenCalledTimes(1);
    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.events).toHaveLength(1);
  });

  test('should handle non-Error thrown values', async () => {
    // Arrange
    (internalCalendarService.getEvents as jest.Mock).mockRejectedValue('String error');

    // Act
    const { result } = renderHook(() => useInternalCalendarEvents());

    // Wait for async operation
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(result.current.error).toBe('Failed to fetch internal calendar events');
    expect(result.current.events).toEqual([]);
  });
});
