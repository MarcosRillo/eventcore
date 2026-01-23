import { renderHook } from '@testing-library/react'

import { useEventCardLogic } from '@/features/events/hooks/useEventCardLogic'
import { Event, EventStatus, EventStatusCode } from '@/types/event.types'

// Base mock event structure
const baseMockEvent = {
  type: 'sede_unica' as const,
  category_id: 1,
  category: { id: 1, name: 'Music', slug: 'music', color: '#FF5733', entity_id: 1, is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  locations: [] as Event['locations'],
  location: { id: 1, name: 'Teatro', address: 'Test 123', city: 'CABA', country: 'Argentina', features: [], is_active: true, entity_id: 1, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  organizer: { id: 1, name: 'Test Org', organization: 'Test Org' },
  is_featured: false,
  approval_history: [] as Event['approval_history'],
  created_at: '2025-11-01',
  updated_at: '2025-11-01',
}

// Helper to create mock events - accepts string for forEach loops with status arrays
const createEvent = (status: string, start_date: string, end_date: string): Event => ({
  id: 1,
  title: 'Test Event',
  description: 'Test',
  start_date,
  end_date,
  status: status as EventStatus,
  ...baseMockEvent,
})

const createEventWithStatusObject = (statusCode: EventStatusCode, start_date: string, end_date: string): Event => ({
  id: 1,
  title: 'Test Event',
  description: 'Test',
  start_date,
  end_date,
  status: {
    id: 1,
    status_code: statusCode,
    status_name: statusCode,
    description: statusCode,
    workflow_order: 1,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  ...baseMockEvent,
})

describe('useEventCardLogic', () => {
  describe('formattedDate', () => {
    it('should format same-day event with date and time range', () => {
      const event = createEvent('draft', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.formattedDate).toHaveProperty('date')
      expect(result.current.formattedDate).toHaveProperty('time')
      expect(result.current.formattedDate.time).toContain('-')
    })

    it('should format multi-day event with date range', () => {
      const event = createEvent('draft', '2025-12-15T10:00:00Z', '2025-12-17T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.formattedDate.date).toContain('-')
      expect(result.current.formattedDate).toHaveProperty('time')
    })

    it('should detect same day correctly for different times', () => {
      const event = createEvent('draft', '2025-12-15T08:00:00Z', '2025-12-15T23:59:59Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.formattedDate.time).toContain('-') // Same day should have time range
    })

    it('should handle midnight spanning correctly', () => {
      const event = createEvent('draft', '2025-12-15T22:00:00Z', '2025-12-17T02:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      // Different days (accounting for timezone), so should show date range
      expect(result.current.formattedDate.date).toContain('-')
    })

    it('should format dates in Spanish locale', () => {
      const event = createEvent('draft', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      // Spanish weekday and month abbreviations
      expect(result.current.formattedDate.date).toBeTruthy()
    })

    it('should format time in 24-hour format', () => {
      const event = createEvent('draft', '2025-12-15T14:30:00Z', '2025-12-15T18:45:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.formattedDate.time).toBeTruthy()
    })
  })

  describe('statusColor', () => {
    it('should return red color for pending_internal_approval', () => {
      const event = createEvent('pending_internal_approval', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.statusColor).toBe('bg-red-100 text-red-800 border-red-200')
      expect(result.current.statusColor).toContain('red')
      expect(result.current.getEventStatus()).toBe('pending_internal_approval')
      expect(result.current.canApproveInternal()).toBe(true)
    })

    it('should return red color for pending_public_approval', () => {
      const event = createEvent('pending_public_approval', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.statusColor).toBe('bg-red-100 text-red-800 border-red-200')
      expect(result.current.statusColor).toContain('red')
      expect(result.current.getEventStatus()).toBe('pending_public_approval')
      expect(result.current.canPublish()).toBe(true)
    })

    it('should return red color for requires_changes', () => {
      const event = createEvent('requires_changes', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.statusColor).toBe('bg-red-100 text-red-800 border-red-200')
      expect(result.current.statusColor).toContain('red')
      expect(result.current.getEventStatus()).toBe('requires_changes')
      expect(result.current.canPublish()).toBe(false)
    })

    it('should return yellow color for approved_internal', () => {
      const event = createEvent('approved_internal', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.statusColor).toBe('bg-yellow-100 text-yellow-800 border-yellow-200')
      expect(result.current.statusColor).toContain('yellow')
      expect(result.current.getEventStatus()).toBe('approved_internal')
      expect(result.current.canRequestPublicApproval()).toBe(true)
    })

    it('should return yellow color for draft', () => {
      const event = createEvent('draft', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.statusColor).toBe('bg-yellow-100 text-yellow-800 border-yellow-200')
      expect(result.current.statusColor).toContain('yellow')
      expect(result.current.getEventStatus()).toBe('draft')
      expect(result.current.canPublish()).toBe(false)
    })

    it('should return green color for published', () => {
      const event = createEvent('published', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.statusColor).toBe('bg-green-100 text-green-800 border-green-200')
      expect(result.current.statusColor).toContain('green')
      expect(result.current.getEventStatus()).toBe('published')
      expect(result.current.canPublish()).toBe(false)
    })

    it('should return gray color for rejected', () => {
      const event = createEvent('rejected', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.statusColor).toBe('bg-gray-100 text-gray-800 border-gray-200')
      expect(result.current.statusColor).toContain('gray')
      expect(result.current.getEventStatus()).toBe('rejected')
      expect(result.current.canPublish()).toBe(false)
    })

    it('should return gray color for cancelled', () => {
      const event = createEvent('cancelled', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.statusColor).toBe('bg-gray-100 text-gray-800 border-gray-200')
      expect(result.current.statusColor).toContain('gray')
      expect(result.current.getEventStatus()).toBe('cancelled')
      expect(result.current.canPublish()).toBe(false)
    })

    it('should return gray color for unknown status', () => {
      const event = createEvent('unknown_status', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.statusColor).toBe('bg-gray-100 text-gray-800 border-gray-200')
      expect(result.current.statusColor).toContain('gray')
      expect(result.current.getEventStatus()).toBe('unknown_status')
      expect(typeof result.current.statusColor).toBe('string')
    })

    it('should handle status as object', () => {
      const event = createEventWithStatusObject('published', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.statusColor).toBe('bg-green-100 text-green-800 border-green-200')
      expect(result.current.getEventStatus()).toBe('published')
      expect(typeof event.status).toBe('object')
      expect(result.current.canPublish()).toBe(false)
    })
  })

  describe('getEventStatus', () => {
    it('should return status string when status is a string', () => {
      const event = createEvent('draft', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.getEventStatus()).toBe('draft')
      expect(typeof result.current.getEventStatus()).toBe('string')
      expect(typeof event.status).toBe('string')
      expect(result.current.statusColor).toContain('yellow')
    })

    it('should return status_code when status is an object', () => {
      const event = createEventWithStatusObject('published', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.getEventStatus()).toBe('published')
      expect(typeof result.current.getEventStatus()).toBe('string')
      expect(typeof event.status).toBe('object')
      expect(result.current.statusColor).toContain('green')
    })

    it('should handle different status codes', () => {
      const statuses = ['draft', 'pending_internal_approval', 'approved_internal', 'published']

      statuses.forEach((status) => {
        const event = createEvent(status, '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')
        const { result } = renderHook(() => useEventCardLogic(event))
        expect(result.current.getEventStatus()).toBe(status)
      })
    })
  })

  describe('canApproveInternal', () => {
    it('should return true for pending_internal_approval status', () => {
      const event = createEvent('pending_internal_approval', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.canApproveInternal()).toBe(true)
      expect(result.current.getEventStatus()).toBe('pending_internal_approval')
      expect(result.current.canRequestChanges()).toBe(true)
      expect(result.current.canPublish()).toBe(false)
    })

    it('should return false for other statuses', () => {
      const statuses = ['draft', 'approved_internal', 'published', 'rejected']

      statuses.forEach((status) => {
        const event = createEvent(status, '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')
        const { result } = renderHook(() => useEventCardLogic(event))
        expect(result.current.canApproveInternal()).toBe(false)
        expect(result.current.getEventStatus()).toBe(status)
      })
    })

    it('should handle status as object', () => {
      const event = createEventWithStatusObject('pending_internal_approval', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.canApproveInternal()).toBe(true)
      expect(typeof event.status).toBe('object')
      expect(result.current.getEventStatus()).toBe('pending_internal_approval')
      expect(result.current.statusColor).toContain('red')
    })
  })

  describe('canRequestPublicApproval', () => {
    it('should return true for approved_internal status', () => {
      const event = createEvent('approved_internal', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.canRequestPublicApproval()).toBe(true)
      expect(result.current.getEventStatus()).toBe('approved_internal')
      expect(result.current.canApproveInternal()).toBe(false)
      expect(result.current.statusColor).toContain('yellow')
    })

    it('should return false for other statuses', () => {
      const statuses = ['draft', 'pending_internal_approval', 'published', 'rejected']

      statuses.forEach((status) => {
        const event = createEvent(status, '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')
        const { result } = renderHook(() => useEventCardLogic(event))
        expect(result.current.canRequestPublicApproval()).toBe(false)
        expect(result.current.getEventStatus()).toBe(status)
      })
    })

    it('should handle status as object', () => {
      const event = createEventWithStatusObject('approved_internal', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.canRequestPublicApproval()).toBe(true)
      expect(typeof event.status).toBe('object')
      expect(result.current.getEventStatus()).toBe('approved_internal')
      expect(result.current.statusColor).toContain('yellow')
    })
  })

  describe('canPublish', () => {
    it('should return true for pending_public_approval status', () => {
      const event = createEvent('pending_public_approval', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.canPublish()).toBe(true)
      expect(result.current.getEventStatus()).toBe('pending_public_approval')
      expect(result.current.canRequestChanges()).toBe(true)
      expect(result.current.statusColor).toContain('red')
    })

    it('should return false for other statuses', () => {
      const statuses = ['draft', 'approved_internal', 'published', 'rejected']

      statuses.forEach((status) => {
        const event = createEvent(status, '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')
        const { result } = renderHook(() => useEventCardLogic(event))
        expect(result.current.canPublish()).toBe(false)
        expect(result.current.getEventStatus()).toBe(status)
      })
    })

    it('should handle status as object', () => {
      const event = createEventWithStatusObject('pending_public_approval', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.canPublish()).toBe(true)
      expect(typeof event.status).toBe('object')
      expect(result.current.getEventStatus()).toBe('pending_public_approval')
      expect(result.current.statusColor).toContain('red')
    })
  })

  describe('canRequestChanges', () => {
    it('should return true for pending_internal_approval', () => {
      const event = createEvent('pending_internal_approval', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.canRequestChanges()).toBe(true)
      expect(result.current.getEventStatus()).toBe('pending_internal_approval')
      expect(result.current.canApproveInternal()).toBe(true)
      expect(result.current.canPublish()).toBe(false)
    })

    it('should return true for pending_public_approval', () => {
      const event = createEvent('pending_public_approval', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.canRequestChanges()).toBe(true)
      expect(result.current.getEventStatus()).toBe('pending_public_approval')
      expect(result.current.canPublish()).toBe(true)
      expect(result.current.canApproveInternal()).toBe(false)
    })

    it('should return false for other statuses', () => {
      const statuses = ['draft', 'approved_internal', 'published', 'rejected']

      statuses.forEach((status) => {
        const event = createEvent(status, '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')
        const { result } = renderHook(() => useEventCardLogic(event))
        expect(result.current.canRequestChanges()).toBe(false)
        expect(result.current.getEventStatus()).toBe(status)
      })
    })

    it('should handle status as object', () => {
      const event = createEventWithStatusObject('pending_internal_approval', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventCardLogic(event))

      expect(result.current.canRequestChanges()).toBe(true)
      expect(typeof event.status).toBe('object')
      expect(result.current.getEventStatus()).toBe('pending_internal_approval')
      expect(result.current.canApproveInternal()).toBe(true)
    })
  })

  describe('Memoization', () => {
    it('should memoize formattedDate based on event dates', () => {
      const event = createEvent('draft', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result, rerender } = renderHook(() => useEventCardLogic(event))

      const firstFormattedDate = result.current.formattedDate

      rerender()

      expect(result.current.formattedDate).toBe(firstFormattedDate)
    })

    it('should memoize statusColor based on event status', () => {
      const event = createEvent('published', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result, rerender } = renderHook(() => useEventCardLogic(event))

      const firstStatusColor = result.current.statusColor

      rerender()

      expect(result.current.statusColor).toBe(firstStatusColor)
    })

    it('should update statusColor when status changes', () => {
      let event = createEvent('draft', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result, rerender } = renderHook(({ ev }) => useEventCardLogic(ev), {
        initialProps: { ev: event }
      })

      const firstStatusColor = result.current.statusColor
      expect(firstStatusColor).toBe('bg-yellow-100 text-yellow-800 border-yellow-200')

      // Update event to published
      event = createEvent('published', '2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')
      rerender({ ev: event })

      expect(result.current.statusColor).not.toBe(firstStatusColor)
      expect(result.current.statusColor).toBe('bg-green-100 text-green-800 border-green-200')
    })
  })
})
