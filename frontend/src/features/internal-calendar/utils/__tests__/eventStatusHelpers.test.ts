/**
 * Event Status Helpers Tests
 *
 * Tests for utility functions that provide status-related functionality:
 * - Status color mapping (Tailwind CSS classes)
 * - Status label translation (Spanish)
 * - Status code validation (type guards)
 */

import {
  getStatusColors,
  getStatusLabel,
  isValidInternalCalendarStatus,
} from '@/features/internal-calendar/utils/eventStatusHelpers';

describe('eventStatusHelpers', () => {
  describe('getStatusColors', () => {
    test('returns correct colors for approved_internal status', () => {
      const result = getStatusColors('approved_internal');

      expect(result).toBeDefined();
      expect(result.bgClass).toBe('bg-blue-100');
      expect(result.textClass).toBe('text-blue-800');
      expect(Object.keys(result)).toHaveLength(2);
    });

    test('returns correct colors for pending_public_approval status', () => {
      const result = getStatusColors('pending_public_approval');

      expect(result).toBeDefined();
      expect(result.bgClass).toBe('bg-yellow-100');
      expect(result.textClass).toBe('text-yellow-800');
      expect(Object.keys(result)).toHaveLength(2);
    });

    test('returns correct colors for published status', () => {
      const result = getStatusColors('published');

      expect(result).toBeDefined();
      expect(result.bgClass).toBe('bg-green-100');
      expect(result.textClass).toBe('text-green-800');
      expect(Object.keys(result)).toHaveLength(2);
    });

    test('returns default gray colors for unknown status', () => {
      const result = getStatusColors('unknown_status');

      expect(result).toBeDefined();
      expect(result.bgClass).toBe('bg-gray-100');
      expect(result.textClass).toBe('text-gray-800');
      expect(Object.keys(result)).toHaveLength(2);
    });

    test('returns default gray colors for empty string', () => {
      const result = getStatusColors('');

      expect(result).toBeDefined();
      expect(result.bgClass).toBe('bg-gray-100');
      expect(result.textClass).toBe('text-gray-800');
    });
  });

  describe('getStatusLabel', () => {
    test('returns correct Spanish label for approved_internal', () => {
      const result = getStatusLabel('approved_internal');

      expect(result).toBe('Aprobado Interno');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('returns correct Spanish label for pending_public_approval', () => {
      const result = getStatusLabel('pending_public_approval');

      expect(result).toBe('Pendiente Aprobación Pública');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('returns correct Spanish label for published', () => {
      const result = getStatusLabel('published');

      expect(result).toBe('Publicado');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    test('returns status code itself for unknown status', () => {
      const unknownStatus = 'draft';
      const result = getStatusLabel(unknownStatus);

      expect(result).toBe(unknownStatus);
      expect(typeof result).toBe('string');
    });

    test('returns empty string when given empty string', () => {
      const result = getStatusLabel('');

      expect(result).toBe('');
      expect(typeof result).toBe('string');
    });
  });

  describe('isValidInternalCalendarStatus', () => {
    test('returns true for approved_internal status', () => {
      const result = isValidInternalCalendarStatus('approved_internal');

      expect(result).toBe(true);
      expect(typeof result).toBe('boolean');
    });

    test('returns true for pending_public_approval status', () => {
      const result = isValidInternalCalendarStatus('pending_public_approval');

      expect(result).toBe(true);
      expect(typeof result).toBe('boolean');
    });

    test('returns true for published status', () => {
      const result = isValidInternalCalendarStatus('published');

      expect(result).toBe(true);
      expect(typeof result).toBe('boolean');
    });

    test('returns false for invalid status codes', () => {
      expect(isValidInternalCalendarStatus('draft')).toBe(false);
      expect(isValidInternalCalendarStatus('rejected')).toBe(false);
      expect(isValidInternalCalendarStatus('requires_changes')).toBe(false);
      expect(isValidInternalCalendarStatus('cancelled')).toBe(false);
    });

    test('returns false for empty string', () => {
      const result = isValidInternalCalendarStatus('');

      expect(result).toBe(false);
      expect(typeof result).toBe('boolean');
    });

    test('returns false for random string', () => {
      const result = isValidInternalCalendarStatus('random_invalid_status');

      expect(result).toBe(false);
      expect(typeof result).toBe('boolean');
    });
  });
});
