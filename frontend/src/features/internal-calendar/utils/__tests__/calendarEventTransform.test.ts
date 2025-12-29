/**
 * Calendar Event Transform Tests (TDD - RED Phase)
 *
 * Tests for transforming InternalCalendarEvent to BigCalendarEvent format.
 * Tests written FIRST following TDD methodology.
 */

import {
  transformToBigCalendarEvent,
  transformToBigCalendarEvents,
} from '../calendarEventTransform'
import type {
  InternalCalendarEvent,
} from '@/features/internal-calendar/types/internal-calendar.types'

describe('calendarEventTransform', () => {
  describe('transformToBigCalendarEvent', () => {
    it('transforms a valid event with all required fields', () => {
      // Arrange
      const mockEvent: InternalCalendarEvent = {
        id: 1,
        title: 'Test Event',
        description: 'Test Description',
        start_date: '2025-12-10T10:00:00.000Z',
        end_date: '2025-12-10T12:00:00.000Z',
        status: {
          id: 1,
          status_code: 'approved_internal',
          status_name: 'Approved Internal',
          description: 'Event approved for internal use',
        },
        organization: {
          id: 1,
          name: 'Test Organization',
        },
        eventType: {
          id: 1,
          name: 'Conference',
          color: '#FF5733',
        },
      }

      // Act
      const result = transformToBigCalendarEvent(mockEvent)

      // Assert
      expect(result.id).toBe(1)
      expect(result.title).toBe('Test Event')
      expect(result.color).toBe('#FF5733')
      expect(result.resource).toEqual(mockEvent)
    })

    it('converts ISO date strings to Date objects correctly', () => {
      // Arrange
      const mockEvent: InternalCalendarEvent = {
        id: 2,
        title: 'Date Test Event',
        start_date: '2025-12-15T14:30:00.000Z',
        end_date: '2025-12-15T16:45:00.000Z',
        status: {
          id: 1,
          status_code: 'published',
          status_name: 'Published',
          description: 'Event is live and visible to public',
        },
        organization: {
          id: 1,
          name: 'Test Organization',
        },
        eventType: {
          id: 1,
          name: 'Workshop',
          color: '#00FF00',
        },
      }

      // Act
      const result = transformToBigCalendarEvent(mockEvent)

      // Assert
      expect(result.start).toBeInstanceOf(Date)
      expect(result.end).toBeInstanceOf(Date)
      expect(result.start.toISOString()).toBe('2025-12-15T14:30:00.000Z')
      expect(result.end.toISOString()).toBe('2025-12-15T16:45:00.000Z')
    })

    it('extracts color from eventType when available', () => {
      // Arrange
      const mockEvent: InternalCalendarEvent = {
        id: 3,
        title: 'Color Test Event',
        start_date: '2025-12-20T09:00:00.000Z',
        end_date: '2025-12-20T10:00:00.000Z',
        status: {
          id: 1,
          status_code: 'approved_internal',
          status_name: 'Approved Internal',
          description: 'Event approved for internal use',
        },
        organization: {
          id: 1,
          name: 'Test Organization',
        },
        eventType: {
          id: 2,
          name: 'Seminar',
          color: '#1E40AF',
        },
      }

      // Act
      const result = transformToBigCalendarEvent(mockEvent)

      // Assert
      expect(result.color).toBe('#1E40AF')
      expect(result.color).toMatch(/^#[0-9A-F]{6}$/i)
    })

    it('uses fallback color when eventType is missing', () => {
      // Arrange
      const mockEvent: InternalCalendarEvent = {
        id: 4,
        title: 'No EventType Event',
        start_date: '2025-12-25T12:00:00.000Z',
        end_date: '2025-12-25T13:00:00.000Z',
        status: {
          id: 1,
          status_code: 'published',
          status_name: 'Published',
          description: 'Event is live and visible to public',
        },
        organization: {
          id: 1,
          name: 'Test Organization',
        },
        // eventType is undefined
      }

      // Act
      const result = transformToBigCalendarEvent(mockEvent)

      // Assert
      expect(result.color).toBe('#3B82F6') // Default blue color
      expect(result.color).toMatch(/^#[0-9A-F]{6}$/i)
      expect(result).toHaveProperty('color')
    })

    it('uses fallback color when eventType color property is missing', () => {
      // Arrange
      const mockEvent: InternalCalendarEvent = {
        id: 5,
        title: 'Missing Color Property Event',
        start_date: '2025-12-30T15:00:00.000Z',
        end_date: '2025-12-30T16:00:00.000Z',
        status: {
          id: 1,
          status_code: 'approved_internal',
          status_name: 'Approved Internal',
          description: 'Event approved for internal use',
        },
        organization: {
          id: 1,
          name: 'Test Organization',
        },
        eventType: {
          id: 3,
          name: 'Meeting',
          color: '', // Empty string
        },
      }

      // Act
      const result = transformToBigCalendarEvent(mockEvent)

      // Assert
      expect(result.color).toBe('#3B82F6') // Default blue color
      expect(result.color).not.toBe('')
      expect(result.color).toMatch(/^#[0-9A-F]{6}$/i)
    })

    it('stores original event in resource property for modal access', () => {
      // Arrange
      const mockEvent: InternalCalendarEvent = {
        id: 6,
        title: 'Resource Test Event',
        description: 'Test for resource property',
        start_date: '2026-01-05T10:00:00.000Z',
        end_date: '2026-01-05T11:00:00.000Z',
        status: {
          id: 1,
          status_code: 'published',
          status_name: 'Published',
          description: 'Event is live and visible to public',
        },
        organization: {
          id: 2,
          name: 'Another Organization',
        },
        eventType: {
          id: 4,
          name: 'Festival',
          color: '#FFAA00',
        },
        locations: [
          {
            id: 1,
            name: 'Test Venue',
            city: 'Buenos Aires',
          },
        ],
      }

      // Act
      const result = transformToBigCalendarEvent(mockEvent)

      // Assert
      expect(result.resource).toEqual(mockEvent)
      expect(result.resource.id).toBe(6)
      expect(result.resource.description).toBe('Test for resource property')
      expect(result.resource.locations).toHaveLength(1)
      expect(result.resource.locations?.[0].name).toBe('Test Venue')
    })
  })

  describe('transformToBigCalendarEvents', () => {
    it('transforms an array of events correctly', () => {
      // Arrange
      const mockEvents: InternalCalendarEvent[] = [
        {
          id: 10,
          title: 'Event One',
          start_date: '2025-12-10T10:00:00.000Z',
          end_date: '2025-12-10T11:00:00.000Z',
          status: {
            id: 1,
            status_code: 'approved_internal',
            name: 'Approved Internal',
          },
          organization: {
            id: 1,
            name: 'Organization A',
          },
          eventType: {
            id: 1,
            name: 'Type A',
            color: '#FF0000',
          },
        },
        {
          id: 11,
          title: 'Event Two',
          start_date: '2025-12-11T12:00:00.000Z',
          end_date: '2025-12-11T13:00:00.000Z',
          status: {
            id: 2,
            status_code: 'published',
            name: 'Published',
          },
          organization: {
            id: 2,
            name: 'Organization B',
          },
          eventType: {
            id: 2,
            name: 'Type B',
            color: '#00FF00',
          },
        },
      ]

      // Act
      const result = transformToBigCalendarEvents(mockEvents)

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(10)
      expect(result[0].title).toBe('Event One')
      expect(result[0].color).toBe('#FF0000')
      expect(result[1].id).toBe(11)
      expect(result[1].title).toBe('Event Two')
      expect(result[1].color).toBe('#00FF00')
    })

    it('handles empty array correctly', () => {
      // Arrange
      const mockEvents: InternalCalendarEvent[] = []

      // Act
      const result = transformToBigCalendarEvents(mockEvents)

      // Assert
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
      expect(Array.isArray(result)).toBe(true)
    })

    it('transforms multiple events preserving all properties', () => {
      // Arrange
      const mockEvents: InternalCalendarEvent[] = [
        {
          id: 20,
          title: 'Multi Event 1',
          start_date: '2025-12-15T09:00:00.000Z',
          end_date: '2025-12-15T10:00:00.000Z',
          status: {
            id: 1,
            status_code: 'approved_internal',
            name: 'Approved Internal',
          },
          organization: {
            id: 1,
            name: 'Org 1',
          },
          eventType: {
            id: 1,
            name: 'Type 1',
            color: '#AA00BB',
          },
        },
        {
          id: 21,
          title: 'Multi Event 2',
          start_date: '2025-12-16T11:00:00.000Z',
          end_date: '2025-12-16T12:00:00.000Z',
          status: {
            id: 2,
            status_code: 'published',
            name: 'Published',
          },
          organization: {
            id: 2,
            name: 'Org 2',
          },
          eventType: {
            id: 2,
            name: 'Type 2',
            color: '#CCDDEE',
          },
        },
        {
          id: 22,
          title: 'Multi Event 3',
          start_date: '2025-12-17T13:00:00.000Z',
          end_date: '2025-12-17T14:00:00.000Z',
          status: {
            id: 1,
            status_code: 'approved_internal',
            name: 'Approved Internal',
          },
          organization: {
            id: 3,
            name: 'Org 3',
          },
        },
      ]

      // Act
      const result = transformToBigCalendarEvents(mockEvents)

      // Assert
      expect(result).toHaveLength(3)
      expect(result[0].start).toBeInstanceOf(Date)
      expect(result[1].end).toBeInstanceOf(Date)
      expect(result[2].color).toBe('#3B82F6') // Fallback color for missing eventType
      expect(result[0].resource.id).toBe(20)
      expect(result[1].resource.id).toBe(21)
      expect(result[2].resource.id).toBe(22)
    })
  })
})
