/**
 * Tests for useApprovalActions hook
 *
 * Tests business logic for approval actions: approve, reject,
 * request changes, and publish events.
 */

import { renderHook, act, waitFor } from '@testing-library/react'

import { useToast } from '@/components/ui/Toast'
import { useApprovalActions } from '@/features/approval/hooks/useApprovalActions'
import { approvalService } from '@/features/approval/services/approval.service'

jest.mock('@/features/approval/services/approval.service')
jest.mock('@/components/ui/Toast')

describe('useApprovalActions', () => {
  const mockRefresh = jest.fn()
  const mockAddToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useToast as jest.Mock).mockReturnValue({
      addToast: mockAddToast
    })
  })

  describe('approveEvent', () => {
    test('approves event successfully and shows success toast', async () => {
      const mockApprovedEvent = { id: 1, status: 'approved_internal' }
      ;(approvalService.approve as jest.Mock).mockResolvedValue(mockApprovedEvent)

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.approveEvent(1)
      })

      expect(approvalService.approve).toHaveBeenCalledWith(1)
      expect(mockAddToast).toHaveBeenCalledWith({ message: 'Event approved successfully', type: 'success' })
      expect(mockRefresh).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    test('handles approve error and shows error toast', async () => {
      ;(approvalService.approve as jest.Mock).mockRejectedValue(
        new Error('Permission denied')
      )

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.approveEvent(1)
      })

      expect(mockAddToast).toHaveBeenCalledWith({ message: 'Failed to approve event', type: 'error' })
      expect(mockRefresh).not.toHaveBeenCalled()
    })

    test('sets loading state during approve operation', async () => {
      ;(approvalService.approve as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      act(() => {
        result.current.approveEvent(1)
      })

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('rejectEvent', () => {
    test('rejects event with reason successfully', async () => {
      ;(approvalService.reject as jest.Mock).mockResolvedValue({ id: 1, status: 'rejected' })

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.rejectEvent(1, 'Incomplete information')
      })

      expect(approvalService.reject).toHaveBeenCalledWith(1, 'Incomplete information')
      expect(mockAddToast).toHaveBeenCalledWith({ message: 'Event rejected', type: 'success' })
      expect(mockRefresh).toHaveBeenCalled()
    })

    test('requires reason parameter for rejection', async () => {
      ;(approvalService.reject as jest.Mock).mockResolvedValue({ id: 1 })

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.rejectEvent(1, 'Missing details')
      })

      expect(approvalService.reject).toHaveBeenCalledWith(1, 'Missing details')
    })

    test('handles reject error and shows error toast', async () => {
      ;(approvalService.reject as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.rejectEvent(1, 'Test reason')
      })

      expect(mockAddToast).toHaveBeenCalledWith({ message: 'Failed to reject event', type: 'error' })
      expect(mockRefresh).not.toHaveBeenCalled()
    })
  })

  describe('requestChanges', () => {
    test('requests changes with comments successfully', async () => {
      ;(approvalService.requestChanges as jest.Mock).mockResolvedValue({
        id: 1,
        status: 'requires_changes'
      })

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.requestChanges(1, 'Please add more details')
      })

      expect(approvalService.requestChanges).toHaveBeenCalledWith(1, 'Please add more details')
      expect(mockAddToast).toHaveBeenCalledWith({ message: 'Changes requested successfully', type: 'success' })
      expect(mockRefresh).toHaveBeenCalled()
    })

    test('handles request changes error', async () => {
      ;(approvalService.requestChanges as jest.Mock).mockRejectedValue(
        new Error('Failed')
      )

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.requestChanges(1, 'Comments')
      })

      expect(mockAddToast).toHaveBeenCalledWith({ message: 'Failed to request changes', type: 'error' })
    })
  })

  describe('publishEvent', () => {
    test('publishes event successfully', async () => {
      ;(approvalService.publish as jest.Mock).mockResolvedValue({
        id: 1,
        status: 'published'
      })

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.publishEvent(1)
      })

      expect(approvalService.publish).toHaveBeenCalledWith(1)
      expect(mockAddToast).toHaveBeenCalledWith({ message: 'Event published to public calendar', type: 'success' })
      expect(mockRefresh).toHaveBeenCalled()
    })

    test('handles publish error', async () => {
      ;(approvalService.publish as jest.Mock).mockRejectedValue(
        new Error('Failed')
      )

      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      await act(async () => {
        await result.current.publishEvent(1)
      })

      expect(mockAddToast).toHaveBeenCalledWith({ message: 'Failed to publish event', type: 'error' })
    })
  })

  describe('Modal State Management', () => {
    test('opens and closes approve modal', () => {
      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      act(() => {
        result.current.openApproveModal(1)
      })

      expect(result.current.approveModalOpen).toBe(true)
      expect(result.current.selectedEventId).toBe(1)

      act(() => {
        result.current.closeApproveModal()
      })

      expect(result.current.approveModalOpen).toBe(false)
      expect(result.current.selectedEventId).toBeNull()
    })

    test('opens and closes reject modal', () => {
      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      act(() => {
        result.current.openRejectModal(1)
      })

      expect(result.current.rejectModalOpen).toBe(true)

      act(() => {
        result.current.closeRejectModal()
      })

      expect(result.current.rejectModalOpen).toBe(false)
    })

    test('opens and closes request changes modal', () => {
      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      act(() => {
        result.current.openRequestChangesModal(1)
      })

      expect(result.current.requestChangesModalOpen).toBe(true)

      act(() => {
        result.current.closeRequestChangesModal()
      })

      expect(result.current.requestChangesModalOpen).toBe(false)
    })

    test('opens and closes publish modal', () => {
      const { result } = renderHook(() => useApprovalActions(mockRefresh))

      act(() => {
        result.current.openPublishModal(1)
      })

      expect(result.current.publishModalOpen).toBe(true)

      act(() => {
        result.current.closePublishModal()
      })

      expect(result.current.publishModalOpen).toBe(false)
    })
  })
})
