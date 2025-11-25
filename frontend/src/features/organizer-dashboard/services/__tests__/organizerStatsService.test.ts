import { organizerStatsService } from '@/features/organizer-dashboard/services/organizerStatsService';
import apiClient from '@/services/apiClient';

// Mock the API client
jest.mock('@/services/apiClient');

describe('organizerStatsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    test('should fetch stats and return data correctly', async () => {
      // Arrange
      const mockResponse = {
        data: {
          data: {
            total_events: 12,
            pending_internal: 2,
            approved_internal: 3,
            pending_public: 1,
            published: 4,
            requires_changes: 1,
            rejected: 1,
          },
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await organizerStatsService.getStats();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/organizer/stats');
      expect(result).toEqual(mockResponse.data.data);
      expect(result.total_events).toBe(12);
      expect(result.pending_internal).toBe(2);
    });

    test('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(organizerStatsService.getStats()).rejects.toThrow('Network error');
      expect(apiClient.get).toHaveBeenCalledWith('/organizer/stats');
    });

    test('should handle 401 unauthorized error', async () => {
      // Arrange
      const mockError = { response: { status: 401 } };
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(organizerStatsService.getStats()).rejects.toEqual(mockError);
    });

    test('should handle malformed response', async () => {
      // Arrange
      const mockResponse = { data: null };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act & Assert
      // Should handle gracefully or throw appropriate error
      await expect(organizerStatsService.getStats()).rejects.toThrow();
    });
  });
});
