/**
 * Event Type Color Mapping Tests (TDD - RED Phase)
 *
 * Tests for event type color utility functions.
 * Tests written FIRST following TDD methodology.
 */

import {
  getEventTypeColor,
  isValidHexColor,
  getContrastTextColor,
  DEFAULT_EVENT_COLOR,
} from '../eventTypeColorMapping'
import type { EventType } from '@/features/internal-calendar/types/internal-calendar.types'

describe('eventTypeColorMapping', () => {
  describe('getEventTypeColor', () => {
    it('returns event type color when valid', () => {
      // Arrange
      const eventType: EventType = {
        id: 1,
        name: 'Conference',
        color: '#FF5733',
      }

      // Act
      const result = getEventTypeColor(eventType)

      // Assert
      expect(result).toBe('#FF5733')
      expect(result).toMatch(/^#[0-9A-F]{6}$/i)
    })

    it('returns default color when eventType is undefined', () => {
      // Arrange
      const eventType: EventType | undefined = undefined

      // Act
      const result = getEventTypeColor(eventType)

      // Assert
      expect(result).toBe(DEFAULT_EVENT_COLOR)
      expect(result).toBe('#3B82F6')
    })

    it('returns default color when color property is empty string', () => {
      // Arrange
      const eventType: EventType = {
        id: 2,
        name: 'Workshop',
        color: '',
      }

      // Act
      const result = getEventTypeColor(eventType)

      // Assert
      expect(result).toBe(DEFAULT_EVENT_COLOR)
      expect(result).toBe('#3B82F6')
    })
  })

  describe('isValidHexColor', () => {
    it('validates correct hex color formats', () => {
      // Assert
      expect(isValidHexColor('#FF5733')).toBe(true)
      expect(isValidHexColor('#000000')).toBe(true)
      expect(isValidHexColor('#FFFFFF')).toBe(true)
      expect(isValidHexColor('#abc123')).toBe(true)
      expect(isValidHexColor('#3B82F6')).toBe(true)
    })

    it('rejects invalid hex color formats', () => {
      // Assert
      expect(isValidHexColor('')).toBe(false)
      expect(isValidHexColor('FF5733')).toBe(false) // Missing #
      expect(isValidHexColor('#FF57')).toBe(false) // Too short
      expect(isValidHexColor('#FF57339')).toBe(false) // Too long
      expect(isValidHexColor('#GGGGGG')).toBe(false) // Invalid characters
      expect(isValidHexColor('rgb(255, 87, 51)')).toBe(false) // Wrong format
    })
  })

  describe('getContrastTextColor', () => {
    it('returns white text for dark background colors', () => {
      // Assert dark colors should get white text
      expect(getContrastTextColor('#000000')).toBe('#FFFFFF') // Black
      expect(getContrastTextColor('#1E40AF')).toBe('#FFFFFF') // Dark blue
      expect(getContrastTextColor('#7F1D1D')).toBe('#FFFFFF') // Dark red
      expect(getContrastTextColor('#1E3A8A')).toBe('#FFFFFF') // Dark blue
    })

    it('returns black text for light background colors', () => {
      // Assert light colors should get black text
      expect(getContrastTextColor('#FFFFFF')).toBe('#000000') // White
      expect(getContrastTextColor('#FEF3C7')).toBe('#000000') // Light yellow
      expect(getContrastTextColor('#DBEAFE')).toBe('#000000') // Light blue
      expect(getContrastTextColor('#CCDDEE')).toBe('#000000') // Light gray-blue
    })
  })
})
