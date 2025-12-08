import apiClient from '@/services/apiClient';
import type {
  InternalCalendarEvent,
  InternalCalendarFilters,
  InternalCalendarStatusCode,
} from '@/features/internal-calendar/types/internal-calendar.types';

/**
 * Internal Calendar Service
 *
 * Handles API calls for the internal calendar feature.
 * Provides methods to fetch events and available statuses.
 */
export const internalCalendarService = {
  /**
   * Fetch internal calendar events with optional filters
   *
   * @param filters - Optional filters for events (status, date range, event type)
   * @returns Promise resolving to array of internal calendar events
   * @throws Error if API call fails or response is malformed
   */
  async getEvents(
    filters: InternalCalendarFilters = {}
  ): Promise<InternalCalendarEvent[]> {
    try {
      const response = await apiClient.get<{ data: InternalCalendarEvent[] }>(
        '/internal-calendar/events',
        {
          params: filters,
        }
      );

      // Validate response structure
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response structure');
      }

      return response.data.data;
    } catch (error) {
      // Re-throw error for handling by caller
      throw error;
    }
  },

  /**
   * Fetch available status codes for filtering
   *
   * Returns the list of status codes that are visible in the internal calendar.
   * Used to populate filter dropdowns.
   *
   * @returns Promise resolving to array of status codes
   * @throws Error if API call fails
   */
  async getAvailableStatuses(): Promise<InternalCalendarStatusCode[]> {
    try {
      const response = await apiClient.get<{ data: InternalCalendarStatusCode[] }>(
        '/internal-calendar/event-statuses'
      );

      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};
