import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { useEventManager } from '@/features/events/hooks/useEventManager';
import * as eventService from '@/features/events/services/event.service';
import type { Event, EventFormData } from '@/types/event.types';

jest.mock('@/lib/swr/fetcher', () => ({
  apiFetcher: jest.fn(),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: 1, name: 'Test User', role: 'admin' },
  }),
}));

jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    isAdmin: () => true,
    isOrganizer: () => false,
    canAccessAdmin: () => true,
  }),
}));

jest.mock('@/features/events/services/event.service');

import { apiFetcher } from '@/lib/swr/fetcher';

const mockedFetcher = apiFetcher as jest.Mock;

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

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

const mockAdminService = {
  getEvents: jest.fn(),
  getEvent: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
  duplicateEvent: jest.fn(),
  toggleFeatured: jest.fn(),
  getStatistics: jest.fn(),
  approval: {
    approveInternal: jest.fn(),
    requestPublic: jest.fn(),
    approvePublic: jest.fn(),
    requestChanges: jest.fn(),
    rejectEvent: jest.fn(),
    getApprovalStatistics: jest.fn(),
  },
};

const mockEventsResponse = {
  data: [mockEvent],
  meta: {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 1,
    from: 1,
    to: 1,
    path: 'http://api.example.com/events',
    links: [],
  },
};

describe('useEventManager Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (eventService.getEventServiceForContext as jest.Mock).mockReturnValue(mockAdminService);
    mockedFetcher.mockResolvedValue(mockEventsResponse);
  });

  describe('CRUD Operations', () => {
    test('should create event successfully', async () => {
      const newEvent = { ...mockEvent, id: 2, title: 'New Event' };
      mockAdminService.createEvent.mockResolvedValue(newEvent);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createEvent(mockEventFormData);
      });

      expect(mockAdminService.createEvent).toHaveBeenCalledWith(mockEventFormData);
      expect(result.current.isCreateModalOpen).toBe(false);
    });

    test('should update event successfully', async () => {
      const updatedEvent = { ...mockEvent, title: 'Updated Event' };
      mockAdminService.updateEvent.mockResolvedValue(updatedEvent);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updateData = { title: 'Updated Event' };

      await act(async () => {
        await result.current.updateEvent(1, updateData);
      });

      expect(mockAdminService.updateEvent).toHaveBeenCalledWith(1, updateData);
      expect(result.current.isEditModalOpen).toBe(false);
      expect(result.current.currentEvent).toBeNull();
    });

    test('should delete event successfully', async () => {
      mockAdminService.deleteEvent.mockResolvedValue(undefined);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteEvent(1);
      });

      expect(mockAdminService.deleteEvent).toHaveBeenCalledWith(1);
      expect(result.current.isDeleteModalOpen).toBe(false);
      expect(result.current.currentEvent).toBeNull();
    });

    test('should duplicate event successfully', async () => {
      const duplicatedEvent = { ...mockEvent, id: 3, title: 'Test Event (Copy)' };
      mockAdminService.duplicateEvent.mockResolvedValue(duplicatedEvent);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.duplicateEvent(1, { title: 'Test Event (Copy)' });
      });

      expect(mockAdminService.duplicateEvent).toHaveBeenCalledWith(1, { title: 'Test Event (Copy)' });
    });

    test('should toggle featured status successfully', async () => {
      const updatedEvent = { ...mockEvent, is_featured: true };
      mockAdminService.toggleFeatured.mockResolvedValue(updatedEvent);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleFeatured(1);
      });

      expect(mockAdminService.toggleFeatured).toHaveBeenCalledWith(1);
    });
  });

  describe('Approval Workflow', () => {
    test('should approve event internally', async () => {
      const approvedEvent = { ...mockEvent, status_id: 2 };
      mockAdminService.approval.approveInternal.mockResolvedValue(approvedEvent);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.approveInternal(1, 'Looks good');
      });

      expect(mockAdminService.approval.approveInternal).toHaveBeenCalledWith(1, 'Looks good');
      expect(result.current.isApprovalModalOpen).toBe(false);
      expect(result.current.currentEvent).toBeNull();
    });

    test('should request public approval', async () => {
      const updatedEvent = { ...mockEvent, status_id: 3 };
      mockAdminService.approval.requestPublic.mockResolvedValue(updatedEvent);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.requestPublic(1, 'Ready for public');
      });

      expect(mockAdminService.approval.requestPublic).toHaveBeenCalledWith(1, 'Ready for public');
      expect(result.current.isApprovalModalOpen).toBe(false);
    });

    test('should approve event for public', async () => {
      const approvedEvent = { ...mockEvent, status_id: 4 };
      mockAdminService.approval.approvePublic.mockResolvedValue(approvedEvent);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.approvePublic(1);
      });

      expect(mockAdminService.approval.approvePublic).toHaveBeenCalledWith(1, undefined);
      expect(result.current.isApprovalModalOpen).toBe(false);
    });

    test('should request changes for event', async () => {
      const updatedEvent = { ...mockEvent, status_id: 5 };
      mockAdminService.approval.requestChanges.mockResolvedValue(updatedEvent);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.requestChanges(1, 'Please update the description');
      });

      expect(mockAdminService.approval.requestChanges).toHaveBeenCalledWith(1, 'Please update the description');
      expect(result.current.isApprovalModalOpen).toBe(false);
    });

    test('should reject event', async () => {
      const rejectedEvent = { ...mockEvent, status_id: 6 };
      mockAdminService.approval.rejectEvent.mockResolvedValue(rejectedEvent);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.rejectEvent(1, 'Does not meet criteria');
      });

      expect(mockAdminService.approval.rejectEvent).toHaveBeenCalledWith(1, 'Does not meet criteria');
      expect(result.current.isApprovalModalOpen).toBe(false);
    });
  });

  describe('Modal Management', () => {
    test('should open create modal', async () => {
      const { result } = renderHook(() => useEventManager(), { wrapper });

      act(() => {
        result.current.openCreateModal();
      });

      expect(result.current.isCreateModalOpen).toBe(true);
    });

    test('should open edit modal with event', async () => {
      const { result } = renderHook(() => useEventManager(), { wrapper });

      act(() => {
        result.current.openEditModal(mockEvent);
      });

      expect(result.current.isEditModalOpen).toBe(true);
      expect(result.current.currentEvent).toEqual(mockEvent);
    });

    test('should open delete modal with event', async () => {
      const { result } = renderHook(() => useEventManager(), { wrapper });

      act(() => {
        result.current.openDeleteModal(mockEvent);
      });

      expect(result.current.isDeleteModalOpen).toBe(true);
      expect(result.current.currentEvent).toEqual(mockEvent);
    });

    test('should open approval modal with event', async () => {
      const { result } = renderHook(() => useEventManager(), { wrapper });

      act(() => {
        result.current.openApprovalModal(mockEvent);
      });

      expect(result.current.isApprovalModalOpen).toBe(true);
      expect(result.current.currentEvent).toEqual(mockEvent);
    });

    test('should open details modal with event', async () => {
      const { result } = renderHook(() => useEventManager(), { wrapper });

      act(() => {
        result.current.openDetailsModal(mockEvent);
      });

      expect(result.current.isDetailsModalOpen).toBe(true);
      expect(result.current.currentEvent).toEqual(mockEvent);
    });

    test('should close all modals', async () => {
      const { result } = renderHook(() => useEventManager(), { wrapper });

      act(() => {
        result.current.openCreateModal();
        result.current.openEditModal(mockEvent);
        result.current.openDeleteModal(mockEvent);
        result.current.openApprovalModal(mockEvent);
        result.current.openDetailsModal(mockEvent);
      });

      act(() => {
        result.current.closeAllModals();
      });

      expect(result.current.isCreateModalOpen).toBe(false);
      expect(result.current.isEditModalOpen).toBe(false);
      expect(result.current.isDeleteModalOpen).toBe(false);
      expect(result.current.isApprovalModalOpen).toBe(false);
      expect(result.current.isDetailsModalOpen).toBe(false);
      expect(result.current.currentEvent).toBeNull();
    });
  });

  describe('Filter Management', () => {
    test('should update filters', async () => {
      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateFilters({ status: 'published' });
      });

      expect(result.current.filters.status).toBe('published');
    });

    test('should reset page to 1 when filters change', async () => {
      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.changePage(3);
      });

      expect(result.current.filters.page).toBe(3);

      act(() => {
        result.current.setFilters({ status: 'published' });
      });

      expect(result.current.filters.page).toBe(1);
    });
  });

  describe('Error Handling', () => {
    test('should handle create event error gracefully', async () => {
      const mockError = new Error('API Error: Cannot create event');
      mockAdminService.createEvent.mockRejectedValue(mockError);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.createEvent(mockEventFormData);
        });
      }).rejects.toThrow('API Error: Cannot create event');
    });

    test('should handle update event error gracefully', async () => {
      const mockError = new Error('API Error: Cannot update event');
      mockAdminService.updateEvent.mockRejectedValue(mockError);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.updateEvent(1, { title: 'Updated' });
        });
      }).rejects.toThrow('API Error: Cannot update event');
    });

    test('should handle delete event error', async () => {
      const mockError = new Error('API Error: Cannot delete event');
      mockAdminService.deleteEvent.mockRejectedValue(mockError);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.deleteEvent(1);
        });
      }).rejects.toThrow('API Error: Cannot delete event');
    });

    test('should handle approval error gracefully', async () => {
      const mockError = new Error('Approval failed');
      mockAdminService.approval.approveInternal.mockRejectedValue(mockError);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.approveInternal(1);
        });
      }).rejects.toThrow('Approval failed');
    });

    test('should throw error when create is not available in context', async () => {
      const limitedService = {
        ...mockAdminService,
        createEvent: undefined,
      };
      (eventService.getEventServiceForContext as jest.Mock).mockReturnValue(limitedService);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.createEvent(mockEventFormData);
        });
      }).rejects.toThrow('Create event not available in current context');
    });
  });

  describe('Statistics Loading', () => {
    test('should load event statistics successfully', async () => {
      const mockStats = {
        total: 100,
        published: 80,
        draft: 20,
        pending: 10,
      };
      mockAdminService.getStatistics.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.loadStatistics();
      });

      expect(mockAdminService.getStatistics).toHaveBeenCalled();
      expect(result.current.statistics).toEqual(mockStats);
    });

    test('should load approval statistics successfully', async () => {
      const mockApprovalStats = {
        pending_approval: 5,
        approved: 50,
        rejected: 3,
      };
      mockAdminService.approval.getApprovalStatistics.mockResolvedValue(mockApprovalStats);

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.loadApprovalStatistics();
      });

      expect(mockAdminService.approval.getApprovalStatistics).toHaveBeenCalled();
      expect(result.current.approvalStatistics).toEqual(mockApprovalStats);
    });

    test('should handle statistics error silently', async () => {
      mockAdminService.getStatistics.mockRejectedValue(new Error('Stats error'));

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.loadStatistics();
      });

      expect(result.current.statistics).toBeNull();
    });
  });

  describe('Service Context Detection', () => {
    test('should use admin service for admin users', async () => {
      renderHook(() => useEventManager(), { wrapper });

      expect(eventService.getEventServiceForContext).toHaveBeenCalledWith('admin');
    });

    test('should use specified context when provided', async () => {
      renderHook(() => useEventManager({ context: 'public' }), { wrapper });

      expect(eventService.getEventServiceForContext).toHaveBeenCalledWith('public');
    });
  });

  describe('Data fetching', () => {
    test('should fetch events on mount', async () => {
      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockedFetcher).toHaveBeenCalled();
      expect(result.current.events).toHaveLength(1);
      expect(result.current.events[0].title).toBe('Test Event');
    });

    test('should return pagination data', async () => {
      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pagination).toBeDefined();
      expect(result.current.pagination?.current_page).toBe(1);
      expect(result.current.pagination?.total).toBe(1);
    });

    test('should handle fetch error', async () => {
      mockedFetcher.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Optimistic updates', () => {
    test('should add event optimistically', async () => {
      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newEvent = { ...mockEvent, id: 99, title: 'New Optimistic Event' };

      act(() => {
        result.current.addEvent(newEvent);
      });

      expect(result.current.events).toContainEqual(newEvent);
    });

    test('should update event in list optimistically', async () => {
      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateEventInList(1, { title: 'Updated Title' });
      });

      const updated = result.current.events.find(e => e.id === 1);
      expect(updated?.title).toBe('Updated Title');
    });

    test('should remove event optimistically', async () => {
      const { result } = renderHook(() => useEventManager(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.removeEvent(1);
      });

      expect(result.current.events.find(e => e.id === 1)).toBeUndefined();
    });
  });
});
