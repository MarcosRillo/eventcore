/**
 * Internal Calendar Stats Service Tests
 *
 * Tests for the internal calendar stats API service.
 * Following TDD methodology.
 */

import { getInternalStats } from '../internal-calendar-stats.service';
import type { InternalStats } from '@/features/internal-calendar/types/internal-calendar.types';

// Mock fetch globally
global.fetch = jest.fn();

describe('InternalCalendarStatsService', () => {
  const mockToken = 'test-jwt-token-123';
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockStatsData }),
      });

      const result = await getInternalStats(mockToken);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/v1/internal-calendar/stats`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
            'Accept': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockStatsData);
    });

    it('includes Authorization header with token', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockStatsData }),
      });

      await getInternalStats(mockToken);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(fetchCall.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('returns stats data from response.data envelope', async () => {
      const customStats: InternalStats = {
        total_events: 100,
        total_event_types: 20,
        events_this_month: 50,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: customStats }),
      });

      const result = await getInternalStats(mockToken);

      expect(result).toEqual(customStats);
      expect(result.total_events).toBe(100);
      expect(result.total_event_types).toBe(20);
      expect(result.events_this_month).toBe(50);
    });

    it('throws error when API returns 401 Unauthorized', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(getInternalStats(mockToken)).rejects.toThrow(
        'Failed to fetch internal stats: 401 Unauthorized'
      );
    });

    it('throws error when API returns 500 Server Error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(getInternalStats(mockToken)).rejects.toThrow(
        'Failed to fetch internal stats: 500 Internal Server Error'
      );
    });

    it('throws error when API returns 403 Forbidden', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(getInternalStats(mockToken)).rejects.toThrow(
        'Failed to fetch internal stats: 403 Forbidden'
      );
    });

    it('handles zero values correctly', async () => {
      const zeroStats: InternalStats = {
        total_events: 0,
        total_event_types: 0,
        events_this_month: 0,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: zeroStats }),
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

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: largeStats }),
      });

      const result = await getInternalStats(mockToken);

      expect(result.total_events).toBe(9999);
      expect(result.total_event_types).toBe(999);
      expect(result.events_this_month).toBe(888);
    });
  });
});
