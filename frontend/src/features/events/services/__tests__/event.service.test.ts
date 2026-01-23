/**
 * Tests for Event Service
 *
 * Coverage areas:
 * 1. CRUD Operations (getEvents, getEvent, createEvent, updateEvent, deleteEvent)
 * 2. Additional Operations (duplicateEvent, toggleFeatured, getStatistics)
 * 3. Approval Operations (approveInternal, requestPublic, approvePublic, requestChanges, rejectEvent)
 * 4. Error Handling (API failures, network errors)
 */

import { eventApprovalService,eventService } from '@/features/events/services/event.service';
import apiClient from '@/services/apiClient';
import { Event, EventFilters,EventFormData } from '@/types/event.types';

// Mock the API client
jest.mock('@/services/apiClient');

const mockEvent: Event = {
  id: 1,
  title: 'Test Event',
  description: 'Test Description',
  start_date: '2025-10-10 10:00:00',
  end_date: '2025-10-10 12:00:00',
  status: { id: 1, status_code: 'draft', status_name: 'Draft', description: 'Draft', workflow_order: 1, created_at: '', updated_at: '' },
  type: { id: 1, type_code: 'sede_unica', type_name: 'Single Location', description: 'Single location event', created_at: '', updated_at: '' },
  category_id: 1,
  category: { id: 1, name: 'Test Category', slug: 'test-category', entity_id: 1, is_active: true, created_at: '', updated_at: '' },
  locations: [],
  created_by: 1,
  is_featured: false,
  max_attendees: 100,
  metadata: {},
  approval_history: [],
  created_at: '2025-10-01 10:00:00',
  updated_at: '2025-10-01 10:00:00',
};

const mockEventFormData: EventFormData = {
  title: 'New Event',
  description: 'New Description',
  start_date: '2025-10-15 10:00:00',
  end_date: '2025-10-15 12:00:00',
  status: 'draft',
  type: 'sede_unica',
  category_id: 1,
  location_ids: [1],
  is_featured: false,
  max_attendees: 50,
};

describe('Event Service', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================
  // CRUD OPERATIONS
  // ============================================================

  describe('CRUD Operations', () => {

    test('getEvents should call API with filters', async () => {
      const filters: EventFilters = {
        status: 'draft',
        category_id: 2,
        page: 1,
        per_page: 15
      };
      const mockResponse = {
        data: {
          data: [mockEvent],
          meta: { current_page: 1, total: 1 },
          links: {}
        }
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventService.getEvents(filters);

      expect(apiClient.get).toHaveBeenCalled();
      // Verify the URL contains filter parameters
      const callArg = (apiClient.get as jest.Mock).mock.calls[0][0];
      expect(callArg).toContain('/events');
      expect(callArg).toContain('status=draft');
      expect(callArg).toContain('category_id=2');
      expect(result).toEqual(mockResponse.data);
    });

    test('getEvents should handle empty filters', async () => {
      const mockResponse = {
        data: {
          data: [mockEvent],
          meta: {},
          links: {}
        }
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await eventService.getEvents();

      expect(apiClient.get).toHaveBeenCalledWith('/events?');
    });

    test('getEvent should call API correctly', async () => {
      const mockResponse = {
        data: { data: mockEvent }
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventService.getEvent(1);

      expect(apiClient.get).toHaveBeenCalledWith('/events/1');
      expect(result).toEqual(mockEvent);
    });

    test('createEvent should call API correctly', async () => {
      const mockResponse = {
        data: { data: mockEvent }
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventService.createEvent(mockEventFormData);

      expect(apiClient.post).toHaveBeenCalledWith('/events', expect.objectContaining({
        ...mockEventFormData,
        status: 'draft',
        end_date: mockEventFormData.end_date
      }));
      expect(result).toEqual(mockEvent);
    });

    test('createEvent should use start_date as end_date if not provided', async () => {
      const dataWithoutEndDate = { ...mockEventFormData };
      delete dataWithoutEndDate.end_date;

      const mockResponse = {
        data: { data: mockEvent }
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await eventService.createEvent(dataWithoutEndDate);

      expect(apiClient.post).toHaveBeenCalledWith('/events', expect.objectContaining({
        end_date: dataWithoutEndDate.start_date
      }));
    });

    test('updateEvent should call API correctly', async () => {
      const updateData = { title: 'Updated Event' };
      const mockResponse = {
        data: { data: { ...mockEvent, ...updateData } }
      };
      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventService.updateEvent(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/events/1', updateData);
      expect(result).toEqual({ ...mockEvent, ...updateData });
    });

    test('updateEvent should auto-set end_date if only start_date is provided', async () => {
      const updateData = { start_date: '2025-11-01 10:00:00' };
      const mockResponse = {
        data: { data: mockEvent }
      };
      (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

      await eventService.updateEvent(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/events/1', expect.objectContaining({
        start_date: updateData.start_date,
        end_date: updateData.start_date
      }));
    });

    test('deleteEvent should call API correctly', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({});

      await eventService.deleteEvent(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/events/1');
    });
  });

  // ============================================================
  // ADDITIONAL OPERATIONS
  // ============================================================

  describe('Additional Operations', () => {

    test('duplicateEvent should call API correctly', async () => {
      const overrides = { title: 'Duplicated Event' };
      const mockResponse = {
        data: { data: { ...mockEvent, ...overrides } }
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventService.duplicateEvent(1, overrides);

      expect(apiClient.post).toHaveBeenCalledWith('/events/1/duplicate', overrides);
      expect(result).toEqual({ ...mockEvent, ...overrides });
    });

    test('duplicateEvent should work without overrides', async () => {
      const mockResponse = {
        data: { data: mockEvent }
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await eventService.duplicateEvent(1);

      expect(apiClient.post).toHaveBeenCalledWith('/events/1/duplicate', {});
    });

    test('toggleFeatured should call API correctly', async () => {
      const mockResponse = {
        data: { data: { ...mockEvent, is_featured: true } }
      };
      (apiClient.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventService.toggleFeatured(1);

      expect(apiClient.patch).toHaveBeenCalledWith('/events/1/toggle-featured');
      expect(result.is_featured).toBe(true);
    });

    test('getStatistics should call API correctly', async () => {
      const mockStats = {
        total: 100,
        published: 80,
        draft: 20,
        pending: 10,
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockStats });

      const result = await eventService.getStatistics();

      expect(apiClient.get).toHaveBeenCalledWith('/events/statistics');
      expect(result).toEqual(mockStats);
    });
  });

  // ============================================================
  // APPROVAL OPERATIONS
  // ============================================================

  describe('Approval Operations', () => {

    test('approveInternal should call API correctly', async () => {
      const mockResponse = {
        data: { data: { ...mockEvent, status_id: 2 } }
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventApprovalService.approveInternal(1, 'Approved');

      expect(apiClient.post).toHaveBeenCalledWith('/events/1/approve-internal', { comment: 'Approved' });
      expect(result).toEqual({ ...mockEvent, status_id: 2 });
    });

    test('approveInternal should work without comment', async () => {
      const mockResponse = {
        data: { data: mockEvent }
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await eventApprovalService.approveInternal(1);

      expect(apiClient.post).toHaveBeenCalledWith('/events/1/approve-internal', {});
    });

    test('requestPublic should call API correctly', async () => {
      const mockResponse = {
        data: { data: { ...mockEvent, status_id: 3 } }
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventApprovalService.requestPublic(1, 'Ready for public');

      expect(apiClient.post).toHaveBeenCalledWith('/events/1/request-public', { comment: 'Ready for public' });
      expect(typeof result.status === 'object' ? result.status.id : result.status).toBeDefined();
    });

    test('approvePublic should call API correctly', async () => {
      const mockResponse = {
        data: { data: { ...mockEvent, status_id: 4 } }
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventApprovalService.approvePublic(1);

      expect(apiClient.post).toHaveBeenCalledWith('/events/1/approve-public', {});
      expect(typeof result.status === 'object' ? result.status.id : result.status).toBeDefined();
    });

    test('requestChanges should call API correctly', async () => {
      const mockResponse = {
        data: { data: { ...mockEvent, status_id: 5 } }
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventApprovalService.requestChanges(1, 'Update description');

      expect(apiClient.post).toHaveBeenCalledWith('/events/1/request-changes', { comment: 'Update description' });
      expect(typeof result.status === 'object' ? result.status.id : result.status).toBeDefined();
    });

    test('rejectEvent should call API correctly', async () => {
      const mockResponse = {
        data: { data: { ...mockEvent, status_id: 6 } }
      };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventApprovalService.rejectEvent(1, 'Does not meet criteria');

      expect(apiClient.post).toHaveBeenCalledWith('/events/1/reject', { comment: 'Does not meet criteria' });
      expect(typeof result.status === 'object' ? result.status.id : result.status).toBeDefined();
    });

    test('getApprovalStatistics should call API correctly', async () => {
      const mockStats = {
        pending_internal: 5,
        pending_public: 3,
        approved: 50,
        rejected: 2,
      };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockStats });

      const result = await eventApprovalService.getApprovalStatistics();

      expect(apiClient.get).toHaveBeenCalledWith('/events/approval/statistics');
      expect(result).toEqual(mockStats);
    });

    test('getEventsByStatus should call API correctly', async () => {
      const filters = { page: 1, per_page: 10 };
      const mockResponse = {
        data: {
          data: [mockEvent],
          meta: {},
          links: {}
        }
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await eventApprovalService.getEventsByStatus('pending_internal_approval', filters);

      const callArg = (apiClient.get as jest.Mock).mock.calls[0][0];
      expect(callArg).toContain('/events/approval-status/pending_internal');
      expect(callArg).toContain('page=1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  // ============================================================
  // ERROR HANDLING
  // ============================================================

  describe('Error Handling', () => {

    test('should throw error on getEvents API failure', async () => {
      const mockError = new Error('Network Error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(eventService.getEvents()).rejects.toThrow('Network Error');
    });

    test('should throw error on createEvent API failure', async () => {
      const mockError = new Error('Validation Error');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(eventService.createEvent(mockEventFormData)).rejects.toThrow('Validation Error');
    });

    test('should throw error on updateEvent API failure', async () => {
      const mockError = new Error('Not Found');
      (apiClient.put as jest.Mock).mockRejectedValue(mockError);

      await expect(eventService.updateEvent(1, { title: 'New' })).rejects.toThrow('Not Found');
    });

    test('should throw error on deleteEvent API failure', async () => {
      const mockError = new Error('Forbidden');
      (apiClient.delete as jest.Mock).mockRejectedValue(mockError);

      await expect(eventService.deleteEvent(1)).rejects.toThrow('Forbidden');
    });

    test('should throw error on approval operation failure', async () => {
      const mockError = new Error('Unauthorized');
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(eventApprovalService.approveInternal(1)).rejects.toThrow('Unauthorized');
    });

    test('should handle 404 errors correctly', async () => {
      const mockError = { response: { status: 404, data: { message: 'Event not found' } } };
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      await expect(eventService.getEvent(999)).rejects.toEqual(mockError);
    });

    test('should handle 422 validation errors correctly', async () => {
      const mockError = {
        response: {
          status: 422,
          data: {
            message: 'Validation failed',
            errors: { title: ['Title is required'] }
          }
        }
      };
      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      await expect(eventService.createEvent(mockEventFormData)).rejects.toEqual(mockError);
    });
  });

  // ============================================================
  // EDGE CASES
  // ============================================================

  describe('Edge Cases', () => {

    test('should handle filters with undefined values', async () => {
      const filters: EventFilters = {
        status: 'draft',
        category_id: undefined,
        search: ''
      };
      const mockResponse = { data: { data: [], meta: {}, links: {} } };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      await eventService.getEvents(filters);

      const callArg = (apiClient.get as jest.Mock).mock.calls[0][0];
      // Should only include status, not undefined or empty values
      expect(callArg).toContain('status=draft');
      expect(callArg).not.toContain('category_id');
      expect(callArg).not.toContain('search');
    });

    test('should handle event data with null values', async () => {
      const dataWithNulls = {
        ...mockEventFormData,
        description: null as unknown as string,
        metadata: null as unknown as Record<string, unknown>
      };
      const mockResponse = { data: { data: mockEvent } };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await eventService.createEvent(dataWithNulls);

      expect(apiClient.post).toHaveBeenCalled();
    });

    test('should handle approval with empty comment as no comment', async () => {
      const mockResponse = { data: { data: mockEvent } };
      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await eventApprovalService.approveInternal(1, '');

      // Empty string is treated as falsy, so no comment object is sent
      expect(apiClient.post).toHaveBeenCalledWith('/events/1/approve-internal', {});
    });
  });
});
