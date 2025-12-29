import { renderHook } from '@testing-library/react'

import { useEventUrgency } from '@/features/events/hooks/useEventUrgency'
import { Event, EventStatus } from '@/types/event.types'

// Helper to create mock events
const createEvent = (start_date: string, end_date: string): Event => ({
  id: 1,
  title: 'Test Event',
  description: 'Test',
  type: 'sede_unica',
  start_date,
  end_date,
  status: 'published' as EventStatus,
  category_id: 1,
  category: { id: 1, name: 'Music', slug: 'music', color: '#FF5733', entity_id: 1, is_active: true, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  locations: [],
  location: { id: 1, name: 'Teatro', address: 'Test 123', city: 'CABA', country: 'Argentina', features: [], is_active: true, entity_id: 1, created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z' },
  organizer: { id: 1, name: 'Test Org', organization: 'Test Org' },
  is_featured: false,
  approval_history: [],
  created_at: '2025-11-01',
  updated_at: '2025-11-01',
})

// Mock current date for consistent testing
const MOCK_NOW = new Date('2025-12-15T12:00:00Z')

describe('useEventUrgency', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(MOCK_NOW)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('urgencyData', () => {
    it('should return null for events that have ended', () => {
      const event = createEvent('2025-12-10T10:00:00Z', '2025-12-14T23:59:59Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.urgencyData).toBeNull()
    })

    it('should return "happening" indicator for ongoing events', () => {
      const event = createEvent('2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.urgencyData).not.toBeNull()
      expect(result.current.urgencyData?.type).toBe('happening')
      expect(result.current.urgencyData?.text).toBe('En curso')
      expect(result.current.urgencyData?.className).toBe('bg-blue-100 text-blue-800')
      expect(result.current.urgencyData?.showPulse).toBe(true)
    })

    it('should return "upcoming" indicator for events in 1 day', () => {
      const event = createEvent('2025-12-16T10:00:00Z', '2025-12-16T18:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.urgencyData).not.toBeNull()
      expect(result.current.urgencyData?.type).toBe('upcoming')
      expect(result.current.urgencyData?.text).toBe('Próximo (1d)')
      expect(result.current.urgencyData?.className).toBe('bg-orange-100 text-orange-800')
      expect(result.current.urgencyData?.showIcon).toBe(true)
    })

    it('should return "upcoming" indicator for events in 2 days', () => {
      const event = createEvent('2025-12-17T10:00:00Z', '2025-12-17T18:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.urgencyData).not.toBeNull()
      expect(result.current.urgencyData?.type).toBe('upcoming')
      expect(result.current.urgencyData?.text).toBe('Próximo (2d)')
    })

    it('should return "upcoming" indicator for events in 3 days', () => {
      const event = createEvent('2025-12-18T10:00:00Z', '2025-12-18T18:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.urgencyData).not.toBeNull()
      expect(result.current.urgencyData?.type).toBe('upcoming')
      expect(result.current.urgencyData?.text).toBe('Próximo (3d)')
    })

    it('should return null for events more than 3 days away', () => {
      const event = createEvent('2025-12-19T10:00:00Z', '2025-12-19T18:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.urgencyData).toBeNull()
    })

    it('should return null for events 7 days away', () => {
      const event = createEvent('2025-12-22T10:00:00Z', '2025-12-22T18:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.urgencyData).toBeNull()
    })

    it('should handle multi-day events that are happening', () => {
      const event = createEvent('2025-12-14T10:00:00Z', '2025-12-16T18:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.urgencyData?.type).toBe('happening')
    })

    it('should handle events starting exactly now', () => {
      const event = createEvent('2025-12-15T12:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.urgencyData?.type).toBe('happening')
    })

    it('should handle events ending exactly now', () => {
      const event = createEvent('2025-12-15T10:00:00Z', '2025-12-15T12:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.urgencyData?.type).toBe('happening')
    })
  })

  describe('timeInfo', () => {
    it('should return hasEnded=true for past events', () => {
      const event = createEvent('2025-12-10T10:00:00Z', '2025-12-14T23:59:59Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.timeInfo.hasEnded).toBe(true)
      expect(result.current.timeInfo.isHappening).toBe(false)
      expect(result.current.timeInfo.isUpcoming).toBe(false)
    })

    it('should return isHappening=true for ongoing events', () => {
      const event = createEvent('2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.timeInfo.hasEnded).toBe(false)
      expect(result.current.timeInfo.isHappening).toBe(true)
      expect(result.current.timeInfo.isUpcoming).toBe(false)
    })

    it('should return isUpcoming=true for future events', () => {
      const event = createEvent('2025-12-20T10:00:00Z', '2025-12-20T18:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.timeInfo.hasEnded).toBe(false)
      expect(result.current.timeInfo.isHappening).toBe(false)
      expect(result.current.timeInfo.isUpcoming).toBe(true)
    })

    it('should calculate correct daysUntilEvent for future events', () => {
      const event = createEvent('2025-12-20T10:00:00Z', '2025-12-20T18:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.timeInfo.daysUntilEvent).toBe(5)
    })

    it('should calculate negative daysUntilEvent for past events', () => {
      const event = createEvent('2025-12-10T10:00:00Z', '2025-12-10T18:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.timeInfo.daysUntilEvent).toBeLessThan(0)
    })

    it('should mark isUrgent=true for events within 3 days', () => {
      const event = createEvent('2025-12-16T10:00:00Z', '2025-12-16T18:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.timeInfo.isUrgent).toBe(true)
      expect(result.current.timeInfo.daysUntilEvent).toBe(1)
    })

    it('should mark isUrgent=false for events more than 3 days away', () => {
      const event = createEvent('2025-12-20T10:00:00Z', '2025-12-20T18:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.timeInfo.isUrgent).toBe(false)
      expect(result.current.timeInfo.daysUntilEvent).toBe(5)
    })

    it('should mark isUrgent=false for events happening now', () => {
      const event = createEvent('2025-12-15T10:00:00Z', '2025-12-15T18:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.timeInfo.isUrgent).toBe(false)
      expect(Math.abs(result.current.timeInfo.daysUntilEvent)).toBe(0) // Handle -0 vs 0
    })

    it('should handle events with same start and end date', () => {
      const event = createEvent('2025-12-16T10:00:00Z', '2025-12-16T10:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.timeInfo.daysUntilEvent).toBe(1)
      expect(result.current.timeInfo.isUpcoming).toBe(true)
    })

    it('should provide all time info fields', () => {
      const event = createEvent('2025-12-20T10:00:00Z', '2025-12-20T18:00:00Z')

      const { result } = renderHook(() => useEventUrgency(event))

      expect(result.current.timeInfo).toHaveProperty('hasEnded')
      expect(result.current.timeInfo).toHaveProperty('isHappening')
      expect(result.current.timeInfo).toHaveProperty('isUpcoming')
      expect(result.current.timeInfo).toHaveProperty('daysUntilEvent')
      expect(result.current.timeInfo).toHaveProperty('isUrgent')
    })
  })

  describe('Memoization', () => {
    it('should memoize urgencyData based on event dates', () => {
      const event = createEvent('2025-12-16T10:00:00Z', '2025-12-16T18:00:00Z')

      const { result, rerender } = renderHook(() => useEventUrgency(event))

      const firstUrgencyData = result.current.urgencyData

      rerender()

      expect(result.current.urgencyData).toBe(firstUrgencyData)
    })

    it('should update urgencyData when event dates change', () => {
      let event = createEvent('2025-12-16T10:00:00Z', '2025-12-16T18:00:00Z')

      const { result, rerender } = renderHook(({ ev }) => useEventUrgency(ev), {
        initialProps: { ev: event }
      })

      const firstUrgencyData = result.current.urgencyData
      expect(firstUrgencyData?.text).toBe('Próximo (1d)')

      // Update event to be further in the future
      event = createEvent('2025-12-20T10:00:00Z', '2025-12-20T18:00:00Z')
      rerender({ ev: event })

      expect(result.current.urgencyData).not.toBe(firstUrgencyData)
      expect(result.current.urgencyData).toBeNull() // More than 3 days away
    })
  })
})
