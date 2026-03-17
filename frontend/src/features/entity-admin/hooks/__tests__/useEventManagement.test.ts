/**
 * Tests for useEventManagement hook
 *
 * Tests the hook that manages the event management modal state and approval actions.
 * Following TDD: RED phase - these tests should fail initially.
 */

import { act,renderHook } from '@testing-library/react';

import { useApprovalManager } from '@/features/entity-admin/hooks/useApprovalManager';
import { useEventManagement } from '@/features/entity-admin/hooks/useEventManagement';
import type { Event } from '@/types/event.types';

// Mock useApprovalManager
jest.mock('../useApprovalManager');
const mockedUseApprovalManager = useApprovalManager as jest.MockedFunction<typeof useApprovalManager>;

describe('useEventManagement', () => {
  const mockEvent: Event = {
    id: 1,
    title: 'Test Event',
    description: 'Test description',
    start_date: '2025-03-15T10:00:00',
    end_date: '2025-03-15T18:00:00',
    type: 'sede_unica',
    status: 'pending_internal_approval',
    locations: [],
    is_featured: false,
    approval_history: [],
    created_at: '2025-01-01T00:00:00',
    updated_at: '2025-01-01T00:00:00',
  };

  const mockApprovalManager = {
    isLoading: false,
    error: null,
    approveInternal: jest.fn().mockResolvedValue(mockEvent),
    approveAndPublish: jest.fn().mockResolvedValue(mockEvent),
    requestPublicApproval: jest.fn().mockResolvedValue(mockEvent),
    publishEvent: jest.fn().mockResolvedValue(mockEvent),
    requestChanges: jest.fn().mockResolvedValue(mockEvent),
    rejectEvent: jest.fn().mockResolvedValue(mockEvent),
    toggleFeatured: jest.fn().mockResolvedValue(mockEvent),
    canApproveInternal: jest.fn().mockReturnValue(true),
    canRequestPublicApproval: jest.fn().mockReturnValue(false),
    canPublish: jest.fn().mockReturnValue(false),
    canRequestChanges: jest.fn().mockReturnValue(true),
    canReject: jest.fn().mockReturnValue(true),
    isInternallyApproved: jest.fn().mockReturnValue(false),
    isPublished: jest.fn().mockReturnValue(false),
    getWorkflowStage: jest.fn().mockReturnValue('Pendiente aprobación interna'),
    getAvailableActions: jest.fn().mockReturnValue(['approve_internal', 'request_changes', 'reject']),
    approveEvent: jest.fn().mockResolvedValue(mockEvent),
    canApprove: jest.fn().mockReturnValue(true),
    clearError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseApprovalManager.mockReturnValue(mockApprovalManager);
  });

  describe('Modal State', () => {
    test('initializes with closed modal', () => {
      const { result } = renderHook(() => useEventManagement());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.selectedEvent).toBeNull();
    });

    test('opens modal with selected event', () => {
      const { result } = renderHook(() => useEventManagement());

      act(() => {
        result.current.openModal(mockEvent);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.selectedEvent).toEqual(mockEvent);
    });

    test('closes modal and resets state', () => {
      const { result } = renderHook(() => useEventManagement());

      act(() => {
        result.current.openModal(mockEvent);
      });

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.selectedEvent).toBeNull();
      expect(result.current.selectedAction).toBeNull();
      expect(result.current.comment).toBe('');
    });
  });

  describe('Action Selection', () => {
    test('selects an action', () => {
      const { result } = renderHook(() => useEventManagement());

      act(() => {
        result.current.openModal(mockEvent);
      });

      act(() => {
        result.current.selectAction('approve_internal');
      });

      expect(result.current.selectedAction).toBe('approve_internal');
    });

    test('cancels action selection and clears comment', () => {
      const { result } = renderHook(() => useEventManagement());

      act(() => {
        result.current.openModal(mockEvent);
        result.current.selectAction('request_changes');
        result.current.setComment('Some feedback');
      });

      act(() => {
        result.current.cancelAction();
      });

      expect(result.current.selectedAction).toBeNull();
      expect(result.current.comment).toBe('');
      expect(result.current.commentError).toBeNull();
    });
  });

  describe('Comment Management', () => {
    test('sets comment value', () => {
      const { result } = renderHook(() => useEventManagement());

      act(() => {
        result.current.openModal(mockEvent);
        result.current.selectAction('request_changes');
      });

      act(() => {
        result.current.setComment('This needs more details');
      });

      expect(result.current.comment).toBe('This needs more details');
    });

    test('validates comment for actions that require it', () => {
      const { result } = renderHook(() => useEventManagement());

      act(() => {
        result.current.openModal(mockEvent);
        result.current.selectAction('request_changes');
        result.current.setComment('Short'); // Less than 10 chars
      });

      // Try to confirm
      act(() => {
        result.current.confirmAction();
      });

      expect(result.current.commentError).toBeTruthy();
    });

    test('clears comment error when valid comment is entered', () => {
      const { result } = renderHook(() => useEventManagement());

      act(() => {
        result.current.openModal(mockEvent);
        result.current.selectAction('request_changes');
        result.current.setComment('Short');
      });

      // Try to confirm (sets error)
      act(() => {
        result.current.confirmAction();
      });

      expect(result.current.commentError).toBeTruthy();

      // Enter valid comment
      act(() => {
        result.current.setComment('This is a valid comment with more than 10 characters');
      });

      expect(result.current.commentError).toBeNull();
    });
  });

  describe('Available Actions', () => {
    test('returns available actions based on event status', () => {
      const { result } = renderHook(() => useEventManagement());

      act(() => {
        result.current.openModal(mockEvent);
      });

      expect(result.current.availableActions).toContain('approve_internal');
      expect(result.current.availableActions).toContain('request_changes');
      expect(result.current.availableActions).toContain('reject');
    });

    test('returns empty actions when no event is selected', () => {
      const { result } = renderHook(() => useEventManagement());

      expect(result.current.availableActions).toEqual([]);
    });
  });

  describe('Action Confirmation', () => {
    test('calls approveInternal when confirming approve_internal action', async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useEventManagement({ onSuccess }));

      act(() => {
        result.current.openModal(mockEvent);
        result.current.selectAction('approve_internal');
      });

      await act(async () => {
        await result.current.confirmAction();
      });

      expect(mockApprovalManager.approveInternal).toHaveBeenCalledWith(mockEvent.id);
      expect(onSuccess).toHaveBeenCalled();
    });

    test('calls requestChanges with comment when confirming request_changes action', async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useEventManagement({ onSuccess }));

      act(() => {
        result.current.openModal(mockEvent);
        result.current.selectAction('request_changes');
        result.current.setComment('Please add more details about the event');
      });

      await act(async () => {
        await result.current.confirmAction();
      });

      expect(mockApprovalManager.requestChanges).toHaveBeenCalledWith(
        mockEvent.id,
        'Please add more details about the event'
      );
      expect(onSuccess).toHaveBeenCalled();
    });

    test('calls rejectEvent with comment when confirming reject action', async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useEventManagement({ onSuccess }));

      act(() => {
        result.current.openModal(mockEvent);
        result.current.selectAction('reject');
        result.current.setComment('Event does not meet requirements');
      });

      await act(async () => {
        await result.current.confirmAction();
      });

      expect(mockApprovalManager.rejectEvent).toHaveBeenCalledWith(
        mockEvent.id,
        'Event does not meet requirements'
      );
      expect(onSuccess).toHaveBeenCalled();
    });

    test('keeps modal open and updates event on forward action (approve_internal)', async () => {
      const updatedEvent = { ...mockEvent, status: 'approved_internal' };
      mockApprovalManager.approveInternal.mockResolvedValueOnce(updatedEvent);

      const { result } = renderHook(() => useEventManagement());

      act(() => {
        result.current.openModal(mockEvent);
        result.current.selectAction('approve_internal');
      });

      await act(async () => {
        await result.current.confirmAction();
      });

      // Modal stays open for forward actions
      expect(result.current.isOpen).toBe(true);
      // Event is updated with new status
      expect(result.current.selectedEvent).toEqual(updatedEvent);
      // Action selection is reset
      expect(result.current.selectedAction).toBeNull();
    });

    test('calls approveAndPublish when confirming publish_directly action', async () => {
      const publishedEvent = { ...mockEvent, status: 'published' };
      mockApprovalManager.approveAndPublish.mockResolvedValueOnce(publishedEvent);
      const onSuccess = jest.fn();

      const { result } = renderHook(() => useEventManagement({ onSuccess }));

      act(() => {
        result.current.openModal(mockEvent);
        result.current.selectAction('publish_directly');
      });

      await act(async () => {
        await result.current.confirmAction();
      });

      expect(mockApprovalManager.approveAndPublish).toHaveBeenCalledWith(mockEvent.id);
      expect(result.current.isOpen).toBe(true);
      expect(result.current.selectedEvent).toEqual(publishedEvent);
      expect(onSuccess).toHaveBeenCalled();
    });

    test('closes modal on negative action (reject)', async () => {
      const rejectedEvent = { ...mockEvent, status: 'rejected' };
      mockApprovalManager.rejectEvent.mockResolvedValueOnce(rejectedEvent);

      const { result } = renderHook(() => useEventManagement());

      act(() => {
        result.current.openModal(mockEvent);
        result.current.selectAction('reject');
        result.current.setComment('Event does not meet requirements');
      });

      await act(async () => {
        await result.current.confirmAction();
      });

      expect(result.current.isOpen).toBe(false);
    });

    test('closes modal on request_changes action', async () => {
      const changesEvent = { ...mockEvent, status: 'requires_changes' };
      mockApprovalManager.requestChanges.mockResolvedValueOnce(changesEvent);

      const { result } = renderHook(() => useEventManagement());

      act(() => {
        result.current.openModal(mockEvent);
        result.current.selectAction('request_changes');
        result.current.setComment('Please add more details about the event');
      });

      await act(async () => {
        await result.current.confirmAction();
      });

      expect(result.current.isOpen).toBe(false);
    });

    test('does not close modal when action fails', async () => {
      mockApprovalManager.approveInternal.mockResolvedValueOnce(null);

      const { result } = renderHook(() => useEventManagement());

      act(() => {
        result.current.openModal(mockEvent);
        result.current.selectAction('approve_internal');
      });

      await act(async () => {
        await result.current.confirmAction();
      });

      // Modal should stay open when action fails
      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('Loading State', () => {
    test('reflects loading state from approval manager', () => {
      mockedUseApprovalManager.mockReturnValue({
        ...mockApprovalManager,
        isLoading: true,
      });

      const { result } = renderHook(() => useEventManagement());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('reflects error from approval manager', () => {
      mockedUseApprovalManager.mockReturnValue({
        ...mockApprovalManager,
        error: { message: 'Network error', details: undefined },
      });

      const { result } = renderHook(() => useEventManagement());

      expect(result.current.error).toBe('Network error');
    });
  });
});
