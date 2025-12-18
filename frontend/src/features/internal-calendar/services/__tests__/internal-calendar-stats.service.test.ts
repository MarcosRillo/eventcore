/**
 * Internal Calendar Stats Service Tests
 *
 * Tests for the internal calendar stats API service.
 * Following TDD methodology.
 * Refactored to mock apiClient instead of fetch (Dec 10, 2025).
 */

import { getInternalStats } from '../internal-calendar-stats.service';
import apiClient from '@/services/apiClient';
import type { InternalStats } from '@/features/internal-calendar/types/internal-calendar.types';

// Mock apiClient
jest.mock('@/services/apiClient');

describe('InternalCalendarStatsService', () => {
  const mockToken = 'test-jwt-token-123';
  const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInternalStats', () => {
    const mockStatsData: InternalStats = {
      total_events: 42,
      total_event_types: 8,
      events_this_month: 15,
    };

    it('fetches stats successfully with correct endpoint', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: { data: mockStatsData },
      });

      const result = await getInternalStats(mockToken);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        '/internal-calendar/stats',
        {
          headers: {
            'Authorization': `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockStatsData);
    });

    it('includes Authorization header with token when provided', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: { data: mockStatsData },
      });

      await getInternalStats(mockToken);

      const getCall = mockedApiClient.get.mock.calls[0];
      expect(getCall[1]).toEqual({
        headers: {
          'Authorization': `Bearer ${mockToken}`,
        },
      });
    });

    it('returns stats data from response.data envelope', async () => {
      const customStats: InternalStats = {
        total_events: 100,
        total_event_types: 20,
        events_this_month: 50,
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: { data: customStats },
      });

      const result = await getInternalStats(mockToken);

      expect(result).toEqual(customStats);
      expect(result.total_events).toBe(100);
      expect(result.total_event_types).toBe(20);
      expect(result.events_this_month).toBe(50);
    });

    it('throws error when API returns error', async () => {
      const errorMessage = 'Request failed with status code 401';
      mockedApiClient.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(getInternalStats(mockToken)).rejects.toThrow(
        `Failed to fetch internal stats: ${errorMessage}`
      );
    });

    it('throws error when response structure is invalid (missing data)', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: {},  // Missing data.data
      });

      await expect(getInternalStats(mockToken)).rejects.toThrow(
        'Failed to fetch internal stats: Invalid response structure from stats endpoint'
      );
    });

    it('throws error when response structure is invalid (null data)', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: { data: null },  // null instead of stats object
      });

      await expect(getInternalStats(mockToken)).rejects.toThrow(
        'Failed to fetch internal stats: Invalid response structure from stats endpoint'
      );
    });

    it('handles zero values correctly', async () => {
      const zeroStats: InternalStats = {
        total_events: 0,
        total_event_types: 0,
        events_this_month: 0,
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: { data: zeroStats },
      });

      const result = await getInternalStats(mockToken);

      expect(result).toEqual(zeroStats);
      expect(result.total_events).toBe(0);
    });

    it('handles large numbers correctly', async () => {
      const largeStats: InternalStats = {
        total_events: 9999,
        total_event_types: 999,
        events_this_month: 888,
      };

      mockedApiClient.get.mockResolvedValueOnce({
        data: { data: largeStats },
      });

      const result = await getInternalStats(mockToken);

      expect(result.total_events).toBe(9999);
      expect(result.total_event_types).toBe(999);
      expect(result.events_this_month).toBe(888);
    });
  });
});
