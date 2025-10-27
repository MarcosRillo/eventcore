import apiClient from '@/services/apiClient';
import { OrganizerStats } from '../types/organizerStats.types';

export const organizerStatsService = {
  /**
   * Get organizer statistics from API
   * @returns Promise<OrganizerStats>
   * @throws Error if API call fails or response is malformed
   */
  getStats: async (): Promise<OrganizerStats> => {
    try {
      const response = await apiClient.get<{ data: OrganizerStats }>('/organizer/stats');

      // Validate response structure
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response structure from API');
      }

      return response.data.data;
    } catch (error) {
      // Re-throw to let caller handle
      throw error;
    }
  },
};
