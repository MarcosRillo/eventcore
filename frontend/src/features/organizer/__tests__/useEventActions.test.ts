/**
 * Tests for useEventActions hook
 *
 * Tests business logic for event actions: submit for review, duplicate, delete.
 * Includes API calls, error handling, and state management.
 */

import { act, renderHook, waitFor } from '@testing-library/react'

import { useEventActions } from '@/features/organizer/hooks/useEventActions'
import * as organizerEventService from '@/features/organizer/services/organizer-event.service'
import { useToast } from '@/shared/context'

// Mock dependencies
jest.mock('@/features/organizer/services/organizer-event.service')
jest.mock('@/shared/context')

describe('useEventActions', () => {
  const mockRefresh = jest.fn()
  const mockAddToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useToast as jest.Mock).mockReturnValue({ addToast: mockAddToast })
  })

  describe('submitForReview', () => {
    test('submits event for review successfully and shows success toast', async () => {
      const mockSubmittedEvent = {
        message: 'Event submitted for review',
        status: 'pending_internal_approval',
        event: { id: 1, status: 'pending_internal_approval' }
      }
      ;(organizerEventService.submitForReview as jest.Mock).mockResolvedValue(mockSubmittedEvent)

      const { result } = renderHook(() => useEventActions(mockRefresh))

      await act(async () => {
        await result.current.submitForReview(1)
      })

      expect(organizerEventService.submitForReview).toHaveBeenCalledWith(1)
      expect(mockAddToast).toHaveBeenCalledWith({
        message: 'Evento enviado a revisión exitosamente',
        type: 'success'
      })
      expect(mockRefresh).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    test('handles submit error and shows error toast', async () => {
      ;(organizerEventService.submitForReview as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      const { result } = renderHook(() => useEventActions(mockRefresh))

      await act(async () => {
        await result.current.submitForReview(1)
      })

      expect(mockAddToast).toHaveBeenCalledWith({
        message: 'Error al enviar evento a revisión',
        type: 'error'
      })
      expect(mockRefresh).not.toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    test('sets loading state during submit operation', async () => {
      ;(organizerEventService.submitForReview as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => useEventActions(mockRefresh))

      act(() => {
        result.current.submitForReview(1)
      })

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('deleteEvent', () => {
    test('deletes event successfully and shows success toast', async () => {
      ;(organizerEventService.deleteEvent as jest.Mock).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useEventActions(mockRefresh))

      await act(async () => {
        await result.current.deleteEvent(1)
      })

      expect(organizerEventService.deleteEvent).toHaveBeenCalledWith(1)
      expect(mockAddToast).toHaveBeenCalledWith({
        message: 'Evento eliminado exitosamente',
        type: 'success'
      })
      expect(mockRefresh).toHaveBeenCalledWith(1)
      expect(result.current.loading).toBe(false)
    })

    test('handles delete error and shows error toast', async () => {
      ;(organizerEventService.deleteEvent as jest.Mock).mockRejectedValue(
        new Error('Permission denied')
      )

      const { result } = renderHook(() => useEventActions(mockRefresh))

      await act(async () => {
        await result.current.deleteEvent(1)
      })

      expect(mockAddToast).toHaveBeenCalledWith({
        message: 'Error al eliminar evento',
        type: 'error'
      })
      expect(mockRefresh).not.toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    test('sets loading state during delete operation', async () => {
      ;(organizerEventService.deleteEvent as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => useEventActions(mockRefresh))

      act(() => {
        result.current.deleteEvent(1)
      })

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('Confirmation Modals', () => {
    test('opens and closes submit confirmation modal', () => {
      const { result } = renderHook(() => useEventActions(mockRefresh))

      act(() => {
        result.current.openSubmitModal(1)
      })

      expect(result.current.submitModalOpen).toBe(true)
      expect(result.current.selectedEventId).toBe(1)

      act(() => {
        result.current.closeSubmitModal()
      })

      expect(result.current.submitModalOpen).toBe(false)
      expect(result.current.selectedEventId).toBeNull()
    })

    test('opens and closes delete confirmation modal', () => {
      const { result } = renderHook(() => useEventActions(mockRefresh))

      act(() => {
        result.current.openDeleteModal(1)
      })

      expect(result.current.deleteModalOpen).toBe(true)
      expect(result.current.selectedEventId).toBe(1)

      act(() => {
        result.current.closeDeleteModal()
      })

      expect(result.current.deleteModalOpen).toBe(false)
      expect(result.current.selectedEventId).toBeNull()
    })

  })
})
