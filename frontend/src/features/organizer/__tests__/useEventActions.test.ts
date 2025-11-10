/**
 * Tests for useEventActions hook
 *
 * Tests business logic for event actions: publish, duplicate, delete.
 * Includes API calls, error handling, and state management.
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useEventActions } from '../hooks/useEventActions'
import * as organizerEventService from '@/features/organizer/services/organizer-event.service'
import { useToast } from '@/components/ui/Toast'

// Mock dependencies
jest.mock('@/features/organizer/services/organizer-event.service')
jest.mock('@/components/ui/Toast')

describe('useEventActions', () => {
  const mockRefresh = jest.fn()
  const mockAddToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useToast as jest.Mock).mockReturnValue({ addToast: mockAddToast })
  })

  describe('publishEvent', () => {
    test('publishes event successfully and shows success toast', async () => {
      const mockPublishedEvent = { data: { id: 1, status: 'pending' } }
      ;(organizerEventService.publishEvent as jest.Mock).mockResolvedValue(mockPublishedEvent)

      const { result } = renderHook(() => useEventActions(mockRefresh))

      await act(async () => {
        await result.current.publishEvent(1)
      })

      expect(organizerEventService.publishEvent).toHaveBeenCalledWith(1)
      expect(mockAddToast).toHaveBeenCalledWith({
        message: 'Event published successfully',
        type: 'success'
      })
      expect(mockRefresh).toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    test('handles publish error and shows error toast', async () => {
      ;(organizerEventService.publishEvent as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      const { result } = renderHook(() => useEventActions(mockRefresh))

      await act(async () => {
        await result.current.publishEvent(1)
      })

      expect(mockAddToast).toHaveBeenCalledWith({
        message: 'Failed to publish event',
        type: 'error'
      })
      expect(mockRefresh).not.toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
    })

    test('sets loading state during publish operation', async () => {
      ;(organizerEventService.publishEvent as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => useEventActions(mockRefresh))

      act(() => {
        result.current.publishEvent(1)
      })

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('duplicateEvent', () => {
    test('duplicates event successfully and shows success toast', async () => {
      const mockOriginalEvent = {
        data: {
          id: 1,
          title: 'Original Event',
          status: 'published' as const,
          event_date: '2025-11-01',
          location: 'Test Location'
        }
      }
      const mockDuplicatedEvent = {
        data: {
          id: 2,
          title: 'Original Event (Copy)',
          status: 'draft' as const,
          event_date: '2025-11-01',
          location: 'Test Location'
        }
      }

      ;(organizerEventService.getEvent as jest.Mock).mockResolvedValue(mockOriginalEvent)
      ;(organizerEventService.createEvent as jest.Mock).mockResolvedValue(mockDuplicatedEvent)

      const { result } = renderHook(() => useEventActions(mockRefresh))

      await act(async () => {
        await result.current.duplicateEvent(1)
      })

      expect(organizerEventService.getEvent).toHaveBeenCalledWith(1)
      expect(organizerEventService.createEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Original Event (Copy)'
        })
      )
      expect(mockAddToast).toHaveBeenCalledWith({
        message: 'Event duplicated successfully',
        type: 'success'
      })
      expect(mockRefresh).toHaveBeenCalled()
    })

    test('removes id and timestamps when duplicating', async () => {
      const mockOriginalEvent = {
        data: {
          id: 1,
          title: 'Original Event',
          event_date: '2025-11-01',
          location: 'Test Location',
          status: 'draft' as const,
          created_at: '2025-10-29T00:00:00Z',
          updated_at: '2025-10-29T00:00:00Z'
        }
      }

      ;(organizerEventService.getEvent as jest.Mock).mockResolvedValue(mockOriginalEvent)
      ;(organizerEventService.createEvent as jest.Mock).mockResolvedValue({ data: { id: 2 } })

      const { result } = renderHook(() => useEventActions(mockRefresh))

      await act(async () => {
        await result.current.duplicateEvent(1)
      })

      expect(organizerEventService.createEvent).toHaveBeenCalledWith(
        expect.not.objectContaining({
          id: expect.anything(),
          created_at: expect.anything(),
          updated_at: expect.anything()
        })
      )
    })

    test('handles duplicate error and shows error toast', async () => {
      ;(organizerEventService.getEvent as jest.Mock).mockRejectedValue(
        new Error('Not found')
      )

      const { result } = renderHook(() => useEventActions(mockRefresh))

      await act(async () => {
        await result.current.duplicateEvent(1)
      })

      expect(mockAddToast).toHaveBeenCalledWith({
        message: 'Failed to duplicate event',
        type: 'error'
      })
      expect(mockRefresh).not.toHaveBeenCalled()
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
        message: 'Event deleted successfully',
        type: 'success'
      })
      expect(mockRefresh).toHaveBeenCalled()
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
        message: 'Failed to delete event',
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
    test('opens and closes publish confirmation modal', () => {
      const { result } = renderHook(() => useEventActions(mockRefresh))

      act(() => {
        result.current.openPublishModal(1)
      })

      expect(result.current.publishModalOpen).toBe(true)
      expect(result.current.selectedEventId).toBe(1)

      act(() => {
        result.current.closePublishModal()
      })

      expect(result.current.publishModalOpen).toBe(false)
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

    test('duplicate action does not require confirmation modal', () => {
      const { result } = renderHook(() => useEventActions(mockRefresh))

      // Should not have duplicate modal state
      expect(result.current).not.toHaveProperty('duplicateModalOpen')
    })
  })
})
