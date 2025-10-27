import { renderHook, waitFor } from '@testing-library/react';
import { useOrganizerStats } from '../useOrganizerStats';
import { organizerStatsService } from '../../services/organizerStatsService';

// Mock the service
jest.mock('../../services/organizerStatsService');

describe('useOrganizerStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with loading state', () => {
    // Arrange
    (organizerStatsService.getStats as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    // Act
    const { result } = renderHook(() => useOrganizerStats());

    // Assert
    expect(result.current.loading).toBe(true);
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('should fetch stats on mount and update state', async () => {
    // Arrange
    const mockStats = {
      total_events: 10,
      pending_internal: 2,
      approved_internal: 3,
      pending_public: 1,
      published: 4,
      requires_changes: 0,
      rejected: 0,
    };
    (organizerStatsService.getStats as jest.Mock).mockResolvedValue(mockStats);

    // Act
    const { result } = renderHook(() => useOrganizerStats());

    // Assert - Initial state
    expect(result.current.loading).toBe(true);

    // Wait for async operation
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert - Final state
    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.error).toBeNull();
    expect(organizerStatsService.getStats).toHaveBeenCalledTimes(1);
  });

  test('should handle fetch error', async () => {
    // Arrange
    const mockError = new Error('Failed to fetch');
    (organizerStatsService.getStats as jest.Mock).mockRejectedValue(mockError);

    // Act
    const { result } = renderHook(() => useOrganizerStats());

    // Wait for async operation
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBe('Failed to fetch');
  });

  test('should refetch stats when refetch is called', async () => {
    // Arrange
    const mockStats = {
      total_events: 5,
      pending_internal: 1,
      approved_internal: 1,
      pending_public: 1,
      published: 2,
      requires_changes: 0,
      rejected: 0,
    };
    (organizerStatsService.getStats as jest.Mock).mockResolvedValue(mockStats);

    // Act
    const { result } = renderHook(() => useOrganizerStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear previous calls
    jest.clearAllMocks();

    // Refetch
    await result.current.refetch();

    // Assert
    expect(organizerStatsService.getStats).toHaveBeenCalledTimes(1);
    expect(result.current.stats).toEqual(mockStats);
  });

  test('should handle non-Error thrown values', async () => {
    // Arrange
    (organizerStatsService.getStats as jest.Mock).mockRejectedValue('String error');

    // Act
    const { result } = renderHook(() => useOrganizerStats());

    // Wait for async operation
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(result.current.error).toBe('Failed to fetch stats');
  });
});
