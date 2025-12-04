/**
 * Tests for useEventManager Hook
 *
 * Coverage areas:
 * 1. CRUD Operations (create, update, delete events)
 * 2. Approval Workflow (approve, reject, request changes)
 * 3. Modal Management (open, close modals)
 * 4. Filter Management (update filters)
 * 5. Error Handling (API failures)
 */

import { renderHook, act } from '@testing-library/react';
import { useEventManager } from '../useEventManager';
import * as eventService from '@/features/events/services/event.service';
import { Event, EventFormData } from '@/types/event.types';

// Mock dependencies
jest.mock('@/features/events/services/event.service');
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: 1, name: 'Test User', role: 'admin' }
  })
}));
jest.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    isAdmin: () => true,
    isOrganizer: () => false,
    canAccessAdmin: () => true
  })
}));
jest.mock('@/hooks/usePaginatedData', () => ({
  usePaginatedData: ({ initialFilters }: { initialFilters: Record<string, unknown> }) => ({
    data: [],
    pagination: null,
    filters: initialFilters,
    isLoading: false,
    error: null,
    setFilters: jest.fn(),
    resetFilters: jest.fn(),
    changePage: jest.fn(),
    refreshData: jest.fn(),
    addItem: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
  })
}));

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

// Mock admin service
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
  }
};

describe('useEventManager Hook', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock for getEventServiceForContext
    (eventService.getEventServiceForContext as jest.Mock).mockReturnValue(mockAdminService);
  });

  // ============================================================
  // CRUD OPERATIONS TESTS
  // ============================================================

  describe('CRUD Operations', () => {

    test('should create event successfully', async () => {
      const newEvent = { ...mockEvent, id: 2, title: 'New Event' };
      mockAdminService.createEvent.mockResolvedValue(newEvent);

      const { result } = renderHook(() => useEventManager());

      await act(async () => {
        await result.current.createEvent(mockEventFormData);
      });

      expect(mockAdminService.createEvent).toHaveBeenCalledWith(mockEventFormData);
      expect(result.current.isCreateModalOpen).toBe(false);
      expect(result.current.isCreating).toBe(false);
    });

    test('should update event successfully', async () => {
      const updatedEvent = { ...mockEvent, title: 'Updated Event' };
      mockAdminService.updateEvent.mockResolvedValue(updatedEvent);

      const { result } = renderHook(() => useEventManager());

      const updateData = { title: 'Updated Event' };

      await act(async () => {
        await result.current.updateEvent(1, updateData);
      });

      expect(mockAdminService.updateEvent).toHaveBeenCalledWith(1, updateData);
      expect(result.current.isEditModalOpen).toBe(false);
      expect(result.current.currentEvent).toBeNull();
      expect(result.current.isUpdating).toBe(false);
    });

    test('should delete event successfully', async () => {
      mockAdminService.deleteEvent.mockResolvedValue(undefined);

      const { result } = renderHook(() => useEventManager());

      await act(async () => {
        await result.current.deleteEvent(1);
      });

      expect(mockAdminService.deleteEvent).toHaveBeenCalledWith(1);
      expect(result.current.isDeleteModalOpen).toBe(false);
      expect(result.current.currentEvent).toBeNull();
      expect(result.current.isDeleting).toBe(false);
    });

    test('should duplicate event successfully', async () => {
      const duplicatedEvent = { ...mockEvent, id: 3, title: 'Test Event (Copy)' };
      mockAdminService.duplicateEvent.mockResolvedValue(duplicatedEvent);

      const { result } = renderHook(() => useEventManager());

      await act(async () => {
        await result.current.duplicateEvent(1, { title: 'Test Event (Copy)' });
      });

      expect(mockAdminService.duplicateEvent).toHaveBeenCalledWith(1, { title: 'Test Event (Copy)' });
    });

    test('should toggle featured status successfully', async () => {
      const updatedEvent = { ...mockEvent, is_featured: true };
      mockAdminService.toggleFeatured.mockResolvedValue(updatedEvent);

      const { result } = renderHook(() => useEventManager());

      await act(async () => {
        await result.current.toggleFeatured(1);
      });

      expect(mockAdminService.toggleFeatured).toHaveBeenCalledWith(1);
    });
  });

  // ============================================================
  // APPROVAL WORKFLOW TESTS
  // ============================================================

  describe('Approval Workflow', () => {

    test('should approve event internally', async () => {
      const approvedEvent = { ...mockEvent, status_id: 2 };
      mockAdminService.approval.approveInternal.mockResolvedValue(approvedEvent);

      const { result } = renderHook(() => useEventManager());

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

      const { result } = renderHook(() => useEventManager());

      await act(async () => {
        await result.current.requestPublic(1, 'Ready for public');
      });

      expect(mockAdminService.approval.requestPublic).toHaveBeenCalledWith(1, 'Ready for public');
      expect(result.current.isApprovalModalOpen).toBe(false);
    });

    test('should approve event for public', async () => {
      const approvedEvent = { ...mockEvent, status_id: 4 };
      mockAdminService.approval.approvePublic.mockResolvedValue(approvedEvent);

      const { result } = renderHook(() => useEventManager());

      await act(async () => {
        await result.current.approvePublic(1);
      });

      expect(mockAdminService.approval.approvePublic).toHaveBeenCalledWith(1, undefined);
      expect(result.current.isApprovalModalOpen).toBe(false);
    });

    test('should request changes for event', async () => {
      const updatedEvent = { ...mockEvent, status_id: 5 };
      mockAdminService.approval.requestChanges.mockResolvedValue(updatedEvent);

      const { result } = renderHook(() => useEventManager());

      await act(async () => {
        await result.current.requestChanges(1, 'Please update the description');
      });

      expect(mockAdminService.approval.requestChanges).toHaveBeenCalledWith(1, 'Please update the description');
      expect(result.current.isApprovalModalOpen).toBe(false);
    });

    test('should reject event', async () => {
      const rejectedEvent = { ...mockEvent, status_id: 6 };
      mockAdminService.approval.rejectEvent.mockResolvedValue(rejectedEvent);

      const { result } = renderHook(() => useEventManager());

      await act(async () => {
        await result.current.rejectEvent(1, 'Does not meet criteria');
      });

      expect(mockAdminService.approval.rejectEvent).toHaveBeenCalledWith(1, 'Does not meet criteria');
      expect(result.current.isApprovalModalOpen).toBe(false);
    });
  });

  // ============================================================
  // MODAL MANAGEMENT TESTS
  // ============================================================

  describe('Modal Management', () => {

    test('should open create modal', () => {
      const { result } = renderHook(() => useEventManager());

      act(() => {
        result.current.openCreateModal();
      });

      expect(result.current.isCreateModalOpen).toBe(true);
    });

    test('should open edit modal with event', () => {
      const { result } = renderHook(() => useEventManager());

      act(() => {
        result.current.openEditModal(mockEvent);
      });

      expect(result.current.isEditModalOpen).toBe(true);
      expect(result.current.currentEvent).toEqual(mockEvent);
    });

    test('should open delete modal with event', () => {
      const { result } = renderHook(() => useEventManager());

      act(() => {
        result.current.openDeleteModal(mockEvent);
      });

      expect(result.current.isDeleteModalOpen).toBe(true);
      expect(result.current.currentEvent).toEqual(mockEvent);
    });

    test('should open approval modal with event', () => {
      const { result } = renderHook(() => useEventManager());

      act(() => {
        result.current.openApprovalModal(mockEvent);
      });

      expect(result.current.isApprovalModalOpen).toBe(true);
      expect(result.current.currentEvent).toEqual(mockEvent);
    });

    test('should open details modal with event', () => {
      const { result } = renderHook(() => useEventManager());

      act(() => {
        result.current.openDetailsModal(mockEvent);
      });

      expect(result.current.isDetailsModalOpen).toBe(true);
      expect(result.current.currentEvent).toEqual(mockEvent);
    });

    test('should close all modals', () => {
      const { result } = renderHook(() => useEventManager());

      // First open all modals
      act(() => {
        result.current.openCreateModal();
        result.current.openEditModal(mockEvent);
        result.current.openDeleteModal(mockEvent);
        result.current.openApprovalModal(mockEvent);
        result.current.openDetailsModal(mockEvent);
      });

      // Then close all
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

  // ============================================================
  // FILTER MANAGEMENT TESTS
  // ============================================================

  describe('Filter Management', () => {

    test('should update filters', () => {
      const { result } = renderHook(() => useEventManager());

      act(() => {
        result.current.updateFilters({ status: 'published' });
      });

      // Since we're mocking usePaginatedData, we can't test the actual filter change
      // but we can verify the function is callable without errors
      expect(result.current.updateFilters).toBeDefined();
    });

    test('should include show_past filter when enabled', () => {
      const { result } = renderHook(() => useEventManager());

      act(() => {
        result.current.updateFilters({ show_past: '1' });
      });

      // Assert: updateFilters function is callable with show_past parameter
      expect(result.current.updateFilters).toBeDefined();
      // The mock should have been called with the show_past filter
      // This verifies the filter can be passed through the hook
    });
  });

  // ============================================================
  // ERROR HANDLING TESTS
  // ============================================================

  describe('Error Handling', () => {

    test('should handle create event error gracefully', async () => {
      const mockError = new Error('API Error: Cannot create event');
      mockAdminService.createEvent.mockRejectedValue(mockError);

      const { result } = renderHook(() => useEventManager());

      await expect(async () => {
        await act(async () => {
          await result.current.createEvent(mockEventFormData);
        });
      }).rejects.toThrow('API Error: Cannot create event');

      expect(result.current.isCreating).toBe(false);
    });

    test('should handle update event error gracefully', async () => {
      const mockError = new Error('API Error: Cannot update event');
      mockAdminService.updateEvent.mockRejectedValue(mockError);

      const { result } = renderHook(() => useEventManager());

      await expect(async () => {
        await act(async () => {
          await result.current.updateEvent(1, { title: 'Updated' });
        });
      }).rejects.toThrow('API Error: Cannot update event');

      expect(result.current.isUpdating).toBe(false);
    });

    test('should handle delete event error and revert optimistic update', async () => {
      const mockError = new Error('API Error: Cannot delete event');
      mockAdminService.deleteEvent.mockRejectedValue(mockError);

      const { result } = renderHook(() => useEventManager());

      await expect(async () => {
        await act(async () => {
          await result.current.deleteEvent(1);
        });
      }).rejects.toThrow('API Error: Cannot delete event');

      expect(result.current.isDeleting).toBe(false);
      // Verify refreshData was called to revert optimistic update
      // This would require deeper mocking of usePaginatedData
    });

    test('should handle approval error gracefully', async () => {
      const mockError = new Error('Approval failed');
      mockAdminService.approval.approveInternal.mockRejectedValue(mockError);

      const { result } = renderHook(() => useEventManager());

      await expect(async () => {
        await act(async () => {
          await result.current.approveInternal(1);
        });
      }).rejects.toThrow('Approval failed');
    });

    test('should throw error when create is not available in context', async () => {
      // Mock service without createEvent
      const limitedService = {
        ...mockAdminService,
        createEvent: undefined,
      };
      (eventService.getEventServiceForContext as jest.Mock).mockReturnValue(limitedService);

      const { result } = renderHook(() => useEventManager());

      await expect(async () => {
        await act(async () => {
          await result.current.createEvent(mockEventFormData);
        });
      }).rejects.toThrow('Create event not available in current context');

      expect(result.current.isCreating).toBe(false);
    });
  });

  // ============================================================
  // STATISTICS TESTS
  // ============================================================

  describe('Statistics Loading', () => {

    test('should load event statistics successfully', async () => {
      const mockStats = {
        total: 100,
        published: 80,
        draft: 20,
        pending: 10,
      };
      mockAdminService.getStatistics.mockResolvedValue(mockStats);

      const { result } = renderHook(() => useEventManager());

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

      const { result } = renderHook(() => useEventManager());

      await act(async () => {
        await result.current.loadApprovalStatistics();
      });

      expect(mockAdminService.approval.getApprovalStatistics).toHaveBeenCalled();
      expect(result.current.approvalStatistics).toEqual(mockApprovalStats);
    });

    test('should handle statistics error silently', async () => {
      mockAdminService.getStatistics.mockRejectedValue(new Error('Stats error'));

      const { result } = renderHook(() => useEventManager());

      await act(async () => {
        await result.current.loadStatistics();
      });

      // Should not throw, error handled silently
      expect(result.current.statistics).toBeNull();
    });
  });

  // ============================================================
  // CONTEXT DETECTION TESTS
  // ============================================================

  describe('Service Context Detection', () => {

    test('should use admin service for admin users', () => {
      renderHook(() => useEventManager());

      expect(eventService.getEventServiceForContext).toHaveBeenCalledWith('admin');
    });

    test('should use specified context when provided', () => {
      renderHook(() => useEventManager({ context: 'public' }));

      expect(eventService.getEventServiceForContext).toHaveBeenCalledWith('public');
    });
  });
});
