import type {
  InternalCalendarEvent,
  InternalCalendarFilters,
  InternalCalendarStatusCode,
} from '@/features/internal-calendar/types/internal-calendar.types';
import apiClient from '@/services/apiClient';

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
   * Fetch a single event by ID
   *
   * @param id - Event ID to fetch
   * @returns Promise resolving to the event or null if not found
   * @throws Error if API call fails (except 404)
   */
  async getEventById(id: number): Promise<InternalCalendarEvent | null> {
    try {
      const response = await apiClient.get<{ data: InternalCalendarEvent }>(
        `/internal-calendar/events/${id}`
      );

      if (!response.data || !response.data.data) {
        return null;
      }

      return response.data.data;
    } catch (error) {
      // Return null for 404 (not found)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
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
