/**
 * Event Type Color Mapping Utilities
 *
 * Utility functions for working with event type colors.
 * Created following TDD methodology (tests written first).
 */

import type { EventType } from '@/features/internal-calendar/types/internal-calendar.types'

/**
 * Default fallback color for events without eventType or color
 */
export const DEFAULT_EVENT_COLOR = '#3B82F6' // Blue-500 from Tailwind

/**
 * Gets the color from an EventType object, with fallback to default.
 *
 * @param eventType - The event type object (can be undefined)
 * @returns Hex color string (e.g., "#FF5733")
 *
 * @example
 * ```typescript
 * const color = getEventTypeColor(event.eventType)
 * // "#FF5733" or "#3B82F6" (fallback)
 * ```
 */
export function getEventTypeColor(eventType: EventType | undefined): string {
  if (!eventType || !eventType.color) {
    return DEFAULT_EVENT_COLOR
  }
  return eventType.color
}

/**
 * Validates if a string is a valid hex color format.
 *
 * @param color - The color string to validate
 * @returns true if valid hex color (e.g., "#FF5733"), false otherwise
 *
 * @example
 * ```typescript
 * isValidHexColor("#FF5733") // true
 * isValidHexColor("FF5733")  // false (missing #)
 * isValidHexColor("#FFF")    // false (too short)
 * ```
 */
export function isValidHexColor(color: string): boolean {
  const hexColorRegex = /^#[0-9A-F]{6}$/i
  return hexColorRegex.test(color)
}

/**
 * Determines the best contrast text color (white or black) for a background color.
 * Uses the relative luminance formula (WCAG 2.0).
 *
 * @param backgroundColor - Hex color of the background (e.g., "#FF5733")
 * @returns "#FFFFFF" (white) for dark backgrounds, "#000000" (black) for light backgrounds
 *
 * @example
 * ```typescript
 * getContrastTextColor("#000000") // "#FFFFFF" (white text on black)
 * getContrastTextColor("#FFFFFF") // "#000000" (black text on white)
 * ```
 */
export function getContrastTextColor(backgroundColor: string): string {
  // Remove # and convert to RGB
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Calculate relative luminance (WCAG 2.0 formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return white text for dark backgrounds, black text for light backgrounds
  // Threshold: 0.5 (50% luminance)
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}
