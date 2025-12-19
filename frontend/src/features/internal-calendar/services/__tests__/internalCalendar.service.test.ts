import { internalCalendarService } from '@/features/internal-calendar/services/internalCalendar.service';
import apiClient from '@/services/apiClient';
import type { InternalCalendarFilters } from '@/features/internal-calendar/types/internal-calendar.types';

// Mock the API client
jest.mock('@/services/apiClient');

describe('internalCalendarService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    test('should fetch events without filters and return data correctly', async () => {
      // Arrange
      const mockResponse = {
        data: {
          data: [
            {
              id: 1,
              title: 'Test Event 1',
              start_date: '2025-12-10',
              end_date: '2025-12-11',
              status: { id: 1, status_code: 'approved_internal', status_name: 'Approved Internal', description: 'Event approved for internal use' },
              organization: { id: 1, name: 'Test Org' },
            },
            {
              id: 2,
              title: 'Test Event 2',
              start_date: '2025-12-15',
              end_date: '2025-12-16',
              status: { id: 2, status_code: 'published', status_name: 'Published', description: 'Event published' },
              organization: { id: 1, name: 'Test Org' },
            },
          ],
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await internalCalendarService.getEvents();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/internal-calendar/events', {
        params: {},
      });
      expect(result).toEqual(mockResponse.data.data);
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Test Event 1');
      expect(result[0].status.status_code).toBe('approved_internal');
    });

    test('should fetch events with filters and pass them as query params', async () => {
      // Arrange
      const filters: InternalCalendarFilters = {
        status: 'published',
        start_date: '2025-12-01',
        end_date: '2025-12-31',
        event_type_id: 5,
      };
      const mockResponse = {
        data: {
          data: [
            {
              id: 3,
              title: 'Filtered Event',
              start_date: '2025-12-20',
              end_date: '2025-12-21',
              status: { id: 3, status_code: 'published', status_name: 'Published', description: 'Event published' },
              organization: { id: 2, name: 'Org 2' },
            },
          ],
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await internalCalendarService.getEvents(filters);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/internal-calendar/events', {
        params: filters,
      });
      expect(result).toEqual(mockResponse.data.data);
      expect(result).toHaveLength(1);
      expect(result[0].status.status_code).toBe('published');
    });

    test('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(internalCalendarService.getEvents()).rejects.toThrow('Network error');
      expect(apiClient.get).toHaveBeenCalledWith('/internal-calendar/events', {
        params: {},
      });
    });

    test('should handle 401 unauthorized error', async () => {
      // Arrange
      const mockError = { response: { status: 401 } };
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(internalCalendarService.getEvents()).rejects.toEqual(mockError);
    });

    test('should handle malformed response gracefully', async () => {
      // Arrange
      const mockResponse = { data: null };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(internalCalendarService.getEvents()).rejects.toThrow();
    });
  });

  describe('getAvailableStatuses', () => {
    test('should fetch available statuses and return data correctly', async () => {
      // Arrange
      const mockResponse = {
        data: {
          data: ['approved_internal', 'pending_public_approval', 'published'],
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await internalCalendarService.getAvailableStatuses();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/internal-calendar/event-statuses');
      expect(result).toEqual(mockResponse.data.data);
      expect(result).toHaveLength(3);
      expect(result).toContain('approved_internal');
      expect(result).toContain('pending_public_approval');
      expect(result).toContain('published');
    });

    test('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Failed to fetch statuses');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(internalCalendarService.getAvailableStatuses()).rejects.toThrow(
        'Failed to fetch statuses'
      );
    });
  });
});
